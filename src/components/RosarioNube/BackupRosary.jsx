import React from "react";
import "./BackupRosary.css";

const BackupRosary = ({
  currentPrayerIndex,
  currentMystery,
  totalPrayers = 57,
  onBeadClick,
  prayers,
}) => {
  // Mystery-specific color schemes
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      dolorosos: {
        beads: "#D2B48C", // light earth colored
        cross: "#D2B48C", // light earth colored
        chain: "#8B4513", // earth brown chain
        highlight: "#FFD700", // gold for current bead
      },
      gloriosos: {
        beads: "#2F2F2F", // onyx
        cross: "#2F2F2F", // onyx
        chain: "#708090", // darkish silver chain
        highlight: "#FFD700", // gold for current bead
      },
      gozosos: {
        beads: "#FF7F7F", // coral pinkish salmon colored
        cross: "#FF7F7F", // coral pinkish salmon colored
        chain: "#708090", // darkish silver chain
        highlight: "#FFD700", // gold for current bead
      },
      luminosos: {
        beads: "#F5F5DC", // pearl colored
        cross: "#F5F5DC", // pearl colored
        chain: "#F8F8FF", // pearl chain
        highlight: "#FFD700", // gold for current bead
      },
    };
    return colorSchemes[mystery] || colorSchemes.dolorosos;
  };

  const colors = getMysteryColors(currentMystery);

  // Calculate positions for pixel beads around screen perimeter
  const getPixelBeadPositions = () => {
    const beads = [];
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Calculate perimeter length
    const perimeter = 2 * (screenWidth + screenHeight);
    const beadSpacing = perimeter / totalPrayers;

    // let currentPosition = 0; // Removed unused variable
    let currentX = screenWidth / 2; // Start at middle bottom
    let currentY = screenHeight - 20; // Start at bottom edge
    let direction = "up"; // Start going up

    for (let i = 0; i < totalPrayers; i++) {
      beads.push({
        index: i,
        x: currentX,
        y: currentY,
        isCurrent: i === currentPrayerIndex,
      });

      // Move to next position (removed unused variable)

      // Determine next position based on current direction and position
      if (direction === "up" && currentY <= 20) {
        direction = "right";
      } else if (direction === "right" && currentX >= screenWidth - 20) {
        direction = "down";
      } else if (direction === "down" && currentY >= screenHeight - 20) {
        direction = "left";
      } else if (direction === "left" && currentX <= 20) {
        direction = "up";
      }

      // Move in current direction
      switch (direction) {
        case "up":
          currentY = Math.max(20, currentY - beadSpacing);
          break;
        case "right":
          currentX = Math.min(screenWidth - 20, currentX + beadSpacing);
          break;
        case "down":
          currentY = Math.min(screenHeight - 20, currentY + beadSpacing);
          break;
        case "left":
          currentX = Math.max(20, currentX - beadSpacing);
          break;
        default:
          // Fallback to up direction
          currentY = Math.max(20, currentY - beadSpacing);
          break;
      }
    }

    return beads;
  };

  const pixelBeads = getPixelBeadPositions();

  // Count Hail Marys based on actual prayer sequence
  const getHailMaryCount = () => {
    if (!prayers) return 0;

    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };

    const rosarySequence = prayers[mysteryToArray[currentMystery]] || [];
    let count = 0;

    // Count "A" entries (Ave Maria/Hail Mary) up to current prayer index
    for (let i = 0; i <= currentPrayerIndex && i < rosarySequence.length; i++) {
      if (rosarySequence[i] === "A") {
        count++;
      }
    }

    return count;
  };

  const hailMaryCount = getHailMaryCount();

  return (
    <div className="backup-rosary">
      {/* Pixel beads around screen perimeter */}
      {pixelBeads.map((bead) => (
        <div
          key={bead.index}
          className={`pixel-bead ${bead.isCurrent ? "current" : ""}`}
          style={{
            position: "fixed",
            left: `${bead.x}px`,
            top: `${bead.y}px`,
            backgroundColor: bead.isCurrent ? colors.highlight : colors.beads,
            border: `1px solid ${colors.chain}`,
            zIndex: 1000,
          }}
          onClick={() => onBeadClick && onBeadClick(bead.index)}
          title={`Prayer ${bead.index + 1}`}
        />
      ))}

      {/* Hail Mary Counter */}
      <div
        className="hail-mary-counter"
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          background: "rgba(255, 255, 0, 0.9)",
          padding: "8px",
          borderRadius: "5px",
          fontSize: "14px",
          fontWeight: "bold",
          border: "2px solid #000",
          zIndex: 1001,
        }}
      >
        <div>📿 Hail Marys: {hailMaryCount}</div>
        <div>
          Prayer: {currentPrayerIndex + 1}/{totalPrayers}
        </div>
        <div>Mystery: {currentMystery}</div>
      </div>

      {/* Cross indicator at starting position */}
      <div
        className="cross-indicator"
        style={{
          position: "fixed",
          left: `${window.innerWidth / 2 - 10}px`,
          top: `${window.innerHeight - 30}px`,
          width: "20px",
          height: "20px",
          background: colors.cross,
          border: `2px solid ${colors.chain}`,
          borderRadius: "2px",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: colors.chain,
        }}
        title="Cross - Starting position"
      >
        ✝
      </div>
    </div>
  );
};

export default BackupRosary;
