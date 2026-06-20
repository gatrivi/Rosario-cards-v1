import React from "react";
import "./LitanyDisplay.css";

/**
 * LitanyDisplay Component
 *
 * Specialized component for displaying the Litany of Loreto with two-voice coloring
 * Shows invocation and response in different color tones with verse images
 */
const LitanyDisplay = ({
  verse,
  verseIndex,
  totalVerses,
  currentMystery,
  onNextVerse,
  onPrevVerse,
}) => {
  if (!verse) return null;

  // Get mystery-specific colors
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      gozosos: {
        invocation: "#FFB6C1", // Light pink
        response: "#FF69B4", // Hot pink
        highlight: "#FFD700", // Gold
      },
      dolorosos: {
        invocation: "#8B4513", // Saddle brown
        response: "#2F4F4F", // Dark slate gray
        highlight: "#DC143C", // Crimson
      },
      gloriosos: {
        invocation: "#4169E1", // Royal blue
        response: "#000080", // Navy blue
        highlight: "#FFD700", // Gold
      },
      luminosos: {
        invocation: "#FFD700", // Gold
        response: "#FFA500", // Orange
        highlight: "#FFFF00", // Yellow
      },
    };
    return colorSchemes[mystery] || colorSchemes.gozosos;
  };

  const colors = getMysteryColors(currentMystery);

  return (
    <div className="litany-display">
      {/* Verse counter */}
      <div className="litany-counter">
        Verse {verseIndex + 1} of {totalVerses}
      </div>

      {/* Invocation */}
      <div className="litany-invocation" style={{ color: colors.invocation }}>
        {verse.invocation}
      </div>

      {/* Response */}
      <div className="litany-response" style={{ color: colors.response }}>
        {verse.response}
      </div>

      {/* Navigation hints */}
      <div className="litany-navigation">
        <div className="nav-hint">Swipe or tap to continue</div>
      </div>
    </div>
  );
};

export default LitanyDisplay;
