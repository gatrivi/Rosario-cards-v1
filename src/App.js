import "./App.css";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useEffect, useCallback } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import InteractiveRosary from "./components/RosarioNube/InteractiveRosary";
import InterfaceToggle from "./components/common/InterfaceToggle";
import { useRosaryState } from "./components/RosarioNube/useRosaryState";
function App() {
  const [prayer, setPrayer] = useState(
    "Por la señal de la Santa Cruz \nde nuestros enemigos, líbranos Señor, Dios nuestro. \nAmén.\n\nAbre Señor, mis labios \ny proclamará mi boca tu alabanza."
  );
  const [currentMystery, setcurrentMystery] = useState(getDefaultMystery);
  const [prayerImg, setPrayerImg] = useState(
    RosarioPrayerBook.mysteries[currentMystery][0]
  );
  const [count, setCount] = useState(0);

  // Interface visibility states for clean prayer mode
  const [showRosary, setShowRosary] = useState(true);
  const [showCounters, setShowCounters] = useState(true);
  
  // Focus mode state - hides text and shows only rosary counter
  const [focusMode, setFocusMode] = useState(false);

  // Left-handed mode state - persisted in localStorage via LeftHandedToggle
  const [leftHandedMode, setLeftHandedMode] = useState(() => {
    return localStorage.getItem("leftHandedMode") === "true";
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

  // Use the rosary state hook - MUST come before any code that uses these values
  const {
    currentPrayerIndex,
    handleBeadClick,
    jumpToPrayer,
    navigateToIndex,
    getRosarySequence,
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

  // Listen for theme changes and update current prayer image
  useEffect(() => {
    const handleThemeChange = () => {
      // Only process if prayerImg is an object with image properties
      if (!prayerImg || typeof prayerImg === "string") return;

      const theme = localStorage.getItem("theme");
      const isDark = theme === "dark";

      // If we have the prayer object with img/imgmo properties
      if (prayerImg.img || prayerImg.imgmo) {
        const selectedImage =
          isDark && prayerImg.imgmo ? prayerImg.imgmo : prayerImg.img;
        setPrayerImg(selectedImage);
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [prayerImg]);

  // Keyboard shortcuts for focus mode
  useEffect(() => {
    const handleKeyPress = (event) => {
      // F key to toggle focus mode
      if (event.key === 'f' || event.key === 'F') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          toggleFocusMode();
        }
      }
      // Escape key to exit focus mode
      if (event.key === 'Escape' && focusMode) {
        exitFocusMode();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusMode, toggleFocusMode, exitFocusMode]);

  const handleCountClick = () => {
    if (count < 10) {
      setCount(count + 1);
    }
  };

  const handleResetClick = () => {
    setCount(0);
  };

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

  // Handle bead click from rosary
  const onBeadClick = (prayerIndex, prayerId) => {
    const result = handleBeadClick(prayerIndex, prayerId);
    if (result) {
      setPrayer(result.prayer);

      // Handle theme-based image selection
      const theme = localStorage.getItem("theme");
      const isDark = theme === "dark";
      const prayerObj = result.prayerImg;
      const selectedImage =
        isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
      setPrayerImg(selectedImage);
    }
  };

  return (
    <div className="app">
      {/* Settings Panel - Consolidated controls */}
      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }}>
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
        />
      </div>

      {/* Main content area with stained glass design */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Interactive Rosary - Forefront (highest priority) */}
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
        />
      </div>


      {/* Prayer Buttons with stained glass styling */}
      <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
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
        />
      </div>
    </div>
  );
}

export default App;
