import React, { useState, useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';

/**
 * ShareButton — genera una imagen de la lectura y la comparte o descarga.
 *
 * Dibuja en un canvas offscreen:
 *  - Fondo oscuro + borde dorado
 *  - Caracteres chinos "易經"
 *  - Las 6 líneas del hexagrama original (y mutado si existe)
 *  - Nombre del hexagrama y la pregunta
 */
export default function ShareButton({ pregunta, hexOriginal, hexMutado, lineasMutantes, lineas }) {
  const { t } = useI18n();
  const [sharing, setSharing] = useState(false);
  const canvasRef = useRef(null);

  const dibujarCanvas = () => {
    const W = 600;
    const H = 700;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Fondo
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    // Borde dorado
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // Título "易經"
    ctx.font = '80px serif';
    ctx.fillStyle = '#d4a843';
    ctx.textAlign = 'center';
    ctx.fillText('易經', W / 2, 110);

    // Separador
    ctx.strokeStyle = 'rgba(212,168,67,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(W - 60, 130);
    ctx.stroke();

    // Pregunta
    if (pregunta) {
      ctx.font = 'italic 17px serif';
      ctx.fillStyle = '#a09882';
      ctx.textAlign = 'center';
      const maxW = W - 120;
      wrapText(ctx, `"${pregunta}"`, W / 2, 165, maxW, 24);
    }

    // Hexagramas
    const hasMut = hexMutado && lineasMutantes.length > 0;
    const hexStartY = pregunta ? 230 : 170;

    if (hasMut) {
      drawHexSVG(ctx, lineas, lineasMutantes, false, 120, hexStartY, 160);
      // Flecha
      ctx.font = '28px serif';
      ctx.fillStyle = '#d4a843';
      ctx.textAlign = 'center';
      ctx.fillText('⟶', W / 2, hexStartY + 90);
      const lineasMutadas = lineas.map((v, i) =>
        lineasMutantes.includes(i) ? (v === 6 ? 7 : v === 9 ? 8 : v) : v
      );
      drawHexSVG(ctx, lineasMutadas, [], true, W - 280, hexStartY, 160);
    } else {
      drawHexSVG(ctx, lineas, lineasMutantes, false, W / 2 - 80, hexStartY, 160);
    }

    // Nombres de hexagramas
    const nameY = hexStartY + 210;
    ctx.font = '18px serif';
    ctx.fillStyle = '#e8dcc8';
    ctx.textAlign = 'center';
    if (hasMut) {
      ctx.fillText(`${hexOriginal.numero}. ${hexOriginal.chino} ${hexOriginal.nombre}`, 160, nameY);
      ctx.fillText(`${hexMutado.numero}. ${hexMutado.chino} ${hexMutado.nombre}`, W - 160, nameY);
    } else {
      ctx.fillText(`${hexOriginal.numero}. ${hexOriginal.chino} — ${hexOriginal.nombre}`, W / 2, nameY);
    }

    // Separador inferior
    ctx.strokeStyle = 'rgba(212,168,67,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, nameY + 30);
    ctx.lineTo(W - 60, nameY + 30);
    ctx.stroke();

    // Juicio (primeras 3 líneas)
    ctx.font = '15px serif';
    ctx.fillStyle = '#a09882';
    ctx.textAlign = 'center';
    const juicio = hexOriginal.juicio || '';
    wrapText(ctx, juicio, W / 2, nameY + 60, W - 120, 22, 3);

    // URL
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(160,152,130,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('i-ching.pabloguil.com', W / 2, H - 36);

    return canvas;
  };

  /** Dibuja un hexagrama en canvas como líneas SVG-like */
  function drawHexSVG(ctx, lineas, lineasMutantes, esMutado, x, y, h) {
    const TOTAL = 6;
    const lineH = 11;
    const gapY = (h - TOTAL * lineH) / (TOTAL - 1);
    const lineW = 130;
    const gapX = 18;
    const segW = (lineW - gapX) / 2;

    for (let i = 0; i < TOTAL; i++) {
      const drawIdx = TOTAL - 1 - i;
      const ly = y + drawIdx * (lineH + gapY);
      const val = i < lineas.length ? lineas[i] : null;
      const isMut = lineasMutantes.includes(i);

      if (val === null) {
        ctx.fillStyle = 'rgba(212,168,67,0.15)';
        ctx.fillRect(x, ly, lineW, lineH);
        continue;
      }

      ctx.fillStyle = isMut
        ? (esMutado ? '#d4a843' : '#c0392b')
        : '#e8dcc8';

      if (val % 2 === 0) {
        // Yin — partida
        ctx.fillRect(x, ly, segW, lineH);
        ctx.fillRect(x + segW + gapX, ly, segW, lineH);
      } else {
        // Yang — continua
        ctx.fillRect(x, ly, lineW, lineH);
      }
    }
  }

  /** Ajuste de texto en múltiples líneas */
  function wrapText(ctx, text, x, y, maxW, lineH, maxLines = Infinity) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const { width } = ctx.measureText(testLine);
      if (width > maxW && line !== '') {
        if (linesDrawn >= maxLines - 1) {
          ctx.fillText(line.trim() + '…', x, currentY);
          return;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = words[i] + ' ';
        currentY += lineH;
        linesDrawn++;
      } else {
        line = testLine;
      }
    }
    if (linesDrawn < maxLines) {
      ctx.fillText(line.trim(), x, currentY);
    }
  }

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);

    try {
      const canvas = dibujarCanvas();

      // Intentar Web Share API con archivo
      if (navigator.canShare) {
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], 'iching-lectura.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `I Ching — ${hexOriginal.nombre}`,
            text: pregunta || 'Mi lectura del I Ching',
            files: [file],
          });
          return;
        }
      }

      // Fallback: descargar PNG
      const link = document.createElement('a');
      link.download = `iching-${hexOriginal.numero}-${hexOriginal.nombre.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir:', err);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        className="btn btn-share"
        onClick={handleShare}
        disabled={sharing}
        aria-label={t('share.label')}
        title={t('share.label')}
      >
        {sharing ? '…' : '↗'} {t(sharing ? 'share.generating' : 'share.label')}
      </button>
    </>
  );
}
