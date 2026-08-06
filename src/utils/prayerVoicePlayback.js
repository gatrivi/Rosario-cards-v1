/**
 * Play one prayer step: Tier S → bundled WAV → browser EN TTS (speakable text only).
 */

import {
  pickRecordingForSlot,
  blobToObjectUrl,
} from './prayerRecordingStore';
import { resolveBundledVoiceUrl } from '../data/bundledVoiceMap';
import { getVoicePrefs } from './voicePrefs';

let activeAudio = null;
let activeObjectUrl = null;
let activeUtterance = null;
let playGeneration = 0;

export function stopStepVoice() {
  playGeneration += 1;
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.onended = null;
      activeAudio.onerror = null;
    } catch (_) {
      /* ignore */
    }
    activeAudio = null;
  }
  if (activeObjectUrl) {
    try {
      URL.revokeObjectURL(activeObjectUrl);
    } catch (_) {
      /* ignore */
    }
    activeObjectUrl = null;
  }
  activeUtterance = null;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {
      /* ignore */
    }
  }
}

function playAudioUrl(url, revoke, gen) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    activeAudio = audio;
    if (revoke) activeObjectUrl = url;
    const finish = () => {
      if (gen !== playGeneration) {
        resolve({ ended: false, cancelled: true });
        return;
      }
      if (revoke && activeObjectUrl === url) {
        URL.revokeObjectURL(url);
        activeObjectUrl = null;
      }
      if (activeAudio === audio) activeAudio = null;
      resolve({ ended: true, cancelled: false, source: 'audio' });
    };
    audio.onended = finish;
    audio.onerror = finish;
    audio.play().catch(() => finish());
  });
}

function getSpeechVoices() {
  try {
    return window.speechSynthesis?.getVoices?.() || [];
  } catch (_) {
    return [];
  }
}

/** Chrome often returns [] until voiceschanged — wait briefly once. */
function waitForSpeechVoices(maxMs = 400) {
  const now = getSpeechVoices();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', finish);
      } catch (_) {
        /* ignore */
      }
      clearTimeout(timer);
      resolve(getSpeechVoices());
    };
    const timer = setTimeout(finish, maxMs);
    try {
      window.speechSynthesis.addEventListener('voiceschanged', finish);
    } catch (_) {
      finish();
    }
  });
}

function playBrowserTts(text, prefs, gen) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      // ponytail: nothing to speak — treat as ended so Liber auto can advance
      resolve({ ended: true, cancelled: false, source: 'tts-skip' });
      return;
    }
    const Utterance =
      typeof window.SpeechSynthesisUtterance === 'function'
        ? window.SpeechSynthesisUtterance
        : typeof SpeechSynthesisUtterance === 'function'
          ? SpeechSynthesisUtterance
          : null;
    if (!Utterance) {
      resolve({ ended: true, cancelled: false, source: 'tts-skip' });
      return;
    }

    const run = (voices) => {
      if (gen !== playGeneration) {
        resolve({ ended: false, cancelled: true, source: 'tts' });
        return;
      }
      // No voices (headless / empty pack) — don't hang waiting for onend
      if (!voices.length) {
        resolve({ ended: true, cancelled: false, source: 'tts-no-voices' });
        return;
      }

      const utterance = new Utterance(text);
      utterance.lang = prefs.ttsLang || 'en-US';
      utterance.rate = prefs.ttsRate || 1;
      activeUtterance = utterance;
      let settled = false;
      let keepAlive = null;
      let watchdog = null;
      const finish = (cancelled) => {
        if (settled) return;
        settled = true;
        if (keepAlive) {
          clearInterval(keepAlive);
          keepAlive = null;
        }
        if (watchdog) {
          clearTimeout(watchdog);
          watchdog = null;
        }
        if (gen !== playGeneration) {
          resolve({ ended: false, cancelled: true, source: 'tts' });
          return;
        }
        if (activeUtterance === utterance) activeUtterance = null;
        resolve({ ended: !cancelled, cancelled: !!cancelled, source: 'tts' });
      };
      utterance.onend = () => finish(false);
      utterance.onerror = (ev) => {
        const err = ev?.error;
        const userStop = err === 'interrupted' || err === 'canceled';
        if (userStop || gen !== playGeneration) {
          finish(true);
          return;
        }
        // ponytail: synthesis-failed — end so auto can advance
        finish(false);
      };
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        // Chrome often pauses TTS ~15s without resume ticks
        keepAlive = setInterval(() => {
          if (gen !== playGeneration) {
            clearInterval(keepAlive);
            keepAlive = null;
            return;
          }
          try {
            window.speechSynthesis.resume();
          } catch (_) {
            /* ignore */
          }
        }, 8000);
        // Safety: if neither onend nor onerror fires, don't stall Liber auto
        const ms = Math.min(120000, Math.max(8000, String(text).length * 80));
        watchdog = setTimeout(() => finish(false), ms);
      } catch (_) {
        finish(false);
      }
    };

    waitForSpeechVoices(400).then(run);
  });
}

/**
 * @param {{ text: string, prayerId: string, mystery: string, sequenceIndex: number }} opts
 * @returns {Promise<{ ended: boolean, cancelled: boolean, source?: string }>}
 */
export async function playStepVoice({ text, prayerId, mystery, sequenceIndex }) {
  stopStepVoice();
  const gen = playGeneration;
  const prefs = getVoicePrefs();
  const speakable = typeof text === 'string' ? text.trim() : '';

  try {
    if (prefs.useUserVoice && mystery != null && sequenceIndex != null && prayerId) {
      const rec = await pickRecordingForSlot(mystery, sequenceIndex, prayerId);
      if (gen !== playGeneration) return { ended: false, cancelled: true };
      if (rec?.blob) {
        const url = blobToObjectUrl(rec);
        if (url) return playAudioUrl(url, true, gen);
      }
    }

    if (prefs.useBundledVoice && prayerId) {
      const url = resolveBundledVoiceUrl(prayerId);
      if (url) {
        if (gen !== playGeneration) return { ended: false, cancelled: true };
        return playAudioUrl(url, false, gen);
      }
    }

    if (prefs.useBrowserTts !== false && speakable) {
      if (gen !== playGeneration) return { ended: false, cancelled: true };
      return playBrowserTts(speakable, prefs, gen);
    }
  } catch (_) {
    /* autoplay / missing — silent */
  }

  // No clip / TTS off / empty text — still "ended" so Liber auto can advance
  if (gen !== playGeneration) return { ended: false, cancelled: true };
  return { ended: true, cancelled: false, source: 'skip' };
}

/** Pure FSM for title ▶ control. */
export const VOICE_MODES = { OFF: 'off', ONCE: 'once', AUTO: 'auto' };

/**
 * @param {'off'|'once'|'auto'} mode
 * @param {'tap'|'once_ended'|'auto_ended_advance'|'auto_ended_done'|'external_stop'} event
 */
export function nextVoiceMode(mode, event) {
  if (event === 'external_stop') return VOICE_MODES.OFF;
  if (event === 'once_ended') return mode === VOICE_MODES.ONCE ? VOICE_MODES.OFF : mode;
  if (event === 'auto_ended_done') return VOICE_MODES.OFF;
  if (event === 'auto_ended_advance') return VOICE_MODES.AUTO;
  if (event === 'tap') {
    if (mode === VOICE_MODES.OFF) return VOICE_MODES.ONCE;
    if (mode === VOICE_MODES.ONCE) return VOICE_MODES.AUTO;
    return VOICE_MODES.OFF;
  }
  return mode;
}
