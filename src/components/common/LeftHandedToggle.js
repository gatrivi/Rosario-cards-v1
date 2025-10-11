import React, { useState, useEffect } from "react";
import { FaHandPaper } from "react-icons/fa";

/**
 * LeftHandedToggle Component
 *
 * Provides a toggle to switch between right-handed (default) and left-handed mode.
 * In left-handed mode, navigation buttons are reversed so the Next button
 * is on the left side for easier thumb access on large phones.
 *
 * Features:
 * - Persists preference in localStorage
 * - Visual indicator showing current mode
 * - Accessible design with proper ARIA labels
 */
const LeftHandedToggle = () => {
  const [leftHandedMode, setLeftHandedMode] = useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem("leftHandedMode") === "true";
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem("leftHandedMode", leftHandedMode.toString());

    // Dispatch custom event so other components can react to the change
    window.dispatchEvent(
      new CustomEvent("leftHandedModeChange", {
        detail: { leftHandedMode },
      })
    );
  }, [leftHandedMode]);

  const toggleMode = () => setLeftHandedMode(!leftHandedMode);

  return (
    <button
      onClick={toggleMode}
      className="rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
      style={{
        padding: "8px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        position: "relative",
      }}
      aria-label={
        leftHandedMode
          ? "Switch to right-handed mode"
          : "Switch to left-handed mode"
      }
      title={
        leftHandedMode ? "Left-handed mode active" : "Right-handed mode active"
      }
    >
      <FaHandPaper
        size={15}
        style={{
          transform: leftHandedMode ? "scaleX(-1)" : "scaleX(1)",
          transition: "transform 0.3s ease",
        }}
      />
      {leftHandedMode && (
        <span style={{ fontSize: "10px", fontWeight: "bold" }}>L</span>
      )}
    </button>
  );
};

export default LeftHandedToggle;
