import React, { useEffect, useState } from 'react';

export default function History() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistorial();
  }, []);

  async function fetchHistorial() {
    try {
      setLoading(true);
      const res = await fetch('/api/consultas?limit=20');
      if (!res.ok) throw new Error('Error al cargar historial');
      const data = await res.json();
      setConsultas(data);
    } catch (err) {
      setError('No se pudo conectar al servidor. El historial requiere el servidor activo.');
    } finally {
      setLoading(false);
    }
  }

  async function limpiar() {
    if (!confirm('¿Limpiar todo el historial de consultas?')) return;
    try {
      await fetch('/api/consultas', { method: 'DELETE' });
      setConsultas([]);
    } catch {
      setError('Error al limpiar historial');
    }
  }

  if (loading) {
    return <div className="history-loading">Cargando historial...</div>;
  }

  if (error) {
    return <div className="history-error">{error}</div>;
  }

  return (
    <div className="history">
      <div className="history-header">
        <h3>Historial de Consultas</h3>
        {consultas.length > 0 && (
          <button className="btn btn-limpiar" onClick={limpiar}>
            Limpiar
          </button>
        )}
      </div>

      {consultas.length === 0 ? (
        <p className="history-empty">No hay consultas registradas.</p>
      ) : (
        <div className="history-list">
          {consultas.map((c) => (
            <div key={c.id} className="history-item">
              <div className="history-fecha">{new Date(c.fecha).toLocaleString('es-ES')}</div>
              <div className="history-pregunta">{c.pregunta}</div>
              <div className="history-resultado">
                <span className="history-original">{c.nombre_original}</span>
                {c.tiene_mutaciones === 1 && c.nombre_mutado && (
                  <>
                    <span className="history-arrow"> → </span>
                    <span className="history-mutado">{c.nombre_mutado}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
