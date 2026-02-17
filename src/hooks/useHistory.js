import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';

const LS_KEY = 'iching-historial';
const MAX_LOCAL = 20;

// --- localStorage helpers ---

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocal(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_LOCAL)));
}

function addLocal(consulta) {
  const items = loadLocal();
  const entry = {
    id: crypto.randomUUID?.() || Date.now().toString(36),
    ...consulta,
    favorito: false,
    nota: null,
    created_at: new Date().toISOString(),
  };
  items.unshift(entry);
  saveLocal(items);
  return entry;
}

// --- Hook ---

export function useHistory() {
  const { session, user } = useAuth();
  const isCloud = !!(session && user);

  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all consultas
  const fetchConsultas = useCallback(async () => {
    setError(null);
    if (!isCloud) {
      setConsultas(loadLocal());
      return;
    }
    setLoading(true);
    try {
      const data = await dbSelect('consultas', {
        session,
        order: 'created_at.desc',
        limit: 200,
      });
      setConsultas(data);
    } catch (err) {
      setError(err.message);
      // Fallback to local
      setConsultas(loadLocal());
    } finally {
      setLoading(false);
    }
  }, [isCloud, session]);

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  // Save a new consulta
  const guardarConsulta = useCallback(async (consulta) => {
    if (!isCloud) {
      const entry = addLocal(consulta);
      setConsultas((prev) => [entry, ...prev]);
      return entry;
    }
    try {
      const [entry] = await dbInsert('consultas', {
        user_id: user.id,
        pregunta: consulta.pregunta || '',
        lineas: consulta.lineas,
        hexagrama_original: consulta.hexOriginal,
        nombre_original: consulta.nombreOriginal,
        hexagrama_mutado: consulta.hexMutado || null,
        nombre_mutado: consulta.nombreMutado || null,
        tiene_mutaciones: consulta.tieneMutaciones || false,
      }, session);
      setConsultas((prev) => [entry, ...prev]);
      return entry;
    } catch {
      // Fallback to local if cloud fails
      const entry = addLocal(consulta);
      setConsultas((prev) => [entry, ...prev]);
      return entry;
    }
  }, [isCloud, session, user]);

  // Toggle favorito
  const toggleFavorito = useCallback(async (id) => {
    const item = consultas.find((c) => c.id === id);
    if (!item) return;
    const newVal = !item.favorito;

    if (!isCloud) {
      const items = loadLocal().map((c) =>
        c.id === id ? { ...c, favorito: newVal } : c
      );
      saveLocal(items);
      setConsultas(items);
      return;
    }
    try {
      await dbUpdate('consultas', id, { favorito: newVal }, session);
      setConsultas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, favorito: newVal } : c))
      );
    } catch (err) {
      setError(err.message);
    }
  }, [consultas, isCloud, session]);

  // Update nota
  const updateNota = useCallback(async (id, nota) => {
    if (!isCloud) {
      const items = loadLocal().map((c) =>
        c.id === id ? { ...c, nota } : c
      );
      saveLocal(items);
      setConsultas(items);
      return;
    }
    try {
      await dbUpdate('consultas', id, { nota }, session);
      setConsultas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, nota } : c))
      );
    } catch (err) {
      setError(err.message);
    }
  }, [isCloud, session]);

  // Delete a consulta
  const eliminarConsulta = useCallback(async (id) => {
    if (!isCloud) {
      const items = loadLocal().filter((c) => c.id !== id);
      saveLocal(items);
      setConsultas(items);
      return;
    }
    try {
      await dbDelete('consultas', id, session);
      setConsultas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, [isCloud, session]);

  // Clear all (local only — cloud uses individual delete)
  const limpiarHistorial = useCallback(() => {
    if (!isCloud) {
      localStorage.removeItem(LS_KEY);
      setConsultas([]);
      return;
    }
    // For cloud, we don't mass-delete. User can delete individually.
  }, [isCloud]);

  // Sync local → cloud on first login
  const syncLocalToCloud = useCallback(async () => {
    if (!isCloud) return;
    const local = loadLocal();
    if (local.length === 0) return;

    // Insert each item individually, tracking failures.
    // Only items that succeed are removed from localStorage — this avoids
    // data loss if a partial failure occurs mid-sync.
    const failed = [];
    for (const c of local) {
      try {
        await dbInsert('consultas', {
          user_id: user.id,
          pregunta: c.pregunta || '',
          lineas: c.lineas,
          hexagrama_original: c.hexagrama_original ?? c.hexOriginal,
          nombre_original: c.nombre_original ?? c.nombreOriginal,
          hexagrama_mutado: c.hexagrama_mutado ?? c.hexMutado ?? null,
          nombre_mutado: c.nombre_mutado ?? c.nombreMutado ?? null,
          tiene_mutaciones: c.tiene_mutaciones ?? c.tieneMutaciones ?? false,
          created_at: c.created_at,
        }, session);
      } catch {
        failed.push(c);
      }
    }

    if (failed.length === 0) {
      localStorage.removeItem(LS_KEY);
    } else {
      // Keep only the items that failed — they will retry on the next login
      saveLocal(failed);
    }

    await fetchConsultas();
  }, [isCloud, session, user, fetchConsultas]);

  return {
    consultas,
    loading,
    error,
    isCloud,
    guardarConsulta,
    toggleFavorito,
    updateNota,
    eliminarConsulta,
    limpiarHistorial,
    syncLocalToCloud,
    refetch: fetchConsultas,
  };
}
