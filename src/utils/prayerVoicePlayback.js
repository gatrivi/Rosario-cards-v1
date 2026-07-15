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

function playBrowserTts(text, prefs, gen) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      resolve({ ended: false, cancelled: true, source: 'tts' });
      return;
    }
    const Utterance =
      typeof window.SpeechSynthesisUtterance === 'function'
        ? window.SpeechSynthesisUtterance
        : typeof SpeechSynthesisUtterance === 'function'
          ? SpeechSynthesisUtterance
          : null;
    if (!Utterance) {
      resolve({ ended: false, cancelled: true, source: 'tts' });
      return;
    }
    const utterance = new Utterance(text);
    utterance.lang = prefs.ttsLang || 'en-US';
    utterance.rate = prefs.ttsRate || 1;
    activeUtterance = utterance;
    const finish = (cancelled) => {
      if (gen !== playGeneration) {
        resolve({ ended: false, cancelled: true, source: 'tts' });
        return;
      }
      if (activeUtterance === utterance) activeUtterance = null;
      resolve({ ended: !cancelled, cancelled: !!cancelled, source: 'tts' });
    };
    utterance.onend = () => finish(false);
    utterance.onerror = () => finish(true);
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      finish(true);
    }
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

  return { ended: false, cancelled: true };
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
