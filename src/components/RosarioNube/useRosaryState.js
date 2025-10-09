import { useState, useCallback, useEffect } from "react";

export const useRosaryState = (prayers, currentMystery) => {
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0);
  const [highlightedBead, setHighlightedBead] = useState(0);

  // Get the rosary sequence based on current mystery
  const getRosarySequence = useCallback(() => {
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };
    return prayers[mysteryToArray[currentMystery]] || [];
  }, [prayers, currentMystery]);

  // Get prayer object by ID
  const getPrayerById = useCallback(
    (id) => {
      // Check in apertura
      const aperturaPrayer = prayers.apertura?.find((p) => p.id === id);
      if (aperturaPrayer) return aperturaPrayer;

      // Check in decada
      const decadaPrayer = prayers.decada?.find((p) => p.id === id);
      if (decadaPrayer) return decadaPrayer;

      // Check in mysteries
      const mysteryPrayer = prayers.mysteries?.[currentMystery]?.find(
        (p) => p.id === id
      );
      if (mysteryPrayer) return mysteryPrayer;

      // Check in cierre
      const cierrePrayer = prayers.cierre?.find((p) => p.id === id);
      if (cierrePrayer) return cierrePrayer;

      return null;
    },
    [prayers, currentMystery]
  );

  // Handle bead click
  const handleBeadClick = useCallback(
    (prayerIndex, prayerId) => {
      setCurrentPrayerIndex(prayerIndex);
      setHighlightedBead(prayerIndex);

      const prayer = getPrayerById(prayerId);
      if (prayer) {
        return {
          prayer: prayer.text,
          prayerImg: prayer.img || prayer.imgmo,
          prayerIndex: prayerIndex,
        };
      }
      return null;
    },
    [getPrayerById]
  );

  // Jump to specific prayer
  const jumpToPrayer = useCallback(
    (prayerId) => {
      const rosarySequence = getRosarySequence();
      const targetIndex = rosarySequence.indexOf(prayerId);
      if (targetIndex !== -1) {
        setCurrentPrayerIndex(targetIndex);
        setHighlightedBead(targetIndex);
        return targetIndex;
      }
      return currentPrayerIndex;
    },
    [getRosarySequence, currentPrayerIndex]
  );

  // Get current mystery number based on prayer index
  const getCurrentMysteryNumber = useCallback(() => {
    const rosarySequence = getRosarySequence();
    const currentPrayerId = rosarySequence[currentPrayerIndex];

    // Find which mystery this prayer belongs to
    if (prayers.mysteries?.[currentMystery]) {
      const mysteryIndex = prayers.mysteries[currentMystery].findIndex(
        (mystery) => mystery.id === currentPrayerId
      );
      if (mysteryIndex !== -1) {
        return mysteryIndex + 1;
      }
    }

    // Default logic based on position in rosary
    // Each decade has 10 Ave Marias + 1 Our Father + 1 Glory + 1 Fatima + 1 Mystery
    // So roughly every 14 prayers is a new mystery
    return Math.floor(currentPrayerIndex / 14) + 1;
  }, [currentPrayerIndex, currentMystery, prayers, getRosarySequence]);

  // Reset when mystery changes
  useEffect(() => {
    setCurrentPrayerIndex(0);
    setHighlightedBead(0);
  }, [currentMystery]);

  return {
    currentPrayerIndex,
    highlightedBead,
    handleBeadClick,
    jumpToPrayer,
    getCurrentMysteryNumber,
    getRosarySequence,
  };
};



