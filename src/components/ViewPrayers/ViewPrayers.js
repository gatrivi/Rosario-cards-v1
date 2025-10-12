import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import AveMariaD from "../../data/assets/img/AllMary17thLith.jpeg";
import { SoundEffects } from "../../utils/soundEffects";

/**
 * ViewPrayers Component
 *
 * Displays the current prayer text and image with Hail Mary counter
 * Provides a clean, focused interface for prayer reading with:
 * - Prayer text display with proper formatting
 * - Prayer image display with theme support
 * - Hail Mary counter based on actual prayer sequence
 * - Responsive layout for different screen sizes
 *
 * @param {string} prayer - Current prayer text to display
 * @param {number} count - Manual counter for Hail Marys (legacy)
 * @param {string} prayerImg - URL of the current prayer image
 * @param {string} currentMystery - Current mystery type
 * @param {number} currentPrayerIndex - Current position in rosary sequence
 * @param {object} prayers - Prayer data object for sequence analysis
 */
const ViewPrayers = forwardRef(
  (
    {
      prayer,
      count,
      prayerImg,
      currentMystery,
      currentPrayerIndex,
      prayers,
      showCounters = true,
    },
    ref
  ) => {
    const scrollContainerRef = useRef(null);
    const soundEffectsRef = useRef(new SoundEffects());
    const currentTheme = localStorage.getItem("theme");

    /**
     * Count Hail Marys based on current decade position
     * This function calculates which decade the user is in and counts the Hail Marys
     * within that decade up to the current prayer position
     *
     * @returns {number} Number of Hail Marys in current decade (1-10)
     */
    const getHailMaryCount = () => {
      if (!prayers) return 0;

      const mysteryToArray = {
        gozosos: "RGo",
        dolorosos: "RDo",
        gloriosos: "RGl",
        luminosos: "RL",
      };

      const rosarySequence = prayers[mysteryToArray[currentMystery]] || [];

      // Define decade starting positions (after each mystery prayer)
      // Each decade starts with "P" (Our Father) followed by 10 "A" (Hail Marys)
      const decadeStarts = [];
      for (let i = 0; i < rosarySequence.length; i++) {
        // Look for mystery prayers (MGo1, MGo2, etc.) to find decade starts
        if (rosarySequence[i] && rosarySequence[i].startsWith("M")) {
          // The next "P" after a mystery marks the start of a decade
          for (let j = i + 1; j < rosarySequence.length; j++) {
            if (rosarySequence[j] === "P") {
              decadeStarts.push(j);
              break;
            }
          }
        }
      }

      // Find which decade we're currently in
      let currentDecadeStart = 0; // Default to opening prayers
      for (let i = decadeStarts.length - 1; i >= 0; i--) {
        if (currentPrayerIndex >= decadeStarts[i]) {
          currentDecadeStart = decadeStarts[i];
          break;
        }
      }

      // Count Hail Marys from the decade start to current position
      let count = 0;
      for (
        let i = currentDecadeStart;
        i <= currentPrayerIndex && i < rosarySequence.length;
        i++
      ) {
        if (rosarySequence[i] === "A") {
          count++;
        }
      }

      return count;
    };

    const hailMaryCount = getHailMaryCount();

    /**
     * Expose scroll control methods to parent component
     * Allows parent to check scroll position and control scrolling
     */
    useImperativeHandle(ref, () => ({
      /**
       * Check if content can scroll down
       * @returns {boolean} True if there's more content below
       */
      canScrollDown: () => {
        if (!scrollContainerRef.current) return false;
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        return scrollTop + clientHeight < scrollHeight - 10; // 10px threshold
      },

      /**
       * Check if content can scroll up
       * @returns {boolean} True if there's content above
       */
      canScrollUp: () => {
        if (!scrollContainerRef.current) return false;
        return scrollContainerRef.current.scrollTop > 10; // 10px threshold
      },

      /**
       * Scroll down by one viewport
       */
      scrollDown: () => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = scrollContainerRef.current.clientHeight * 0.8;
        scrollContainerRef.current.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
        soundEffectsRef.current.playScrollSound();
      },

      /**
       * Scroll up by one viewport
       */
      scrollUp: () => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = scrollContainerRef.current.clientHeight * 0.8;
        scrollContainerRef.current.scrollBy({
          top: -scrollAmount,
          behavior: "smooth",
        });
        soundEffectsRef.current.playScrollSound();
      },
    }));

    // Handle wheel events for scroll-based navigation
    useEffect(() => {
      const handleWheel = (event) => {
        if (!scrollContainerRef.current) return;

        const { deltaY } = event;
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;

        // Check if we're at the boundaries
        const isAtTop = scrollTop <= 10;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (deltaY > 0 && isAtBottom) {
          // Scrolling down at bottom - trigger prayer navigation
          event.preventDefault();
          soundEffectsRef.current.playEndOfScrollSound();
          // Dispatch custom event for parent to handle prayer navigation
          window.dispatchEvent(
            new CustomEvent("prayerScrollNext", {
              detail: { direction: "next" },
            })
          );
        } else if (deltaY < 0 && isAtTop) {
          // Scrolling up at top - trigger prayer navigation
          event.preventDefault();
          soundEffectsRef.current.playEndOfScrollSound();
          // Dispatch custom event for parent to handle prayer navigation
          window.dispatchEvent(
            new CustomEvent("prayerScrollPrev", {
              detail: { direction: "prev" },
            })
          );
        } else {
          // Normal scrolling within content
          soundEffectsRef.current.playScrollSound();
        }
      };

      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
      }
    }, []);

    // Handle prayer change sound
    useEffect(() => {
      soundEffectsRef.current.playPrayerChangeSound();
    }, [prayer]);
    console.log(
      `📿 ViewPrayers: currentPrayerIndex=${currentPrayerIndex}, hailMaryCount=${hailMaryCount}, currentMystery=${currentMystery}`
    );

    // Set base image URL based on theme and mystery type
    // Dark theme uses special images for certain mysteries
    let baseImageUrl;
    if (currentTheme === "dark") {
      if (currentMystery === "gloriosos") {
        baseImageUrl =
          "/gallery-images/misterios/modooscuro/misteriogloria0.jpg";
      }
    } else {
      baseImageUrl = AveMariaD;
    }
    const finalImageUrl = prayerImg ? prayerImg : baseImageUrl;
    return (
      <div
        className="stained-glass-prayer-container"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Full-screen background image */}
        <div
          className="page-right"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            className="prayer-image"
            src={finalImageUrl}
            alt={`${prayer.name} illustration`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              filter: "brightness(0.7) contrast(1.1)",
            }}
          />
        </div>

        {/* Stained glass overlay */}
        <div
          className="stained-glass-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(1px)",
            border: "3px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "20px",
            boxShadow: "inset 0 0 50px rgba(212, 175, 55, 0.1)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Prayer text overlay */}
        <div
          className="page-left"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: window.innerWidth < 768 ? "90%" : "70%",
            maxWidth: "800px",
            maxHeight: "80vh",
            overflow: "auto",
            padding: window.innerWidth < 768 ? "16px" : "24px",
            fontSize: `calc(${window.innerWidth < 768 ? "clamp(16px, 4vw, 20px)" : "1.4rem"} * var(--font-size-multiplier, 1.0))`,
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(8px)",
            border: "2px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            zIndex: 2,
            pointerEvents: "auto",
          }}
        >
          {showCounters && (
            <div
              style={{
                color: "#d4af37",
                fontSize: window.innerWidth < 768 ? "16px" : "20px",
                fontWeight: "bold",
                display: "block",
                marginBottom: "16px",
                textAlign: "center",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
              }}
            >
              📿 Hail Marys: {hailMaryCount} (Index: {currentPrayerIndex})
            </div>
          )}
          <p
            style={{
              margin: 0,
              lineHeight: 1.8,
              letterSpacing: "1px",
              textAlign: "center",
            }}
          >
            {prayer}
          </p>
        </div>
      </div>
    );
  }
);

export default ViewPrayers;
