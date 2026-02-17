import React, { useRef, useEffect } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function QuestionForm({ pregunta, setPregunta, onConfirmar, onConsultaGeneral }) {
  const { t } = useI18n();
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
        {t('question.label')}
      </label>

      <textarea
        ref={textareaRef}
        className="form-textarea"
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('question.placeholder')}
        rows={3}
      />

      <button
        className="btn btn-consultar"
        onClick={onConfirmar}
        disabled={!pregunta.trim()}
      >
        {t('question.submit')}
      </button>

      <div className="consulta-divider">
        <span>{t('question.or')}</span>
      </div>

      <button className="btn btn-general" onClick={onConsultaGeneral}>
        {t('question.general')}
      </button>
    </div>
  );
}
