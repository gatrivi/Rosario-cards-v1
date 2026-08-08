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

const UPDATE_WAIT_TIMEOUT_MS = 4000;

function waitForWaitingWorker(registration) {
  if (registration?.waiting) return Promise.resolve(registration.waiting);

  return new Promise((resolve) => {
    let installing = null;
    let timer = null;

    const cleanup = () => {
      registration?.removeEventListener?.('updatefound', inspect);
      installing?.removeEventListener?.('statechange', onStateChange);
      if (timer) clearTimeout(timer);
    };
    const finish = () => {
      cleanup();
      resolve(registration?.waiting || null);
    };
    const onStateChange = () => {
      if (installing?.state === 'installed') {
        setTimeout(finish, 0);
      }
    };
    const inspect = () => {
      if (registration?.waiting) {
        finish();
        return;
      }
      const next = registration?.installing;
      if (next && next !== installing) {
        installing?.removeEventListener?.('statechange', onStateChange);
        installing = next;
        installing.addEventListener('statechange', onStateChange);
      }
    };

    registration?.addEventListener?.('updatefound', inspect);
    inspect();
    timer = setTimeout(finish, UPDATE_WAIT_TIMEOUT_MS);
  });
}

function activateWaitingWorker(worker) {
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      try {
        window.location.reload();
      } finally {
        resolve(true);
      }
    };
    const onControllerChange = () => finish();

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    worker.postMessage('skipWaiting');
    setTimeout(finish, 8000);
  });
}

/** Activate the waiting worker, then reload after Android has taken control. */
export async function applyPendingUpdate() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (!('serviceWorker' in navigator)) {
    window.location.reload();
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration?.();
  if (!registration) {
    window.location.reload();
    return false;
  }

  let waiting = registration.waiting;
  if (!waiting) {
    const waitingPromise = waitForWaitingWorker(registration);
    try {
      await registration.update();
    } catch (_) {
      return false;
    }
    waiting = await waitingPromise;
  }

  if (!waiting) return false;
  return activateWaitingWorker(waiting);
}

export function subscribeToAppUpdates(onUpdateAvailable) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return () => {};

  let disposed = false;
  let registration = null;
  let installing = null;
  let onStateChange = null;

  const notifyIfWaiting = () => {
    if (!disposed && registration?.waiting && navigator.serviceWorker.controller) {
      onUpdateAvailable?.();
    }
  };
  const watchInstalling = () => {
    const next = registration?.installing;
    if (!next || next === installing) return;
    installing = next;
    onStateChange = () => {
      if (installing?.state === 'installed') notifyIfWaiting();
    };
    installing.addEventListener('statechange', onStateChange);
  };
  const handleUpdateFound = () => watchInstalling();

  navigator.serviceWorker.ready.then((readyRegistration) => {
    if (disposed) return;
    registration = readyRegistration;
    registration.addEventListener('updatefound', handleUpdateFound);
    notifyIfWaiting();
    watchInstalling();
    registration.update().catch(() => {});
  }).catch(() => {});

  return () => {
    disposed = true;
    registration?.removeEventListener?.('updatefound', handleUpdateFound);
    installing?.removeEventListener?.('statechange', onStateChange);
  };
}
