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
import { calcularMutado } from './utils/randomness';

export default function App() {
  const { lang, setLang, t } = useI18n();
  const { user, configured, logout } = useAuth();
  const history = useHistory();

  // UI state (no relacionado con el oráculo)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [vista, setVista] = useState('oracle'); // 'oracle' | 'historial'

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

  // --- History Page view ---
  if (vista === 'historial') {
    return (
      <div className="app">
        <HistoryPage
          consultas={history.consultas}
          onToggleFav={history.toggleFavorito}
          onUpdateNota={history.updateNota}
          onDelete={history.eliminarConsulta}
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
            {fase === 'lanzando' && preguntaConfirmada && (
              <div className="pregunta-display">
                <span className="pregunta-label">{t('question.yours')}</span>
                <p className="pregunta-texto">{preguntaConfirmada}</p>
              </div>
            )}

            <CoinToss
              lineas={lineas}
              ultimaMoneda={ultimaMoneda}
              onLanzar={lanzarMonedas}
              completado={lineas.length >= 6}
              animatingLine={animatingLine}
            />

            {lineas.length > 0 && (
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

                {tieneMutaciones && hexMutado && (
                  <div className="hexagrama-section mutado">
                    <h3 className="section-title">{t('hex.transformed')}</h3>
                    <HexagramDisplay
                      lineas={calcularMutado(lineas)}
                      lineasMutantes={lineasMutantes}
                      esMutado
                    />
                    <p className="hexagrama-nombre">
                      {hexMutado.numero}. {hexMutado.chino} &mdash; {hexMutado.nombre}
                    </p>
                  </div>
                )}

                {!tieneMutaciones && lineas.length === 6 && (
                  <div className="hexagrama-section mutado sin-mutacion">
                    <p className="sin-mutaciones-texto">{t('hex.noChanges')}</p>
                  </div>
                )}
              </div>
            )}

            {fase === 'resultado' && hexOriginal && (
              <Interpretation
                hexOriginal={hexOriginal}
                hexMutado={hexMutado}
                lineasMutantes={lineasMutantes}
              />
            )}

            {fase === 'resultado' && hexOriginal && (
              <AiOracle
                pregunta={preguntaConfirmada}
                hexOriginal={hexOriginal}
                hexMutado={hexMutado}
                lineasMutantes={lineasMutantes}
              />
            )}

            {fase === 'resultado' && (
              <button className="btn btn-nueva" onClick={reiniciar}>
                {t('action.newConsultation')}
              </button>
            )}
          </>
        )}
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
          onSelect={() => setVista('historial')}
          onClose={() => setShowSidebar(false)}
          onOpenFull={() => setVista('historial')}
        />
      )}
    </div>
  );
}
