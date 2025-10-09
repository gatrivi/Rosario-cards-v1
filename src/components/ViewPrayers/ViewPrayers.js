import React, { useRef, useImperativeHandle, forwardRef } from "react";
import AveMariaD from "../../data/assets/img/AllMary17thLith.jpeg";

/**
 * ViewPrayers Component
 * 
 * Displays the current prayer text and image with Hail Mary counter
 * Provides a clean, focused interface for prayer reading with:
 * - Prayer text display with proper formatting
 * - Prayer image display with theme support
 * - Hail Mary counter based on actual prayer sequence
 * - Responsive layout for different screen sizes
 * - Scroll control for navigation
 * 
 * @param {string} prayer - Current prayer text to display
 * @param {number} count - Manual counter for Hail Marys (legacy)
 * @param {string} prayerImg - URL of the current prayer image
 * @param {string} currentMystery - Current mystery type
 * @param {number} currentPrayerIndex - Current position in rosary sequence
 * @param {object} prayers - Prayer data object for sequence analysis
 */
const ViewPrayers = forwardRef(({
  prayer,
  count,
  prayerImg,
  currentMystery,
  currentPrayerIndex,
  prayers,
  showCounters = true,
}, ref) => {
  const scrollContainerRef = useRef(null);
  let baseImageUrl;
  const finalImageUrl = prayerImg ? prayerImg : baseImageUrl;
  const currentTheme = localStorage.getItem("theme");

  /**
   * Count Hail Marys based on actual prayer sequence
   * This function analyzes the rosary sequence to count how many "A" entries
   * (Ave Maria/Hail Mary) have been reached up to the current prayer index
   * 
   * @returns {number} Number of Hail Marys prayed so far
   */
  const getHailMaryCount = () => {
    if (!prayers) return 0;

    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };

    const rosarySequence = prayers[mysteryToArray[currentMystery]] || [];
    let count = 0;

    // Count "A" entries (Ave Maria/Hail Mary) up to current prayer index
    // This provides an accurate count of Hail Marys prayed so far
    for (let i = 0; i <= currentPrayerIndex && i < rosarySequence.length; i++) {
      if (rosarySequence[i] === "A") {
        count++;
      }
    }

    return count;
  };

  const hailMaryCount = getHailMaryCount();

  /**
   * Expose scroll control methods to parent component
   * Allows parent to check scroll position and control scrolling
   */
  useImperativeHandle(ref, () => ({
    /**
     * Check if content can scroll down
     * @returns {boolean} True if there's more content below
     */
    canScrollDown: () => {
      if (!scrollContainerRef.current) return false;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      return scrollTop + clientHeight < scrollHeight - 10; // 10px threshold
    },
    
    /**
     * Check if content can scroll up
     * @returns {boolean} True if there's content above
     */
    canScrollUp: () => {
      if (!scrollContainerRef.current) return false;
      return scrollContainerRef.current.scrollTop > 10; // 10px threshold
    },
    
    /**
     * Scroll down by one viewport
     */
    scrollDown: () => {
      if (!scrollContainerRef.current) return;
      const scrollAmount = scrollContainerRef.current.clientHeight * 0.8;
      scrollContainerRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      });
    },
    
    /**
     * Scroll up by one viewport
     */
    scrollUp: () => {
      if (!scrollContainerRef.current) return;
      const scrollAmount = scrollContainerRef.current.clientHeight * 0.8;
      scrollContainerRef.current.scrollBy({
        top: -scrollAmount,
        behavior: 'smooth'
      });
    },
    
    /**
     * Reset scroll to top
     */
    resetScroll: () => {
      if (!scrollContainerRef.current) return;
      scrollContainerRef.current.scrollTop = 0;
    }
  }));

  // Set base image URL based on theme and mystery type
  // Dark theme uses special images for certain mysteries
  if (currentTheme === "dark") {
    if (currentMystery === "gloriosos") {
      baseImageUrl = "/gallery-images/misterios/modooscuro/misteriogloria0.jpg";
    }
  } else {
    baseImageUrl = AveMariaD;
  }
  return (
    <div
      className="top-section prayer-content-overlay"
      style={{
        display: "flex",
        height: "58vh",
        background: "rgba(255, 255, 255, 0.1)", // More transparent
        backdropFilter: "blur(0.5px)", // Less blur
        borderRadius: "8px",
        margin: "10px",
        padding: "10px",
        pointerEvents: "none", // Allow clicks to pass through
      }}
    >
      <div
        ref={scrollContainerRef}
        className="page-left"
        style={{
          flex: 1,
          overflow: "scroll",
          padding: "4px",
        }}
      >
        {showCounters && (
          <span style={{ color: "gold", fontSize: "18px", fontWeight: "bold" }}>
            📿 Hail Marys: {hailMaryCount} (Index: {currentPrayerIndex})
          </span>
        )}
        <p>{prayer}</p>
      </div>
      <div className="page-right" style={{ flex: 1 }}>
        <img
          className="prayer-image"
          src={finalImageUrl}
          alt={`${prayer.name} illustration`}
          style={{
            width: "47vw",
            height: "56vh",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
});

ViewPrayers.displayName = 'ViewPrayers';

export default ViewPrayers;
