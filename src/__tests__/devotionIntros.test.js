import { getDevotionIntro } from '../data/devotionIntros';

describe('devotionIntros', () => {
  test('returns art + blurb for recorridos', () => {
    const sc = getDevotionIntro('sagrado_corazon_adoracion');
    expect(sc?.title).toMatch(/Adoración|Sagrado/i);
    expect(sc?.blurb).toBeTruthy();
    expect(sc?.img).toBeTruthy();
  });

  test('returns intro for oraciones breves', () => {
    const g = getDevotionIntro('guardian');
    expect(g?.title).toMatch(/Guarda/i);
    expect(g?.img).toBeTruthy();
  });

  test('unknown id is null', () => {
    expect(getDevotionIntro('nope')).toBeNull();
  });
});
