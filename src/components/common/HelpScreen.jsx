import React, { useState, useEffect } from "react";
import "./HelpScreen.css";

/**
 * Help Screen Component
 *
 * Displays instructional help about the rosary app with stained glass styling
 * Shows on first visit, can be minimized, and provides a lingering help button
 */
const HelpScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(() => {
    try {
      return localStorage.getItem("hasSeenHelp") === "true";
    } catch (error) {
      return false;
    }
  });
  const [isHelpButtonVisible, setIsHelpButtonVisible] = useState(() => {
    try {
      return localStorage.getItem("showHelpButton") !== "false";
    } catch (error) {
      return true;
    }
  });

  // Show help on first visit
  useEffect(() => {
    if (!hasSeenHelp) {
      setIsVisible(true);
      // Auto-hide after 30 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsMinimized(true);
        setHasSeenHelp(true);
        try {
          localStorage.setItem("hasSeenHelp", "true");
        } catch (error) {
          console.warn("localStorage not available:", error);
        }
      }, 30000);

      return () => clearTimeout(timer);
    } else {
      setIsMinimized(true);
    }
  }, [hasSeenHelp]);

  // Listen for help button visibility toggle
  useEffect(() => {
    const handleToggleHelpButton = (event) => {
      setIsHelpButtonVisible(event.detail.visible);
    };

    window.addEventListener("toggleHelpButton", handleToggleHelpButton);

    return () => {
      window.removeEventListener("toggleHelpButton", handleToggleHelpButton);
    };
  }, []);

  const handleMinimize = () => {
    setIsVisible(false);
    setIsMinimized(true);
    setHasSeenHelp(true);
    try {
      localStorage.setItem("hasSeenHelp", "true");
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
  };

  const handleShowHelp = () => {
    setIsVisible(true);
    setIsMinimized(false);
    // Dispatch event to show navigation buttons
    window.dispatchEvent(new CustomEvent("showNavigationButtons"));
  };

  if (isMinimized && !isVisible) {
    return isHelpButtonVisible ? (
      <div className="help-button-container">
        <button
          className="help-button"
          onClick={handleShowHelp}
          title="Show Help"
        >
          ?
        </button>
      </div>
    ) : null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="help-screen-overlay">
      <div className="help-screen">
        <div className="help-header">
          <h2>🙏 Welcome to the Digital Rosary</h2>
          <button
            className="help-close-button"
            onClick={handleMinimize}
            title="Minimize Help"
          >
            ×
          </button>
        </div>

        <div className="help-content">
          <div className="help-section">
            <h3>📿 How to Pray the Rosary</h3>
            <p>
              The rosary is a beautiful Catholic prayer tradition. Click through
              the beads or use the prayer buttons to navigate through the
              mysteries and prayers.
            </p>
            <ul>
              <li>
                <strong>Cross:</strong> Start with the Sign of the Cross
              </li>
              <li>
                <strong>Tail Beads:</strong> Apostles' Creed, Our Father, Hail
                Marys
              </li>
              <li>
                <strong>Main Loop:</strong> Five decades of mysteries
              </li>
              <li>
                <strong>Each Decade:</strong> Our Father + 10 Hail Marys + Glory
                Be
              </li>
            </ul>
          </div>

          <div className="help-section">
            <h3>🎯 Four Types of Mysteries</h3>
            <div className="mystery-types">
              <div className="mystery-type">
                <span className="mystery-color coral"></span>
                <strong>Joyful (Monday/Saturday):</strong> Birth and early life
                of Jesus
              </div>
              <div className="mystery-type">
                <span className="mystery-color brown"></span>
                <strong>Sorrowful (Tuesday/Friday):</strong> Passion and death
                of Jesus
              </div>
              <div className="mystery-type">
                <span className="mystery-color blue"></span>
                <strong>Glorious (Wednesday/Sunday):</strong> Resurrection and
                glory
              </div>
              <div className="mystery-type">
                <span className="mystery-color gold"></span>
                <strong>Luminous (Thursday):</strong> Public ministry of Jesus
              </div>
            </div>
          </div>

          <div className="help-section">
            <h3>⚙️ Interface Controls</h3>
            <p>
              Use the settings wheel (⚙️) in the top-left to customize your
              experience:
            </p>
            <ul>
              <li>
                <strong>Interactive Rosary:</strong> Show/hide the draggable
                rosary
              </li>
              <li>
                <strong>Prayer Counters:</strong> Display prayer progress
              </li>
              <li>
                <strong>Focus Mode:</strong> Hide text for pure meditation
              </li>
              <li>
                <strong>Progress Bar:</strong> Track your rosary devotion
              </li>
              <li>
                <strong>Font Size:</strong> Adjust text size for comfort
              </li>
            </ul>
          </div>

          <div className="help-section">
            <h3>🏆 Devotion Tracking</h3>
            <p>Complete rosaries to advance through spiritual tiers:</p>
            <div className="tier-info">
              <div className="tier-item">
                <span className="tier-color coral"></span>
                <strong>Devoto de Nuestra Señora:</strong> 2 rosaries/day
              </div>
              <div className="tier-item">
                <span className="tier-color brown"></span>
                <strong>Caballero del Santo Rosario:</strong> 4 rosaries/day
              </div>
              <div className="tier-item">
                <span className="tier-color onyx"></span>
                <strong>Santa Rosa de Lima:</strong> 8 rosaries/day
              </div>
              <div className="tier-item">
                <span className="tier-color pearl"></span>
                <strong>Santa Teresa de Avila:</strong> 16 rosaries/day
              </div>
            </div>
          </div>

          <div className="help-section">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <ul>
              <li>
                <strong>Ctrl/Cmd + F:</strong> Toggle Focus Mode
              </li>
              <li>
                <strong>Space:</strong> Enter Focus Mode
              </li>
              <li>
                <strong>Escape:</strong> Exit Focus Mode
              </li>
              <li>
                <strong>Arrow Keys:</strong> Navigate prayers
              </li>
              <li>
                <strong>Ctrl/Cmd + ,:</strong> Open Settings
              </li>
            </ul>
          </div>

          <div className="help-footer">
            <p>
              <em>"The rosary is the weapon for these times."</em> - St. Padre
              Pio
            </p>
            <button className="help-got-it-button" onClick={handleMinimize}>
              Got it! 🙏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
