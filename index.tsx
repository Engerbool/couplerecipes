import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { DarkModeProvider } from './contexts/DarkModeContext';
import App from './App';
import i18n from './config/i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DarkModeProvider>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </DarkModeProvider>
  </React.StrictMode>
);