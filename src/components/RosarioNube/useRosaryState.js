import { useState, useCallback, useEffect } from "react";

/**
 * useRosaryState Hook
 * 
 * Custom hook for managing rosary state and prayer navigation
 * Provides functionality for:
 * - Tracking current prayer index in the rosary sequence
 * - Handling bead clicks and prayer navigation
 * - Jumping to specific prayers by ID
 * - Managing mystery-specific prayer sequences
 * - Calculating current mystery number based on prayer position
 * 
 * @param {object} prayers - Prayer data object containing all prayer sequences
 * @param {string} currentMystery - Current mystery type (gozosos, dolorosos, gloriosos, luminosos)
 * @returns {object} Object containing state and handler functions
 */
export const useRosaryState = (prayers, currentMystery) => {
  // State for tracking current position in rosary sequence
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0);
  const [highlightedBead, setHighlightedBead] = useState(0);

  /**
   * Get the rosary sequence based on current mystery type
   * Maps mystery types to their corresponding prayer sequences
   * 
   * @returns {array} Array of prayer IDs in the correct rosary sequence
   */
  const getRosarySequence = useCallback(() => {
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };
    return prayers[mysteryToArray[currentMystery]] || [];
  }, [prayers, currentMystery]);

  /**
   * Get prayer object by ID from any section of the prayer book
   * Searches through all prayer sections to find the matching prayer
   * 
   * @param {string} id - Prayer ID to search for
   * @returns {object|null} Prayer object if found, null otherwise
   */
  const getPrayerById = useCallback(
    (id) => {
      // Check in apertura (opening prayers)
      const aperturaPrayer = prayers.apertura?.find((p) => p.id === id);
      if (aperturaPrayer) return aperturaPrayer;

      // Check in decada (decade prayers - Our Father, Hail Mary, etc.)
      const decadaPrayer = prayers.decada?.find((p) => p.id === id);
      if (decadaPrayer) return decadaPrayer;

      // Check in mysteries (mystery-specific prayers)
      const mysteryPrayer = prayers.mysteries?.[currentMystery]?.find(
        (p) => p.id === id
      );
      if (mysteryPrayer) return mysteryPrayer;

      // Check in cierre (closing prayers)
      const cierrePrayer = prayers.cierre?.find((p) => p.id === id);
      if (cierrePrayer) return cierrePrayer;

      return null;
    },
    [prayers, currentMystery]
  );

  /**
   * Handle bead click from interactive rosary
   * Updates the current prayer index and returns prayer data for display
   * 
   * @param {number} prayerIndex - Index of the clicked bead in rosary sequence
   * @param {string} prayerId - ID of the prayer associated with the bead
   * @returns {object|null} Prayer data object or null if not found
   */
  const handleBeadClick = useCallback(
    (prayerIndex, prayerId) => {
      setCurrentPrayerIndex(prayerIndex);
      setHighlightedBead(prayerIndex);

      const prayer = getPrayerById(prayerId);
      if (prayer) {
        return {
          prayer: prayer.text,
          prayerImg: prayer.img || prayer.imgmo, // Use dark mode image if available
          prayerIndex: prayerIndex,
        };
      }
      return null;
    },
    [getPrayerById]
  );

  /**
   * Jump to specific prayer by ID
   * Finds the prayer in the current rosary sequence and updates the index
   * 
   * @param {string} prayerId - ID of the prayer to jump to
   * @returns {number} New prayer index or current index if not found
   */
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

  /**
   * Get current mystery number based on prayer index
   * Calculates which mystery (1-5) the user is currently praying based on position
   * 
   * @returns {number} Current mystery number (1-5)
   */
  const getCurrentMysteryNumber = useCallback(() => {
    const rosarySequence = getRosarySequence();
    const currentPrayerId = rosarySequence[currentPrayerIndex];

    // Find which mystery this prayer belongs to by checking mystery prayers
    if (prayers.mysteries?.[currentMystery]) {
      const mysteryIndex = prayers.mysteries[currentMystery].findIndex(
        (mystery) => mystery.id === currentPrayerId
      );
      if (mysteryIndex !== -1) {
        return mysteryIndex + 1;
      }
    }

    // Default logic based on position in rosary sequence
    // Each decade has approximately 14 prayers:
    // - 10 Ave Marias (Hail Marys)
    // - 1 Our Father
    // - 1 Glory Be
    // - 1 Fatima Prayer
    // - 1 Mystery
    // So roughly every 14 prayers is a new mystery
    return Math.floor(currentPrayerIndex / 14) + 1;
  }, [currentPrayerIndex, currentMystery, prayers, getRosarySequence]);

  /**
   * Reset rosary state when mystery type changes
   * This effect ensures the rosary starts from the beginning when switching mysteries
   */
  useEffect(() => {
    setCurrentPrayerIndex(0);
    setHighlightedBead(0);
  }, [currentMystery]);

  // Return all state and handler functions for use in components
  return {
    currentPrayerIndex,        // Current position in rosary sequence
    highlightedBead,          // Currently highlighted bead index
    handleBeadClick,          // Function to handle bead clicks
    jumpToPrayer,             // Function to jump to specific prayer
    getCurrentMysteryNumber,  // Function to get current mystery number
    getRosarySequence,        // Function to get current rosary sequence
  };
};



