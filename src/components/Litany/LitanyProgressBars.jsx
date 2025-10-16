import React from "react";
import "./LitanyProgressBars.css";

/**
 * LitanyProgressBars Component
 *
 * Boss-style health bar system for the Litany of Loreto
 * Shows three horizontal bars representing the three sections of the litany
 */
const LitanyProgressBars = ({
  currentVerseIndex,
  sections,
  currentMystery,
}) => {
  if (!sections || sections.length === 0) return null;

  // Get mystery-specific colors
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      gozosos: {
        active: "#FFD700", // Gold
        inactive: "#FFB6C1", // Light pink
        glow: "#FF69B4", // Hot pink
      },
      dolorosos: {
        active: "#DC143C", // Crimson
        inactive: "#8B4513", // Saddle brown
        glow: "#B22222", // Fire brick
      },
      gloriosos: {
        active: "#FFD700", // Gold
        inactive: "#4169E1", // Royal blue
        glow: "#9370DB", // Medium purple
      },
      luminosos: {
        active: "#FFFF00", // Yellow
        inactive: "#FFD700", // Gold
        glow: "#FF8C00", // Dark orange
      },
    };
    return colorSchemes[mystery] || colorSchemes.gozosos;
  };

  const colors = getMysteryColors(currentMystery);

  const getCurrentSection = () => {
    return sections.find(
      (section) =>
        currentVerseIndex >= section.start && currentVerseIndex <= section.end
    );
  };

  const getSectionProgress = (section) => {
    const completed = Math.max(0, currentVerseIndex - section.start);
    const total = section.total;
    const progress = Math.min(completed / total, 1);
    return {
      percentage: progress * 100,
      isActive:
        currentVerseIndex >= section.start && currentVerseIndex <= section.end,
      isCompleted: currentVerseIndex > section.end,
    };
  };

  const currentSection = getCurrentSection();
  if (!currentSection) return null;

  const progress = getSectionProgress(currentSection);

  return (
    <div className="litany-progress-container">
      <div className="litany-progress-title">{currentSection.name}</div>

      <div className="litany-bars">
        <div className="litany-bar-section">
          <div className="bar-label">
            <span>Progress</span>
            <span className="bar-count">
              ({Math.max(0, currentVerseIndex - currentSection.start)}/
              {currentSection.total})
            </span>
          </div>

          <div className="litany-bar-container">
            <div className="litany-bar-background" />
            <div
              className={`litany-bar-fill ${
                progress.isCompleted
                  ? "completed"
                  : progress.isActive
                  ? "active"
                  : "inactive"
              }`}
              style={{
                width: `${Math.max(5, progress.percentage)}%`,
                backgroundColor: progress.isCompleted
                  ? colors.glow
                  : progress.isActive
                  ? colors.active
                  : colors.inactive,
                boxShadow: progress.isActive
                  ? `0 0 15px ${colors.glow}`
                  : "none",
              }}
            />

            {/* Glow effect for active section */}
            {progress.isActive && (
              <div
                className="litany-bar-glow"
                style={{
                  backgroundColor: colors.glow,
                  opacity: 0.3,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitanyProgressBars;
