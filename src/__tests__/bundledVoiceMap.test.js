import { resolveBundledVoiceUrl, BUNDLED_VOICE_BY_ID } from '../data/bundledVoiceMap';

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

  test('resolves SC and returns null for unknown', () => {
    expect(resolveBundledVoiceUrl('SC')).toBe(BUNDLED_VOICE_BY_ID.SC);
    expect(resolveBundledVoiceUrl(null)).toBeNull();
    expect(resolveBundledVoiceUrl('LL')).toBeNull();
  });
});
