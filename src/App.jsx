import React, { useState, useCallback, useEffect } from 'react';
import { useI18n } from './i18n/index.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { useHistory } from './hooks/useHistory.js';
import { useOracle } from './hooks/useOracle.js';
import QuestionForm from './components/QuestionForm';
import CoinToss from './components/CoinToss';
import HexagramDisplay from './components/HexagramDisplay';
import Interpretation from './components/Interpretation';
import AiOracle from './components/AiOracle';
import AuthModal from './components/AuthModal';
import HistorySidebar from './components/HistorySidebar';
import HistoryPage from './components/HistoryPage';
import ConsultaHistorialView from './components/ConsultaHistorialView';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingModal from './components/OnboardingModal';
import PhaseTransition from './components/PhaseTransition';
import ShareButton from './components/ShareButton';
import { calcularMutado } from './utils/randomness';

export default function App() {
  const { lang, setLang, t } = useI18n();
  const { user, configured, logout } = useAuth();
  const history = useHistory();

  // UI state (no relacionado con el oráculo)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('iching-onboarding-done');
  });
  const [vista, setVista] = useState('oracle'); // 'oracle' | 'historial' | 'consulta'
  const [consultaActiva, setConsultaActiva] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState('oracle');

  const verConsulta = useCallback((consulta, desde = 'oracle') => {
    setConsultaActiva(consulta);
    setVistaPrevia(desde);
    setVista('consulta');
  }, []);

  const [tema, setTema] = useState(() => {
    return localStorage.getItem('iching-tema') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  // Sync local history to cloud on first login
  useEffect(() => {
    if (user) {
      history.syncLocalToCloud();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTema = useCallback(() => {
    setTema((t) => {
      const nuevo = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('iching-tema', nuevo);
      return nuevo;
    });
  }, []);

  // Callback de persistencia que recibe el oráculo al completar 6 líneas
  const handleGuardarConsulta = useCallback(async (consulta) => {
    // Guardar en historial híbrido (localStorage o Supabase)
    history.guardarConsulta(consulta);

    // Guardar en BD del servidor (legado, best-effort)
    try {
      await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consulta),
      });
    } catch {
      // Servidor no disponible — la consulta se guardó igualmente en el historial
    }
  }, [history]);

  const oracle = useOracle({ onGuardarConsulta: handleGuardarConsulta });

  const {
    pregunta, setPregunta, preguntaConfirmada,
    lineas, ultimaMoneda, fase, animatingLine,
    hexOriginal, hexMutado, lineasMutantes, tieneMutaciones,
    confirmarPregunta, consultaGeneral, lanzarMonedas, reiniciar,
  } = oracle;

  // --- Consulta Historial view ---
  if (vista === 'consulta' && consultaActiva) {
    return (
      <ConsultaHistorialView
        consulta={consultaActiva}
        onBack={() => setVista(vistaPrevia)}
      />
    );
  }

  // --- History Page view ---
  if (vista === 'historial') {
    return (
      <div className="app">
        <HistoryPage
          consultas={history.consultas}
          onToggleFav={history.toggleFavorito}
          onUpdateNota={history.updateNota}
          onDelete={history.eliminarConsulta}
          onSelect={(c) => verConsulta(c, 'historial')}
          onBack={() => setVista('oracle')}
        />
      </div>
    );
  }

  // --- Main Oracle view ---
  return (
    <div className="app">
      <header className="header">
        <h1 className="title">易經</h1>
        <p className="subtitle">{t('app.subtitle')}</p>
        <div className="header-controls">
          {/* Sidebar toggle */}
          <button
            className="btn-icon-header"
            onClick={() => setShowSidebar(true)}
            aria-label={t('sidebar.title')}
            title={t('sidebar.title')}
          >
            &#9776;
          </button>

          {/* Auth button */}
          {configured && (
            user ? (
              <button
                className="btn-user"
                onClick={logout}
                title={t('auth.logout')}
              >
                {user.email?.charAt(0).toUpperCase() || '?'}
              </button>
            ) : (
              <button
                className="btn-icon-header"
                onClick={() => setShowAuthModal(true)}
                aria-label={t('auth.login')}
                title={t('auth.login')}
              >
                &#128100;
              </button>
            )
          )}

          <button
            className="btn-lang"
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button
            className="btn-tema"
            onClick={toggleTema}
            aria-label={t('theme.toggle')}
            title={tema === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {tema === 'dark' ? '☀' : '☽'}
          </button>
        </div>
      </header>

      <main className="main">
        <ErrorBoundary
          title={t('error.title')}
          message={t('error.message')}
          resetLabel={t('error.reset')}
          onReset={reiniciar}
        >
          <PhaseTransition phase={fase}>
          {fase === 'pregunta' && (
            <QuestionForm
              pregunta={pregunta}
              setPregunta={setPregunta}
              onConfirmar={confirmarPregunta}
              onConsultaGeneral={consultaGeneral}
            />
          )}

          {fase !== 'pregunta' && (
            <>
                  {/* 1. Pregunta */}
              {preguntaConfirmada && (
                <div className="pregunta-display">
                  <span className="pregunta-label">{t('question.yours')}</span>
                  <p className="pregunta-texto">{preguntaConfirmada}</p>
                </div>
              )}

              {/* 2. Hexagramas — siempre visibles desde el inicio */}
              <div className="hexagramas-container">
                <div className="hexagrama-section">
                  <h3 className="section-title">{t('hex.original')}</h3>
                  <HexagramDisplay
                    lineas={lineas}
                    lineasMutantes={lineasMutantes}
                    animatingLine={animatingLine}
                  />
                  {hexOriginal && (
                    <p className="hexagrama-nombre">
                      {hexOriginal.numero}. {hexOriginal.chino} &mdash; {hexOriginal.nombre}
                    </p>
                  )}
                </div>

                {tieneMutaciones ? (
                  <div className="hexagrama-section mutado">
                    <h3 className="section-title">{t('hex.transformed')}</h3>
                    <HexagramDisplay
                      lineas={calcularMutado(lineas)}
                      lineasMutantes={lineasMutantes}
                      esMutado
                    />
                    {hexMutado && (
                      <p className="hexagrama-nombre">
                        {hexMutado.numero}. {hexMutado.chino} &mdash; {hexMutado.nombre}
                      </p>
                    )}
                  </div>
                ) : fase === 'resultado' ? (
                  <div className="hexagrama-section sin-mutacion">
                    <p className="sin-mutaciones-texto">{t('hex.noChanges')}</p>
                  </div>
                ) : null}
              </div>

              {/* 3. Monedas + resultado + botón */}
              <CoinToss
                lineas={lineas}
                ultimaMoneda={ultimaMoneda}
                onLanzar={lanzarMonedas}
                completado={lineas.length >= 6}
                animatingLine={animatingLine}
              />

              {/* 4. Interpretación + IA (solo en resultado) */}
              {fase === 'resultado' && hexOriginal && (
                <ErrorBoundary
                  title={t('error.title')}
                  message={t('error.messageInterp')}
                  resetLabel={t('error.dismiss')}
                >
                  <Interpretation
                    hexOriginal={hexOriginal}
                    hexMutado={hexMutado}
                    lineasMutantes={lineasMutantes}
                  />
                </ErrorBoundary>
              )}

              {fase === 'resultado' && hexOriginal && (
                <ErrorBoundary
                  title={t('error.title')}
                  message={t('error.messageOracle')}
                  resetLabel={t('error.dismiss')}
                >
                  <AiOracle
                    pregunta={preguntaConfirmada}
                    hexOriginal={hexOriginal}
                    hexMutado={hexMutado}
                    lineasMutantes={lineasMutantes}
                  />
                </ErrorBoundary>
              )}

              {fase === 'resultado' && hexOriginal && (
                <div className="resultado-actions">
                  <ShareButton
                    pregunta={preguntaConfirmada}
                    hexOriginal={hexOriginal}
                    hexMutado={hexMutado}
                    lineasMutantes={lineasMutantes}
                    lineas={lineas}
                  />
                  <button className="btn btn-nueva" onClick={reiniciar}>
                    {t('action.newConsultation')}
                  </button>
                </div>
              )}
            </>
          )}
          </PhaseTransition>
        </ErrorBoundary>
      </main>

      <footer className="footer">
        {/* Cloud sync prompt for non-logged-in users */}
        {configured && !user && (
          <p className="cloud-prompt" onClick={() => setShowAuthModal(true)}>
            {t('auth.loginPrompt')}
          </p>
        )}
      </footer>

      {/* Modals & overlays */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showSidebar && (
        <HistorySidebar
          consultas={history.consultas}
          onSelect={(c) => { verConsulta(c, 'oracle'); setShowSidebar(false); }}
          onClose={() => setShowSidebar(false)}
          onOpenFull={() => { setVista('historial'); setShowSidebar(false); }}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          onClose={() => {
            localStorage.setItem('iching-onboarding-done', '1');
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}
