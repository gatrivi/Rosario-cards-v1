import { useState, useCallback, useEffect } from "react";

/**
 * useRosaryProgress Hook
 * 
 * Manages rosary progress tracking, completion detection, and visual effects
 * Tracks only the first cross and 55 beads in main decades for progress calculation
 * Manages persistent glow effects for recited beads and completion animations
 */
export const useRosaryProgress = (prayers, currentMystery, currentPrayerIndex) => {
  // State for tracking recited beads (persistent glow effect)
  const [recitedBeads, setRecitedBeads] = useState(new Set());
  
  // State for rosary completion effects
  const [completedRosaries, setCompletedRosaries] = useState([]);
  const [isRosaryComplete, setIsRosaryComplete] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  /**
   * Get the rosary sequence based on current mystery type
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
   * Calculate progress based on first cross and 55 main decade beads only
   * Progress = (currentIndex + 1) / 56 (0-55 inclusive)
   */
  const getProgress = useCallback(() => {
    const rosarySequence = getRosarySequence();
    if (!rosarySequence.length) return 0;
    
    // Only count first cross (index 0) and 55 main decade beads (indices 1-55)
    const maxProgressIndex = Math.min(55, rosarySequence.length - 1);
    const currentIndex = Math.min(currentPrayerIndex, maxProgressIndex);
    
    return {
      current: currentIndex + 1,
      total: 56, // First cross + 55 main decade beads
      percentage: ((currentIndex + 1) / 56) * 100
    };
  }, [currentPrayerIndex, getRosarySequence]);

  /**
   * Check if a bead should have glow effect (has been recited)
   */
  const isBeadRecited = useCallback((prayerIndex) => {
    return recitedBeads.has(prayerIndex);
  }, [recitedBeads]);

  /**
   * Mark a bead as recited (adds persistent glow effect)
   */
  const markBeadAsRecited = useCallback((prayerIndex) => {
    setRecitedBeads(prev => new Set([...prev, prayerIndex]));
  }, []);

  /**
   * Check if rosary is complete (reached end of main decades)
   */
  const checkRosaryCompletion = useCallback(() => {
    const progress = getProgress();
    const isComplete = progress.current >= progress.total;
    
    if (isComplete && !isRosaryComplete) {
      setIsRosaryComplete(true);
      setShowCompletionAnimation(true);
      
      // Add completion timestamp for 6-hour effect tracking
      const completionTime = Date.now();
      setCompletedRosaries(prev => [...prev, completionTime]);
      
      // Hide completion animation after 3 seconds
      setTimeout(() => {
        setShowCompletionAnimation(false);
      }, 3000);
      
      return true;
    }
    
    return false;
  }, [getProgress, isRosaryComplete]);

  /**
   * Get active holy energy effects (completed rosaries within last 6 hours)
   */
  const getActiveHolyEnergyEffects = useCallback(() => {
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
    return completedRosaries.filter(timestamp => timestamp > sixHoursAgo);
  }, [completedRosaries]);

  /**
   * Reset rosary state when mystery changes
   */
  useEffect(() => {
    setRecitedBeads(new Set());
    setIsRosaryComplete(false);
    setShowCompletionAnimation(false);
  }, [currentMystery]);

  /**
   * Check for completion when prayer index changes
   */
  useEffect(() => {
    checkRosaryCompletion();
  }, [currentPrayerIndex, checkRosaryCompletion]);

  /**
   * Mark current bead as recited when prayer index changes
   */
  useEffect(() => {
    if (currentPrayerIndex >= 0) {
      markBeadAsRecited(currentPrayerIndex);
    }
  }, [currentPrayerIndex, markBeadAsRecited]);

  return {
    // Progress tracking
    getProgress,
    
    // Bead glow effects
    isBeadRecited,
    markBeadAsRecited,
    
    // Completion effects
    isRosaryComplete,
    showCompletionAnimation,
    getActiveHolyEnergyEffects,
    
    // State
    recitedBeads,
    completedRosaries
  };
};