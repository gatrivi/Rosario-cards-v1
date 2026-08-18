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

  test('passes closing state and commits bead actions only on a clean release', () => {
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

    // Chain-prayer click is only a candidate on pointer-down.
    passedLocked.onBeadClick(5, 'P');
    expect(onNodeClick).not.toHaveBeenCalled();
    passedLocked.onBeadHoldEnd();
    expect(onNodeClick).toHaveBeenCalledWith(5);
    expect(onBeadHoldEnd).toHaveBeenCalledTimes(1);

    // A regular bead hold follows the same clean-release gate.
    passedLocked.onBeadHoldStart(7, 'A');
    expect(onBeadHoldStart).not.toHaveBeenCalled();
    passedLocked.onBeadHoldEnd();
    expect(onBeadHoldStart).toHaveBeenCalledWith(7);
    expect(onBeadHoldEnd).toHaveBeenCalledTimes(2);

    // Dragging cancels a pending bead action instead of navigating by accident.
    passedLocked.onBeadClick(9, 'A');
    window.dispatchEvent(new CustomEvent('beadDragStart', { detail: { isDragging: true } }));
    passedLocked.onBeadHoldEnd();
    expect(onNodeClick).not.toHaveBeenCalledWith(9);

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
