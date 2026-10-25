const KEY = 'rosa-reading-session-v1';

export function readRoseSession(mystery, prayerIndex) {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY + ':' + mystery + ':' + prayerIndex) || sessionStorage.getItem(KEY) || 'null');
    return value?.mystery === mystery && value?.prayerIndex === prayerIndex ? value : null;
  } catch (_) { return null; }
}

/** Forget every saved step of one mystery/devotion so a new pass starts clean. */
export function clearRoseSessions(mystery) {
  try {
    const prefix = KEY + ':' + mystery + ':';
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => sessionStorage.removeItem(key));
  } catch (_) { /* Optional resume storage. */ }
}

export function saveRoseSession(value) {
  try { sessionStorage.setItem(KEY + ':' + value.mystery + ':' + value.prayerIndex, JSON.stringify(value)); } catch (_) { /* Optional resume storage. */ }
}
