import "./App.css";
import logo from "./logo.png";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useEffect } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import InteractiveRosary from "./components/RosarioNube/InteractiveRosary";
import Rosary2 from "./components/RosarioNube/Rosary2";
import TestMatterScene from "./components/RosarioNube/TestMatterScene";
import ColorPicker from "./components/common/ColorPicker";
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

  // Rosary type toggle - switch between InteractiveRosary and Rosary2
  const [useRosary2, setUseRosary2] = useState(true);

  // Color customization states
  const [customColors, setCustomColors] = useState({
    mainLoopStart: "#D2B48C",
    mainLoopEnd: "#8B4513",
    tail: "#8B4513",
    cross: "#D2B48C",
  });

  // Color picker visibility
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Settings menu visibility
  const [showSettings, setShowSettings] = useState(false);

  // Use the rosary state hook
  const { currentPrayerIndex, handleBeadClick, jumpToPrayer } = useRosaryState(
    RosarioPrayerBook,
    currentMystery
  );

  // Back to basics - working TestMatterScene only

  // Keyboard navigation for rosary beads
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        // Fire event to move to next bead
        window.dispatchEvent(new CustomEvent("rosary:nextBead"));
      } else if (e.key === "ArrowLeft" || e.key === "p" || e.key === "P") {
        // Fire event to move to previous bead
        window.dispatchEvent(new CustomEvent("rosary:prevBead"));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

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
        showCounters={showCounters}
        onToggleRosary={() => setShowRosary(!showRosary)}
        onToggleCounters={() => setShowCounters(!showCounters)}
      />

      {/* Settings Menu */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          padding: "8px",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderBottom: "1px solid #ccc",
        }}
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: "8px 16px",
            backgroundColor: showSettings ? "#FF9800" : "#9E9E9E",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Settings
        </button>

        {showSettings && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setUseRosary2(!useRosary2)}
              style={{
                padding: "8px 16px",
                backgroundColor: useRosary2 ? "#4CAF50" : "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {useRosary2 ? "Rosary2" : "InteractiveRosary"}
            </button>

            {useRosary2 && (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: showColorPicker ? "#FF9800" : "#9E9E9E",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
                >
                  Colors
                </button>

                {showColorPicker && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <ColorPicker
                      label="Start"
                      color={customColors.mainLoopStart}
                      onChange={(color) =>
                        setCustomColors((prev) => ({
                          ...prev,
                          mainLoopStart: color,
                        }))
                      }
                    />
                    <ColorPicker
                      label="End"
                      color={customColors.mainLoopEnd}
                      onChange={(color) =>
                        setCustomColors((prev) => ({
                          ...prev,
                          mainLoopEnd: color,
                        }))
                      }
                    />
                    <ColorPicker
                      label="Tail"
                      color={customColors.tail}
                      onChange={(color) =>
                        setCustomColors((prev) => ({ ...prev, tail: color }))
                      }
                    />
                    <ColorPicker
                      label="Cross"
                      color={customColors.cross}
                      onChange={(color) =>
                        setCustomColors((prev) => ({ ...prev, cross: color }))
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
        {/* Interactive Rosary - TEMPORARILY HIDDEN FOR TESTING */}
        {false && showRosary && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
              pointerEvents: "auto",
            }}
          >
            {useRosary2 ? (
              <Rosary2
                currentMystery={currentMystery}
                currentPrayerIndex={currentPrayerIndex}
                onBeadClick={onBeadClick}
                prayers={RosarioPrayerBook}
                customColors={customColors}
                className="rosary-container"
              />
            ) : (
              <InteractiveRosary
                currentMystery={currentMystery}
                currentPrayerIndex={currentPrayerIndex}
                onBeadClick={onBeadClick}
                prayers={RosarioPrayerBook}
                className="rosary-container"
              />
            )}
          </div>
        )}

        {/* TestMatterScene: Working rosary - back to basics */}
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
            <TestMatterScene />
          </div>
        )}

        {/* Prayer content overlay - Behind rosary */}
        <div
          style={{
            position: "relative",
            zIndex: 0, // Behind rosary (baseline level)
            width: "100%",
            display: "flex",
            flexDirection: "column",
            pointerEvents: "none", // Allow clicks to pass through to rosary
          }}
        >
          <ViewPrayers
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
      />
    </div>
  );
}

export default App;
