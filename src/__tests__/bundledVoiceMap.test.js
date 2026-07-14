import {
  resolveBundledVoiceUrl,
  resolveBundledVoiceClip,
  BUNDLED_VOICE_BY_ID,
  VOICE_TIER_BUNDLED,
} from '../data/bundledVoiceMap';
import {
  getBundledCoverage,
  findSmallestDevotionLackingBundledVoice,
} from '../utils/voiceCoverage';

describe('bundledVoiceMap', () => {
  test('resolves ofrenda ids', () => {
    expect(resolveBundledVoiceUrl('PBO_3')).toBe('/voice/sangrepreciosa/PBO_3.wav');
  });

  test('resolves chaplet step ids with index suffix', () => {
    expect(resolveBundledVoiceUrl('PBContrition_1')).toBe(BUNDLED_VOICE_BY_ID.PBContrition);
    expect(resolveBundledVoiceUrl('PB_12')).toBe(BUNDLED_VOICE_BY_ID.PB);
    expect(resolveBundledVoiceUrl('PB_P_2')).toBe(BUNDLED_VOICE_BY_ID.PB_P);
    expect(resolveBundledVoiceUrl('PB_G_8')).toBe(BUNDLED_VOICE_BY_ID.PB_G);
    expect(resolveBundledVoiceUrl('PBClosing_50')).toBe(BUNDLED_VOICE_BY_ID.PBClosing);
  });

  test('resolves Ángelus Ave suffix and clip tier', () => {
    expect(resolveBundledVoiceUrl('ANG_AVE_1')).toBe(BUNDLED_VOICE_BY_ID.ANG_AVE);
    expect(resolveBundledVoiceClip('ANG_SC')).toEqual({
      url: BUNDLED_VOICE_BY_ID.ANG_SC,
      tier: VOICE_TIER_BUNDLED,
      pack: 'angelus',
    });
  });

  test('resolves SC and returns null for unknown', () => {
    expect(resolveBundledVoiceUrl('SC')).toBe(BUNDLED_VOICE_BY_ID.SC);
    expect(resolveBundledVoiceUrl(null)).toBeNull();
    expect(resolveBundledVoiceUrl('LL')).toBeNull();
  });
});

describe('voiceCoverage', () => {
  test('Ángelus and Magnificat have full Tier-3 coverage', () => {
    expect(getBundledCoverage('angelus')).toMatchObject({ total: 8, missing: 0 });
    expect(getBundledCoverage('magnificat')).toMatchObject({ total: 9, missing: 0 });
  });

  test('smallest lacking devotion skips fully covered short ones', () => {
    const next = findSmallestDevotionLackingBundledVoice([
      'angelus',
      'magnificat',
      'sangrepreciosa_ofrendas',
    ]);
    expect(next).toBeTruthy();
    expect(next.missing).toBeGreaterThan(0);
  });
});
