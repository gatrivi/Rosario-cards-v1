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

  test('defaults to es voice pack + es-ES TTS tag', () => {
    const p = getVoicePrefs();
    expect(p.voiceLang).toBe('es');
    expect(p.ttsLang).toBe('es-ES');
    expect(p.useBrowserTts).toBe(false);
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
      getVoices: () => [{ lang: 'en-US', name: 'fake' }],
    };
    localStorage.clear();
    setVoicePrefs({ useUserVoice: false, useBundledVoice: false, useBrowserTts: true, voiceLang: 'en' });

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
      getVoices: () => [{ lang: 'en-US', name: 'fake' }],
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

  test('no voices ends immediately (no hang)', async () => {
    function FakeUtterance(text) {
      this.text = text;
    }
    window.SpeechSynthesisUtterance = FakeUtterance;
    window.speechSynthesis = {
      getVoices: () => [],
      speak: jest.fn(),
      cancel: jest.fn(),
      resume: jest.fn(),
    };
    localStorage.clear();
    setVoicePrefs({ useUserVoice: false, useBundledVoice: false, useBrowserTts: true });

    const result = await playStepVoice({
      text: 'Ave Maria',
      prayerId: 'A',
      mystery: 'gozosos',
      sequenceIndex: 2,
    });

    expect(result.ended).toBe(true);
    expect(result.cancelled).toBe(false);
    expect(result.source).toBe('tts-no-voices');
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
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

  test('bundled devotion clip uses opts.lang pack', async () => {
    localStorage.clear();
    setVoicePrefs({ useUserVoice: false, useBundledVoice: true, useBrowserTts: false, voiceLang: 'en' });
    window.Audio = jest.fn().mockImplementation((url) => {
      const a = {
        src: url,
        onended: null,
        onerror: null,
        play: jest.fn(() => {
          setTimeout(() => a.onended?.(), 0);
          return Promise.resolve();
        }),
        pause: jest.fn(),
      };
      return a;
    });
    const result = await playStepVoice({
      text: '',
      prayerId: 'MAG_1',
      mystery: 'magnificat',
      sequenceIndex: 0,
      lang: 'es',
      preferBundled: true,
    });
    expect(window.Audio).toHaveBeenCalledWith('/voice/es/MAG_1.wav');
    expect(result.source).toBe('audio');
    expect(result.ended).toBe(true);
  });

  test('EN lang uses EN Fish pack (no Spanish fallback)', async () => {
    localStorage.clear();
    setVoicePrefs({ useUserVoice: true, useBundledVoice: true, useBrowserTts: false, voiceLang: 'en' });
    window.Audio = jest.fn().mockImplementation((url) => {
      const a = {
        src: url,
        onended: null,
        onerror: null,
        play: jest.fn(() => {
          setTimeout(() => a.onended?.(), 0);
          return Promise.resolve();
        }),
        pause: jest.fn(),
      };
      return a;
    });
    const result = await playStepVoice({
      text: '',
      prayerId: 'P',
      mystery: 'gozosos',
      sequenceIndex: 1,
      lang: 'en',
      preferBundled: true,
    });
    expect(window.Audio).toHaveBeenCalledWith('/voice/en/P.wav');
    expect(result.source).toBe('audio');
    expect(result.ended).toBe(true);
  });

  test('Liber preferBundled skips TTS when Fish clip missing', async () => {
    localStorage.clear();
    setVoicePrefs({ useUserVoice: true, useBundledVoice: true, useBrowserTts: true, voiceLang: 'en' });
    window.Audio = jest.fn();
    const speak = jest.fn();
    window.speechSynthesis = {
      speak,
      cancel: jest.fn(),
      getVoices: () => [{ lang: 'en-US', name: 'Test' }],
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      resume: jest.fn(),
    };
    const result = await playStepVoice({
      text: 'Hello prayer',
      prayerId: '__no_such_clip__',
      mystery: 'gozosos',
      sequenceIndex: 0,
      lang: 'en',
      preferBundled: true,
    });
    expect(window.Audio).not.toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
    expect(result.source).toBe('fish-miss');
  });
});
