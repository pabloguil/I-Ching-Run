import React from 'react';
import { useI18n } from '../i18n/index.jsx';

/**
 * Dibuja un hexagrama como SVG.
 * Las líneas se dibujan de arriba (línea 6) hacia abajo (línea 1),
 * igual que en la tradición del I Ching.
 *
 * Yang (impar): línea continua ———
 * Yin (par): línea partida  — —
 * Mutante: se muestra en rojo/dorado
 */
export default function HexagramDisplay({ lineas, lineasMutantes = [], animatingLine = -1, esMutado = false }) {
  const { t } = useI18n();
  const width = 180;
  const height = 180;
  const segmentLength = 68;
  const gapLength = 20;
  const lineWidth = 10;
  const leftMargin = 14;
  const topMargin = 18;
  const lineSpacing = 29;

  const normalColor = '#e8dcc8';    // Papel de arroz
  const mutantColor = '#c0392b';    // Rojo cinabrio
  const mutadoColor = '#d4a843';    // Dorado

  const renderLineas = () => {
    const elements = [];
    const n = lineas.length;

    for (let i = 0; i < n; i++) {
      // Dibujar de arriba hacia abajo: la línea 6 (índice 5) arriba, línea 1 (índice 0) abajo
      const drawIndex = n - 1 - i;
      const y = topMargin + drawIndex * lineSpacing;
      const valor = lineas[i];
      const esMutante = lineasMutantes.includes(i);
      const esAnimando = animatingLine === i;

      let color = normalColor;
      if (esMutante && !esMutado) color = mutantColor;
      if (esMutante && esMutado) color = mutadoColor;

      const opacity = esAnimando ? 'line-animate' : '';

      if (valor % 2 === 0) {
        // Yin: línea partida
        elements.push(
          <g key={`line-${i}`} className={opacity}>
            <rect
              x={leftMargin}
              y={y - lineWidth / 2}
              width={segmentLength}
              height={lineWidth}
              fill={color}
              rx={2}
            />
            <rect
              x={leftMargin + segmentLength + gapLength}
              y={y - lineWidth / 2}
              width={segmentLength}
              height={lineWidth}
              fill={color}
              rx={2}
            />
            {/* Marcador accesible para yin mutante (6): × en el hueco central */}
            {esMutante && (
              <text
                x={leftMargin + segmentLength + gapLength / 2}
                y={y + 4}
                textAnchor="middle"
                fontSize="10"
                fill={color}
                aria-hidden="true"
              >×</text>
            )}
          </g>
        );
      } else {
        // Yang: línea continua
        elements.push(
          <g key={`line-${i}`} className={opacity}>
            <rect
              x={leftMargin}
              y={y - lineWidth / 2}
              width={segmentLength * 2 + gapLength}
              height={lineWidth}
              fill={color}
              rx={2}
            />
            {/* Marcador accesible para yang mutante (9): ○ centrado sobre la línea */}
            {esMutante && (
              <text
                x={leftMargin + (segmentLength * 2 + gapLength) / 2}
                y={y - lineWidth / 2 - 3}
                textAnchor="middle"
                fontSize="10"
                fill={color}
                aria-hidden="true"
              >○</text>
            )}
          </g>
        );
      }
    }

    return elements;
  };

  const hasMutantes = lineasMutantes.length > 0;
  const swatchColor = esMutado ? mutadoColor : mutantColor;
  const legendLabel = esMutado ? t('hex.transformedLegend') : t('hex.changingLegend');

  return (
    <div className="hexagram-svg-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="hexagram-svg"
        role="img"
        aria-label={t('hex.ariaLabel')}
      >
        {renderLineas()}
      </svg>
      {hasMutantes && (
        <div className="hexagram-legend">
          <span
            className="legend-swatch"
            style={{ background: swatchColor }}
            aria-hidden="true"
          />
          <span className="legend-text">{legendLabel}</span>
        </div>
      )}
    </div>
  );
}
