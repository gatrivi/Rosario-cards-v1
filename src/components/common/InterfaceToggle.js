import React, { useState } from "react";

/**
 * InterfaceToggle Component
 *
 * Provides a toggle button to hide/show rosary and counters for a clean, distraction-free interface
 * Perfect for users who want to focus solely on prayer without visual distractions
 *
 * Features:
 * - Toggle between full interface and clean prayer mode
 * - Visual indicator of current mode
 * - Smooth transitions between states
 * - Accessible design with proper ARIA labels
 *
 * @param {boolean} showRosary - Whether to show the interactive rosary
 * @param {boolean} showCounters - Whether to show prayer counters
 * @param {function} onToggleRosary - Callback to toggle rosary visibility
 * @param {function} onToggleCounters - Callback to toggle counters visibility
 * @param {string} className - Additional CSS classes for styling
 */
const InterfaceToggle = ({
  showRosary = true,
  showCounters = true,
  onToggleRosary,
  onToggleCounters,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Toggle the expanded state of the control panel
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Handle individual toggle for rosary visibility
   */
  const handleRosaryToggle = () => {
    if (onToggleRosary) {
      onToggleRosary();
    }
  };

  /**
   * Handle individual toggle for counters visibility
   */
  const handleCountersToggle = () => {
    if (onToggleCounters) {
      onToggleCounters();
    }
  };

  /**
   * Toggle all interface elements at once
   */
  const handleToggleAll = () => {
    const allVisible = showRosary && showCounters;
    if (onToggleRosary) onToggleRosary(!allVisible);
    if (onToggleCounters) onToggleCounters(!allVisible);
  };

  return (
    <div
      className={`interface-toggle ${className}`}
      style={{ position: "fixed", top: "10px", left: "10px", zIndex: 10 }}
    >
      {/* Main toggle button */}
      <button
        onClick={toggleExpanded}
        className="main-toggle-btn"
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        }}
        title="Toggle Interface Controls"
        aria-label="Toggle interface controls"
      >
        {isExpanded ? "✕" : "⚙️"}
      </button>

      {/* Expanded control panel */}
      {isExpanded && (
        <div
          className="control-panel"
          style={{
            position: "absolute",
            top: "60px",
            left: "0",
            background: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            minWidth: "200px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
            border: "1px solid #FFD700",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              fontWeight: "bold",
              color: "#FFD700",
            }}
          >
            Interface Controls
          </div>

          {/* Toggle All Button */}
          <button
            onClick={handleToggleAll}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              background: showRosary && showCounters ? "#FF6B6B" : "#4ECDC4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {showRosary && showCounters ? "Hide All" : "Show All"}
          </button>

          {/* Individual toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Interactive Rosary Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showRosary}
                onChange={handleRosaryToggle}
                style={{ marginRight: "8px" }}
              />
              <span>📿 Interactive Rosary</span>
            </label>

            {/* Counters Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showCounters}
                onChange={handleCountersToggle}
                style={{ marginRight: "8px" }}
              />
              <span>📊 Prayer Counters</span>
            </label>
          </div>

          {/* Help text */}
          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#ccc",
              fontStyle: "italic",
              borderTop: "1px solid #333",
              paddingTop: "8px",
            }}
          >
            💡 Hide elements for distraction-free prayer
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfaceToggle;
