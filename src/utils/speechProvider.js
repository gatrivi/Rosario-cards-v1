/**
 * Speech provider abstraction.
 * Deepgram is NOT wired yet — browser Web Speech API is the default on mobile/desktop.
 */

export function isDeepgramConfigured() {
  return Boolean(process.env.REACT_APP_DEEPGRAM_API_KEY);
}

export function getSpeechProviderLabel() {
  if (isDeepgramConfigured()) return 'Deepgram';
  if (getBrowserSpeechRecognition()) return 'Navegador (es-ES)';
  return 'No disponible';
}

export function getBrowserSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/** Normalize for loose matching of spoken vs written prayer */
export function normalizeSpeechText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if spoken transcript likely finished the prayer.
 * Looks for amén or overlap with the last words of the expected text.
 */
export function prayerSpeechLooksComplete(expectedText, transcript) {
  const normExpected = normalizeSpeechText(expectedText);
  const normSpoken = normalizeSpeechText(transcript);
  if (!normSpoken) return false;

  if (/\bamen\b/.test(normSpoken) || normSpoken.endsWith('amen')) {
    return true;
  }

  const expectedWords = normExpected.split(' ').filter(Boolean);
  if (expectedWords.length < 3) {
    return normSpoken.length >= normExpected.length * 0.5;
  }

  const tail = expectedWords.slice(-5).join(' ');
  if (tail.length > 8 && normSpoken.includes(tail)) {
    return true;
  }

  const spokenWords = new Set(normSpoken.split(' '));
  const matched = expectedWords.filter((w) => spokenWords.has(w)).length;
  return matched / expectedWords.length >= 0.72;
}
