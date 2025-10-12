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
  leftHandedMode = false,
  setLeftHandedMode = () => {},
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

  /**
   * Handle left-handed mode toggle
   */
  const handleLeftHandedToggle = () => {
    const newMode = !leftHandedMode;
    setLeftHandedMode(newMode);
    localStorage.setItem("leftHandedMode", newMode.toString());
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("leftHandedModeChange", {
      detail: { leftHandedMode: newMode }
    }));
  };

  return (
    <div
      className={`interface-toggle ${className}`}
      style={{ position: "fixed", top: "10px", left: "10px", zIndex: 2 }}
    >
      {/* Main toggle button */}
      <button
        onClick={toggleExpanded}
        className="main-toggle-btn"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(8px)",
          color: "var(--text-color)",
          border: "2px solid var(--glass-border)",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          fontFamily: "Cloister Black, serif",
          fontWeight: "bold",
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
            background: "var(--glass-bg)",
            backdropFilter: "blur(12px)",
            color: "var(--text-color)",
            padding: "20px",
            borderRadius: "16px",
            minWidth: "220px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            border: "2px solid var(--glass-border)",
            fontFamily: "Cloister Black, serif",
          }}
        >
          <div
            style={{
              marginBottom: "15px",
              fontWeight: "bold",
              color: "var(--catholic-gold)",
              fontSize: "16px",
              textAlign: "center",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            ⚙️ Interface Controls
          </div>

          {/* Toggle All Button */}
          <button
            onClick={handleToggleAll}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              background: showRosary && showCounters 
                ? "linear-gradient(135deg, var(--catholic-red), #8b0000)" 
                : "linear-gradient(135deg, var(--catholic-gold), var(--catholic-blue))",
              color: "var(--catholic-white)",
              border: "2px solid var(--glass-border)",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
            }}
          >
            {showRosary && showCounters ? "🙈 Hide All" : "👁️ Show All"}
          </button>

          {/* Individual toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Interactive Rosary Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--glass-border)",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="checkbox"
                checked={showRosary}
                onChange={handleRosaryToggle}
                style={{ 
                  marginRight: "12px",
                  transform: "scale(1.2)",
                  accentColor: "var(--catholic-gold)",
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>📿 Interactive Rosary</span>
            </label>

            {/* Counters Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--glass-border)",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="checkbox"
                checked={showCounters}
                onChange={handleCountersToggle}
                style={{ 
                  marginRight: "12px",
                  transform: "scale(1.2)",
                  accentColor: "var(--catholic-gold)",
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>📊 Prayer Counters</span>
            </label>

            {/* Left-Handed Mode Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--glass-border)",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="checkbox"
                checked={leftHandedMode}
                onChange={handleLeftHandedToggle}
                style={{ 
                  marginRight: "12px",
                  transform: "scale(1.2)",
                  accentColor: "var(--catholic-gold)",
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>👈 Left-Handed Mode</span>
            </label>
          </div>

          {/* Help text */}
          <div
            style={{
              marginTop: "15px",
              fontSize: "12px",
              color: "var(--catholic-gold)",
              fontStyle: "italic",
              borderTop: "2px solid var(--glass-border)",
              paddingTop: "12px",
              textAlign: "center",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
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
