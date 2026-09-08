import React, { useEffect, useRef, useState } from 'react';

/** Visual pacing only: the rosary's prayer/counting state remains immediate. */
export default function RosaryPrayerTransition({ stepKey, artworkReady, children }) {
  const [shownKey, setShownKey] = useState(stepKey);
  const [phase, setPhase] = useState('ready');
  const snapshot = useRef(children);
  const latest = useRef(children);
  latest.current = children;
  if (shownKey === stepKey && phase === 'ready') snapshot.current = children;

  useEffect(() => {
    if (shownKey === stepKey) {
      if (phase === 'leaving') setPhase('ready');
      return undefined;
    }
    setPhase('leaving');
    const timer = setTimeout(() => {
      snapshot.current = latest.current;
      setShownKey(stepKey);
      setPhase('hidden');
    }, 220);
    return () => clearTimeout(timer);
  }, [stepKey, shownKey, phase]);

  useEffect(() => {
    if (phase !== 'hidden' || !artworkReady || shownKey !== stepKey) return undefined;
    const timer = setTimeout(() => setPhase('entering'), 500);
    return () => clearTimeout(timer);
  }, [phase, artworkReady, shownKey, stepKey]);

  useEffect(() => {
    if (phase !== 'entering') return undefined;
    const timer = setTimeout(() => setPhase('ready'), 550);
    return () => clearTimeout(timer);
  }, [phase]);

  return <div
    className={`rosary-prayer-layer-wrap rosary-prayer-layer-wrap--${phase}`}
    aria-hidden={phase !== 'ready' || shownKey !== stepKey}
  >
    {phase === 'ready' && shownKey === stepKey ? children : snapshot.current}
  </div>;
}
