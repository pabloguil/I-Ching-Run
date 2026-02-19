import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/index.jsx';

export default function AuthModal({ onClose }) {
  const { t } = useI18n();
  const { login, signup, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'signup') {
        const user = await signup(email, password);
        if (user && !user.email_confirmed_at) {
          setSignupSuccess(true);
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal-title">
          {mode === 'login' && t('auth.login')}
          {mode === 'signup' && t('auth.signup')}
          {mode === 'forgot' && t('auth.forgotTitle')}
        </h2>

        {signupSuccess ? (
          <div className="auth-success">
            <p>{t('auth.checkEmail')}</p>
            <button className="btn btn-consultar" onClick={onClose}>
              {t('auth.ok')}
            </button>
          </div>
        ) : resetSent ? (
          <div className="auth-success">
            <p>{t('auth.resetSent')}</p>
            <button className="btn btn-consultar" onClick={onClose}>
              {t('auth.ok')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="auth-input"
              required
              autoFocus
            />

            {mode !== 'forgot' && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="auth-input"
                required
                minLength={6}
              />
            )}

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-consultar auth-submit"
              disabled={loading}
            >
              {loading ? '...' : (
                mode === 'login' ? t('auth.loginBtn') :
                mode === 'signup' ? t('auth.signupBtn') :
                t('auth.sendReset')
              )}
            </button>

            {mode === 'login' && (
              <>
                <button
                  type="button"
                  className="auth-switch-btn auth-forgot"
                  onClick={() => switchMode('forgot')}
                >
                  {t('auth.forgotPassword')}
                </button>
                <p className="auth-switch">
                  {t('auth.noAccount')}{' '}
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => switchMode('signup')}
                  >
                    {t('auth.signupLink')}
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="auth-switch">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchMode('login')}
                >
                  {t('auth.loginLink')}
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p className="auth-switch">
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchMode('login')}
                >
                  {t('auth.backToLogin')}
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
