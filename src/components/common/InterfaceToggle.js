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
    <div className={`interface-toggle ${className}`} style={{ position: "fixed", top: "16px", left: "16px", zIndex: 2000 }}>
      {/* iOS-style Main toggle button */}
      <button
        onClick={toggleExpanded}
        className="main-toggle-btn"
        style={{
          background: "var(--system-fill)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "var(--text-color)",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
        }}
        title="Toggle Interface Controls"
        aria-label="Toggle interface controls"
      >
        {isExpanded ? "✕" : "⚙️"}
      </button>

      {/* iOS-style Expanded control panel */}
      {isExpanded && (
        <div
          className="control-panel"
          style={{
            position: "absolute",
            top: "60px",
            left: "0",
            background: "var(--card-background)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "var(--text-color)",
            padding: "20px",
            borderRadius: "16px",
            minWidth: "240px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            border: "1px solid var(--separator)",
          }}
        >
          <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "17px", color: "var(--text-color)" }}>
            Interface Controls
          </div>

          {/* iOS-style Toggle All Button */}
          <button
            onClick={handleToggleAll}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "16px",
              background: showRosary && showBackupRosary && showCounters ? "var(--primary)" : "var(--system-fill)",
              color: showRosary && showBackupRosary && showCounters ? "white" : "var(--text-color)",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
              minHeight: "44px",
            }}
          >
            {showRosary && showBackupRosary && showCounters ? "Hide All" : "Show All"}
          </button>

          {/* iOS-style Individual toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Interactive Rosary Toggle */}
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              background: "var(--system-fill)",
              transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
            }}>
              <input
                type="checkbox"
                checked={showRosary}
                onChange={handleRosaryToggle}
                style={{ 
                  marginRight: "12px",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "15px", fontWeight: "500" }}>📿 Interactive Rosary</span>
            </label>

            {/* Backup Rosary Toggle */}
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              background: "var(--system-fill)",
              transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
            }}>
              <input
                type="checkbox"
                checked={showBackupRosary}
                onChange={handleBackupRosaryToggle}
                style={{ 
                  marginRight: "12px",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "15px", fontWeight: "500" }}>🔴 Backup Rosary</span>
            </label>

            {/* Counters Toggle */}
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              background: "var(--system-fill)",
              transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
            }}>
              <input
                type="checkbox"
                checked={showCounters}
                onChange={handleCountersToggle}
                style={{ 
                  marginRight: "12px",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "15px", fontWeight: "500" }}>📊 Prayer Counters</span>
            </label>
          </div>

          {/* iOS-style Help text */}
          <div style={{ 
            marginTop: "16px", 
            fontSize: "13px", 
            color: "var(--text-secondary)", 
            borderTop: "1px solid var(--separator)",
            paddingTop: "12px",
            lineHeight: "1.4",
          }}>
            💡 Hide elements for distraction-free prayer
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfaceToggle;
