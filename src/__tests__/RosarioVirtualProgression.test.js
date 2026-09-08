import React from 'react';
import { act, render, cleanup } from '@testing-library/react';
import RosarioVirtualView from '../components/Views/RosarioVirtualView';
import { buildSequence } from '../utils/bookletSequence';
import RosaryAdapter from '../components/RosarioNube/RosaryAdapter';

jest.mock('../components/RosarioNube/RosaryAdapter', () => jest.fn(() => null));
jest.mock('../components/common/SacredDust', () => () => null);
jest.mock('../components/common/VitralBackground', () => () => null);
jest.mock('../components/Views/BookletPrayerPanel', () => () => null);
jest.mock('../hooks/usePrayerVoiceAutoplay', () => ({ usePrayerVoiceAutoplay: () => {} }));

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
