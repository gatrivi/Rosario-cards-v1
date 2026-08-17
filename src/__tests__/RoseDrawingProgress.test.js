import React from 'react';
import { render } from '@testing-library/react';
import RoseDrawing from '../components/Views/RoseDrawing';

describe('RoseDrawing progressive SVG contract', () => {
  beforeAll(() => {
    if (!SVGElement.prototype.getTotalLength) {
      SVGElement.prototype.getTotalLength = () => 100;
    }
  });

  test('starts hidden and reveals more strokes as progress increases', () => {
    const { container, rerender } = render(
      <RoseDrawing progress={0} seed={123} size={120} />
    );

    const visibleGroupsAtStart = Array.from(container.querySelectorAll('svg > g'))
      .filter((group) => group.style.opacity === '1').length;

    expect(visibleGroupsAtStart).toBe(0);

    rerender(<RoseDrawing progress={0.55} seed={123} size={120} />);

    const groupsAtHalf = Array.from(container.querySelectorAll('svg > g'));
    const visibleGroupsAtHalf = groupsAtHalf.filter((group) => group.style.opacity === '1');

    expect(visibleGroupsAtHalf.length).toBeGreaterThan(0);
    expect(visibleGroupsAtHalf.length).toBeLessThanOrEqual(RoseDrawing.PATH_COUNT);

    const drawnOffsets = Array.from(container.querySelectorAll('svg > g path'))
      .map((path) => Number(path.getAttribute('stroke-dashoffset')))
      .filter((offset) => Number.isFinite(offset));

    expect(drawnOffsets.some((offset) => offset < 100)).toBe(true);

    rerender(<RoseDrawing progress={1} seed={123} size={120} />);

    const visibleGroupsAtEnd = Array.from(container.querySelectorAll('svg > g'))
      .filter((group) => group.style.opacity === '1').length;

    expect(visibleGroupsAtEnd).toBe(RoseDrawing.PATH_COUNT);
  });

  test('keeps exactly twelve semantic strokes: petals, stem and leaves', () => {
    expect(RoseDrawing.PATH_COUNT).toBe(12);

    const { container } = render(
      <RoseDrawing progress={1} seed={456} size={120} />
    );

    expect(container.querySelectorAll('svg > g')).toHaveLength(12);
  });
});
