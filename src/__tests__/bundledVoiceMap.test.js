import { resolveBundledVoiceUrl, BUNDLED_VOICE_BY_ID } from '../data/bundledVoiceMap';

describe('bundledVoiceMap', () => {
  test('resolves ofrenda ids', () => {
    expect(resolveBundledVoiceUrl('PBO_3')).toBe('/voice/sangrepreciosa/PBO_3.wav');
  });

  test('resolves chaplet step ids with index suffix', () => {
    expect(resolveBundledVoiceUrl('PBContrition_1')).toBe(BUNDLED_VOICE_BY_ID.PBContrition);
    expect(resolveBundledVoiceUrl('PB_12')).toBe(BUNDLED_VOICE_BY_ID.PB);
    expect(resolveBundledVoiceUrl('PBClosing_50')).toBe(BUNDLED_VOICE_BY_ID.PBClosing);
  });

  test('returns null for unknown / Padre Nuestro chaplet', () => {
    expect(resolveBundledVoiceUrl('PB_P_2')).toBeNull();
    expect(resolveBundledVoiceUrl('SC')).toBeNull();
    expect(resolveBundledVoiceUrl(null)).toBeNull();
  });
});
