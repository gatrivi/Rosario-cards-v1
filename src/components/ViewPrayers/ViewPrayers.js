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
        height: "60vh",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "20px",
        margin: "16px",
        padding: "16px",
        gap: "16px",
        pointerEvents: "none",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {showCounters && (
          <div style={{ 
            background: "rgba(0, 122, 255, 0.1)",
            padding: "12px 16px",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--primary)",
            alignSelf: "center",
            boxShadow: "0 2px 8px rgba(0, 122, 255, 0.15)",
          }}>
            <span>📿</span>
            <span>Hail Marys: {hailMaryCount}</span>
          </div>
        )}
        <p style={{ 
          margin: 0, 
          lineHeight: "1.7",
          fontSize: "1.125rem",
        }}>{prayer}</p>
      </div>
      <div className="page-right" style={{ flex: 1, padding: "8px" }}>
        <img
          className="prayer-image"
          src={finalImageUrl}
          alt={`${prayer.name} illustration`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "16px",
          }}
        />
      </div>
    </div>
  );
}

export default ViewPrayers;
