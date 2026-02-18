import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';

function YangFace() {
  return (
    <svg viewBox="-250 -250 500 500" className="coin-svg">
      <circle r="230" strokeWidth="10" />
      <circle r="200" strokeWidth="6" />
      <rect x="-60" y="-60" width="120" height="120" strokeWidth="10" />
      <text x="0" y="-125" fontSize="110">通</text>
      <text x="0" y="145" fontSize="110">寶</text>
      <text x="-145" y="0" fontSize="110">通</text>
      <text x="145" y="0" fontSize="110">寶</text>
    </svg>
  );
}

function YinFace() {
  return (
    <svg viewBox="-250 -250 500 500" className="coin-svg">
      <circle r="230" strokeWidth="10" />
      <circle r="200" strokeWidth="6" />
      <rect x="-60" y="-60" width="120" height="120" strokeWidth="10" />
      <text x="0" y="145" fontSize="96">易經</text>
    </svg>
  );
}

/** Mini-hexagrama en construcción: muestra las líneas generadas hasta ahora */
function MiniHexagram({ lineas, animatingLine }) {
  const TOTAL = 6;
  const lineHeight = 8;
  const gapHeight = 6;
  const svgHeight = TOTAL * (lineHeight + gapHeight);
  const svgWidth = 100;
  const segLen = 38;
  const gap = 12;
  const left = 6;

  const items = [];
  for (let i = 0; i < TOTAL; i++) {
    // Dibujamos de arriba hacia abajo: índice TOTAL-1-i en y
    const drawIndex = TOTAL - 1 - i;
    const y = drawIndex * (lineHeight + gapHeight) + lineHeight / 2;
    const filled = i < lineas.length;
    const isNew = animatingLine === i;

    if (!filled) {
      // Línea pendiente — placeholder semitransparente
      items.push(
        <rect
          key={`ph-${i}`}
          x={left}
          y={y - lineHeight / 2}
          width={segLen * 2 + gap}
          height={lineHeight}
          rx={2}
          fill="var(--border-subtle)"
          opacity={0.4}
        />
      );
    } else {
      const valor = lineas[i];
      const esYin = valor % 2 === 0;
      const esMutante = valor === 6 || valor === 9;
      const color = esMutante ? '#c0392b' : 'var(--hex-line-color)';
      const cls = isNew ? 'line-animate' : '';

      if (esYin) {
        items.push(
          <g key={`line-${i}`} className={cls}>
            <rect x={left} y={y - lineHeight / 2} width={segLen} height={lineHeight} rx={2} fill={color} />
            <rect x={left + segLen + gap} y={y - lineHeight / 2} width={segLen} height={lineHeight} rx={2} fill={color} />
          </g>
        );
      } else {
        items.push(
          <g key={`line-${i}`} className={cls}>
            <rect x={left} y={y - lineHeight / 2} width={segLen * 2 + gap} height={lineHeight} rx={2} fill={color} />
          </g>
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="mini-hexagram-svg"
      aria-hidden="true"
    >
      {items}
    </svg>
  );
}

export default function CoinToss({ lineas, ultimaMoneda, onLanzar, completado, animatingLine }) {
  const { t } = useI18n();
  const [isSpinning, setIsSpinning] = useState(false);
  const [shownMonedas, setShownMonedas] = useState(null);
  const prevUltimaMonedaRef = useRef(null);

  const handleLanzar = () => {
    if (isSpinning) return;
    prevUltimaMonedaRef.current = ultimaMoneda;
    setIsSpinning(true);
    setShownMonedas(null);
    onLanzar();
    setTimeout(() => setIsSpinning(false), 1300);
  };

  useEffect(() => {
    if (!isSpinning && ultimaMoneda && ultimaMoneda !== prevUltimaMonedaRef.current) {
      setShownMonedas(ultimaMoneda.monedas);
      prevUltimaMonedaRef.current = ultimaMoneda;
    }
  }, [isSpinning, ultimaMoneda]);

  const lineaActual = lineas.length + 1;
  const progreso = (lineas.length / 6) * 100;

  return (
    <div className="coin-toss">
      {/* Barra de progreso + contador */}
      <div className="coins-progress">
        <div className="coins-progress-bar" role="progressbar" aria-valuenow={lineas.length} aria-valuemin={0} aria-valuemax={6} aria-label={t('coins.count', { count: lineas.length })}>
          <div className="coins-progress-fill" style={{ width: `${progreso}%` }} />
        </div>
        <span className="coins-progress-label">
          {t('coins.count', { count: lineas.length })}
        </span>
      </div>

      {/* Área principal: monedas + mini-hexagrama */}
      <div className="coins-main">
        <div className="coins-visual">
          {(isSpinning || shownMonedas) && (
            <div className="coins-row">
              {[0, 1, 2].map((i) => {
                const valor = shownMonedas ? shownMonedas[i] : null;
                return (
                  <div
                    key={i}
                    className={`coin ${
                      isSpinning
                        ? 'coin-spinning'
                        : valor
                        ? `coin-${valor}`
                        : ''
                    }`}
                  >
                    <div
                      className="coin-inner"
                      style={isSpinning ? { animationDelay: `${i * 120}ms` } : undefined}
                    >
                      <div className="coin-front">
                        <YangFace />
                      </div>
                      <div className="coin-back">
                        <YinFace />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isSpinning && shownMonedas && ultimaMoneda && (
            <div className={`moneda-resultado ${animatingLine >= 0 ? 'animating' : ''}`}>
              <span className="moneda-valor">
                {ultimaMoneda.valor} &mdash; {t(`coins.${ultimaMoneda.valor}`)}
              </span>
            </div>
          )}
        </div>

        {/* Mini-hexagrama en construcción */}
        <div className="mini-hexagram-wrapper" aria-hidden="true">
          <MiniHexagram lineas={lineas} animatingLine={animatingLine} />
        </div>
      </div>

      {!completado && (
        <button
          className="btn btn-lanzar"
          onClick={handleLanzar}
          disabled={isSpinning}
          aria-label={t('coins.cast') + ' ' + t('coins.line', { num: lineaActual })}
        >
          <span className="coin-icons" aria-hidden="true">☰</span>
          {isSpinning ? t('coins.casting') : t('coins.cast')}
          {!isSpinning && (
            <span className="linea-num">{t('coins.line', { num: lineaActual })}</span>
          )}
        </button>
      )}

      {lineas.length > 0 && (
        <div className="lineas-detalle" role="list" aria-label={t('coins.linesHistory')}>
          {lineas.map((v, i) => (
            <div
              key={i}
              role="listitem"
              className={`linea-item ${animatingLine === i ? 'nueva' : ''} linea-tipo-${v}`}
            >
              <span className="linea-num-label">{i + 1}.</span>
              <span className="linea-valor">{v}</span>
              <span className="linea-tipo">{t(`coins.${v}`)}</span>
              {(v === 6 || v === 9) && (
                <span className="linea-mutante-badge" aria-label={t('coins.changing')}>
                  {v === 6 ? '×' : '○'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
