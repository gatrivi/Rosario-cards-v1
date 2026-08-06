import {
  nextVoiceMode,
  VOICE_MODES,
  stopStepVoice,
  playStepVoice,
} from '../utils/prayerVoicePlayback';
import { getVoicePrefs, setVoicePrefs } from '../utils/voicePrefs';

describe('nextVoiceMode FSM', () => {
  test('tap cycles off → once → auto → off', () => {
    expect(nextVoiceMode(VOICE_MODES.OFF, 'tap')).toBe(VOICE_MODES.ONCE);
    expect(nextVoiceMode(VOICE_MODES.ONCE, 'tap')).toBe(VOICE_MODES.AUTO);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'tap')).toBe(VOICE_MODES.OFF);
  });

  test('once_ended returns to off; auto advance stays auto; done ends', () => {
    expect(nextVoiceMode(VOICE_MODES.ONCE, 'once_ended')).toBe(VOICE_MODES.OFF);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'auto_ended_advance')).toBe(VOICE_MODES.AUTO);
    expect(nextVoiceMode(VOICE_MODES.AUTO, 'auto_ended_done')).toBe(VOICE_MODES.OFF);
  });
});

describe('voicePrefs TTS', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to en-US browser TTS', () => {
    const p = getVoicePrefs();
    expect(p.ttsLang).toBe('en-US');
    expect(p.useBrowserTts).toBe(true);
    expect(p.ttsRate).toBe(1);
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
      resume: jest.fn(),
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
    expect(utter.lang).toBe('en-US');
    expect(result.source).toBe('tts');
    expect(result.ended).toBe(true);
    expect(result.cancelled).toBe(false);
  });

  test('synthesis-failed still ends so Liber auto can advance', async () => {
    function FakeUtterance(text) {
      this.text = text;
      this.onend = null;
      this.onerror = null;
    }
    window.SpeechSynthesisUtterance = FakeUtterance;
    window.speechSynthesis = {
      speak: jest.fn((u) => {
        setTimeout(() => u.onerror?.({ error: 'synthesis-failed' }), 0);
      }),
      cancel: jest.fn(),
      resume: jest.fn(),
    };
    localStorage.clear();
    setVoicePrefs({ useUserVoice: false, useBundledVoice: false, useBrowserTts: true });

    const result = await playStepVoice({
      text: 'Padre nuestro',
      prayerId: 'P',
      mystery: 'gozosos',
      sequenceIndex: 1,
    });

    expect(result.ended).toBe(true);
    expect(result.cancelled).toBe(false);
  });

  test('skip path ends when TTS disabled and no clips', async () => {
    localStorage.clear();
    setVoicePrefs({ useUserVoice: false, useBundledVoice: false, useBrowserTts: false });
    const result = await playStepVoice({
      text: 'Amen',
      prayerId: 'X',
      mystery: 'gozosos',
      sequenceIndex: 0,
    });
    expect(result.ended).toBe(true);
    expect(result.source).toBe('skip');
  });
});
