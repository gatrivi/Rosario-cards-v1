import { hasGuideAudio, GUIDE_AUDIO_READY_IDS } from '../data/guideAudioReady';

describe('guideAudioReady', () => {
  test('rosary mysteries have guide audio', () => {
    expect(GUIDE_AUDIO_READY_IDS.size).toBe(4);
    expect(hasGuideAudio('gozosos')).toBe(true);
    expect(hasGuideAudio('dolorosos')).toBe(true);
    expect(hasGuideAudio('gloriosos')).toBe(true);
    expect(hasGuideAudio('luminosos')).toBe(true);
  });

  test('other booklet modes do not yet', () => {
    expect(hasGuideAudio('angelus')).toBe(false);
    expect(hasGuideAudio('divinamisericordia')).toBe(false);
    expect(hasGuideAudio('viacrucis')).toBe(false);
  });
});
