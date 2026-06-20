import React, { useEffect, useRef } from 'react';
import { runMatterRosary } from './physics/runMatterRosary';
import './VirtualRosaryPhysics.css';

const VirtualRosaryPhysics = ({
  onNodeClick,
  onLinkClick,
  onAdvance,
  onRetreat,
  onSwipeAdvance,
  onSwipeRetreat,
  onEmptyPointerDown,
  onEmptyPointerMove,
  onEmptyPointerUp,
  activePrayerIndex = 0,
  misterioActual = 'gozosos',
  guided = true,
}) => {
  const shellRef = useRef(null);
  const handleRef = useRef(null);
  const activeIndexRef = useRef(activePrayerIndex);
  const guidedRef = useRef(guided);

  const callbacksRef = useRef({
    onNodeClick,
    onLinkClick,
    onAdvance,
    onRetreat,
    onSwipeAdvance,
    onSwipeRetreat,
    onEmptyPointerDown,
    onEmptyPointerMove,
    onEmptyPointerUp,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNodeClick,
      onLinkClick,
      onAdvance,
      onRetreat,
      onSwipeAdvance,
      onSwipeRetreat,
      onEmptyPointerDown,
      onEmptyPointerMove,
      onEmptyPointerUp,
    };
  }, [
    onNodeClick, onLinkClick, onAdvance, onRetreat,
    onSwipeAdvance, onSwipeRetreat, onEmptyPointerDown,
    onEmptyPointerMove, onEmptyPointerUp,
  ]);

  useEffect(() => {
    guidedRef.current = guided;
  }, [guided]);

  useEffect(() => {
    activeIndexRef.current = activePrayerIndex;
    handleRef.current?.setActiveIndex(activePrayerIndex);
  }, [activePrayerIndex]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    handleRef.current = runMatterRosary(shell, {
      misterioActual,
      getCallbacks: () => callbacksRef.current,
      getActiveIndex: () => activeIndexRef.current,
      getGuided: () => guidedRef.current,
    });

    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [misterioActual]);

  return <div ref={shellRef} className="rosary-matter-shell" />;
};

export default VirtualRosaryPhysics;
