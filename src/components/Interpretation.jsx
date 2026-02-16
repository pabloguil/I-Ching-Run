import React, { useState } from 'react';

export default function Interpretation({ hexOriginal, hexMutado, lineasMutantes }) {
  const [expandido, setExpandido] = useState(true);

  if (!hexOriginal) return null;

  return (
    <div className="interpretation">
      <button
        className="interpretation-toggle"
        onClick={() => setExpandido(!expandido)}
      >
        <span className="toggle-icon">{expandido ? '▾' : '▸'}</span>
        Interpretación
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
              <span>☶ Superior: {hexOriginal.trigrama_superior}</span>
              <span className="trigrama-separator">|</span>
              <span>☷ Inferior: {hexOriginal.trigrama_inferior}</span>
            </div>

            <div className="interp-block">
              <h4>El Juicio</h4>
              <p>{hexOriginal.juicio}</p>
            </div>

            <div className="interp-block">
              <h4>La Imagen</h4>
              <p>{hexOriginal.imagen}</p>
            </div>

            <div className="interp-block">
              <h4>Significado</h4>
              <p>{hexOriginal.significado}</p>
            </div>
          </div>

          {/* Hexagrama Mutado */}
          {hexMutado && (
            <div className="interp-section mutado-section">
              <div className="mutation-arrow">
                <span>Líneas mutantes: {lineasMutantes.map(i => i + 1).join(', ')}</span>
                <span className="arrow">⟶</span>
              </div>

              <h3 className="interp-title">
                {hexMutado.numero}. {hexMutado.chino} &mdash; {hexMutado.nombre}
                <span className="interp-pinyin">({hexMutado.pinyin})</span>
              </h3>

              <div className="interp-trigramas">
                <span>☶ Superior: {hexMutado.trigrama_superior}</span>
                <span className="trigrama-separator">|</span>
                <span>☷ Inferior: {hexMutado.trigrama_inferior}</span>
              </div>

              <div className="interp-block">
                <h4>El Juicio</h4>
                <p>{hexMutado.juicio}</p>
              </div>

              <div className="interp-block">
                <h4>La Imagen</h4>
                <p>{hexMutado.imagen}</p>
              </div>

              <div className="interp-block">
                <h4>Significado</h4>
                <p>{hexMutado.significado}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
