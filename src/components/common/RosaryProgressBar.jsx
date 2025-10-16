import React, { useState, useEffect } from "react";
import rosaryTracker from "../../utils/rosaryTracker";
import "./RosaryProgressBar.css";

/**
 * Rosary Progress Bar Component
 *
 * Displays a progress bar at the top of the screen showing:
 * - Current tier and progress towards next tier
 * - Daily average rosaries completed
 * - Days remaining in current 14-day period
 * - Toggleable via settings
 */
const RosaryProgressBar = ({
  className = "",
  isVisible = true,
  onToggle,
  currentPrayerTitle,
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
        {/* Tier Title and Current Prayer */}
        <div className="tier-title">
          {currentPrayerTitle && (
            <span
              style={{ fontSize: "14px", opacity: 0.8, marginRight: "12px" }}
            >
              {currentPrayerTitle}
            </span>
          )}
          {getTierText()}
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{
              width: `${Math.max(5, progressToNextTier)}%`,
              backgroundColor: getBarColor(),
            }}
          />
          <div className="progress-bar-background" />
        </div>

        {/* Stats Text */}
        <div className="progress-stats">
          <span className="daily-average">{getProgressText()}</span>
          <span className="days-remaining">{daysRemaining} days left</span>
          <span className="total-completions">{totalCompletions} total</span>
        </div>

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
