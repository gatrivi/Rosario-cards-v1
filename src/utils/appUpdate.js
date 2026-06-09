/**
 * Helpers for checking and applying PWA / service-worker updates.
 */

import audioManager from './audioManager';

/** Soft chime when a new build is waiting — always plays (independent of prayer sounds). */
export async function playUpdateAvailableSound() {
  if (typeof window === 'undefined') return;

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([40, 60, 40]);
  }

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
  playNote(659.25, t, 0.075);
  playNote(830.61, t + 0.2, 0.07);
  playNote(987.77, t + 0.4, 0.065);
}

let updateReminderTimer = null;

/** Schedule one gentle repeat if the user is still on an old build. */
export function scheduleUpdateReminder(onReminder) {
  if (updateReminderTimer) clearTimeout(updateReminderTimer);
  updateReminderTimer = setTimeout(() => {
    updateReminderTimer = null;
    onReminder?.();
  }, 90000);
}

export function clearUpdateReminder() {
  if (updateReminderTimer) {
    clearTimeout(updateReminderTimer);
    updateReminderTimer = null;
  }
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
