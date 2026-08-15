import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import InteractiveRosary from './InteractiveRosary';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { canStartLitany, isClosingPrayersUnlocked } from '../../utils/rosarySequenceUtils';

/**
 * Bridges RosarioVirtualView callbacks to origin/master InteractiveRosary.
 */
export default function RosaryAdapter({
  sequence,
  activePrayerIndex = 0,
  misterioActual = 'gozosos',
  soundEnabled = true,
  guided = true,
  isInLitany = false,
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
  const pendingBeadRef = useRef(null);
  const pendingChainClickRef = useRef(null);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    guidedRef.current = guided;
  }, [guided]);

  const cancelPendingBeadInteraction = useCallback(() => {
    pendingBeadRef.current = null;
    pendingChainClickRef.current = null;
  }, []);

  // Matter reports the bead on pointer-down. Keep that as a candidate only;
  // committing immediately makes a drag/pinch that starts on the wrong bead
  // navigate to its prayer before we know what gesture the user intended.
  const handleBeadHoldStart = useCallback((prayerIndex) => {
    pendingBeadRef.current = prayerIndex;
    pendingChainClickRef.current = null;
  }, []);

  // Chain-prayer clicks are also emitted during pointer-down. Defer them to the
  // same clean-release gate so dragging a highlighted chain bead cannot advance.
  const handleBeadClick = useCallback((prayerIndex) => {
    pendingChainClickRef.current = prayerIndex;
  }, []);

  const handleBeadHoldEnd = useCallback(() => {
    const chainPrayerIndex = pendingChainClickRef.current;
    const beadPrayerIndex = pendingBeadRef.current;
    cancelPendingBeadInteraction();

    if (Number.isInteger(chainPrayerIndex)) {
      onNodeClick?.(chainPrayerIndex);
    } else if (Number.isInteger(beadPrayerIndex)) {
      onBeadHoldStart?.(beadPrayerIndex);
    }

    onBeadHoldEnd?.();
  }, [
    cancelPendingBeadInteraction,
    onBeadHoldEnd,
    onBeadHoldStart,
    onNodeClick,
  ]);

  useEffect(() => {
    const handleBeadDragStart = (event) => {
      if (event.detail?.isDragging) cancelPendingBeadInteraction();
    };
    const handleMultiTouch = (event) => {
      if (event.touches?.length >= 2) cancelPendingBeadInteraction();
    };
    const handleGestureCancel = () => cancelPendingBeadInteraction();

    window.addEventListener('beadDragStart', handleBeadDragStart);
    window.addEventListener('touchstart', handleMultiTouch, {
      passive: true,
      capture: true,
    });
    window.addEventListener('touchcancel', handleGestureCancel, true);
    window.addEventListener('pointercancel', handleGestureCancel, true);
    window.addEventListener('blur', handleGestureCancel);

    return () => {
      window.removeEventListener('beadDragStart', handleBeadDragStart);
      window.removeEventListener('touchstart', handleMultiTouch, true);
      window.removeEventListener('touchcancel', handleGestureCancel, true);
      window.removeEventListener('pointercancel', handleGestureCancel, true);
      window.removeEventListener('blur', handleGestureCancel);
    };
  }, [cancelPendingBeadInteraction]);

  const closingUnlocked = useMemo(
    () => isClosingPrayersUnlocked(sequence, activePrayerIndex),
    [sequence, activePrayerIndex]
  );

  const heartLitanyEnabled = useMemo(
    () => canStartLitany(sequence, activePrayerIndex),
    [sequence, activePrayerIndex]
  );

  return (
    <InteractiveRosary
      sequence={sequence}
      currentMystery={misterioActual}
      currentPrayerIndex={activePrayerIndex}
      areClosingPrayersUnlocked={closingUnlocked}
      canStartLitany={heartLitanyEnabled}
      isInLitany={isInLitany}
      onBeadClick={handleBeadClick}
      onBeadHoldStart={handleBeadHoldStart}
      onBeadHoldEnd={handleBeadHoldEnd}
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
