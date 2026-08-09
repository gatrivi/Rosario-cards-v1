import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AppShell from './components/Layout/AppShell';
import ErrorBoundary from './components/common/ErrorBoundary';
import reportWebVitals from './reportWebVitals';
import { subscribeToAppUpdates } from './utils/appUpdate';
import { installNovenaAutoProgress } from './utils/novenaAutoProgress';
import { installErrorCapture } from './utils/errorCapture';

const APP_VERSION = '0.3.77';

installNovenaAutoProgress();
installErrorCapture();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/service-worker.js?v=${APP_VERSION}`, { updateViaCache: 'none' })
      .then((registration) => {
        console.log('SW registered:', registration.scope);

        setInterval(() => {
          registration.update().catch(() => {});
        }, 5 * 60 * 1000);

        subscribeToAppUpdates(() => {
          window.dispatchEvent(new CustomEvent('appUpdateAvailable'));
        });
      })
      .catch((err) => console.warn('SW registration failed:', err));
  });
}
