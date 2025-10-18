import React, { useState, useEffect } from "react";
import rosaryTracker from "../../utils/rosaryTracker";
import "./RosaryProgressBar.css";

/**
 * Rosary Progress Bar Component
 *
 * Displays a progress bar at the top of the screen showing:
 * - Current session bead progress (beads pressed / 60 total beads)
 * - Current tier and progress towards next tier (based on rosary completions)
 * - Daily average rosaries completed
 * - Days remaining in current 14-day period
 * - Toggleable via settings
 */
const RosaryProgressBar = ({
  className = "",
  isVisible = true,
  onToggle,
  currentPrayerTitle,
  pressedBeadCount = 0, // NEW: Track pressed beads in current session
  totalBeads = 60, // Total beads in a rosary (excluding chain prayers)
  showNavigation = false, // Navigation bar visibility
  onToggleNavigation, // Navigation bar toggle callback
}) => {
  const [stats, setStats] = useState(null);

  // Update stats when component mounts or when rosary completions change
  useEffect(() => {
    const updateStats = () => {
      const currentStats = rosaryTracker.getCurrentPeriodStats();
      setStats(currentStats);
    };

    // Initial load
    updateStats();

    // Listen for rosary completion events
    const handleRosaryCompletion = () => {
      updateStats();
    };

    window.addEventListener("rosaryCompleted", handleRosaryCompletion);

    // Update stats every minute to keep data fresh
    const interval = setInterval(updateStats, 60000);

    return () => {
      window.removeEventListener("rosaryCompleted", handleRosaryCompletion);
      clearInterval(interval);
    };
  }, []);

  // Don't render if not visible or stats aren't loaded yet
  if (!isVisible || !stats) {
    return null;
  }

  const {
    currentTier,
    nextTier,
    progressToNextTier,
    dailyAverage,
    daysRemaining,
    totalCompletions,
  } = stats;

  // Calculate bead progress for current session
  const beadProgress =
    totalBeads > 0 ? (pressedBeadCount / totalBeads) * 100 : 0;

  // Determine colors and text based on current tier
  const getBarColor = () => {
    if (currentTier) {
      return currentTier.color;
    } else if (nextTier) {
      return nextTier.color;
    }
    return "#FF7F7F"; // Default coral
  };

  const getTierText = () => {
    if (currentTier) {
      return currentTier.name;
    } else if (nextTier) {
      return `Working towards: ${nextTier.name}`;
    }
    return "Start your rosary journey";
  };

  const getProgressText = () => {
    if (currentTier && !nextTier) {
      return `Mastered! ${dailyAverage.toFixed(1)} rosaries/day`;
    } else if (nextTier) {
      return `${dailyAverage.toFixed(1)}/${nextTier.dailyTarget} rosaries/day`;
    }
    return `${dailyAverage.toFixed(1)} rosaries/day`;
  };

  return (
    <div className={`rosary-progress-bar ${className}`}>
      <div className="progress-container">
        {/* Current Session Bead Progress */}
        <div className="tier-title">
          <span
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginRight: "12px",
            }}
          >
            Beads: {pressedBeadCount}/{totalBeads} ({Math.round(beadProgress)}%)
          </span>
          {currentPrayerTitle && (
            <span
              style={{ fontSize: "14px", opacity: 0.8, marginRight: "12px" }}
            >
              {currentPrayerTitle}
            </span>
          )}
        </div>

        {/* Bead Progress Bar (current session) */}
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{
              width: `${Math.max(5, beadProgress)}%`,
              backgroundColor: getBarColor(),
              transition: "width 0.3s ease",
            }}
          />
          <div className="progress-bar-background" />
        </div>

        {/* Tier Progress (rosary completions) */}
        <div
          className="tier-title"
          style={{ fontSize: "12px", marginTop: "4px", opacity: 0.9 }}
        >
          {getTierText()}
        </div>

        {/* Stats Text */}
        <div className="progress-stats">
          <span className="daily-average">{getProgressText()}</span>
          <span className="days-remaining">{daysRemaining} days left</span>
          <span className="total-completions">{totalCompletions} total</span>
        </div>

        {/* Navigation Toggle Button */}
        {onToggleNavigation && (
          <button
            className="nav-toggle-button"
            onClick={onToggleNavigation}
            title={showNavigation ? "Hide navigation buttons" : "Show navigation buttons"}
            style={{
              position: "absolute",
              right: "45px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "2px solid rgba(212, 175, 55, 0.6)",
              background: showNavigation 
                ? "rgba(212, 175, 55, 0.3)" 
                : "rgba(0, 0, 0, 0.3)",
              color: "rgba(212, 175, 55, 0.9)",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          >
            {showNavigation ? "🔽" : "🔼"}
          </button>
        )}

        {/* Close Button */}
        <button
          className="close-button"
          onClick={onToggle}
          title="Hide progress bar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default RosaryProgressBar;
