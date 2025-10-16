import React, { useState, useEffect } from "react";
import "./LitanyEntrance.css";

/**
 * LitanyEntrance Component
 *
 * Epic boss-style entrance animation for the Litany of Loreto
 * Shows golden light rays, title fade-in, and reverent celebration
 */
const LitanyEntrance = ({ onComplete, currentMystery, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState("rays"); // rays -> title -> celebration -> complete

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("title"), 800);
    const timer2 = setTimeout(() => setPhase("celebration"), 1600);
    const timer3 = setTimeout(() => {
      setPhase("complete");
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  // Get mystery-specific colors
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      gozosos: {
        primary: "#FFD700", // Gold
        secondary: "#FF69B4", // Hot pink
        accent: "#FFB6C1", // Light pink
      },
      dolorosos: {
        primary: "#DC143C", // Crimson
        secondary: "#8B4513", // Saddle brown
        accent: "#B22222", // Fire brick
      },
      gloriosos: {
        primary: "#FFD700", // Gold
        secondary: "#4169E1", // Royal blue
        accent: "#9370DB", // Medium purple
      },
      luminosos: {
        primary: "#FFFF00", // Yellow
        secondary: "#FFD700", // Gold
        accent: "#FF8C00", // Dark orange
      },
    };
    return colorSchemes[mystery] || colorSchemes.gozosos;
  };

  const colors = getMysteryColors(currentMystery);

  return (
    <div className="litany-entrance-overlay">
      {/* Golden light rays */}
      <div className={`light-rays ${phase === "rays" ? "active" : ""}`}>
        <div className="ray ray-1" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-2" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-3" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-4" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-5" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-6" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-7" style={{ "--ray-color": colors.primary }} />
        <div className="ray ray-8" style={{ "--ray-color": colors.primary }} />
      </div>

      {/* Central glow */}
      <div className={`central-glow ${phase !== "rays" ? "active" : ""}`}>
        <div
          className="glow-circle"
          style={{
            backgroundColor: colors.primary,
            boxShadow: `0 0 60px ${colors.primary}, 0 0 120px ${colors.secondary}`,
          }}
        />
      </div>

      {/* Title */}
      <div
        className={`entrance-title ${
          phase === "title" || phase === "celebration" ? "active" : ""
        }`}
      >
        <h1
          className="main-title"
          style={{
            color: colors.primary,
            textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`,
          }}
        >
          Litany of Loreto
        </h1>
        <p
          className="subtitle"
          style={{
            color: colors.accent,
            textShadow: `0 0 10px ${colors.accent}`,
          }}
        >
          The Final Prayer
        </p>
      </div>

      {/* Celebration particles */}
      <div
        className={`celebration-particles ${
          phase === "celebration" ? "active" : ""
        }`}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              "--particle-color": colors.secondary,
              "--delay": `${i * 0.1}s`,
              "--angle": `${i * 30}deg`,
            }}
          />
        ))}
      </div>

      {/* Stained glass effect */}
      <div className="stained-glass-overlay" />
    </div>
  );
};

export default LitanyEntrance;
