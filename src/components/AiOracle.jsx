import React, { useState, useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';

const TIMEOUT_MS = 30_000;

export default function AiOracle({ pregunta, hexOriginal, hexMutado, lineasMutantes }) {
  const { lang, t } = useI18n();
  const [estado, setEstado] = useState('idle'); // 'idle' | 'loading' | 'streaming' | 'done' | 'error'
  const [texto, setTexto] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(null);

  const cancelar = () => {
    abortRef.current?.abort('user');
  };

  const consultar = async () => {
    if (estado === 'loading' || estado === 'streaming') return;
    setEstado('loading');
    setTexto('');
    setErrorMsg('');

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS);

    // Track accumulated text locally to read it reliably inside catch
    let accumulated = '';

    try {
      const res = await fetch('/api/oraculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          pregunta: pregunta || '',
          hexagrama: hexOriginal.numero,
          nombreHexagrama: `${hexOriginal.chino} — ${hexOriginal.nombre}`,
          juicio: hexOriginal.juicio,
          imagen: hexOriginal.imagen,
          hexMutado: hexMutado?.numero || null,
          nombreMutado: hexMutado ? `${hexMutado.chino} — ${hexMutado.nombre}` : null,
          lineasMutantes: lineasMutantes || [],
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }

      setEstado('streaming');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            setEstado('done');
            continue;
          }

          let parsed;
          try { parsed = JSON.parse(data); } catch { continue; }

          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) {
            accumulated += parsed.text;
            setTexto(accumulated);
          }
        }
      }

      setEstado('done');
    } catch (err) {
      clearTimeout(timeoutId);

      if (controller.signal.aborted) {
        if (controller.signal.reason === 'timeout') {
          setErrorMsg(t('oracle.timeout'));
          setEstado('error');
        } else {
          // Cancelación manual: conservar texto parcial si ya llegó algo
          if (accumulated) {
            setTexto(accumulated + '\n\n— ' + t('oracle.interrupted'));
            setEstado('done');
          } else {
            setEstado('idle');
          }
        }
        return;
      }

      setErrorMsg(err.message || 'Error');
      setEstado('error');
    } finally {
      abortRef.current = null;
    }
  };

  const isActive = estado === 'loading' || estado === 'streaming';

  return (
    <div className="ai-oracle">
      <div className="ai-oracle-header">
        <div className="ai-oracle-header-text">
          <span className="ai-oracle-label">{t('oracle.label')}</span>
          {estado === 'idle' && (
            <span className="ai-oracle-desc">{t('oracle.desc')}</span>
          )}
        </div>
        {(estado === 'idle' || estado === 'error') && (
          <button className="btn btn-oracle btn-oracle-prominent" onClick={consultar}>
            ✦ {t('oracle.consult')}
          </button>
        )}
        {isActive && (
          <button className="btn btn-oracle-cancel" onClick={cancelar}>
            {t('oracle.cancel')}
          </button>
        )}
      </div>

      {estado === 'loading' && (
        <div className="ai-oracle-loading">
          <span className="oracle-dot" />
          <span className="oracle-dot" />
          <span className="oracle-dot" />
        </div>
      )}

      {(estado === 'streaming' || estado === 'done') && texto && (
        <div className="ai-oracle-text">
          <p>
            {texto}
            {estado === 'streaming' && <span className="cursor-blink">▋</span>}
          </p>
        </div>
      )}

      {estado === 'error' && (
        <p className="ai-oracle-error">{errorMsg}</p>
      )}
    </div>
  );
}
