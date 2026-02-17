import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { KING_WEN_MAPPING, HEXAGRAMS } from '../data/hexagrams';
import { HEXAGRAMS_EN } from '../data/hexagrams-en';
import {
  hashPregunta,
  generarLinea,
  getPatron,
  calcularMutado,
  getLineasMutantes,
  hayMutaciones,
} from '../utils/randomness';

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

/**
 * Encapsula todo el estado y la lógica de una sesión de oráculo.
 *
 * @param {Object} options
 * @param {Function} options.onGuardarConsulta - Callback llamado cuando se completan las 6 líneas.
 *   Recibe el objeto de consulta. Puede ser async.
 */
export function useOracle({ onGuardarConsulta }) {
  const { lang } = useI18n();

  // Usamos ref para evitar stale closures en lanzarMonedas sin añadir
  // el callback como dependencia de useCallback.
  const onGuardarRef = useRef(onGuardarConsulta);
  useEffect(() => {
    onGuardarRef.current = onGuardarConsulta;
  });

  const [pregunta, setPregunta] = useState('');
  const [preguntaConfirmada, setPreguntaConfirmada] = useState('');
  const [lineas, setLineas] = useState([]);
  const [ultimaMoneda, setUltimaMoneda] = useState(null);
  const [fase, setFase] = useState('pregunta'); // 'pregunta' | 'lanzando' | 'resultado'
  const [animatingLine, setAnimatingLine] = useState(-1);

  // Derived values — memoized para evitar recalcular en cada render
  const hexOriginal = useMemo(
    () => lineas.length === 6 ? getHexagramaInfo(lineas, lang) : null,
    [lineas, lang]
  );

  const lineasMutantes = useMemo(
    () => lineas.length === 6 ? getLineasMutantes(lineas) : [],
    [lineas]
  );

  const tieneMutaciones = useMemo(
    () => lineas.length === 6 && hayMutaciones(lineas),
    [lineas]
  );

  const hexMutado = useMemo(
    () => tieneMutaciones ? getHexagramaInfo(calcularMutado(lineas), lang) : null,
    [tieneMutaciones, lineas, lang]
  );

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

      await onGuardarRef.current({
        pregunta: preguntaConfirmada,
        lineas: nuevasLineas,
        hexOriginal: original?.numero,
        nombreOriginal: original ? `${original.numero}. ${original.chino} - ${original.nombre}` : 'Desconocido',
        hexMutado: mutado?.numero,
        nombreMutado: mutado ? `${mutado.numero}. ${mutado.chino} - ${mutado.nombre}` : null,
        tieneMutaciones: tieneMut,
      });
    }
  }, [lineas, preguntaConfirmada]);

  const reiniciar = useCallback(() => {
    setPregunta('');
    setPreguntaConfirmada('');
    setLineas([]);
    setUltimaMoneda(null);
    setFase('pregunta');
    setAnimatingLine(-1);
  }, []);

  return {
    // Estado del formulario
    pregunta,
    setPregunta,
    preguntaConfirmada,
    // Estado del lanzamiento
    lineas,
    ultimaMoneda,
    fase,
    animatingLine,
    // Valores derivados (memoizados)
    hexOriginal,
    hexMutado,
    lineasMutantes,
    tieneMutaciones,
    // Acciones
    confirmarPregunta,
    consultaGeneral,
    lanzarMonedas,
    reiniciar,
  };
}
