import React, { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

// Importación lazy de los textos de líneas para no bloquear el bundle
let LINE_TEXTS_ES = null;
let LINE_TEXTS_EN = null;

async function loadLineTexts(lang) {
  try {
    if (lang === 'en') {
      if (!LINE_TEXTS_EN) {
        const mod = await import('../data/line-texts-en.js').catch(() => null);
        LINE_TEXTS_EN = mod?.LINE_TEXTS || null;
      }
      return LINE_TEXTS_EN;
    } else {
      if (!LINE_TEXTS_ES) {
        const mod = await import('../data/line-texts-es.js').catch(() => null);
        LINE_TEXTS_ES = mod?.LINE_TEXTS || null;
      }
      return LINE_TEXTS_ES;
    }
  } catch {
    return null;
  }
}

function useLineTexts(hexNum, lineasMutantes, lang) {
  const [textos, setTextos] = useState(null);

  React.useEffect(() => {
    if (!hexNum || lineasMutantes.length === 0) return;
    let cancelled = false;
    loadLineTexts(lang).then((data) => {
      if (!cancelled && data && data[hexNum]) {
        const relevant = {};
        for (const idx of lineasMutantes) {
          const lineNum = idx + 1; // 1-indexed
          if (data[hexNum][lineNum]) {
            relevant[lineNum] = data[hexNum][lineNum];
          }
        }
        setTextos(Object.keys(relevant).length > 0 ? relevant : null);
      }
    });
    return () => { cancelled = true; };
  }, [hexNum, lineasMutantes, lang]);

  return textos;
}

function InterpSection({ hex }) {
  const { t } = useI18n();
  return (
    <div className="interp-section">
      <h3 className="interp-title">
        {hex.numero}. {hex.chino} &mdash; {hex.nombre}
        <span className="interp-pinyin">({hex.pinyin})</span>
      </h3>

      <div className="interp-trigramas">
        <span>{t('interp.upper')} {hex.trigrama_superior}</span>
        <span className="trigrama-separator">|</span>
        <span>{t('interp.lower')} {hex.trigrama_inferior}</span>
      </div>

      <div className="interp-block">
        <h4>{t('interp.judgment')}</h4>
        <p>{hex.juicio}</p>
      </div>

      <div className="interp-block">
        <h4>{t('interp.image')}</h4>
        <p>{hex.imagen}</p>
      </div>

      <div className="interp-block">
        <h4>{t('interp.meaning')}</h4>
        <p>{hex.significado}</p>
      </div>
    </div>
  );
}

export default function Interpretation({ hexOriginal, hexMutado, lineasMutantes }) {
  const { lang, t } = useI18n();
  const [expandido, setExpandido] = useState(true);
  const lineTextos = useLineTexts(hexOriginal?.numero, lineasMutantes, lang);

  if (!hexOriginal) return null;

  return (
    <div className="interpretation">
      <button
        className="interpretation-toggle"
        onClick={() => setExpandido(!expandido)}
        aria-expanded={expandido}
        aria-controls="interp-content"
      >
        <span className="toggle-icon" aria-hidden="true">{expandido ? '▾' : '▸'}</span>
        {t('interp.title')}
      </button>

      {expandido && (
        <div className="interpretation-content" id="interp-content">
          {/* Textos de líneas mutantes — se muestran PRIMERO si existen */}
          {lineTextos && lineasMutantes.length > 0 && (
            <div className="interp-section interp-lineas-mutantes">
              <h3 className="interp-lineas-title">
                {t('interp.changingLinesTitle')}
              </h3>
              {lineasMutantes.map((idx) => {
                const lineNum = idx + 1;
                const texto = lineTextos[lineNum];
                if (!texto) return null;
                return (
                  <div key={idx} className="interp-linea-item">
                    <span className="interp-linea-num">
                      {t('interp.line')} {lineNum}
                    </span>
                    <p className="interp-linea-texto">{texto}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hexagrama Original */}
          <InterpSection hex={hexOriginal} />

          {/* Hexagrama Mutado */}
          {hexMutado && (
            <div className="interp-section mutado-section">
              <div className="mutation-arrow">
                <span>{t('interp.changingLines')} {lineasMutantes.map(i => i + 1).join(', ')}</span>
                <span className="arrow">⟶</span>
              </div>
              <InterpSection hex={hexMutado} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
