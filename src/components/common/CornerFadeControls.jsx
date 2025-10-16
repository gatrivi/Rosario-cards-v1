import React, { useState, useEffect } from "react";
import "./CornerFadeControls.css";

/**
 * CornerFadeControls Component
 *
 * Provides invisible touch zones in bottom corners that fade prayer text and rosary
 * when held, allowing users to appreciate the background images fully.
 *
 * Features:
 * - Bottom-left and bottom-right corner zones
 * - Hold to fade prayer text and rosary to near-transparent
 * - Smooth transitions with visual feedback
 * - Works on both touch and mouse events
 * - Non-intrusive design that doesn't block other interactions
 */
const CornerFadeControls = ({
  onFadeChange = () => {}, // Callback when fade state changes
}) => {
  const [isFading, setIsFading] = useState(false);
  const [fadeIntensity, setFadeIntensity] = useState(1); // 1 = normal, 0.1 = faded

  // Handle fade state changes
  useEffect(() => {
    onFadeChange(isFading, fadeIntensity);
  }, [isFading, fadeIntensity, onFadeChange]);

  // Apply fade effect to prayer text and rosary
  useEffect(() => {
    const prayerText = document.querySelector(".page-left");
    const rosary = document.querySelector(".interactive-rosary");

    if (prayerText) {
      prayerText.style.opacity = fadeIntensity;
      prayerText.style.transition = "opacity 0.3s ease";
    }

    if (rosary) {
      rosary.style.opacity = fadeIntensity;
      rosary.style.transition = "opacity 0.3s ease";
    }

    // Cleanup function to restore opacity
    return () => {
      if (prayerText) {
        prayerText.style.opacity = "";
        prayerText.style.transition = "";
      }
      if (rosary) {
        rosary.style.opacity = "";
        rosary.style.transition = "";
      }
    };
  }, [fadeIntensity]);

  const handleStart = () => {
    setIsFading(true);
    setFadeIntensity(0.1);
  };

  const handleEnd = () => {
    setIsFading(false);
    setFadeIntensity(1);
  };

  return (
    <>
      {/* Bottom-left corner fade zone */}
      <div
        className="corner-fade-zone corner-fade-left"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        role="button"
        aria-label="Hold to fade prayer text and rosary"
        tabIndex={-1}
      >
        <div className="corner-fade-indicator">
          <div className="corner-fade-icon">👁️</div>
          <div className="corner-fade-text">Hold</div>
        </div>
      </div>

      {/* Bottom-right corner fade zone */}
      <div
        className="corner-fade-zone corner-fade-right"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        role="button"
        aria-label="Hold to fade prayer text and rosary"
        tabIndex={-1}
      >
        <div className="corner-fade-indicator">
          <div className="corner-fade-icon">👁️</div>
          <div className="corner-fade-text">Hold</div>
        </div>
      </div>

      {/* Visual feedback when fading */}
      {isFading && (
        <div className="corner-fade-feedback">
          <div className="corner-fade-message">Background Mode Active</div>
        </div>
      )}
    </>
  );
};

export default CornerFadeControls;

