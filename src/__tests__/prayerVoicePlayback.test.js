import {
  nextVoiceMode,
  VOICE_MODES,
  stopStepVoice,
  playStepVoice,
} from '../utils/prayerVoicePlayback';
import { getVoicePrefs, setVoicePrefs } from '../utils/voicePrefs';

describe('nextVoiceMode FSM', () => {
  test('tap cycles off → once → auto → off when idle', () => {
    expect(nextVoiceMode(VOICE_MODES.OFF, 'tap')).toBe(VOICE_MODES.ONCE);
    expect(nextVoiceMode(VOICE_MODES.ONCE, 'tap')).toBe(VOICE_MODES.AUTO);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'tap')).toBe(VOICE_MODES.OFF);
  });

  test('tap while playing always stops', () => {
    expect(nextVoiceMode(VOICE_MODES.ONCE, 'tap', { playing: true })).toBe(VOICE_MODES.OFF);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'tap', { playing: true })).toBe(VOICE_MODES.OFF);
  });

  test('once_ended stays in mode; auto advance stays auto; done ends', () => {
    expect(nextVoiceMode(VOICE_MODES.ONCE, 'once_ended')).toBe(VOICE_MODES.ONCE);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'auto_ended_advance')).toBe(VOICE_MODES.AUTO);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'auto_ended_done')).toBe(VOICE_MODES.OFF);
  });
});

describe('voicePrefs TTS', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to es-ES browser TTS', () => {
    const p = getVoicePrefs();
    expect(p.ttsLang).toBe('es-ES');
    expect(p.useBrowserTts).toBe(true);
    expect(p.ttsRate).toBe(1);
  });

  test('migrates legacy en-US default to es-ES', () => {
    localStorage.setItem('rosario_voice_tts_lang', 'en-US');
    expect(getVoicePrefs().ttsLang).toBe('es-ES');
    expect(localStorage.getItem('rosario_voice_tts_lang')).toBe('es-ES');
  });

  test('persists rate clamp', () => {
    setVoicePrefs({ ttsRate: 9 });
    expect(getVoicePrefs().ttsRate).toBe(1.5);
    setVoicePrefs({ ttsRate: 0.1 });
    expect(getVoicePrefs().ttsRate).toBe(0.7);
  });
});

describe('playStepVoice browser TTS', () => {
  afterEach(() => {
    stopStepVoice();
    delete window.speechSynthesis;
  });

  test('speaks speakable text via speechSynthesis when no clips', async () => {
    function FakeUtterance(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    }
    window.SpeechSynthesisUtterance = FakeUtterance;
    const speak = jest.fn((u) => {
      setTimeout(() => u.onend?.(), 0);
    });
    window.speechSynthesis = {
      speak,
      cancel: jest.fn(),
    };
    localStorage.clear();
    setVoicePrefs({ useUserVoice: false, useBundledVoice: false, useBrowserTts: true });

    const result = await playStepVoice({
      text: 'Hail Mary, full of grace',
      prayerId: 'NO_CLIP',
      mystery: 'angelus',
      sequenceIndex: 0,
    });

    expect(speak).toHaveBeenCalled();
    const utter = speak.mock.calls[0][0];
    expect(utter.text).toBe('Hail Mary, full of grace');
    expect(utter.lang).toBe('es-ES');
    expect(result.source).toBe('tts');
  });
});
