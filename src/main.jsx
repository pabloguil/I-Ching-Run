import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n/index.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </React.StrictMode>
);
