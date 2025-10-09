import "./App.css";
import logo from "./logo.png";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useRef } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import InteractiveRosary from "./components/RosarioNube/InteractiveRosary";
import BackupRosary from "./components/RosarioNube/BackupRosary";
import SimpleBeadTest from "./components/RosarioNube/SimpleBeadTest";
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
  const [showSimpleTest, setShowSimpleTest] = useState(false);

  // Interface visibility states for clean prayer mode
  const [showRosary, setShowRosary] = useState(true);
  const [showBackupRosary, setShowBackupRosary] = useState(true);
  const [showCounters, setShowCounters] = useState(true);

  // Ref for scroll control in ViewPrayers component
  const scrollControlRef = useRef(null);

  // Use the rosary state hook
  const { currentPrayerIndex, handleBeadClick, jumpToPrayer } = useRosaryState(
    RosarioPrayerBook,
    currentMystery
  );

  const handleCountClick = () => {
    if (count < 10) {
      setCount(count + 1);
    }
  };

  const handleResetClick = () => {
    setCount(0);
  };

  // Handle bead click from rosary
  const onBeadClick = (prayerIndex, prayerId) => {
    const result = handleBeadClick(prayerIndex, prayerId);
    if (result) {
      setPrayer(result.prayer);
      setPrayerImg(result.prayerImg);
    }
  };

  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header logo={logo} style={{ height: "4vh" }} />

      {/* Interface Toggle - Control panel for hiding/showing elements */}
      <InterfaceToggle
        showRosary={showRosary}
        showBackupRosary={showBackupRosary}
        showCounters={showCounters}
        onToggleRosary={() => setShowRosary(!showRosary)}
        onToggleBackupRosary={() => setShowBackupRosary(!showBackupRosary)}
        onToggleCounters={() => setShowCounters(!showCounters)}
      />

      {/* Simple Test Toggle Button */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "20px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          borderRadius: "8px",
          border: "2px solid #FF6B6B",
        }}
      >
        <button
          onClick={() => setShowSimpleTest(!showSimpleTest)}
          style={{
            background: showSimpleTest ? "#FF6B6B" : "#4ECDC4",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showSimpleTest ? "Hide Simple Test" : "Show Simple Test"}
        </button>
      </div>

      {/* Main content area with rosary */}
      <div
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simple Bead Test - Show when toggled */}
        {showSimpleTest && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              pointerEvents: "auto",
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SimpleBeadTest />
          </div>
        )}

        {/* Interactive Rosary - Make it more visible */}
        {!showSimpleTest && showRosary && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 3,
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

        {/* Prayer content overlay - Make it semi-transparent */}
        <div
          style={{
            position: "relative",
            zIndex: 1, // Lower z-index to allow rosary to be visible
            width: "100%",
            display: "flex",
            flexDirection: "column",
            pointerEvents: "none", // Allow clicks to pass through to rosary
          }}
        >
          <ViewPrayers
            ref={scrollControlRef}
            count={count}
            prayerImg={prayerImg}
            prayer={prayer}
            currentMystery={currentMystery}
            currentPrayerIndex={currentPrayerIndex}
            prayers={RosarioPrayerBook}
            showCounters={showCounters}
          />
        </div>
      </div>

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
        scrollControlRef={scrollControlRef}
      />

      {/* Backup Rosary - Always visible around screen edges */}
      {showBackupRosary && (
        <BackupRosary
          currentPrayerIndex={currentPrayerIndex}
          currentMystery={currentMystery}
          onBeadClick={onBeadClick}
          totalPrayers={57}
          prayers={RosarioPrayerBook}
          showCounters={showCounters}
        />
      )}
    </div>
  );
}

export default App;
