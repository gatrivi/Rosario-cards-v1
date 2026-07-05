import "./App.css";
import "./styles/reachablePrayerControls.css";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; 
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState } from "react";
import RosedalView from "./components/Rosedal/RosedalView";
import DailyTracker from "./components/Rosedal/DailyTracker";
import RosarioVirtualView from "./components/Views/RosarioVirtualView";

function App({ isEmbedded = false }) {
  const [currentMystery, setcurrentMystery] = useState(getDefaultMystery());
  const [activeIndex, setActiveIndex] = useState(0);
  const [showRosedal, setShowRosedal] = useState(false);
  const [showDailyTracker, setShowDailyTracker] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);

  const handleUpdateProgreso = (index) => {
    setActiveIndex(index);
    // If we finished the sequence, log it
    // Note: RosarioVirtualView handles internal sequence logic
  };

  const backButtonStyle = { 
    position: "fixed", 
    bottom: "30px", 
    left: "50%", 
    transform: "translateX(-50%)", 
    zIndex: 1000, 
    padding: "16px 32px", 
    background: "#d4af37", 
    color: "black", 
    border: "none", 
    borderRadius: "40px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    fontSize: "1.2rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  };

  if (!isEmbedded && showRosedal) {
    return (
      <div style={{ height: "100%", width: "100vw", overflow: "auto", position: "relative", backgroundColor: '#111' }}>
        <div style={{ paddingTop: "20px" }}>
          <RosedalView />
        </div>
        <button onClick={() => setShowRosedal(false)} style={backButtonStyle}>
          <span>🏠</span> Volver al Rosario
        </button>
      </div>
    );
  }

  if (!isEmbedded && showDailyTracker) {
    return (
      <div style={{ height: "100%", width: "100vw", overflow: "auto", position: "relative", backgroundColor: '#111' }}>
        <div style={{ paddingTop: "20px" }}>
          <DailyTracker />
        </div>
        <button onClick={() => setShowDailyTracker(false)} style={backButtonStyle}>
          <span>🏠</span> Volver al Rosario
        </button>
      </div>
    );
  }

  return (
    <div className="app" style={{ height: "100%", width: isEmbedded ? "100%" : "100vw", position: "relative", overflow: "hidden", backgroundColor: "#000" }}>
      
      <RosarioVirtualView 
        currentPrayerIndex={activeIndex}
        misterioActual={currentMystery}
        onUpdateProgreso={handleUpdateProgreso}
        soundEnabled={soundEnabled}
        isLeftHanded={isLeftHanded}
        simpleMode={simpleMode}
        onShowRosedal={() => setShowRosedal(true)}
        onToggleSimpleMode={() => setSimpleMode(!simpleMode)}
      />
    </div>
  );
}

export default App;
