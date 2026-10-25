import React from 'react';
import { act, render, cleanup } from '@testing-library/react';
import RosarioVirtualView from '../components/Views/RosarioVirtualView';
import { buildSequence } from '../utils/bookletSequence';
import RosaryAdapter from '../components/RosarioNube/RosaryAdapter';
import { playBookletTransitionSound } from '../utils/bookletSounds';

jest.mock('../components/RosarioNube/RosaryAdapter', () => jest.fn(() => null));
jest.mock('../components/common/SacredDust', () => () => null);
jest.mock('../components/common/VitralBackground', () => () => null);
jest.mock('../components/Views/BookletPrayerPanel', () => () => null);
jest.mock('../hooks/usePrayerVoiceAutoplay', () => ({ usePrayerVoiceAutoplay: () => {} }));
jest.mock('../utils/bookletSounds', () => ({ playBookletTransitionSound: jest.fn() }));

test('repeat touches advance Ave Maria, Gloria, Fatima exactly once and count only the Ave Maria', () => {
  const sequence = buildSequence('gozosos');
  const gloria = sequence.findIndex((p, i) => p.id === 'G' && sequence[i - 1]?.id === 'A');
  const update = jest.fn(); const count = jest.fn(); const enterChain = jest.fn();
  window.addEventListener('enterChainPrayers', enterChain);
  const props = { misterioActual: 'gozosos', soundEnabled: false, onUpdateProgreso: update, onAveMariaComplete: count };
  const view = render(<RosarioVirtualView {...props} currentPrayerIndex={gloria - 1} />);
  for (const index of [gloria - 1, gloria, gloria + 1]) {
    view.rerender(<RosarioVirtualView {...props} currentPrayerIndex={index} />);
    act(() => window.dispatchEvent(new CustomEvent('beadRepeatTouch', { detail: { prayerIndex: index } })));
  }
  expect(update.mock.calls.map(([index]) => index)).toEqual([gloria, gloria + 1, gloria + 2]);
  expect(count).toHaveBeenCalledTimes(1);
  expect(enterChain).not.toHaveBeenCalled();
  window.removeEventListener('enterChainPrayers', enterChain);
  cleanup();
});

test('empty tap after a completed prayer does not advance; one hold completes only one step', () => {
  jest.useFakeTimers();
  const update = jest.fn();
  const props = { misterioActual: 'gozosos', soundEnabled: false, onUpdateProgreso: update };
  const view = render(<RosarioVirtualView {...props} currentPrayerIndex={0} />);
  const adapter = () => RosaryAdapter.mock.calls[RosaryAdapter.mock.calls.length - 1][0];
  act(() => adapter().onBeadHoldStart(0)); // reveals prayer with charge at 100
  update.mockClear();
  act(() => adapter().onEmptyPointerDown());
  act(() => jest.advanceTimersByTime(120));
  act(() => adapter().onEmptyPointerUp());
  expect(update).not.toHaveBeenCalled();
  act(() => adapter().onEmptyPointerDown());
  act(() => jest.advanceTimersByTime(1500));
  expect(update).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenCalledWith(1);
  view.rerender(<RosarioVirtualView {...props} currentPrayerIndex={1} />);
  act(() => jest.advanceTimersByTime(3000));
  expect(update).toHaveBeenCalledTimes(1);
  cleanup();
  jest.useRealTimers();
});

test('entering a prayer rings the step chime once; mounting and re-rendering do not', () => {
  playBookletTransitionSound.mockClear();
  const props = { misterioActual: 'gozosos', soundEnabled: true, onUpdateProgreso: jest.fn() };
  const view = render(<RosarioVirtualView {...props} currentPrayerIndex={3} />);
  view.rerender(<RosarioVirtualView {...props} currentPrayerIndex={3} />);
  expect(playBookletTransitionSound).not.toHaveBeenCalled();
  view.rerender(<RosarioVirtualView {...props} currentPrayerIndex={4} />);
  expect(playBookletTransitionSound).toHaveBeenCalledTimes(1);
  const sequence = buildSequence('gozosos');
  expect(playBookletTransitionSound.mock.calls[0][0]).toMatchObject({ prayerId: sequence[4].id, soundEnabled: true });
  cleanup();
});
