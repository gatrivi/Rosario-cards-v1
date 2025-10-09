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
 * @param {boolean} showBackupRosary - Whether to show the backup rosary
 * @param {boolean} showCounters - Whether to show prayer counters
 * @param {function} onToggleRosary - Callback to toggle rosary visibility
 * @param {function} onToggleBackupRosary - Callback to toggle backup rosary visibility
 * @param {function} onToggleCounters - Callback to toggle counters visibility
 * @param {string} className - Additional CSS classes for styling
 */
const InterfaceToggle = ({
  showRosary = true,
  showBackupRosary = true,
  showCounters = true,
  onToggleRosary,
  onToggleBackupRosary,
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
   * Handle individual toggle for backup rosary visibility
   */
  const handleBackupRosaryToggle = () => {
    if (onToggleBackupRosary) {
      onToggleBackupRosary();
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
    const allVisible = showRosary && showBackupRosary && showCounters;
    if (onToggleRosary) onToggleRosary(!allVisible);
    if (onToggleBackupRosary) onToggleBackupRosary(!allVisible);
    if (onToggleCounters) onToggleCounters(!allVisible);
  };

  return (
    <div
      className={`interface-toggle ${className}`}
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top) + 8px)",
        left: 10,
        zIndex: 2000,
      }}
    >
      {/* Main toggle button */}
      <button
        onClick={toggleExpanded}
        className="main-toggle-btn"
        style={{
          background: "var(--surface)",
          color: "var(--text-color)",
          border: "0.5px solid var(--separator)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          cursor: "pointer",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          backdropFilter: "saturate(180%) blur(20px)",
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
            top: 56,
            left: 0,
            background: "var(--surface)",
            color: "var(--text-color)",
            padding: 12,
            borderRadius: 12,
            minWidth: 200,
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            border: "0.5px solid var(--separator)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            backdropFilter: "saturate(180%) blur(20px)",
          }}
        >
          <div style={{ marginBottom: "10px", fontWeight: "bold", color: "#FFD700" }}>
            Interface Controls
          </div>

          {/* Toggle All Button */}
          <button
            onClick={handleToggleAll}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 10,
              background: "var(--primary)",
              color: "#fff",
              border: "1px solid var(--primary)",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {showRosary && showBackupRosary && showCounters ? "Hide All" : "Show All"}
          </button>

          {/* Individual toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Interactive Rosary Toggle */}
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showRosary}
                onChange={handleRosaryToggle}
                style={{ marginRight: "8px" }}
              />
              <span>📿 Interactive Rosary</span>
            </label>

            {/* Backup Rosary Toggle */}
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showBackupRosary}
                onChange={handleBackupRosaryToggle}
                style={{ marginRight: "8px" }}
              />
              <span>🔴 Backup Rosary</span>
            </label>

            {/* Counters Toggle */}
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
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
          <div style={{ 
            marginTop: "10px", 
            fontSize: "12px", 
            color: "#ccc", 
            fontStyle: "italic",
            borderTop: "1px solid #333",
            paddingTop: "8px"
          }}>
            💡 Hide elements for distraction-free prayer
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfaceToggle;
