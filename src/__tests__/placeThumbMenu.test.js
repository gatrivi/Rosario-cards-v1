import { placeThumbMenu } from '../utils/placeThumbMenu';

describe('placeThumbMenu', () => {
  test('returns fixed coords anchored to element', () => {
    const el = {
      getBoundingClientRect: () => ({ top: 200, bottom: 260, left: 100, width: 44, height: 60 }),
    };
    const s = placeThumbMenu(el);
    expect(s.position).toBe('fixed');
    expect(s.left).toBe(122);
    expect(s.top).toBe(194);
    expect(s.transform).toContain('translate(-50%, -100%)');
  });

  test('opens downward when little space above', () => {
    const el = {
      getBoundingClientRect: () => ({ top: 40, bottom: 100, left: 10, width: 40, height: 60 }),
    };
    const s = placeThumbMenu(el);
    expect(s.top).toBe(106);
    expect(s.transform).toBe('translateX(-50%)');
  });
});
