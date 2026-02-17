import React from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function HistorySidebar({ consultas, onSelect, onClose, onOpenFull }) {
  const { lang, t } = useI18n();
  const dateLang = lang === 'en' ? 'en-US' : 'es-ES';
  const recientes = consultas.slice(0, 10);
  const favoritos = consultas.filter((c) => c.favorito);

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <aside className="sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <h3>{t('sidebar.title')}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {/* Favorites section */}
        {favoritos.length > 0 && (
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">{t('sidebar.favorites')}</h4>
            {favoritos.slice(0, 5).map((c) => (
              <button
                key={c.id}
                className="sidebar-item"
                onClick={() => { onSelect(c); onClose(); }}
              >
                <span className="sidebar-item-star">&#9733;</span>
                <span className="sidebar-item-name">
                  {c.nombre_original || c.nombreOriginal}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Recent section */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">{t('sidebar.recent')}</h4>
          {recientes.length === 0 ? (
            <p className="sidebar-empty">{t('history.empty')}</p>
          ) : (
            recientes.map((c) => (
              <button
                key={c.id}
                className="sidebar-item"
                onClick={() => { onSelect(c); onClose(); }}
              >
                <div className="sidebar-item-top">
                  <span className="sidebar-item-date">
                    {new Date(c.created_at || c.fecha).toLocaleDateString(dateLang)}
                  </span>
                  {c.favorito && <span className="sidebar-item-star">&#9733;</span>}
                </div>
                <span className="sidebar-item-question">
                  {c.pregunta || t('history.general')}
                </span>
                <span className="sidebar-item-name">
                  {c.nombre_original || c.nombreOriginal}
                </span>
              </button>
            ))
          )}
        </div>

        <button className="btn btn-sidebar-full" onClick={() => { onOpenFull(); onClose(); }}>
          {t('sidebar.viewAll')}
        </button>
      </aside>
    </div>
  );
}
