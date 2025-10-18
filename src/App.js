import "./App.css";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useEffect, useCallback, useRef } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import InteractiveRosary from "./components/RosarioNube/InteractiveRosary";
import InterfaceToggle from "./components/common/InterfaceToggle";
import RosaryProgressBar from "./components/common/RosaryProgressBar";
import HelpScreen from "./components/common/HelpScreen";
import CornerFadeControls from "./components/common/CornerFadeControls";
import { useRosaryState } from "./components/RosarioNube/useRosaryState";

/**
 * Get default fallback images for prayers without images
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {array} Array of fallback image URLs
 */
const getDefaultFallbackImages = (isDark) => {
  if (isDark) {
    return [
      "/gallery-images/misterios/modooscuro/vitral0.jpg",
      "/gallery-images/misterios/modooscuro/vitral3.jpg",
      "/gallery-images/misterios/modooscuro/crucis-14.jpg",
      "/gallery-images/misterios/modooscuro/crucis12.jpg",
      "/gallery-images/misterios/modooscuro/crucis120.jpg",
      "/gallery-images/misterios/modooscuro/crucis2.jpg",
      "/gallery-images/misterios/modooscuro/crucis4.jpg",
      "/gallery-images/misterios/modooscuro/crucis5.jpg",
      "/gallery-images/misterios/modooscuro/crucis6.jpg",
      "/gallery-images/misterios/modooscuro/crucis7.jpg",
      "/gallery-images/misterios/modooscuro/crucis8.jpg",
      "/gallery-images/misterios/modooscuro/crucis9.jpg",
      "/gallery-images/misterios/modooscuro/angel.jpg",
      "/gallery-images/misterios/modooscuro/espiritu-santo.jpg",
      "/gallery-images/misterios/modooscuro/espiritu-santo-2.jpg",
      "/gallery-images/misterios/modooscuro/sagrado-corazon.jpg",
      "/gallery-images/misterios/modooscuro/sagrado-corazon-2.jpg",
      "/gallery-images/misterios/modooscuro/sagrado-corazon-esus-maria.jpg",
    ];
  } else {
    return [
      "/gallery-images/misterios/2009CB6706.jpg",
      "/gallery-images/misterios/3cba1b824516102b46a555a4072bac1c.jpg",
      "/gallery-images/misterios/6abc3cfdf8ec007ce9c0bc62311e44fb.jpg",
      "/gallery-images/misterios/aa467f240417f15f248d1cfeae4ca620.jpg",
      "/gallery-images/misterios/b9b27aaa6e3dfec776a95253720ed82e.jpg",
      "/gallery-images/misterios/c92bf9b0a5b3eccbfc0a20906f42c869.jpg",
      "/gallery-images/misterios/cfb748a76418c7615d1c4d0c75c489b1.jpg",
      "/gallery-images/misterios/ezekielv.jpg",
      "/gallery-images/misterios/salve-regina.jpg",
      "/gallery-images/misterios/salve-regina.png",
      "/gallery-images/gloria.jpg",
      "/gallery-images/misterios/latin-gloria.jpg",
      "/gallery-images/misterios/latin-credo.jpeg",
      "/gallery-images/misterios/latin-pater-noster.jpg",
      "/gallery-images/misterios/latin-ave-maria.jpg",
      "/gallery-images/misterios/ave-maria.webp",
    ];
  }
};

/**
 * Select appropriate image from prayer object based on theme with robust fallback
 * @param {object} prayerObj - Prayer object with img/imgmo properties
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {string} Selected image URL
 */
const selectPrayerImage = (prayerObj, isDark) => {
  if (!prayerObj) {
    // No prayer object - use rotating fallback
    const fallbackImages = getDefaultFallbackImages(isDark);
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    return fallbackImages[randomIndex];
  }

  // Handle array-based images (new system)
  if (Array.isArray(prayerObj.img) || Array.isArray(prayerObj.imgmo)) {
    const lightImages = Array.isArray(prayerObj.img)
      ? prayerObj.img
      : [prayerObj.img];
    const darkImages = Array.isArray(prayerObj.imgmo)
      ? prayerObj.imgmo
      : [prayerObj.imgmo];

    // Select random image from appropriate array
    const imageArray =
      isDark && darkImages.length > 0 ? darkImages : lightImages;

    // If array is empty or has invalid images, use fallback
    if (
      imageArray.length === 0 ||
      imageArray.every((img) => !img || img === "")
    ) {
      const fallbackImages = getDefaultFallbackImages(isDark);
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      return fallbackImages[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * imageArray.length);
    return imageArray[randomIndex];
  } else {
    // Handle single image (current system)
    const selectedImage =
      isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;

    // If no image or empty string, use fallback
    if (!selectedImage || selectedImage === "") {
      const fallbackImages = getDefaultFallbackImages(isDark);
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      return fallbackImages[randomIndex];
    }

    // Return the actual prayer image (no random fallback)
    return selectedImage;
  }
};

/**
 * Get background image based on date - St. Teresa on her feast day, random mystery images otherwise
 * @param {string} currentMystery - Current mystery type to exclude
 * @returns {object} Image object with img, imgmo, title, and description
 */
const getRandomUnusedMysteryImage = (currentMystery) => {
  const today = new Date();
  const isStTeresaDay = today.getMonth() === 9 && today.getDate() === 15; // October 15

  // Show St. Teresa on her feast day
  if (isStTeresaDay) {
    return {
      img: "/gallery-images/saints/santa-teresa-de-avila.jpg",
      imgmo: "/gallery-images/saints/santa-teresa-de-avila.jpg",
      title: "Santa Teresa de Ávila",
      description: "Doctora de la Iglesia - Feast Day: October 15th",
    };
  }

  // Otherwise return random fallback image
  const theme = localStorage.getItem("theme");
  const isDark = theme === "dark";
  const fallbackImages = getDefaultFallbackImages(isDark);
  const randomIndex = Math.floor(Math.random() * fallbackImages.length);
  return fallbackImages[randomIndex];
};

function App() {
  // Initial prayer text - includes St. Teresa reference only on her feast day
  const getInitialPrayer = () => {
    const today = new Date();
    const isStTeresaDay = today.getMonth() === 9 && today.getDate() === 15; // October 15
    
    const basePrayer = "Por la señal de la Santa Cruz \nde nuestros enemigos, líbranos Señor, Dios nuestro. \nAmén.\n\nAbre Señor, mis labios \ny proclamará mi boca tu alabanza.";
    
    if (isStTeresaDay) {
      return basePrayer + "\n\nEn honor a Santa Teresa de Ávila,\nDoctora de la Iglesia, cuya fiesta celebramos hoy.";
    }
    
    return basePrayer;
  };

  const [prayer, setPrayer] = useState(getInitialPrayer());
  const [currentMystery, setcurrentMystery] = useState(getDefaultMystery);
  const [prayerImg, setPrayerImg] = useState(() =>
    getRandomUnusedMysteryImage(getDefaultMystery())
  );
  const [count, setCount] = useState(0);

  // State for tracking image rotation timer
  const imageRotationTimerRef = useRef(null);

  // Interface visibility states for clean prayer mode
  const [showRosary, setShowRosary] = useState(true);
  const [showCounters, setShowCounters] = useState(true);

  // Focus mode state - hides text and shows only rosary counter
  const [focusMode, setFocusMode] = useState(false);

  // Left-handed mode state - persisted in localStorage via LeftHandedToggle
  const [leftHandedMode, setLeftHandedMode] = useState(() => {
    return localStorage.getItem("leftHandedMode") === "true";
  });

  // Navigation bar visibility state - default hidden since bead navigation works well
  const [showNavigation, setShowNavigation] = useState(false);

  // Detailed progress bar state - default disabled
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);

  // Developer mode state - shows bead numbers and constraints
  const [developerMode, setDeveloperMode] = useState(false);

  // Rosary progress bar state - default enabled
  const [showProgressBar, setShowProgressBar] = useState(() => {
    try {
      return localStorage.getItem("showProgressBar") !== "false";
    } catch (error) {
      return true;
    }
  });

  // Rosary friction state - controls air resistance for coasting behavior
  const [rosaryFriction, setRosaryFriction] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("rosaryFriction")) || 0.05;
    } catch (error) {
      return 0.05;
    }
  });

  // Listen for left-handed mode changes from toggle component
  useEffect(() => {
    const handleLeftHandedModeChange = (event) => {
      setLeftHandedMode(event.detail.leftHandedMode);
    };
    window.addEventListener("leftHandedModeChange", handleLeftHandedModeChange);
    return () => {
      window.removeEventListener(
        "leftHandedModeChange",
        handleLeftHandedModeChange
      );
    };
  }, []);

  // Listen for friction changes from settings
  useEffect(() => {
    const handleRosaryFrictionChange = (event) => {
      setRosaryFriction(event.detail.friction);
    };
    window.addEventListener("rosaryFrictionChange", handleRosaryFrictionChange);
    return () => {
      window.removeEventListener(
        "rosaryFrictionChange",
        handleRosaryFrictionChange
      );
    };
  }, []);

  // Use the rosary state hook - MUST come before any code that uses these values
  const {
    currentPrayerIndex,
    handleBeadClick,
    jumpToPrayer,
    navigateToIndex,
    getRosarySequence,
    // Litany-specific state and functions
    litanyVerseIndex,
    isInLitany,
    getLitanyData,
    nextLitanyVerse,
    prevLitanyVerse,
    // Pressed beads tracking (NEW)
    pressedBeads,
    getPressedBeadCount,
    markBeadPressed,
    // Mystery tracking (NEW)
    areClosingPrayersUnlocked,
    // State management functions
    resetRosaryState,
  } = useRosaryState(RosarioPrayerBook, currentMystery);

  // Listen for scroll-based prayer navigation
  useEffect(() => {
    const handlePrayerScrollNext = () => {
      const sequence = getRosarySequence();
      if (currentPrayerIndex < sequence.length - 1) {
        navigateToIndex(currentPrayerIndex + 1);
      }
    };

    const handlePrayerScrollPrev = () => {
      if (currentPrayerIndex > 0) {
        navigateToIndex(currentPrayerIndex - 1);
      }
    };

    window.addEventListener("prayerScrollNext", handlePrayerScrollNext);
    window.addEventListener("prayerScrollPrev", handlePrayerScrollPrev);

    return () => {
      window.removeEventListener("prayerScrollNext", handlePrayerScrollNext);
      window.removeEventListener("prayerScrollPrev", handlePrayerScrollPrev);
    };
  }, [currentPrayerIndex, navigateToIndex, getRosarySequence]);

  // Listen for heart bead press (litany navigation)
  useEffect(() => {
    const handleHeartBeadPress = () => {
      if (isInLitany) {
        // Advance to next litany verse
        const moved = nextLitanyVerse();
        if (!moved) {
          // At end of litany, move to next prayer
          const sequence = getRosarySequence();
          if (currentPrayerIndex < sequence.length - 1) {
            navigateToIndex(currentPrayerIndex + 1);
          }
        }
      }
      // If not in litany, heart bead does nothing (decorative)
    };

    window.addEventListener("heartBeadPressed", handleHeartBeadPress);

    return () => {
      window.removeEventListener("heartBeadPressed", handleHeartBeadPress);
    };
  }, [
    isInLitany,
    nextLitanyVerse,
    currentPrayerIndex,
    navigateToIndex,
    getRosarySequence,
  ]);

  // Focus mode handlers
  const toggleFocusMode = useCallback(() => {
    setFocusMode(!focusMode);
  }, [focusMode]);

  const enterFocusMode = useCallback(() => {
    setFocusMode(true);
  }, []);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
  }, []);

  const handleCountClick = () => {
    if (count < 10) {
      setCount(count + 1);
    }
  };

  const handleResetClick = () => {
    setCount(0);
  };

  const toggleDeveloperMode = useCallback(() => {
    setDeveloperMode((prev) => !prev);
    // Dispatch event for InteractiveRosary to listen
    window.dispatchEvent(
      new CustomEvent("developerModeChange", {
        detail: { developerMode: !developerMode },
      })
    );
  }, [developerMode]);

  // Toggle rosary progress bar
  const toggleProgressBar = useCallback(() => {
    const newValue = !showProgressBar;
    setShowProgressBar(newValue);
    try {
      localStorage.setItem("showProgressBar", newValue.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
  }, [showProgressBar]);

  // Image rotation effect - cycle through images every 45 seconds for contemplative prayer
  useEffect(() => {
    // Clear existing timer
    if (imageRotationTimerRef.current) {
      clearInterval(imageRotationTimerRef.current);
    }

    // Only rotate if prayerImg is string (fallback images) - prayers with images stay fixed
    if (typeof prayerImg === "string") {
      // Handle fallback images - rotate through default images
      const timer = setInterval(() => {
        const theme = localStorage.getItem("theme");
        const isDark = theme === "dark";
        const fallbackImages = getDefaultFallbackImages(isDark);
        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
        const selectedImage = fallbackImages[randomIndex];
        setPrayerImg(selectedImage);
      }, 45000); // 45 seconds - slower for contemplative prayer

      imageRotationTimerRef.current = timer;
    }

    // Cleanup timer on unmount or when prayerImg changes
    return () => {
      if (imageRotationTimerRef.current) {
        clearInterval(imageRotationTimerRef.current);
        imageRotationTimerRef.current = null;
      }
    };
  }, [prayerImg]);

  // Listen for theme changes and update current prayer image
  useEffect(() => {
    const handleThemeChange = () => {
      // Only process if prayerImg is an object with image properties
      if (!prayerImg || typeof prayerImg === "string") return;

      const theme = localStorage.getItem("theme");
      const isDark = theme === "dark";

      // If we have the prayer object with img/imgmo properties
      if (prayerImg.img || prayerImg.imgmo) {
        const selectedImage = selectPrayerImage(prayerImg, isDark);
        setPrayerImg(selectedImage);
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [prayerImg]);

  // Keyboard shortcuts for focus mode and navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // F key to toggle focus mode
      if (event.key === "f" || event.key === "F") {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          toggleFocusMode();
        }
      }
      // Escape key to exit focus mode
      if (event.key === "Escape" && focusMode) {
        exitFocusMode();
      }
      // Arrow keys for navigation
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("prayerScrollNext", {
            detail: { direction: "next" },
          })
        );
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("prayerScrollPrev", {
            detail: { direction: "prev" },
          })
        );
      }
      // Space bar to toggle focus mode
      if (event.key === " " && !focusMode) {
        event.preventDefault();
        enterFocusMode();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusMode, toggleFocusMode, exitFocusMode, enterFocusMode]);

  // Handle bead click from rosary
  const onBeadClick = (prayerIndex, prayerId) => {
    // Mark this bead as pressed for progress tracking
    markBeadPressed(prayerIndex);

    // If clicking the litany bead and we're already in litany, advance through verses
    if (prayerId === "LL" && isInLitany) {
      const moved = nextLitanyVerse();
      if (!moved) {
        // If at end of litany, go to next prayer
        const result = handleBeadClick(prayerIndex, prayerId);
        if (result) {
          setPrayer(result.prayer);
          const theme = localStorage.getItem("theme");
          const isDark = theme === "dark";
          const prayerObj = result.prayerImg;
          const selectedImage = selectPrayerImage(prayerObj, isDark);
          setPrayerImg(selectedImage);
        }
      }
    } else {
      // Normal bead click behavior
      const result = handleBeadClick(prayerIndex, prayerId);
      if (result) {
        setPrayer(result.prayer);
        const theme = localStorage.getItem("theme");
        const isDark = theme === "dark";
        const prayerObj = result.prayerImg;
        const selectedImage = selectPrayerImage(prayerObj, isDark);
        setPrayerImg(selectedImage);
      }
    }
  };

  /**
   * Get prayer object by ID from any section of the prayer book
   * @param {string} id - Prayer ID to search for
   * @returns {object|null} Prayer object if found, null otherwise
   */
  const getPrayerById = (id) => {
    // Check in apertura (opening prayers)
    const aperturaPrayer = RosarioPrayerBook.apertura?.find((p) => p.id === id);
    if (aperturaPrayer) return aperturaPrayer;

    // Check in decada (decade prayers - Our Father, Hail Mary, etc.)
    const decadaPrayer = RosarioPrayerBook.decada?.find((p) => p.id === id);
    if (decadaPrayer) return decadaPrayer;

    // Check in mysteries (mystery-specific prayers)
    const mysteryPrayer = RosarioPrayerBook.mysteries?.[currentMystery]?.find(
      (p) => p.id === id
    );
    if (mysteryPrayer) return mysteryPrayer;

    // Check in cierre (closing prayers)
    const cierrePrayer = RosarioPrayerBook.cierre?.find((p) => p.id === id);
    if (cierrePrayer) return cierrePrayer;

    return null;
  };

  // Get current prayer title for progress bar
  const getCurrentPrayerTitle = () => {
    const rosarySequence = getRosarySequence();
    const currentPrayerId = rosarySequence[currentPrayerIndex];
    if (!currentPrayerId) return null;

    // Get prayer object from prayer book
    const prayerObj = getPrayerById(currentPrayerId);
    return prayerObj ? prayerObj.title : null;
  };

  // Handle corner fade state changes
  const handleFadeChange = useCallback((isFading, fadeIntensity) => {
    // This callback can be used to trigger additional effects if needed
    // For now, the CornerFadeControls component handles the fade directly
  }, []);

  // Listen for opacity changes from settings
  useEffect(() => {
    const handlePrayerTextOpacity = (event) => {
      const prayerText = document.querySelector(".page-left");
      if (prayerText) {
        prayerText.style.opacity = event.detail.opacity;
      }
    };

    const handleRosaryOpacity = (event) => {
      const rosary = document.querySelector(".interactive-rosary");
      if (rosary) {
        // Ensure minimum 20% opacity so beads remain visible and clickable
        rosary.style.opacity = Math.max(0.2, event.detail.opacity);
      }
    };

    // Handle bead drag - make rosary semi-transparent so prayer text is readable
    const handleBeadDragStart = () => {
      const rosary = document.querySelector(".interactive-rosary");
      if (rosary) {
        rosary.style.transition = "opacity 1.0s ease-in-out"; // Slow, peaceful fade (was 0.2s)
        rosary.style.opacity = "0.5"; // Semi-transparent while dragging (was 0.25 - too transparent)
      }
    };

    // Handle bead drag end - restore configured opacity
    const handleBeadDragEnd = () => {
      const rosary = document.querySelector(".interactive-rosary");
      if (rosary) {
        const configuredOpacity =
          parseFloat(localStorage.getItem("rosaryOpacity")) || 1.0;
        rosary.style.transition = "opacity 1.2s ease-in-out"; // Slow, gentle restoration (was 0.3s)
        // Ensure minimum 20% opacity so beads remain visible and clickable
        rosary.style.opacity = Math.max(0.2, configuredOpacity);
      }

      // Restore navigation buttons opacity
      const navButtons = document.querySelector(".segmented-bar");
      if (navButtons) {
        navButtons.style.transition = "opacity 1.2s ease-in-out"; // Slow, gentle restoration (was 0.3s)
        navButtons.style.opacity = "1";
      }
    };

    // Handle navigation button opacity during bead drag
    const handleBeadDragPosition = (event) => {
      const { navButtonOpacity } = event.detail;
      if (navButtonOpacity !== undefined) {
        const navButtons = document.querySelector(".segmented-bar");
        if (navButtons) {
          navButtons.style.transition = "opacity 0.1s ease";
          navButtons.style.opacity = navButtonOpacity;
        }
      }
    };

    window.addEventListener("prayerTextOpacityChange", handlePrayerTextOpacity);
    window.addEventListener("rosaryOpacityChange", handleRosaryOpacity);
    window.addEventListener("beadDragStart", handleBeadDragStart);
    window.addEventListener("beadDragEnd", handleBeadDragEnd);
    window.addEventListener("beadDragPosition", handleBeadDragPosition);

    // Set initial opacity from localStorage
    const initialPrayerTextOpacity =
      parseFloat(localStorage.getItem("prayerTextOpacity")) || 1.0;
    const initialRosaryOpacity =
      parseFloat(localStorage.getItem("rosaryOpacity")) || 1.0;

    const prayerText = document.querySelector(".page-left");
    const rosary = document.querySelector(".interactive-rosary");

    if (prayerText) {
      prayerText.style.opacity = initialPrayerTextOpacity;
    }
    if (rosary) {
      // Ensure minimum 20% opacity so beads remain visible and clickable
      rosary.style.opacity = Math.max(0.2, initialRosaryOpacity);
    }

    return () => {
      window.removeEventListener(
        "prayerTextOpacityChange",
        handlePrayerTextOpacity
      );
      window.removeEventListener("rosaryOpacityChange", handleRosaryOpacity);
      window.removeEventListener("beadDragStart", handleBeadDragStart);
      window.removeEventListener("beadDragEnd", handleBeadDragEnd);
      window.removeEventListener("beadDragPosition", handleBeadDragPosition);
    };
  }, []);

  return (
    <div className="app">
      {/* Settings Panel - Consolidated controls */}
      <InterfaceToggle
        showRosary={showRosary}
        showCounters={showCounters}
        onToggleRosary={() => setShowRosary(!showRosary)}
        onToggleCounters={() => setShowCounters(!showCounters)}
        leftHandedMode={leftHandedMode}
        setLeftHandedMode={setLeftHandedMode}
        focusMode={focusMode}
        onToggleFocusMode={toggleFocusMode}
        onEnterFocusMode={enterFocusMode}
        onExitFocusMode={exitFocusMode}
        onReset={handleResetClick}
        onResetRosary={resetRosaryState}
        showDetailedProgress={showDetailedProgress}
        onToggleDetailedProgress={() =>
          setShowDetailedProgress(!showDetailedProgress)
        }
        developerMode={developerMode}
        onToggleDeveloperMode={toggleDeveloperMode}
        showProgressBar={showProgressBar}
        onToggleProgressBar={toggleProgressBar}
      />{" "}
      {/* Help Screen */}
      <HelpScreen />
      {/* Corner fade controls */}
      <CornerFadeControls onFadeChange={handleFadeChange} />
      {/* Main content area with stained glass design */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Interactive Rosary - Full screen */}
        {showRosary && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <InteractiveRosary
              currentMystery={currentMystery}
              currentPrayerIndex={currentPrayerIndex}
              onBeadClick={onBeadClick}
              prayers={RosarioPrayerBook}
              className="rosary-container"
              rosaryFriction={rosaryFriction}
              isInLitany={isInLitany}
              pressedBeads={pressedBeads}
              areClosingPrayersUnlocked={areClosingPrayersUnlocked}
            />
          </div>
        )}

        {/* Prayer content with stained glass background */}
        <ViewPrayers
          count={count}
          prayerImg={prayerImg}
          prayer={prayer}
          currentMystery={currentMystery}
          currentPrayerIndex={currentPrayerIndex}
          prayers={RosarioPrayerBook}
          showCounters={showCounters}
          focusMode={focusMode}
          onToggleFocusMode={toggleFocusMode}
          getRosarySequence={getRosarySequence}
          showDetailedProgress={showDetailedProgress}
          // Litany-specific props
          litanyVerseIndex={litanyVerseIndex}
          isInLitany={isInLitany}
          getLitanyData={getLitanyData}
          nextLitanyVerse={nextLitanyVerse}
          prevLitanyVerse={prevLitanyVerse}
        />
      </div>
      {/* Prayer Buttons with stained glass styling */}
      <PrayerButtons
        prayers={RosarioPrayerBook}
        countUp={handleCountClick}
        reset={handleResetClick}
        setPrayer={setPrayer}
        setPrayerImg={setPrayerImg}
        currentMystery={currentMystery}
        setcurrentMystery={setcurrentMystery}
        jumpToPrayer={jumpToPrayer}
        currentPrayerIndex={currentPrayerIndex}
        navigateToIndex={navigateToIndex}
        getRosarySequence={getRosarySequence}
        leftHandedMode={leftHandedMode}
        // Litany-specific props
        isInLitany={isInLitany}
        nextLitanyVerse={nextLitanyVerse}
        prevLitanyVerse={prevLitanyVerse}
        // Navigation bar visibility
        showNavigation={showNavigation}
      />
      {/* Rosary Progress Bar - hidden when in litany */}
      <RosaryProgressBar
        isVisible={showProgressBar && !isInLitany}
        onToggle={toggleProgressBar}
        currentPrayerTitle={getCurrentPrayerTitle()}
        pressedBeadCount={getPressedBeadCount()}
        totalBeads={60}
        showNavigation={showNavigation}
        onToggleNavigation={() => setShowNavigation(!showNavigation)}
      />
    </div>
  );
}

export default App;
