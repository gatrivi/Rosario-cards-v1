/**
 * Helpers for checking and applying PWA / service-worker updates.
 */

export function applyPendingUpdate() {
  if (!('serviceWorker' in navigator)) {
    window.location.reload();
    return;
  }

  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration?.waiting) {
      registration.waiting.postMessage('skipWaiting');
    }
    registration?.update().finally(() => {
      window.location.reload();
    });
  });
}

export function subscribeToAppUpdates(onUpdateAvailable) {
  if (!('serviceWorker' in navigator)) return () => {};

  const notifyIfWaiting = (registration) => {
    if (registration?.waiting) {
      onUpdateAvailable();
    }
  };

  const handleControllerChange = () => {
    onUpdateAvailable();
  };

  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

  navigator.serviceWorker.ready.then((registration) => {
    notifyIfWaiting(registration);

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdateAvailable();
        }
      });
    });

    registration.update();
  });

  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
  };
}
