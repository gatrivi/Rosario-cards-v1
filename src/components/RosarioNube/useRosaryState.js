import { useState, useCallback, useEffect } from "react";
import rosaryTracker from "../../utils/rosaryTracker";

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
  // Load initial state from localStorage
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem("rosaryState");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it's for the same mystery
        if (parsed.mystery === currentMystery) {
          return {
            prayerIndex: parsed.prayerIndex || 0,
            litanyVerseIndex: parsed.litanyVerseIndex || 0,
            isInLitany: parsed.isInLitany || false,
          };
        }
      }
    } catch (error) {
      console.warn("Failed to load rosary state from localStorage:", error);
    }
    return { prayerIndex: 0, litanyVerseIndex: 0, isInLitany: false };
  };

  const initialState = getInitialState();

  // Core rosary state
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(
    initialState.prayerIndex
  );
  const [highlightedBead, setHighlightedBead] = useState(
    initialState.prayerIndex
  );

  // Prayer visibility mode state
  const [prayerVisibilityMode, setPrayerVisibilityMode] = useState(() => {
    return localStorage.getItem("prayerVisibilityMode") || "full";
  });

  const [customPrayerVisibility, setCustomPrayerVisibility] = useState(() => {
    const saved = localStorage.getItem("customPrayerVisibility");
    return saved ? JSON.parse(saved) : {};
  });

  // Filter prayers based on visibility mode
  const getFilteredPrayerSequence = useCallback(
    (sequence) => {
      if (!sequence) return [];

      switch (prayerVisibilityMode) {
        case "full":
          return sequence; // Show all prayers

        case "mysteries":
          // Show only mysteries, Litany, Salve Regina, Papa prayer
          return sequence.filter((prayerId) => {
            return (
              prayerId.startsWith("M") || // Mysteries
              prayerId === "LL" || // Litany
              prayerId === "S" || // Salve Regina
              prayerId === "Papa"
            ); // Papa prayer
          });

        case "dedicated":
          // Show only mysteries
          return sequence.filter((prayerId) => prayerId.startsWith("M"));

        case "custom":
          // Use custom settings
          return sequence.filter(
            (prayerId) => customPrayerVisibility[prayerId] !== false
          );

        default:
          return sequence;
      }
    },
    [prayerVisibilityMode, customPrayerVisibility]
  );

  // Listen for prayer visibility mode changes
  useEffect(() => {
    const handleModeChange = (event) => {
      setPrayerVisibilityMode(event.detail.mode);
    };

    const handleCustomChange = (event) => {
      setCustomPrayerVisibility(event.detail.settings);
    };

    window.addEventListener("prayerVisibilityModeChange", handleModeChange);
    window.addEventListener("customPrayerVisibilityChange", handleCustomChange);

    return () => {
      window.removeEventListener(
        "prayerVisibilityModeChange",
        handleModeChange
      );
      window.removeEventListener(
        "customPrayerVisibilityChange",
        handleCustomChange
      );
    };
  }, []);

  // State for litany verse tracking
  const [litanyVerseIndex, setLitanyVerseIndex] = useState(
    initialState.litanyVerseIndex
  );
  const [isInLitany, setIsInLitany] = useState(initialState.isInLitany);

  /**
   * Save current state to localStorage
   */
  const saveStateToStorage = useCallback(() => {
    try {
      const stateToSave = {
        mystery: currentMystery,
        prayerIndex: currentPrayerIndex,
        litanyVerseIndex: litanyVerseIndex,
        isInLitany: isInLitany,
        timestamp: Date.now(),
      };
      localStorage.setItem("rosaryState", JSON.stringify(stateToSave));
    } catch (error) {
      console.warn("Failed to save rosary state to localStorage:", error);
    }
  }, [currentMystery, currentPrayerIndex, litanyVerseIndex, isInLitany]);

  // Save state whenever it changes
  useEffect(() => {
    saveStateToStorage();
  }, [saveStateToStorage]);

  /**
   * Get the rosary sequence based on current mystery type
   * Maps mystery types to their corresponding prayer sequences
   * Applies prayer visibility filtering based on current mode
   *
   * @returns {array} Array of prayer IDs in the correct rosary sequence (filtered)
   */
  const getRosarySequence = useCallback(() => {
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };

    const arrayKey = mysteryToArray[currentMystery];
    const fullSequence = prayers[arrayKey] || [];

    // Apply prayer visibility filtering
    return getFilteredPrayerSequence(fullSequence);
  }, [prayers, currentMystery, getFilteredPrayerSequence]);

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
      console.log(
        `🎯 handleBeadClick: prayerIndex=${prayerIndex}, prayerId=${prayerId}`
      );
      setCurrentPrayerIndex(prayerIndex);
      setHighlightedBead(prayerIndex);

      // Check for rosary completion (last prayer is index 84)
      if (prayerIndex === 84) {
        console.log("🎉 Rosary completed!");
        rosaryTracker.recordCompletion();

        // Dispatch custom event for other components to listen to
        window.dispatchEvent(
          new CustomEvent("rosaryCompleted", {
            detail: {
              mysteryType: currentMystery,
              completionTime: new Date().toISOString(),
            },
          })
        );
      }

      const prayer = getPrayerById(prayerId);
      if (prayer) {
        console.log(`✅ handleBeadClick: Found prayer for ${prayerId}`);
        return {
          prayer: prayer.text,
          prayerImg: prayer, // Return full prayer object for theme-based selection
          prayerIndex: prayerIndex,
        };
      }
      console.log(`❌ handleBeadClick: No prayer found for ${prayerId}`);
      return null;
    },
    [getPrayerById, currentMystery]
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

  /**
   * Navigate to a specific index in the rosary sequence
   * This function allows external components to update the current prayer position
   *
   * @param {number} index - Target prayer index
   * @returns {object|null} Prayer data object or null if not found
   */
  const navigateToIndex = useCallback(
    (index) => {
      const rosarySequence = getRosarySequence();
      if (index >= 0 && index < rosarySequence.length) {
        const prayerId = rosarySequence[index];
        const prayer = getPrayerById(prayerId);

        setCurrentPrayerIndex(index);
        setHighlightedBead(index);

        // Check for rosary completion (last prayer is index 84)
        if (index === 84) {
          console.log("🎉 Rosary completed!");
          rosaryTracker.recordCompletion();

          // Dispatch custom event for other components to listen to
          window.dispatchEvent(
            new CustomEvent("rosaryCompleted", {
              detail: {
                mysteryType: currentMystery,
                completionTime: new Date().toISOString(),
              },
            })
          );
        }

        if (prayer) {
          return {
            prayer: prayer.text,
            prayerImg: prayer, // Return full prayer object for theme-based selection
            prayerIndex: index,
          };
        }
      }
      return null;
    },
    [getRosarySequence, getPrayerById, currentMystery]
  );

  /**
   * Get litany data for current prayer if it's the Litany of Loreto
   * @returns {object|null} Litany data object or null if not litany
   */
  const getLitanyData = useCallback(() => {
    const rosarySequence = getRosarySequence();
    const currentPrayerId = rosarySequence[currentPrayerIndex];

    if (currentPrayerId === "LL") {
      const litanyPrayer = prayers.cierre?.find((p) => p.id === "LL");
      return litanyPrayer;
    }
    return null;
  }, [getRosarySequence, currentPrayerIndex, prayers]);

  /**
   * Navigate to next verse within the litany
   * @returns {boolean} True if moved to next verse, false if at end
   */
  const nextLitanyVerse = useCallback(() => {
    const litanyData = getLitanyData();
    if (!litanyData || !litanyData.verses) return false;

    if (litanyVerseIndex < litanyData.verses.length - 1) {
      setLitanyVerseIndex((prev) => prev + 1);
      return true;
    }
    return false;
  }, [getLitanyData, litanyVerseIndex]);

  /**
   * Navigate to previous verse within the litany
   * @returns {boolean} True if moved to previous verse, false if at beginning
   */
  const prevLitanyVerse = useCallback(() => {
    if (litanyVerseIndex > 0) {
      setLitanyVerseIndex((prev) => prev - 1);
      return true;
    }
    return false;
  }, [litanyVerseIndex]);

  /**
   * Reset litany state when entering or exiting litany
   */
  const resetLitanyState = useCallback(() => {
    setLitanyVerseIndex(0);
    setIsInLitany(false);
  }, []);

  /**
   * Reset rosary state (start fresh)
   */
  const resetRosaryState = useCallback(() => {
    setCurrentPrayerIndex(0);
    setHighlightedBead(0);
    resetLitanyState();
    // Clear localStorage
    try {
      localStorage.removeItem("rosaryState");
    } catch (error) {
      console.warn("Failed to clear rosary state from localStorage:", error);
    }
  }, [resetLitanyState]);

  // Check if we're currently in the litany and update state accordingly
  useEffect(() => {
    const rosarySequence = getRosarySequence();
    const currentPrayerId = rosarySequence[currentPrayerIndex];

    if (currentPrayerId === "LL") {
      if (!isInLitany) {
        setIsInLitany(true);
        setLitanyVerseIndex(0); // Reset to first verse when entering
      }
    } else {
      if (isInLitany) {
        setIsInLitany(false);
        setLitanyVerseIndex(0); // Reset when exiting
      }
    }
  }, [currentPrayerIndex, getRosarySequence, isInLitany]);

  // Return all state and handler functions for use in components
  return {
    currentPrayerIndex, // Current position in rosary sequence
    highlightedBead, // Currently highlighted bead index
    handleBeadClick, // Function to handle bead clicks
    jumpToPrayer, // Function to jump to specific prayer
    navigateToIndex, // Function to navigate to specific index
    getCurrentMysteryNumber, // Function to get current mystery number
    getRosarySequence, // Function to get current rosary sequence
    // Prayer visibility functions
    prayerVisibilityMode, // Current prayer visibility mode
    customPrayerVisibility, // Custom prayer visibility settings
    getFilteredPrayerSequence, // Function to get filtered prayer sequence
    // Litany-specific state and functions
    litanyVerseIndex, // Current verse index within litany
    isInLitany, // Whether currently in litany prayer
    getLitanyData, // Function to get litany data
    nextLitanyVerse, // Function to go to next litany verse
    prevLitanyVerse, // Function to go to previous litany verse
    resetLitanyState, // Function to reset litany state
    // State management functions
    resetRosaryState, // Function to reset entire rosary state
  };
};
