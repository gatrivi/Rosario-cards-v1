import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import InteractiveRosary from './InteractiveRosary';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { isClosingPrayersUnlocked } from '../../utils/rosarySequenceUtils';

/**
 * Bridges RosarioVirtualView callbacks to origin/master InteractiveRosary.
 */
export default function RosaryAdapter({
  sequence,
  activePrayerIndex = 0,
  misterioActual = 'gozosos',
  soundEnabled = true,
  guided = true,
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
}) {
  const soundRef = useRef(soundEnabled);
  const guidedRef = useRef(guided);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    guidedRef.current = guided;
  }, [guided]);

  const handleBeadClick = useCallback(
    (prayerIndex) => {
      if (onNodeClick) onNodeClick(prayerIndex);
    },
    [onNodeClick]
  );

  const handleBeadHoldStart = useCallback(
    (prayerIndex) => {
      if (onBeadHoldStart) onBeadHoldStart(prayerIndex);
    },
    [onBeadHoldStart]
  );

  const closingUnlocked = useMemo(
    () => isClosingPrayersUnlocked(sequence, activePrayerIndex),
    [sequence, activePrayerIndex]
  );

  return (
    <InteractiveRosary
      sequence={sequence}
      currentMystery={misterioActual}
      currentPrayerIndex={activePrayerIndex}
      areClosingPrayersUnlocked={closingUnlocked}
      onBeadClick={handleBeadClick}
      onBeadHoldStart={handleBeadHoldStart}
      onBeadHoldEnd={onBeadHoldEnd}
      prayers={RosarioPrayerBook}
      soundEnabled={soundEnabled}
      guided={guided}
      onAdvance={onAdvance}
      onRetreat={onRetreat}
      onSwipeAdvance={onSwipeAdvance}
      onSwipeRetreat={onSwipeRetreat}
      onEmptyPointerDown={onEmptyPointerDown}
      onEmptyPointerMove={onEmptyPointerMove}
      onEmptyPointerUp={onEmptyPointerUp}
    />
  );
}
