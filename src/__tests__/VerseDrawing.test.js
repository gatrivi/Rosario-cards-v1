import React from 'react';
import { render } from '@testing-library/react';
import VerseDrawing, { verseSegments } from '../components/Views/VerseDrawing';
import { getSequenceData } from '../components/Views/roseViewHelpers';
import { SACRED_SYMBOLS, SYMBOL_MAP } from '../data/SacredSymbols';

test('Breastplate supplies one shield contour per verse and retains prayer images', () => {
  const [prayer] = getSequenceData('gozosos', 'patrick');
  expect(prayer.id).toBe('PATRICK');
  expect(prayer.versos).toHaveLength(SACRED_SYMBOLS[SYMBOL_MAP.PATRICK].length);
  expect(prayer.img).toBeTruthy();
  expect(prayer.imgCandidates.length).toBeGreaterThan(0);
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
});
