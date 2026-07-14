import {
  resolveBundledVoiceUrl,
  resolveBundledVoiceClip,
  BUNDLED_VOICE_BY_ID,
  listBundledVoiceKeys,
} from '../data/bundledVoiceMap';
import {
  getBundledCoverage,
  findSmallestDevotionLackingBundledVoice,
} from '../utils/voiceCoverage';

describe('bundledVoiceMap', () => {
  test('Spanish packs cleared — map empty until English clips arrive', () => {
    expect(listBundledVoiceKeys()).toEqual([]);
    expect(Object.keys(BUNDLED_VOICE_BY_ID)).toHaveLength(0);
    expect(resolveBundledVoiceUrl('PBO_3')).toBeNull();
    expect(resolveBundledVoiceUrl('ANG_SC')).toBeNull();
    expect(resolveBundledVoiceClip('LL')).toBeNull();
  });
});

describe('voiceCoverage', () => {
  test('Ángelus speakable rows omit title junk and lack Tier-3 until EN pack', () => {
    const cov = getBundledCoverage('angelus');
    expect(cov.total).toBe(8);
    expect(cov.missing).toBe(8);
    expect(cov.rows[0].title).toBe('Señal de la Cruz');
    expect(cov.rows[0].text).not.toMatch(/^Señal de la Cruz/);
  });

  test('smallest lacking devotion reports missing guide clips', () => {
    const next = findSmallestDevotionLackingBundledVoice([]);
    expect(next).toBeTruthy();
    expect(next.missing).toBeGreaterThan(0);
  });
});
