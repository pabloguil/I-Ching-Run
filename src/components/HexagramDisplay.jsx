import React from 'react';

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
  const width = 200;
  const height = 240;
  const segmentLength = 80;
  const gapLength = 24;
  const lineWidth = 12;
  const leftMargin = 18;
  const topMargin = 25;
  const lineSpacing = 36;

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
          </g>
        );
      }
    }

    return elements;
  };

  return (
    <div className="hexagram-svg-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="hexagram-svg"
        role="img"
        aria-label="Hexagrama del I Ching"
      >
        {renderLineas()}
      </svg>
    </div>
  );
}
