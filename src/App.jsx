import React, { useState, useCallback, useEffect } from 'react';
import { useI18n } from './i18n/index.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { useHistory } from './hooks/useHistory.js';
import QuestionForm from './components/QuestionForm';
import CoinToss from './components/CoinToss';
import HexagramDisplay from './components/HexagramDisplay';
import Interpretation from './components/Interpretation';
import AiOracle from './components/AiOracle';
import AuthModal from './components/AuthModal';
import HistorySidebar from './components/HistorySidebar';
import HistoryPage from './components/HistoryPage';
import { KING_WEN_MAPPING, HEXAGRAMS } from './data/hexagrams';
import { HEXAGRAMS_EN } from './data/hexagrams-en';
import {
  hashPregunta,
  generarLinea,
  getPatron,
  calcularMutado,
  getLineasMutantes,
  hayMutaciones,
} from './utils/randomness';

function getHexagramaInfo(lineas, lang) {
  const patron = getPatron(lineas);
  const num = KING_WEN_MAPPING[patron];
  if (!num) return null;
  const base = { ...HEXAGRAMS[num], numero: num };
  if (lang === 'en' && HEXAGRAMS_EN[num]) {
    return { ...base, ...HEXAGRAMS_EN[num] };
  }
  return base;
}

export default function App() {
  const { lang, setLang, t } = useI18n();
  const { user, configured, logout } = useAuth();
  const history = useHistory();

  const [pregunta, setPregunta] = useState('');
  const [preguntaConfirmada, setPreguntaConfirmada] = useState('');
  const [lineas, setLineas] = useState([]);
  const [ultimaMoneda, setUltimaMoneda] = useState(null);
  const [fase, setFase] = useState('pregunta'); // 'pregunta' | 'lanzando' | 'resultado'
  const [animatingLine, setAnimatingLine] = useState(-1);

  // UI state
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

  const confirmarPregunta = useCallback(() => {
    if (!pregunta.trim()) return;
    setPreguntaConfirmada(pregunta.trim());
    setFase('lanzando');
    setLineas([]);
    setUltimaMoneda(null);
  }, [pregunta]);

  const consultaGeneral = useCallback(() => {
    setPreguntaConfirmada('');
    setFase('lanzando');
    setLineas([]);
    setUltimaMoneda(null);
  }, []);

  const lanzarMonedas = useCallback(async () => {
    if (lineas.length >= 6) return;

    const qHash = hashPregunta(preguntaConfirmada);
    const resultado = await generarLinea(qHash);
    const nuevasLineas = [...lineas, resultado.valor];

    setUltimaMoneda(resultado);
    setAnimatingLine(lineas.length);
    setLineas(nuevasLineas);

    setTimeout(() => setAnimatingLine(-1), 600);

    if (nuevasLineas.length === 6) {
      const original = getHexagramaInfo(nuevasLineas, 'es');
      const tieneMut = hayMutaciones(nuevasLineas);
      const mutadoLineas = calcularMutado(nuevasLineas);
      const mutado = tieneMut ? getHexagramaInfo(mutadoLineas, 'es') : null;

      setFase('resultado');

      // Save to hybrid history (localStorage or Supabase)
      history.guardarConsulta({
        pregunta: preguntaConfirmada,
        lineas: nuevasLineas,
        hexOriginal: original?.numero,
        nombreOriginal: original ? `${original.numero}. ${original.chino} - ${original.nombre}` : 'Desconocido',
        hexMutado: mutado?.numero,
        nombreMutado: mutado ? `${mutado.numero}. ${mutado.chino} - ${mutado.nombre}` : null,
        tieneMutaciones: tieneMut,
      });

      // Also save to server DB (legacy, best-effort)
      try {
        await fetch('/api/consultas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pregunta: preguntaConfirmada,
            lineas: nuevasLineas,
            hexOriginal: original?.numero,
            nombreOriginal: original ? `${original.numero}. ${original.chino} - ${original.nombre}` : 'Desconocido',
            hexMutado: mutado?.numero,
            nombreMutado: mutado ? `${mutado.numero}. ${mutado.chino} - ${mutado.nombre}` : null,
            tieneMutaciones: tieneMut,
          }),
        });
      } catch {
        // Server not available — no problem
      }
    }
  }, [lineas, preguntaConfirmada, history]);

  const reiniciar = useCallback(() => {
    setPregunta('');
    setPreguntaConfirmada('');
    setLineas([]);
    setUltimaMoneda(null);
    setFase('pregunta');
    setAnimatingLine(-1);
  }, []);

  const hexOriginal = lineas.length === 6 ? getHexagramaInfo(lineas, lang) : null;
  const lineasMutantes = lineas.length === 6 ? getLineasMutantes(lineas) : [];
  const tieneMutaciones_ = lineas.length === 6 && hayMutaciones(lineas);
  const hexMutado = tieneMutaciones_ ? getHexagramaInfo(calcularMutado(lineas), lang) : null;

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

                {tieneMutaciones_ && hexMutado && (
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

                {!tieneMutaciones_ && lineas.length === 6 && (
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
          onSelect={() => {}}
          onClose={() => setShowSidebar(false)}
          onOpenFull={() => setVista('historial')}
        />
      )}
    </div>
  );
}
