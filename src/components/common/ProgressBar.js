import React from "react";

/**
 * ProgressBar Component
 *
 * Displays current position in the rosary sequence with a discreet progress bar
 * Shows current prayer number / total prayers and visual progress
 *
 * @param {number} currentIndex - Current prayer index (0-based)
 * @param {number} totalPrayers - Total number of prayers in sequence
 * @param {string} className - Additional CSS classes
 */
const ProgressBar = ({ currentIndex, totalPrayers, className = "" }) => {
  // Only count first cross (index 0) and 55 beads in main decades (indices 1-55)
  // Total of 56 prayers for progress calculation
  const maxProgressIndex = 55; // 0-55 inclusive = 56 prayers
  const effectiveIndex = Math.min(currentIndex, maxProgressIndex);
  const effectiveTotal = Math.min(totalPrayers, 56);
  const progress =
    effectiveTotal > 0 ? ((effectiveIndex + 1) / effectiveTotal) * 100 : 0;
  const isDarkMode = document.body.classList.contains("dark");

  // Calculate decade markers (every 10 prayers) based on effective total
  const decadeMarkers = [];
  for (let i = 1; i <= Math.floor(effectiveTotal / 10); i++) {
    decadeMarkers.push(((i * 10) / effectiveTotal) * 100);
  }

  return (
    <div
      className={`progress-bar ${className}`}
      style={{
        position: "fixed",
        bottom: "70px", // Above the prayer buttons
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        maxWidth: "400px",
        background: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        padding: "8px 12px",
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1,
        fontSize: "12px",
        color: "var(--text-color)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Progress text */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
          fontSize: "11px",
          opacity: 0.8,
        }}
      >
        <span>
          {effectiveIndex + 1} / {effectiveTotal}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>

      {/* Progress bar container */}
      <div
        style={{
          position: "relative",
          height: "6px",
          background: isDarkMode
            ? "rgba(0, 0, 0, 0.3)"
            : "rgba(255, 255, 255, 0.2)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #FFD700, #FFA500)",
            borderRadius: "3px",
            transition: "width 0.3s ease",
          }}
        />

        {/* Decade markers */}
        {decadeMarkers.map((marker, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${marker}%`,
              top: "0",
              height: "100%",
              width: "1px",
              background: isDarkMode
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.4)",
              transform: "translateX(-50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
