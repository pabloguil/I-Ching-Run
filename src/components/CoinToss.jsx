import React, { useState, useEffect, useRef } from 'react';

const VALOR_NOMBRES = {
  6: 'Yin Mutante',
  7: 'Yang Estable',
  8: 'Yin Estable',
  9: 'Yang Mutante',
};

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
    setTimeout(() => setIsSpinning(false), 900);
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
              const esYang = valor === 'yang';
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
                  style={isSpinning ? { animationDelay: `${i * 80}ms` } : {}}
                >
                  <span className="coin-face">
                    {!isSpinning && valor && (esYang ? '⚊' : '⚋')}
                  </span>
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
