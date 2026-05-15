import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppShell from './components/Layout/AppShell';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);

        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);

        // If a new service worker is waiting, tell it to skip waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available — force reload to activate it
                window.location.reload();
              }
            });
          }
        });
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
