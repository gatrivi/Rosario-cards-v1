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
  const [originalOpacities, setOriginalOpacities] = useState({
    text: 1,
    rosary: 1,
  });

  // Handle fade state changes
  useEffect(() => {
    onFadeChange(isFading, isFading ? 0.1 : 1);
  }, [isFading, onFadeChange]);

  const handleStart = () => {
    const prayerText = document.querySelector(".page-left");
    const rosary = document.querySelector(".interactive-rosary");

    // Store current opacities
    const currentTextOpacity = prayerText
      ? parseFloat(window.getComputedStyle(prayerText).opacity) || 1
      : 1;
    const currentRosaryOpacity = rosary
      ? parseFloat(window.getComputedStyle(rosary).opacity) || 1
      : 1;

    setOriginalOpacities({
      text: currentTextOpacity,
      rosary: currentRosaryOpacity,
    });

    // Apply fade
    if (prayerText) {
      prayerText.style.transition = "opacity 0.3s ease";
      prayerText.style.opacity = "0.1";
    }

    if (rosary) {
      rosary.style.transition = "opacity 0.3s ease";
      rosary.style.opacity = "0.1";
    }

    setIsFading(true);
  };

  const handleEnd = () => {
    const prayerText = document.querySelector(".page-left");
    const rosary = document.querySelector(".interactive-rosary");

    // Restore original opacities
    if (prayerText) {
      prayerText.style.transition = "opacity 0.3s ease";
      prayerText.style.opacity = originalOpacities.text;
    }

    if (rosary) {
      rosary.style.transition = "opacity 0.3s ease";
      rosary.style.opacity = originalOpacities.rosary;
    }

    setIsFading(false);
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
