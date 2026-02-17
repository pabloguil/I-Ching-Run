import React, { useState, useEffect, useRef } from 'react';

const VALOR_NOMBRES = {
  6: 'Yin Mutante',
  7: 'Yang Estable',
  8: 'Yin Estable',
  9: 'Yang Mutante',
};

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

export default function CoinToss({ lineas, ultimaMoneda, onLanzar, completado, animatingLine }) {
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

  return (
    <div className="coin-toss">
      <div className="lineas-count">
        Líneas generadas: {lineas.length} / 6
      </div>

      {!completado && (
        <button
          className="btn btn-lanzar"
          onClick={handleLanzar}
          disabled={isSpinning}
        >
          <span className="coin-icons">☰</span>
          {isSpinning ? 'Lanzando...' : 'Lanzar Monedas'}
          {!isSpinning && (
            <span className="linea-num">(Línea {lineas.length + 1})</span>
          )}
        </button>
      )}

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
      </div>

      {!isSpinning && shownMonedas && ultimaMoneda && (
        <div className={`moneda-resultado ${animatingLine >= 0 ? 'animating' : ''}`}>
          <span className="moneda-valor">
            {ultimaMoneda.valor} &mdash; {VALOR_NOMBRES[ultimaMoneda.valor]}
          </span>
        </div>
      )}

      {lineas.length > 0 && (
        <div className="lineas-detalle">
          {lineas.map((v, i) => (
            <div
              key={i}
              className={`linea-item ${animatingLine === i ? 'nueva' : ''}`}
            >
              <span className="linea-num-label">{i + 1}.</span>
              <span className="linea-valor">{v}</span>
              <span className="linea-tipo">{VALOR_NOMBRES[v]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
