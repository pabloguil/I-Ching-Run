import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function History() {
  const { lang, t } = useI18n();
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
      if (!res.ok) throw new Error('Error loading history');
      const data = await res.json();
      setConsultas(data);
    } catch (err) {
      setError(t('history.serverError'));
    } finally {
      setLoading(false);
    }
  }

  async function limpiar() {
    if (!confirm(t('history.confirmClear'))) return;
    try {
      await fetch('/api/consultas', { method: 'DELETE' });
      setConsultas([]);
    } catch {
      setError(t('history.clearError'));
    }
  }

  if (loading) {
    return <div className="history-loading">{t('history.loading')}</div>;
  }

  if (error) {
    return <div className="history-error">{error}</div>;
  }

  const dateLang = lang === 'en' ? 'en-US' : 'es-ES';

  return (
    <div className="history">
      <div className="history-header">
        <h3>{t('history.title')}</h3>
        {consultas.length > 0 && (
          <button className="btn btn-limpiar" onClick={limpiar}>
            {t('history.clear')}
          </button>
        )}
      </div>

      {consultas.length === 0 ? (
        <p className="history-empty">{t('history.empty')}</p>
      ) : (
        <div className="history-list">
          {consultas.map((c) => (
            <div key={c.id} className="history-item">
              <div className="history-fecha">{new Date(c.fecha).toLocaleString(dateLang)}</div>
              <div className="history-pregunta">
                {c.pregunta || t('history.general')}
              </div>
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
