import React, { useState, useEffect } from "react";

/**
 * RosaryToggle Component
 *
 * Toggles the visibility of the interactive rosary
 * State persists in localStorage
 */
const RosaryToggle = () => {
  const [rosaryVisible, setRosaryVisible] = useState(() => {
    const saved = localStorage.getItem("rosaryVisible");
    return saved !== "false"; // Default to visible
  });

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem("rosaryVisible", rosaryVisible);

    // Dispatch custom event for the rosary component to listen to
    window.dispatchEvent(
      new CustomEvent("rosaryVisibilityChange", {
        detail: { visible: rosaryVisible },
      })
    );
  }, [rosaryVisible]);

  return (
    <button
      onClick={() => setRosaryVisible(!rosaryVisible)}
      style={{
        padding: "8px 12px",
        fontSize: "20px",
        cursor: "pointer",
        border: "none",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.1)",
        color: "inherit",
        transition: "all 0.3s ease",
      }}
      aria-label="Toggle Rosary Visibility"
      title={rosaryVisible ? "Hide Rosary" : "Show Rosary"}
    >
      {rosaryVisible ? "📿" : "🙏"}
    </button>
  );
};

export default RosaryToggle;
