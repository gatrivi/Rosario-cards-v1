import React from 'react';
import { render } from '@testing-library/react';
import VerseDrawing, { verseSegments } from '../components/Views/VerseDrawing';
import { getSequenceData, resolveRoseSymbolKey } from '../components/Views/roseViewHelpers';
import { readRoseSession, saveRoseSession, clearRoseSessions } from '../components/Views/roseSession';
import { RDM_KEYS, divineMercyPrayers } from '../data/divineMercyData';
import { SACRED_SYMBOLS, SYMBOL_MAP } from '../data/SacredSymbols';

test('Breastplate supplies one shield contour per verse and retains prayer images', () => {
  const [prayer] = getSequenceData('gozosos', 'patrick');
  expect(prayer.id).toBe('PATRICK');
  expect(prayer.versos).toHaveLength(SACRED_SYMBOLS[SYMBOL_MAP.PATRICK].length);
  expect(prayer.img).toBeTruthy();
  expect(prayer.imgCandidates.length).toBeGreaterThan(0);
});

describe('Divine Mercy chaplet in the Rosa', () => {
  const chaplet = getSequenceData('gozosos', 'misericordia');

  test('walks the whole chaplet with source text preserved', () => {
    expect(chaplet.map(s => s.id)).toEqual(RDM_KEYS);
    expect(chaplet.filter(s => s.id === 'MP')).toHaveLength(50);
    const mp = chaplet.find(s => s.id === 'MP');
    expect(mp.versos.join(' ')).toBe(divineMercyPrayers.find(p => p.id === 'MP').text);
    expect(mp.versos).toHaveLength(2);
  });

  test('every step has verses and images', () => {
    chaplet.forEach(step => {
      expect(step.versos.length).toBeGreaterThan(0);
      expect(step.img).toBeTruthy();
      expect(step.imgCandidates.length).toBeGreaterThan(0);
    });
  });

  test('chaplet prayers draw their own symbols, never the fallback cross', () => {
    ['MP', 'EF', 'HG', 'DMO1', 'DMO2'].forEach(id => {
      const key = resolveRoseSymbolKey(id, 'gozosos');
      expect(key).not.toBe('cross');
      expect(SACRED_SYMBOLS[key].length).toBeGreaterThan(0);
    });
    expect(SYMBOL_MAP.MP).toBe('mercy_heart');
  });

  test('clearing a devotion session leaves other sessions alone', () => {
    sessionStorage.clear();
    saveRoseSession({ mystery: 'misericordia', prayerIndex: 7, versoIndex: 1 });
    saveRoseSession({ mystery: 'gozosos', prayerIndex: 7, versoIndex: 1 });
    clearRoseSessions('misericordia');
    expect(readRoseSession('misericordia', 7)).toBeNull();
    expect(readRoseSession('gozosos', 7)).not.toBeNull();
    sessionStorage.clear();
  });
});

describe('verse drawing fingerprints', () => {
  test.each([[2, 5], [12, 9], [3, 20]])('covers every contour exactly once: %i paths, %i verses', (paths, verses) => {
    const coverage = Array(paths).fill(0);
    for (let v = 0; v < verses; v++) {
      const segments = verseSegments(paths, verses, v);
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach(s => { coverage[s.pathIndex] += s.end - s.start; });
    }
    coverage.forEach(value => expect(value).toBeCloseTo(1));
  });

  const paths = ['M 10 10 L 90 10', 'M 90 10 L 90 90'];
  test('one completed verse draws exactly one group, and saved traits reproduce it', () => {
    const traits = { warmth: [0.8, 0.2, 0.5, 0.1], wiggle: [3, 1, 2, 0] };
    const { container, rerender } = render(
      <VerseDrawing paths={paths} verseCount={4} progress={0.25} traits={traits} seed={123} />
    );
    expect(container.querySelectorAll('[data-verse-stroke][opacity="1"]')).toHaveLength(1);
    const firstStroke = container.querySelector('[data-verse-stroke="0"]').outerHTML;
    rerender(<VerseDrawing paths={paths} verseCount={4} progress={1}
      traits={JSON.parse(JSON.stringify(traits))} seed={123} compact />);
    expect(container.querySelector('[data-verse-stroke="0"]').outerHTML).toBe(firstStroke);
    expect(container.querySelectorAll('[data-verse-stroke][opacity="1"]')).toHaveLength(4);
  });

  test('reading warmth and movement visibly change stroke weight and shape', () => {
    const { container, rerender } = render(
      <VerseDrawing paths={paths} verseCount={2} progress={1} seed={123}
        traits={{ warmth: [0], wiggle: [0] }} />
    );
    const width = container.querySelector('path').getAttribute('stroke-width');
    const shape = container.querySelector('[data-verse-stroke]').getAttribute('transform');
    rerender(<VerseDrawing paths={paths} verseCount={2} progress={1} seed={123}
      traits={{ warmth: [1], wiggle: [5] }} />);
    expect(container.querySelector('path').getAttribute('stroke-width')).not.toBe(width);
    expect(container.querySelector('[data-verse-stroke]').getAttribute('transform')).not.toBe(shape);
  });

  const roseContext = { source: 'libro', dwellMs: 120000, hour: 12, daylight: 'mediodia' };
  test('prayer context tints rose ink, deterministically', () => {
    const { container: plain } = render(
      <VerseDrawing paths={paths} verseCount={2} progress={1} seed={123} rose
        traits={{ warmth: [0.5], wiggle: [1] }} />
    );
    const { container:WithContext } = render(
      <VerseDrawing paths={paths} verseCount={2} progress={1} seed={123} rose
        traits={{ warmth: [0.5], wiggle: [1] }} context={roseContext} />
    );
    expect(WithContext.querySelector('path').getAttribute('stroke')).toBeTruthy();
    const plainInk = plain.querySelector('path').getAttribute('stroke');
    const contextInk = WithContext.querySelector('path').getAttribute('stroke');
    expect(contextInk).not.toBe(plainInk);
    // Same context twice → identical ink (no Math.random anywhere).
    const { container: again } = render(
      <VerseDrawing paths={paths} verseCount={2} progress={1} seed={123} rose
        traits={{ warmth: [0.5], wiggle: [1] }} context={roseContext} />
    );
    expect(again.querySelector('path').getAttribute('stroke')).toBe(contextInk);
  });

  test('different hours of prayer grow differently tinted roses', () => {
    const renderInk = (daylight) => {
      const { container } = render(
        <VerseDrawing paths={paths} verseCount={2} progress={1} seed={123} rose
          traits={{ warmth: [0.5], wiggle: [1] }}
          context={{ source: 'libro', dwellMs: 20000, daylight }} />
      );
      return container.querySelector('path').getAttribute('stroke');
    };
    expect(renderInk('noche')).not.toBe(renderInk('mediodia'));
    expect(renderInk('atardecer')).not.toBe(renderInk('amanecer'));
  });

  test('dwell shapes stroke weight: a contemplative Ave draws heavier than a quick one', () => {
    const widthFor = (dwellMs) => {
      const { container } = render(
        <VerseDrawing paths={paths} verseCount={2} progress={1} seed={123} rose
          traits={{ warmth: [0.5], wiggle: [1] }}
          context={{ source: 'libro', daylight: 'mediodia', dwellMs }} />
      );
      return Number(container.querySelector('path').getAttribute('stroke-width'));
    };
    expect(widthFor(180000)).toBeGreaterThan(widthFor(4000));
  });

  test('symbol drawings ignore prayer context entirely', () => {
    const props = { paths, verseCount: 2, progress: 1, seed: 123,
      traits: { warmth: [0.5], wiggle: [1] } };
    const { container: plain } = render(<VerseDrawing {...props} />);
    const { container: withContext } = render(<VerseDrawing {...props} context={roseContext} />);
    expect(withContext.innerHTML).toBe(plain.innerHTML);
  });
});
