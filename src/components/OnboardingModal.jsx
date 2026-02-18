import React, { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

const STEPS = ['onboarding.step1', 'onboarding.step2', 'onboarding.step3'];

const STEP_ICONS = ['❓', '☰', '☯'];

export default function OnboardingModal({ onClose }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleSkip} role="dialog" aria-modal="true" aria-label={t('onboarding.title')}>
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="onboarding-header">
          <span className="onboarding-brand">易經</span>
          <button className="onboarding-skip" onClick={handleSkip} aria-label={t('onboarding.skip')}>
            {t('onboarding.skip')}
          </button>
        </div>

        {/* Paso actual */}
        <div className="onboarding-body">
          <div className="onboarding-step-icon" aria-hidden="true">
            {STEP_ICONS[step]}
          </div>
          <h2 className="onboarding-step-title">
            {t(`${STEPS[step]}.title`)}
          </h2>
          <p className="onboarding-step-desc">
            {t(`${STEPS[step]}.desc`)}
          </p>
        </div>

        {/* Indicadores de progreso */}
        <div className="onboarding-dots" role="tablist" aria-label={t('onboarding.progress')}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === step}
              aria-label={`${t('onboarding.step')} ${i + 1}`}
              className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {/* Botones de navegación */}
        <div className="onboarding-footer">
          {step > 0 && (
            <button className="btn onboarding-btn-back" onClick={() => setStep((s) => s - 1)}>
              {t('onboarding.back')}
            </button>
          )}
          <button className="btn btn-consultar onboarding-btn-next" onClick={handleNext}>
            {isLast ? t('onboarding.start') : t('onboarding.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
