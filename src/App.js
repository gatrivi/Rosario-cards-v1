import "./App.css";
import logo from "./logo.png";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import InteractiveRosary from "./components/RosarioNube/InteractiveRosary";
import BackupRosary from "./components/RosarioNube/BackupRosary";
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

      {/* Main content area with rosary */}
      <div
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Interactive Rosary - Make it more visible */}
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
            count={count}
            prayerImg={prayerImg}
            prayer={prayer}
            currentMystery={currentMystery}
            currentPrayerIndex={currentPrayerIndex}
            prayers={RosarioPrayerBook}
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

      {/* Backup Rosary - Always visible around screen edges */}
      <BackupRosary
        currentPrayerIndex={currentPrayerIndex}
        currentMystery={currentMystery}
        onBeadClick={onBeadClick}
        totalPrayers={57}
        prayers={RosarioPrayerBook}
      />
    </div>
  );
}

export default App;
