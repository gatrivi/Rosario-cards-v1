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
        bottom: "110px", // Above the prayer buttons
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "600px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(15px)",
        borderRadius: "20px",
        padding: "16px 24px",
        border: "3px solid var(--glass-border)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1)",
        zIndex: 100,
        fontSize: "16px",
        color: "var(--text-color)",
        fontFamily: "Cloister Black, serif",
        fontWeight: "bold",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Progress text */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          fontSize: "15px",
          opacity: 1,
        }}
      >
        <span style={{ color: "var(--catholic-gold)" }}>
          📿 Prayer {currentIndex + 1} of {totalPrayers}
        </span>
        <span style={{ color: "var(--catholic-gold)" }}>
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Progress bar container */}
      <div
        style={{
          position: "relative",
          height: "12px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: "6px",
          overflow: "hidden",
          border: "2px solid var(--glass-border)",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--catholic-gold), var(--catholic-red), var(--catholic-purple))",
            borderRadius: "4px",
            transition: "width 0.5s ease",
            boxShadow: "0 0 15px rgba(212, 175, 55, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
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
              width: "3px",
              background: "var(--catholic-gold)",
              transform: "translateX(-50%)",
              opacity: 0.8,
              boxShadow: "0 0 8px rgba(212, 175, 55, 0.6)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
