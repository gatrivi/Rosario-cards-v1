import React from 'react';
import { render, cleanup } from '@testing-library/react';
import VirtualRosaryPhysics from '../components/RosarioNube/VirtualRosaryPhysics';
import { buildSequence } from '../utils/bookletSequence';
import { isClosingPrayersUnlocked } from '../utils/rosarySequenceUtils';

jest.mock('../components/RosarioNube/InteractiveRosary', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

describe('VirtualRosaryPhysics (core wiring)', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('passes areClosingPrayersUnlocked and bridges bead callbacks', () => {
    const seq = buildSequence('gozosos');
    const llIdx = seq.findIndex((p) => p.id === 'LL');
    const lockedIndex = 0;
    const unlockedIndex = llIdx - 1;

    const onNodeClick = jest.fn();
    const onBeadHoldStart = jest.fn();
    const onBeadHoldEnd = jest.fn();

    const onAdvance = jest.fn();
    const onRetreat = jest.fn();
    const onSwipeAdvance = jest.fn();
    const onSwipeRetreat = jest.fn();
    const onEmptyPointerDown = jest.fn();
    const onEmptyPointerMove = jest.fn();
    const onEmptyPointerUp = jest.fn();

    const props = {
      sequence: seq,
      misterioActual: 'gozosos',
      soundEnabled: true,
      guided: true,
      onNodeClick,
      onBeadHoldStart,
      onBeadHoldEnd,
      onAdvance,
      onRetreat,
      onSwipeAdvance,
      onSwipeRetreat,
      onEmptyPointerDown,
      onEmptyPointerMove,
      onEmptyPointerUp,
    };

    const { rerender } = render(
      <VirtualRosaryPhysics {...props} activePrayerIndex={lockedIndex} />
    );

    const InteractiveRosary = require('../components/RosarioNube/InteractiveRosary').default;
    expect(InteractiveRosary).toHaveBeenCalledTimes(1);
    const passedLocked = InteractiveRosary.mock.calls[0][0];
    expect(passedLocked.areClosingPrayersUnlocked).toBe(
      isClosingPrayersUnlocked(seq, lockedIndex)
    );

    // Bridge onBeadClick -> onNodeClick. The adapter defers the commit to a
    // clean pointer release (drag-safe taps), so flush with onBeadHoldEnd.
    passedLocked.onBeadClick(5, 'P');
    passedLocked.onBeadHoldEnd();
    expect(onNodeClick).toHaveBeenCalledWith(5);

    // Bridge onBeadHoldStart -> onBeadHoldStart (same clean-release gate)
    passedLocked.onBeadHoldStart(7, 'A');
    passedLocked.onBeadHoldEnd();
    expect(onBeadHoldStart).toHaveBeenCalledWith(7);

    rerender(
      <VirtualRosaryPhysics {...props} activePrayerIndex={unlockedIndex} />
    );

    expect(InteractiveRosary).toHaveBeenCalledTimes(2);
    const passedUnlocked = InteractiveRosary.mock.calls[1][0];
    expect(passedUnlocked.areClosingPrayersUnlocked).toBe(
      isClosingPrayersUnlocked(seq, unlockedIndex)
    );
  });
});

