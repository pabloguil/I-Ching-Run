import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import es from './es';
import en from './en';

const translations = { es, en };

const I18nContext = createContext();

const SEO = {
  es: {
    title: 'I Ching - 易經 El Libro de las Mutaciones',
    description: 'Consulta el oráculo milenario del I Ching. Lanza monedas, genera hexagramas y recibe interpretaciones ancestrales con sabiduría taoísta.',
  },
  en: {
    title: 'I Ching - 易經 The Book of Changes',
    description: 'Consult the ancient I Ching oracle. Cast coins, generate hexagrams and receive ancestral interpretations with Taoist wisdom.',
  },
};

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('iching-lang');
    if (saved) return saved;
    return navigator.language.startsWith('en') ? 'en' : 'es';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = SEO[lang].title;
    localStorage.setItem('iching-lang', lang);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', SEO[lang].description);
  }, [lang]);

  const t = useCallback((key, params) => {
    let text = translations[lang]?.[key] || translations.es[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
