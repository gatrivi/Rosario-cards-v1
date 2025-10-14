import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

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
  focusMode = false,
  onToggleFocusMode = () => {},
  onEnterFocusMode = () => {},
  onExitFocusMode = () => {},
  onReset = () => {}, // NEW: Reset counter function
  showDetailedProgress = false,
  onToggleDetailedProgress = () => {},
  developerMode = false,
  onToggleDeveloperMode = () => {},
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem("fontSize") || "medium";
    } catch (error) {
      console.warn("localStorage not available:", error);
      return "medium";
    }
  });

  // Initialize font size on mount
  useEffect(() => {
    const multiplier = getFontSizeMultiplier(fontSize);
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      multiplier
    );
  }, [fontSize]);

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
    try {
      localStorage.setItem("leftHandedMode", newMode.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("leftHandedModeChange", {
        detail: { leftHandedMode: newMode },
      })
    );
  };

  /**
   * Handle font size change
   */
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    try {
      localStorage.setItem("fontSize", newSize);
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
    // Apply font size to document
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      getFontSizeMultiplier(newSize)
    );
    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("fontSizeChange", {
        detail: { fontSize: newSize },
      })
    );
  };

  /**
   * Get font size multiplier based on size name
   */
  const getFontSizeMultiplier = (size) => {
    const multipliers = {
      small: "0.8",
      medium: "1.0",
      large: "1.2",
      xlarge: "1.4",
    };
    return multipliers[size] || "1.0";
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Settings shortcut: Ctrl+, or Cmd+,
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        setIsExpanded(!isExpanded);
      }

      // Escape to close settings
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isExpanded]);

  return (
    <div
      className={`interface-toggle ${className}`}
      style={{ position: "fixed", top: "10px", left: "10px", zIndex: 20 }}
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
              background:
                showRosary && showCounters
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
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
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                📿 Interactive Rosary
              </span>
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
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                📊 Prayer Counters
              </span>
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
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                👈 Left-Handed Mode
              </span>
            </label>

            {/* Detailed Progress Bar Toggle */}
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
                checked={showDetailedProgress}
                onChange={onToggleDetailedProgress}
                style={{
                  marginRight: "12px",
                  transform: "scale(1.2)",
                  accentColor: "var(--catholic-gold)",
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                📊 Detailed Progress
              </span>
            </label>

            {/* Developer Mode Toggle */}
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
                checked={developerMode}
                onChange={onToggleDeveloperMode}
                style={{
                  marginRight: "12px",
                  transform: "scale(1.2)",
                  accentColor: "var(--catholic-gold)",
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                🔧 Developer Mode
              </span>
            </label>

            {/* Focus Mode Controls */}
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: "var(--catholic-gold)",
                }}
              >
                🎯 Focus Mode
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  onClick={onToggleFocusMode}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: focusMode
                      ? "2px solid var(--catholic-gold)"
                      : "1px solid var(--glass-border)",
                    background: focusMode
                      ? "linear-gradient(135deg, var(--catholic-gold), var(--catholic-red))"
                      : "var(--glass-bg)",
                    color: focusMode
                      ? "var(--catholic-white)"
                      : "var(--text-color)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {focusMode ? "📖 Show Text" : "🎯 Focus Mode"}
                </button>
                <button
                  onClick={focusMode ? onExitFocusMode : onEnterFocusMode}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-border)",
                    background: "var(--glass-bg)",
                    color: "var(--text-color)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {focusMode ? "❌ Exit" : "▶️ Enter"}
                </button>
              </div>
            </div>

            {/* Font Size Control */}
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: "var(--catholic-gold)",
                }}
              >
                🔤 Font Size
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { key: "small", label: "S", title: "Small" },
                  { key: "medium", label: "M", title: "Medium" },
                  { key: "large", label: "L", title: "Large" },
                  { key: "xlarge", label: "XL", title: "Extra Large" },
                ].map(({ key, label, title }) => (
                  <button
                    key={key}
                    onClick={() => handleFontSizeChange(key)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border:
                        fontSize === key
                          ? "2px solid var(--catholic-gold)"
                          : "1px solid var(--glass-border)",
                      background:
                        fontSize === key
                          ? "linear-gradient(135deg, var(--catholic-gold), var(--catholic-red))"
                          : "var(--glass-bg)",
                      color:
                        fontSize === key
                          ? "var(--catholic-white)"
                          : "var(--text-color)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      title: title,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--glass-border)",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "12px",
                  color: "var(--catholic-gold)",
                }}
              >
                🎬 Actions
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {/* Reset Counter Button */}
                <button
                  onClick={onReset}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid var(--glass-border)",
                    background: "var(--glass-bg)",
                    color: "var(--text-color)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, var(--catholic-gold), var(--catholic-red))";
                    e.target.style.color = "var(--catholic-white)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--glass-bg)";
                    e.target.style.color = "var(--text-color)";
                  }}
                >
                  🔄 Reset Counter
                </button>

                {/* Theme Toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                    🌙 Theme
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Help text */}
          <div
            style={{
              marginTop: "15px",
              fontSize: "11px",
              color: "var(--catholic-gold)",
              fontStyle: "italic",
              borderTop: "2px solid var(--glass-border)",
              paddingTop: "12px",
              textAlign: "center",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            💡 Tip: Press Ctrl+, to toggle settings
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfaceToggle;
