import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/index.jsx';

export default function AuthModal({ onClose }) {
  const { t } = useI18n();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else {
        const user = await signup(email, password);
        if (user && !user.email_confirmed_at) {
          setSignupSuccess(true);
        } else {
          onClose();
        }
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
          {mode === 'login' ? t('auth.login') : t('auth.signup')}
        </h2>

        {signupSuccess ? (
          <div className="auth-success">
            <p>{t('auth.checkEmail')}</p>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              className="auth-input"
              required
              minLength={6}
            />

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-consultar auth-submit"
              disabled={loading}
            >
              {loading
                ? '...'
                : mode === 'login'
                  ? t('auth.loginBtn')
                  : t('auth.signupBtn')}
            </button>

            <p className="auth-switch">
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              >
                {mode === 'login' ? t('auth.signupLink') : t('auth.loginLink')}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
