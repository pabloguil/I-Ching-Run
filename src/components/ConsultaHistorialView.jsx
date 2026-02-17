import React from 'react';
import { useI18n } from '../i18n/index.jsx';
import { HEXAGRAMS } from '../data/hexagrams';
import { HEXAGRAMS_EN } from '../data/hexagrams-en';
import { getLineasMutantes, calcularMutado } from '../utils/randomness';
import HexagramDisplay from './HexagramDisplay';
import Interpretation from './Interpretation';
import AiOracle from './AiOracle';

function getHexInfo(num, lang) {
  if (!num || !HEXAGRAMS[num]) return null;
  const base = { ...HEXAGRAMS[num], numero: num };
  if (lang === 'en' && HEXAGRAMS_EN[num]) {
    return { ...base, ...HEXAGRAMS_EN[num] };
  }
  return base;
}

export default function ConsultaHistorialView({ consulta, onBack }) {
  const { lang, t } = useI18n();

  const lineas = Array.isArray(consulta.lineas) ? consulta.lineas : [];
  const lineasMutantes = lineas.length === 6 ? getLineasMutantes(lineas) : [];
  const tieneMutaciones = lineasMutantes.length > 0;

  const hexNumOriginal = consulta.hexagrama_original ?? consulta.hexOriginal;
  const hexNumMutado = consulta.hexagrama_mutado ?? consulta.hexMutado;

  const hexOriginal = getHexInfo(hexNumOriginal, lang);
  const hexMutado = tieneMutaciones ? getHexInfo(hexNumMutado, lang) : null;

  const pregunta = consulta.pregunta || '';
  const fecha = new Date(consulta.created_at || consulta.fecha);
  const dateLang = lang === 'en' ? 'en-US' : 'es-ES';

  return (
    <div className="app">
      <div className="history-page-header">
        <button className="btn btn-back" onClick={onBack}>
          &larr; {t('historyPage.back')}
        </button>
        <span className="hf-date consulta-historial-fecha">
          {fecha.toLocaleDateString(dateLang, { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <main className="main">
        {/* Pregunta */}
        {pregunta && (
          <div className="pregunta-display">
            <span className="pregunta-label">{t('question.yours')}</span>
            <p className="pregunta-texto">{pregunta}</p>
          </div>
        )}

        {/* Hexagramas */}
        {lineas.length === 6 && (
          <div className="hexagramas-container">
            <div className="hexagrama-section">
              <h3 className="section-title">{t('hex.original')}</h3>
              <HexagramDisplay
                lineas={lineas}
                lineasMutantes={lineasMutantes}
              />
              {hexOriginal && (
                <p className="hexagrama-nombre">
                  {hexOriginal.numero}. {hexOriginal.chino} &mdash; {hexOriginal.nombre}
                </p>
              )}
            </div>

            {tieneMutaciones ? (
              <div className="hexagrama-section mutado">
                <h3 className="section-title">{t('hex.transformed')}</h3>
                <HexagramDisplay
                  lineas={calcularMutado(lineas)}
                  lineasMutantes={lineasMutantes}
                  esMutado
                />
                {hexMutado && (
                  <p className="hexagrama-nombre">
                    {hexMutado.numero}. {hexMutado.chino} &mdash; {hexMutado.nombre}
                  </p>
                )}
              </div>
            ) : (
              <div className="hexagrama-section sin-mutacion">
                <p className="sin-mutaciones-texto">{t('hex.noChanges')}</p>
              </div>
            )}
          </div>
        )}

        {/* Interpretation */}
        {hexOriginal && (
          <Interpretation
            hexOriginal={hexOriginal}
            hexMutado={hexMutado}
            lineasMutantes={lineasMutantes}
          />
        )}

        {/* AiOracle */}
        {hexOriginal && (
          <AiOracle
            pregunta={pregunta}
            hexOriginal={hexOriginal}
            hexMutado={hexMutado}
            lineasMutantes={lineasMutantes}
          />
        )}
      </main>
    </div>
  );
}
