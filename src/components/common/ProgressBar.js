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
  const progress =
    totalPrayers > 0 ? ((currentIndex + 1) / totalPrayers) * 100 : 0;
  const isDarkMode = document.body.classList.contains("dark");

  // Calculate decade markers (every 10 prayers)
  const decadeMarkers = [];
  for (let i = 1; i <= Math.floor(totalPrayers / 10); i++) {
    decadeMarkers.push(((i * 10) / totalPrayers) * 100);
  }

  return (
    <div
      className={`progress-bar ${className}`}
      style={{
        position: "fixed",
        bottom: "90px", // Above the prayer buttons
        left: "50%",
        transform: "translateX(-50%)",
        width: "85%",
        maxWidth: "500px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "12px 20px",
        border: "2px solid var(--glass-border)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        zIndex: 100,
        fontSize: "14px",
        color: "var(--text-color)",
        fontFamily: "Cloister Black, serif",
        fontWeight: "bold",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Progress text */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          fontSize: "13px",
          opacity: 0.9,
        }}
      >
        <span>
          📿 {currentIndex + 1} / {totalPrayers}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>

      {/* Progress bar container */}
      <div
        style={{
          position: "relative",
          height: "8px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--catholic-gold), var(--catholic-red))",
            borderRadius: "4px",
            transition: "width 0.3s ease",
            boxShadow: "0 0 10px rgba(212, 175, 55, 0.5)",
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
              width: "2px",
              background: "var(--catholic-gold)",
              transform: "translateX(-50%)",
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
