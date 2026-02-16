import React from 'react';

const VALOR_NOMBRES = {
  6: 'Yin Mutante ⚋✕',
  7: 'Yang Estable ⚊',
  8: 'Yin Estable ⚋',
  9: 'Yang Mutante ⚊○',
};

export default function CoinToss({ lineas, ultimaMoneda, onLanzar, completado, animatingLine }) {
  return (
    <div className="coin-toss">
      <div className="lineas-count">
        Líneas generadas: {lineas.length} / 6
      </div>

      {!completado && (
        <button className="btn btn-lanzar" onClick={onLanzar}>
          <span className="coin-icons">☰</span>
          Lanzar Monedas
          <span className="linea-num">(Línea {lineas.length + 1})</span>
        </button>
      )}

      {ultimaMoneda && (
        <div className={`moneda-resultado ${animatingLine >= 0 ? 'animating' : ''}`}>
          <span className="moneda-tiradas">
            Tiradas: {ultimaMoneda.monedas.join(', ')}
          </span>
          <span className="moneda-valor">
            = {ultimaMoneda.valor} → {VALOR_NOMBRES[ultimaMoneda.valor]}
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
