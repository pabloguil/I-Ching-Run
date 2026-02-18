import React, { useEffect, useRef, useState } from 'react';

/**
 * PhaseTransition — envuelve el contenido de cada fase con una animación
 * de entrada (fade + slide) cuando cambia la `phase` prop.
 */
export default function PhaseTransition({ phase, children }) {
  const [displayedPhase, setDisplayedPhase] = useState(phase);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'exit' | 'enter'
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === displayedPhase) {
      // Solo actualiza el contenido sin animación (mismo fase, actualización interna)
      setDisplayedChildren(children);
      return;
    }

    // Fase cambiada: inicia secuencia exit → enter
    setAnimState('exit');

    timerRef.current = setTimeout(() => {
      setDisplayedPhase(phase);
      setDisplayedChildren(children);
      setAnimState('enter');

      timerRef.current = setTimeout(() => {
        setAnimState('idle');
      }, 400);
    }, 250);

    return () => clearTimeout(timerRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cuando el contenido cambia dentro de la misma fase, actualizamos sin animar
  useEffect(() => {
    if (animState === 'idle') {
      setDisplayedChildren(children);
    }
  }, [children, animState]);

  const cls = [
    'phase-transition',
    animState === 'exit' ? 'phase-exit' : '',
    animState === 'enter' ? 'phase-enter' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      {displayedChildren}
    </div>
  );
}
