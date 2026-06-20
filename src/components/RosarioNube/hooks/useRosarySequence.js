import { useCallback } from "react";

/**
 * Hook to get rosary sequence for current mystery
 */
export const useRosarySequence = (prayers, currentMystery) => {
  const getRosarySequence = useCallback(() => {
    if (!prayers) return [];
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };
    return prayers[mysteryToArray[currentMystery]] || [];
  }, [prayers, currentMystery]);

  return getRosarySequence;
};
