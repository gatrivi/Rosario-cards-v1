import { useRef, useEffect } from 'react';
import { isBeadPrayerRun } from '../utils/beadProgression';

/** Canvas feedback uses live refs and actual Matter body IDs. */
export const useBeadInteraction = (getRosarySequence, matterInstance) => {
  const state = useRef({
    lastTouchedBeadId: null, enhancedBeadId: null, blinkingBeadId: null,
    chainBeadHighlight: null, pressSameBeadId: null,
  });
  useEffect(() => {
    let feedbackTimer;
    const findBody = (index) => matterInstance.current?.allBeads.find((body) => body.prayerIndex === index);
    const clearFeedback = () => {
      Object.assign(state.current, { enhancedBeadId: null, blinkingBeadId: null, chainBeadHighlight: null, pressSameBeadId: null });
    };
    const exhausted = (event) => {
      const index = event.detail?.prayerIndex;
      if (!Number.isInteger(index) || index + 1 >= getRosarySequence().length) return;
      clearTimeout(feedbackTimer);
      clearFeedback();
      const next = findBody(index + 1);
      state.current.blinkingBeadId = next?.id ?? null;
      state.current.enhancedBeadId = next?.id ?? null;
      if (isBeadPrayerRun(getRosarySequence(), index, index + 1)) {
        state.current.chainBeadHighlight = state.current.lastTouchedBeadId;
        state.current.pressSameBeadId = state.current.lastTouchedBeadId;
      }
      feedbackTimer = setTimeout(clearFeedback, 3000);
    };
    window.addEventListener('contentExhausted', exhausted);
    return () => {
      window.removeEventListener('contentExhausted', exhausted);
      clearTimeout(feedbackTimer);
    };
  }, [getRosarySequence, matterInstance]);
  return state;
};
