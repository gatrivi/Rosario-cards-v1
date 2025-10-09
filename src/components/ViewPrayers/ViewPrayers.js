import React from "react";
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
 * 
 * @param {string} prayer - Current prayer text to display
 * @param {number} count - Manual counter for Hail Marys (legacy)
 * @param {string} prayerImg - URL of the current prayer image
 * @param {string} currentMystery - Current mystery type
 * @param {number} currentPrayerIndex - Current position in rosary sequence
 * @param {object} prayers - Prayer data object for sequence analysis
 */
function ViewPrayers({
  prayer,
  count,
  prayerImg,
  currentMystery,
  currentPrayerIndex,
  prayers,
  showCounters = true,
}) {
  let baseImageUrl;
  const finalImageUrl = prayerImg ? prayerImg : baseImageUrl;
  const currentTheme = localStorage.getItem("theme");

  /**
   * Count Hail Marys based on decade positions
   * 
   * Hail Marys are grouped in:
   * - 3 initial Hail Marys (indices 4-6)
   * - 5 decades of 10 Hail Marys each (indices 11-20, 25-34, 39-48, 53-62, 67-76)
   * 
   * This function uses the position of first and last Hail Mary of each decade
   * to calculate the count efficiently without iterating through all prayers.
   * 
   * @returns {number} Number of Hail Marys prayed so far
   */
  const getHailMaryCount = () => {
    if (!prayers) return 0;

    // Define Hail Mary ranges for each section
    // Each entry: start index, end index, and total count in that section
    const hailMaryRanges = [
      { start: 4, end: 6, count: 3 },      // Initial 3 Hail Marys
      { start: 11, end: 20, count: 10 },   // Decade 1
      { start: 25, end: 34, count: 10 },   // Decade 2
      { start: 39, end: 48, count: 10 },   // Decade 3
      { start: 53, end: 62, count: 10 },   // Decade 4
      { start: 67, end: 76, count: 10 },   // Decade 5
    ];

    let totalCount = 0;
    
    // Find the current position in the ranges and calculate count
    for (const range of hailMaryRanges) {
      if (currentPrayerIndex < range.start) {
        // Haven't reached this range yet, stop counting
        break;
      } else if (currentPrayerIndex >= range.start && currentPrayerIndex <= range.end) {
        // Currently in this range
        // Count how many Hail Marys have been said in this range
        const positionInRange = currentPrayerIndex - range.start;
        totalCount += positionInRange + 1; // +1 because we include the current position
        break;
      } else {
        // Completed this range, add all Hail Marys from it
        totalCount += range.count;
      }
    }

    return totalCount;
  };

  const hailMaryCount = getHailMaryCount();

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
}

export default ViewPrayers;
