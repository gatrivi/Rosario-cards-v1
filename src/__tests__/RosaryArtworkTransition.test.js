import React from 'react';
import { act, fireEvent, render, cleanup } from '@testing-library/react';
import ArtworkCrossfade from '../components/common/ArtworkCrossfade';
import RosaryPrayerTransition from '../components/Views/RosaryPrayerTransition';

beforeEach(() => jest.useFakeTimers());
afterEach(() => { cleanup(); jest.useRealTimers(); });
const tick = (ms) => act(() => jest.advanceTimersByTime(ms));
const images = (container) => [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'));
const load = (container, src) => {
  fireEvent.load(container.querySelector(`img[src="${src}"]`));
  tick(50);
};

test('keeps previous art while loading, finishes a dissolve, then takes the latest request', () => {
  const ready = jest.fn();
  const view = render(<ArtworkCrossfade candidates={['a.jpg']} onReady={ready} />);
  load(view.container, 'a.jpg'); tick(1400);
  view.rerender(<ArtworkCrossfade candidates={['b.jpg']} onReady={ready} />);
  expect(images(view.container)).toEqual(['a.jpg', 'b.jpg']);
  expect(view.container.querySelector('img[src="b.jpg"]')).not.toHaveClass('rosary-artwork-incoming--visible');
  load(view.container, 'b.jpg');
  view.rerender(<ArtworkCrossfade candidates={['c.jpg']} onReady={ready} />);
  expect(images(view.container)).toEqual(['a.jpg', 'b.jpg']);
  tick(1400);
  expect(images(view.container)).toEqual(['b.jpg', 'c.jpg']);
  load(view.container, 'c.jpg'); tick(1400);
  expect(images(view.container)).toEqual(['c.jpg']);
  expect(ready).toHaveBeenLastCalledWith('["c.jpg"]');
});

test('failed candidates and stalled requests retain the last good artwork', () => {
  const ready = jest.fn();
  const view = render(<ArtworkCrossfade candidates={['a.jpg']} onReady={ready} />);
  load(view.container, 'a.jpg'); tick(1400);
  view.rerender(<ArtworkCrossfade candidates={['bad.jpg', 'fallback.jpg']} onReady={ready} />);
  fireEvent.error(view.container.querySelector('img[src="bad.jpg"]'));
  expect(images(view.container)).toEqual(['a.jpg', 'fallback.jpg']);
  fireEvent.error(view.container.querySelector('img[src="fallback.jpg"]'));
  expect(images(view.container)).toEqual(['a.jpg']);
  view.rerender(<ArtworkCrossfade candidates={['slow.jpg']} onReady={ready} />);
  tick(6000);
  expect(images(view.container)).toEqual(['a.jpg']);
  expect(ready).toHaveBeenLastCalledWith('["slow.jpg"]');
});

test('text fades out, waits for the artwork, lingers, then returns', () => {
  const view = render(<RosaryPrayerTransition stepKey="a" artworkReady>Old prayer</RosaryPrayerTransition>);
  view.rerender(<RosaryPrayerTransition stepKey="b" artworkReady={false}>New prayer</RosaryPrayerTransition>);
  expect(view.container).toHaveTextContent('Old prayer');
  tick(220);
  expect(view.container.firstChild).toHaveClass('rosary-prayer-layer-wrap--hidden');
  tick(2000);
  expect(view.container.firstChild).toHaveClass('rosary-prayer-layer-wrap--hidden');
  view.rerender(<RosaryPrayerTransition stepKey="b" artworkReady>New prayer</RosaryPrayerTransition>);
  tick(500);
  expect(view.container.firstChild).toHaveClass('rosary-prayer-layer-wrap--entering');
  tick(550);
  expect(view.container.firstChild).toHaveClass('rosary-prayer-layer-wrap--ready');
  expect(view.container).toHaveTextContent('New prayer');
});

test('quickly returning to the original prayer cancels the pending departure', () => {
  const view = render(<RosaryPrayerTransition stepKey="a" artworkReady>Original</RosaryPrayerTransition>);
  view.rerender(<RosaryPrayerTransition stepKey="b" artworkReady>Other</RosaryPrayerTransition>);
  tick(100);
  view.rerender(<RosaryPrayerTransition stepKey="a" artworkReady>Original</RosaryPrayerTransition>);
  tick(2000);
  expect(view.container.firstChild).toHaveClass('rosary-prayer-layer-wrap--ready');
  expect(view.container).toHaveTextContent('Original');
});
