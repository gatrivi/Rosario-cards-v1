/**
 * Helpers for checking and applying PWA / service-worker updates.
 */

import audioManager from './audioManager';

/** Soft two-note chime when a new build is waiting — audible cue to refresh. */
export async function playUpdateAvailableSound() {
  if (typeof window === 'undefined') return;
  const soundOn = localStorage.getItem('rosario_sound_enabled') !== 'false';
  if (!soundOn) return;

  const ctx = audioManager.getContext();
  if (!ctx) return;
  await audioManager.resume();
  if (ctx.state === 'suspended') return;

  const playNote = (freq, t0, gain = 0.09) => {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + 0.03);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.6);
  };

  const t = ctx.currentTime;
  playNote(784, t, 0.08);
  playNote(988, t + 0.22, 0.07);
}

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
