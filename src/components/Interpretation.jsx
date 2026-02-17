import React, { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function Interpretation({ hexOriginal, hexMutado, lineasMutantes }) {
  const { t } = useI18n();
  const [expandido, setExpandido] = useState(false);

  if (!hexOriginal) return null;

  return (
    <div className="interpretation">
      <button
        className="interpretation-toggle"
        onClick={() => setExpandido(!expandido)}
      >
        <span className="toggle-icon">{expandido ? '▾' : '▸'}</span>
        {t('interp.title')}
      </button>

      {expandido && (
        <div className="interpretation-content">
          {/* Hexagrama Original */}
          <div className="interp-section">
            <h3 className="interp-title">
              {hexOriginal.numero}. {hexOriginal.chino} &mdash; {hexOriginal.nombre}
              <span className="interp-pinyin">({hexOriginal.pinyin})</span>
            </h3>

            <div className="interp-trigramas">
              <span>{t('interp.upper')} {hexOriginal.trigrama_superior}</span>
              <span className="trigrama-separator">|</span>
              <span>{t('interp.lower')} {hexOriginal.trigrama_inferior}</span>
            </div>

            <div className="interp-block">
              <h4>{t('interp.judgment')}</h4>
              <p>{hexOriginal.juicio}</p>
            </div>

            <div className="interp-block">
              <h4>{t('interp.image')}</h4>
              <p>{hexOriginal.imagen}</p>
            </div>

            <div className="interp-block">
              <h4>{t('interp.meaning')}</h4>
              <p>{hexOriginal.significado}</p>
            </div>
          </div>

          {/* Hexagrama Mutado */}
          {hexMutado && (
            <div className="interp-section mutado-section">
              <div className="mutation-arrow">
                <span>{t('interp.changingLines')} {lineasMutantes.map(i => i + 1).join(', ')}</span>
                <span className="arrow">⟶</span>
              </div>

              <h3 className="interp-title">
                {hexMutado.numero}. {hexMutado.chino} &mdash; {hexMutado.nombre}
                <span className="interp-pinyin">({hexMutado.pinyin})</span>
              </h3>

              <div className="interp-trigramas">
                <span>{t('interp.upper')} {hexMutado.trigrama_superior}</span>
                <span className="trigrama-separator">|</span>
                <span>{t('interp.lower')} {hexMutado.trigrama_inferior}</span>
              </div>

              <div className="interp-block">
                <h4>{t('interp.judgment')}</h4>
                <p>{hexMutado.juicio}</p>
              </div>

              <div className="interp-block">
                <h4>{t('interp.image')}</h4>
                <p>{hexMutado.imagen}</p>
              </div>

              <div className="interp-block">
                <h4>{t('interp.meaning')}</h4>
                <p>{hexMutado.significado}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
