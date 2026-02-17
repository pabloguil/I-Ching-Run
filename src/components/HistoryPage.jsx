import React, { useState, useMemo } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryPage({ consultas, onToggleFav, onUpdateNota, onDelete, onSelect, onBack }) {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const dateLang = lang === 'en' ? 'en-US' : 'es-ES';

  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [filterHex, setFilterHex] = useState('');
  const [editingNota, setEditingNota] = useState(null);
  const [notaDraft, setNotaDraft] = useState('');

  const filtered = useMemo(() => {
    let items = [...consultas];
    if (filterFav) items = items.filter((c) => c.favorito);
    if (filterHex) {
      const num = parseInt(filterHex, 10);
      if (!isNaN(num)) {
        items = items.filter((c) => (c.hexagrama_original ?? c.hexOriginal) === num);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((c) =>
        (c.pregunta || '').toLowerCase().includes(q) ||
        (c.nombre_original || c.nombreOriginal || '').toLowerCase().includes(q) ||
        (c.nota || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [consultas, filterFav, filterHex, search]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iching-historial-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = ['Fecha', 'Pregunta', 'Hexagrama', 'Mutado', 'Favorito', 'Nota'];
    const rows = filtered.map((c) => [
      new Date(c.created_at || c.fecha).toLocaleString(dateLang),
      `"${(c.pregunta || '').replace(/"/g, '""')}"`,
      c.nombre_original || c.nombreOriginal || '',
      c.nombre_mutado || c.nombreMutado || '',
      c.favorito ? 'Si' : 'No',
      `"${(c.nota || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iching-historial-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditNota = (c) => {
    setEditingNota(c.id);
    setNotaDraft(c.nota || '');
  };

  const saveNota = (id) => {
    onUpdateNota(id, notaDraft);
    setEditingNota(null);
  };

  return (
    <div className="history-page">
      <div className="history-page-header">
        <button className="btn btn-back" onClick={onBack}>&larr; {t('historyPage.back')}</button>
        <h2>{t('historyPage.title')}</h2>
      </div>

      {/* Filters bar */}
      <div className="history-filters">
        <input
          type="text"
          className="auth-input history-search"
          placeholder={t('historyPage.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="history-filter-row">
          <label className="filter-check">
            <input
              type="checkbox"
              checked={filterFav}
              onChange={(e) => setFilterFav(e.target.checked)}
            />
            {t('historyPage.onlyFav')}
          </label>
          <input
            type="number"
            min="1"
            max="64"
            className="auth-input filter-hex-input"
            placeholder={t('historyPage.hexNum')}
            value={filterHex}
            onChange={(e) => setFilterHex(e.target.value)}
          />
        </div>
        <div className="history-export-row">
          <button className="btn btn-export" onClick={exportJSON}>
            {t('historyPage.exportJSON')}
          </button>
          <button className="btn btn-export" onClick={exportCSV}>
            {t('historyPage.exportCSV')}
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="history-count">
        {t('historyPage.count', { n: filtered.length })}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="history-empty">{t('history.empty')}</p>
      ) : (
        <div className="history-full-list">
          {filtered.map((c) => (
            <div key={c.id} className={`history-full-item ${c.favorito ? 'is-fav' : ''}`}>
              <div className="hf-top">
                <span className="hf-date">
                  {new Date(c.created_at || c.fecha).toLocaleString(dateLang)}
                </span>
                <div className="hf-actions">
                  <button
                    className={`btn-icon ${c.favorito ? 'fav-active' : ''}`}
                    onClick={() => onToggleFav(c.id)}
                    title={t('historyPage.toggleFav')}
                  >
                    {c.favorito ? '\u2605' : '\u2606'}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => startEditNota(c)}
                    title={t('historyPage.editNote')}
                  >
                    &#9998;
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => {
                      if (confirm(t('historyPage.confirmDelete'))) onDelete(c.id);
                    }}
                    title={t('historyPage.delete')}
                  >
                    &#10005;
                  </button>
                </div>
              </div>
              <div className="hf-body" onClick={() => onSelect?.(c)}>
                <div className="hf-question">
                  {c.pregunta || t('history.general')}
                </div>
                <div className="hf-result">
                  <span className="history-original">
                    {c.nombre_original || c.nombreOriginal}
                  </span>
                  {(c.tiene_mutaciones || c.tieneMutaciones) && (c.nombre_mutado || c.nombreMutado) && (
                    <>
                      <span className="history-arrow"> &rarr; </span>
                      <span className="history-mutado">
                        {c.nombre_mutado || c.nombreMutado}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Note display/edit */}
              {editingNota === c.id ? (
                <div className="hf-nota-edit">
                  <textarea
                    className="form-textarea hf-nota-textarea"
                    value={notaDraft}
                    onChange={(e) => setNotaDraft(e.target.value)}
                    placeholder={t('historyPage.notePlaceholder')}
                    rows={3}
                    autoFocus
                  />
                  <div className="hf-nota-buttons">
                    <button className="btn btn-small" onClick={() => saveNota(c.id)}>
                      {t('historyPage.saveNote')}
                    </button>
                    <button className="btn btn-small" onClick={() => setEditingNota(null)}>
                      {t('historyPage.cancel')}
                    </button>
                  </div>
                </div>
              ) : c.nota ? (
                <div className="hf-nota" onClick={() => startEditNota(c)}>
                  <span className="hf-nota-label">{t('historyPage.noteLabel')}</span>
                  {c.nota}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
