import React, { useRef, useEffect } from 'react';

export default function QuestionForm({ pregunta, setPregunta, onConfirmar }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onConfirmar();
    }
  };

  return (
    <div className="question-form">
      <div className="form-decoration">
        <span className="deco-line"></span>
        <span className="deco-symbol">☯</span>
        <span className="deco-line"></span>
      </div>

      <label className="form-label">
        Concentra tu mente en la pregunta y escríbela a continuación
      </label>

      <textarea
        ref={textareaRef}
        className="form-textarea"
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu pregunta al oráculo..."
        rows={3}
      />

      <button
        className="btn btn-consultar"
        onClick={onConfirmar}
        disabled={!pregunta.trim()}
      >
        Consultar el Oráculo
      </button>
    </div>
  );
}
