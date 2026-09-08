const KEY = 'rosa-reading-session-v1';

export function readRoseSession(mystery, prayerIndex) {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY + ':' + mystery + ':' + prayerIndex) || sessionStorage.getItem(KEY) || 'null');
    return value?.mystery === mystery && value?.prayerIndex === prayerIndex ? value : null;
  } catch (_) { return null; }
}

export function saveRoseSession(value) {
  try { sessionStorage.setItem(KEY + ':' + value.mystery + ':' + value.prayerIndex, JSON.stringify(value)); } catch (_) { /* Optional resume storage. */ }
}
