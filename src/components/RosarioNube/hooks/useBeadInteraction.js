import { useState, useRef, useEffect } from "react";

/**
 * Hook to manage bead interaction state and event listeners
 */
export const useBeadInteraction = (getRosarySequence) => {
  const [lastTouchedBeadId, setLastTouchedBeadId] = useState(null);
  const [touchTimestamp, setTouchTimestamp] = useState(0);
  const [enhancedBeadId, setEnhancedBeadId] = useState(null);
  const [blinkingBeadId, setBlinkingBeadId] = useState(null);
  const touchCountRef = useRef(new Map());

  const [chainBeadHighlight, setChainBeadHighlight] = useState(null);
  const [pressSameBeadId, setPressSameBeadId] = useState(null);

  // Listen for content exhausted event to trigger next bead blinking
  useEffect(() => {
    const handleContentExhausted = (event) => {
      const { prayerIndex } = event.detail;
      const rosarySequence = getRosarySequence();
      const nextPrayerIndex = prayerIndex + 1;

      if (nextPrayerIndex < rosarySequence.length) {
        setTimeout(() => {
          setBlinkingBeadId((prev) => `next-${nextPrayerIndex}`);
          setEnhancedBeadId((prev) => `next-${nextPrayerIndex}`);

          setTimeout(() => {
            setBlinkingBeadId(null);
            setEnhancedBeadId(null);
          }, 3000);
        }, 100);
      }
    };

    window.addEventListener("contentExhausted", handleContentExhausted);
    return () => {
      window.removeEventListener("contentExhausted", handleContentExhausted);
    };
  }, [getRosarySequence]);

  // Listen for enter chain prayers event
  useEffect(() => {
    const handleEnterChainPrayers = (event) => {
      const { prayerIndex, chainIndices } = event.detail;

      setPressSameBeadId(`chain-${prayerIndex}`);
      setChainBeadHighlight(`chain-${prayerIndex}`);

      const { prayerHistory } = require("../../../utils/soundEffects");
      const soundEffects = require("../../../utils/soundEffects").default;
      soundEffects.playEnterChainPrayerChime(prayerHistory);

      setTimeout(() => {
        setPressSameBeadId(null);
        setEnhancedBeadId(null);
      }, 5000);
    };

    window.addEventListener("enterChainPrayers", handleEnterChainPrayers);
    return () => {
      window.removeEventListener("enterChainPrayers", handleEnterChainPrayers);
    };
  }, []);

  return {
    lastTouchedBeadId,
    setLastTouchedBeadId,
    touchTimestamp,
    setTouchTimestamp,
    enhancedBeadId,
    setEnhancedBeadId,
    blinkingBeadId,
    setBlinkingBeadId,
    touchCountRef,
    chainBeadHighlight,
    setChainBeadHighlight,
    pressSameBeadId,
    setPressSameBeadId,
  };
};
