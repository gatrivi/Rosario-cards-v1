import {
  resolveBundledVoiceUrl,
  resolveBundledVoiceClip,
  normalizeVoiceLang,
  listBundledVoiceKeys,
} from '../data/bundledVoiceMap';
import {
  getBundledCoverage,
  findSmallestDevotionLackingBundledVoice,
} from '../utils/voiceCoverage';
import { applyVariantToVoiceLang, getVoicePrefs, setVoicePrefs } from '../utils/voicePrefs';

describe('bundledVoiceMap langs', () => {
  test('normalizes variant ids to pack folders', () => {
    expect(normalizeVoiceLang('latin')).toBe('la');
    expect(normalizeVoiceLang('en')).toBe('en');
    expect(normalizeVoiceLang('es')).toBe('es');
  });

  test('EN Fish pack resolves in-lang (no ES fallback)', () => {
    expect(listBundledVoiceKeys('en').length).toBeGreaterThan(100);
    expect(resolveBundledVoiceUrl('P', 'en')).toBe('/voice/en/P.wav');
    expect(resolveBundledVoiceUrl('A_3', 'en')).toBe('/voice/en/A.wav');
    expect(resolveBundledVoiceUrl('ANG_AVE_1', 'en')).toBe('/voice/en/ANG_AVE_1.wav');
    expect(resolveBundledVoiceUrl('MAG_1', 'en')).toBe('/voice/en/MAG_1.wav');
    expect(resolveBundledVoiceClip('P', 'en')).toEqual({
      url: '/voice/en/P.wav',
      tier: 3,
      pack: 'en',
    });
  });

  test('missing EN clip does not borrow Spanish Fish', () => {
    expect(resolveBundledVoiceUrl('__no_such_clip__', 'en')).toBeNull();
  });

  test('ES pack maps mysteries via m1–m20 aliases', () => {
    expect(resolveBundledVoiceUrl('P', 'es')).toBe('/voice/es/P.wav');
    expect(resolveBundledVoiceUrl('MG1', 'es')).toBe('/voice/es/m1.wav');
    expect(resolveBundledVoiceUrl('MD1', 'es')).toBe('/voice/es/m6.wav');
    expect(resolveBundledVoiceUrl('S', 'es')).toBe('/voice/es/Papa.wav');
    expect(resolveBundledVoiceUrl('ANG_SC', 'es')).toBe('/voice/es/ANG_SC.wav');
    expect(resolveBundledVoiceUrl('MAG_1', 'es')).toBe('/voice/es/MAG_1.wav');
    expect(resolveBundledVoiceUrl('LPB_1', 'es')).toBe('/voice/es/LPB_1.wav');
    expect(resolveBundledVoiceUrl('VC_OPEN', 'es')).toBe('/voice/es/VC_OPEN.wav');
  });
});

describe('voicePrefs lang', () => {
  beforeEach(() => localStorage.clear());

  test('defaults to es pack', () => {
    expect(getVoicePrefs().voiceLang).toBe('es');
  });

  test('applyVariantToVoiceLang switches pack', () => {
    applyVariantToVoiceLang('en');
    expect(getVoicePrefs().voiceLang).toBe('en');
    applyVariantToVoiceLang('latin');
    expect(getVoicePrefs().voiceLang).toBe('la');
    applyVariantToVoiceLang('niceno');
    expect(getVoicePrefs().voiceLang).toBe('es');
  });

  test('setVoicePrefs syncs TTS lang', () => {
    setVoicePrefs({ voiceLang: 'en' });
    expect(getVoicePrefs().ttsLang).toBe('en-US');
    setVoicePrefs({ voiceLang: 'es' });
    expect(getVoicePrefs().ttsLang).toBe('es-ES');
  });
});

describe('voiceCoverage', () => {
  test('Ángelus ES coverage is complete', () => {
    const cov = getBundledCoverage('angelus', { lang: 'es' });
    expect(cov.total).toBe(8);
    expect(cov.missing).toBe(0);
    expect(cov.rows[0].title).toBe('Señal de la Cruz');
  });

  test('Liber ES has no devotion lacking guide clips', () => {
    const next = findSmallestDevotionLackingBundledVoice([]);
    expect(next).toBeNull();
  });
});
