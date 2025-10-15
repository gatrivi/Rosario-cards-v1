import { useState, useCallback, useEffect } from "react";

/**
 * useRosaryCompletion Hook
 *
 * Manages rosary completion state and effects:
 * - Tracks which beads have been recited
 * - Detects when a rosary is completed
 * - Manages completion effects and stacking
 * - Persists completion data in localStorage
 *
 * @param {string} currentMystery - Current mystery type
 * @returns {object} Object containing completion state and functions
 */
export const useRosaryCompletion = (currentMystery) => {
  // State for tracking recited beads
  const [recitedBeads, setRecitedBeads] = useState(new Set());
  
  // State for tracking completed rosaries
  const [completedRosaries, setCompletedRosaries] = useState([]);
  
  // State for current completion effects
  const [activeEffects, setActiveEffects] = useState([]);

  // Load completion data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('rosaryCompletionData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setRecitedBeads(new Set(data.recitedBeads || []));
        setCompletedRosaries(data.completedRosaries || []);
        setActiveEffects(data.activeEffects || []);
      } catch (error) {
        console.error('Error loading rosary completion data:', error);
      }
    }
  }, []);

  // Save completion data to localStorage whenever it changes
  useEffect(() => {
    const data = {
      recitedBeads: Array.from(recitedBeads),
      completedRosaries,
      activeEffects,
      lastUpdated: Date.now()
    };
    localStorage.setItem('rosaryCompletionData', JSON.stringify(data));
  }, [recitedBeads, completedRosaries, activeEffects]);

  /**
   * Mark a bead as recited
   * @param {number} prayerIndex - Index of the recited prayer
   */
  const markBeadAsRecited = useCallback((prayerIndex) => {
    setRecitedBeads(prev => new Set([...prev, prayerIndex]));
  }, []);

  /**
   * Check if a bead has been recited
   * @param {number} prayerIndex - Index of the prayer to check
   * @returns {boolean} True if the bead has been recited
   */
  const isBeadRecited = useCallback((prayerIndex) => {
    return recitedBeads.has(prayerIndex);
  }, [recitedBeads]);

  /**
   * Check if the rosary is completed (all 56 prayers recited)
   * @returns {boolean} True if rosary is completed
   */
  const isRosaryCompleted = useCallback(() => {
    // Check if all prayers from 0-55 have been recited
    for (let i = 0; i <= 55; i++) {
      if (!recitedBeads.has(i)) {
        return false;
      }
    }
    return true;
  }, [recitedBeads]);

  /**
   * Complete the current rosary
   * Adds completion timestamp and starts effects
   */
  const completeRosary = useCallback(() => {
    if (isRosaryCompleted()) {
      const completionTime = Date.now();
      const newCompletion = {
        mystery: currentMystery,
        timestamp: completionTime,
        id: `${currentMystery}-${completionTime}`
      };
      
      setCompletedRosaries(prev => [...prev, newCompletion]);
      
      // Start holy energy effect for 6 hours
      const effect = {
        id: `holy-energy-${completionTime}`,
        type: 'holy-energy',
        startTime: completionTime,
        duration: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
        mystery: currentMystery
      };
      
      setActiveEffects(prev => [...prev, effect]);
      
      return newCompletion;
    }
    return null;
  }, [isRosaryCompleted, currentMystery]);

  /**
   * Reset recited beads (for new rosary)
   */
  const resetRecitedBeads = useCallback(() => {
    setRecitedBeads(new Set());
  }, []);

  /**
   * Get current completion progress (0-100)
   * @returns {number} Completion percentage
   */
  const getCompletionProgress = useCallback(() => {
    const totalBeads = 56; // 0-55 inclusive
    const recitedCount = Array.from(recitedBeads).filter(index => index <= 55).length;
    return Math.round((recitedCount / totalBeads) * 100);
  }, [recitedBeads]);

  /**
   * Get active holy energy effects
   * @returns {array} Array of active holy energy effects
   */
  const getActiveHolyEnergyEffects = useCallback(() => {
    const now = Date.now();
    return activeEffects.filter(effect => {
      if (effect.type !== 'holy-energy') return false;
      const elapsed = now - effect.startTime;
      return elapsed < effect.duration;
    });
  }, [activeEffects]);

  /**
   * Clean up expired effects
   */
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setActiveEffects(prev => 
        prev.filter(effect => {
          const elapsed = now - effect.startTime;
          return elapsed < effect.duration;
        })
      );
    };

    // Clean up every minute
    const interval = setInterval(cleanup, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    recitedBeads,
    completedRosaries,
    activeEffects,
    markBeadAsRecited,
    isBeadRecited,
    isRosaryCompleted,
    completeRosary,
    resetRecitedBeads,
    getCompletionProgress,
    getActiveHolyEnergyEffects
  };
};