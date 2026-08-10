import {
  resolveDisplayText,
  resolveEnLiberDisplayText,
  resolveLiberBodyText,
  resolveLiberTitle,
} from '../utils/bookletDisplayText';

describe('bookletDisplayText EN glass', () => {
  test('EN lang shows Hail Mary not Dios te salve for A', () => {
    const step = { id: 'A', title: 'Ave María', text: 'Dios te salve, María…' };
    const en = resolveEnLiberDisplayText(step, 'gozosos');
    expect(en).toMatch(/Hail Mary/i);
    expect(resolveLiberBodyText(step, null, 'en', 'gozosos')).toMatch(/Hail Mary/i);
    expect(resolveLiberBodyText(step, null, 'es', 'gozosos')).toMatch(/Dios te salve/);
    expect(resolveLiberTitle(step, 'en', 'gozosos')).toMatch(/Hail Mary/i);
  });

  test('ES keeps body when no EN variant', () => {
    const step = { id: 'VC_1', title: 'Estación', text: 'Pilato entrega a Jesús' };
    expect(resolveEnLiberDisplayText(step, 'viacrucis')).toBe(null);
    expect(resolveLiberBodyText(step, null, 'en', 'viacrucis')).toMatch(/Pilato/);
  });

  test('resolveDisplayText still honors variant id', () => {
    const step = {
      id: 'guardian',
      text: 'fallback',
      variants: [
        { id: 'es', text: 'Ángel de Dios' },
        { id: 'en', text: 'Angel of God' },
      ],
    };
    expect(resolveDisplayText(step, 'en')).toMatch(/Angel of God/);
  });
});
