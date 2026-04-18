import "./App.css";
import logo from "./logo.png";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useEffect } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import Bead from "./components/RosarioNube/Bead";
import VirtualRosary from "./components/RosarioNube/VirtualRosary";
import { getPrayerForNode, getPrayerForLink } from "./utils/prayerMapper";
import StatsView from "./components/StatsView";
import { useRosaryStats } from "./hooks/useRosaryStats";
import RosedalView from "./components/Rosedal/RosedalView";
import DailyTracker from "./components/Rosedal/DailyTracker";

function App({ isEmbedded = false }) {
  const [prayer, setPrayer] = useState(
    "Por la señal de la Santa Cruz \nde nuestros enemigos, líbranos Señor, Dios nuestro. \nAmén.\n\nAbre Señor, mis labios \ny proclamará mi boca tu alabanza."
  );
  const [currentMystery, setcurrentMystery] = useState(getDefaultMystery);

  console.log("currentMystery in App:", currentMystery);
  console.log(
    "Rosario[currentMystery][0] in App:",
    RosarioPrayerBook.mysteries[currentMystery][0]
  );

  const [prayerImg, setPrayerImg] = useState(
    RosarioPrayerBook.mysteries[currentMystery][0]
  );
  const [count, setCount] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRosedal, setShowRosedal] = useState(false);
  const [showDailyTracker, setShowDailyTracker] = useState(false);
  const { logRosary } = useRosaryStats();

  const handleNodeClick = (nodeData) => {
    setActiveNode(nodeData.id);
    setPrayer(getPrayerForNode(nodeData));
  };

  const handleLinkClick = (linkData) => {
    setPrayer(getPrayerForLink(linkData));
  };

  const handleCountClick = () => {
    if (count < 10) {
      setCount(count + 1);
    }
  };
  const handleResetClick = () => {
    setCount(0);
  };

  let backgroundImage = prayerImg
    ? `url(${prayerImg})`
    : "url(/public/gallery-images/cathedral paing.JPG)";

  if (!isEmbedded && showStats) {
    return (
      <div style={{ height: "100%", width: "100vw", overflow: "auto", position: "relative" }}>
        <div style={{ paddingTop: "60px" }}>
          <StatsView />
        </div>
        <button 
          onClick={() => setShowStats(false)}
          style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "12px 24px", background: "rgba(0,0,0,0.85)", color: "white", border: "1px solid #d4af37", borderRadius: "25px", cursor: "pointer", fontWeight: "bold", backdropFilter: "blur(10px)", fontSize: "0.95rem" }}
        >
          ← Volver al Rosario
        </button>
      </div>
    );
  }

  if (!isEmbedded && showRosedal) {
    return (
      <div style={{ height: "100%", width: "100vw", overflow: "auto", position: "relative", backgroundColor: '#1a1a1a' }}>
        <div style={{ paddingTop: "60px" }}>
          <RosedalView />
        </div>
        <button 
          onClick={() => setShowRosedal(false)}
          style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "12px 24px", background: "rgba(0,0,0,0.85)", color: "white", border: "1px solid #d4af37", borderRadius: "25px", cursor: "pointer", fontWeight: "bold", backdropFilter: "blur(10px)", fontSize: "0.95rem" }}
        >
          ← Volver al Rosario
        </button>
      </div>
    );
  }

  if (!isEmbedded && showDailyTracker) {
    return (
      <div style={{ height: "100%", width: "100vw", overflow: "auto", position: "relative", backgroundColor: '#1a1a1a' }}>
        <div style={{ paddingTop: "60px" }}>
          <DailyTracker />
        </div>
        <button 
          onClick={() => setShowDailyTracker(false)}
          style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "12px 24px", background: "rgba(0,0,0,0.85)", color: "white", border: "1px solid #d4af37", borderRadius: "25px", cursor: "pointer", fontWeight: "bold", backdropFilter: "blur(10px)", fontSize: "0.95rem" }}
        >
          ← Volver al Rosario
        </button>
      </div>
    );
  }

  return (
    <div
      className="app"
      style={{
        height: "100%",
        width: isEmbedded ? "100%" : "100vw",
        backgroundImage: backgroundImage,
        backgroundSize: "cover",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background UI Layer (Prayers sitting underneath the rosary) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, display: "flex", flexDirection: "column" }}>
        {!isEmbedded && <Header logo={logo} onToggleStats={() => setShowStats(true)} onToggleRosedal={() => setShowRosedal(true)} onToggleDailyTracker={() => setShowDailyTracker(true)} />}
        
        <div style={{ flex: 1, padding: "10px", overflow: "hidden" }}>
          {/* Opaque box for prayers so they are easy to read */}
          <div style={{ background: "rgba(0,0,0,0.65)", borderRadius: "10px", padding: "10px", color: "white", display: "inline-block", maxWidth: "95%", height: "100%" }}>
            <ViewPrayers
              count={count}
              prayerImg={prayerImg}
              prayer={prayer}
              currentMystery={currentMystery}
            />
          </div>
        </div>
      </div>

      {/* Foreground Physics Layer (Rosary on top) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>
        <VirtualRosary 
          onNodeClick={handleNodeClick} 
          onLinkClick={handleLinkClick} 
        />
      </div>

      {/* Topmost UI Layer (Just the buttons, floating over everything) */}
      <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, zIndex: 20, padding: "10px", display: "flex", flexDirection: "column", alignItems: "flex-end", maxHeight: "80vh", pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button 
            onClick={() => {
              logRosary();
              alert("¡Rosario registrado!");
            }} 
            style={{ padding: "10px 15px", background: "#d4af37", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", pointerEvents: "auto", fontWeight: "bold" }}
          >
            + Finalizar Rosario
          </button>

          <button 
            onClick={() => setShowButtons(!showButtons)} 
            style={{ padding: "10px 15px", background: "rgba(30,30,30,0.8)", color: "white", border: "1px solid white", borderRadius: "8px", cursor: "pointer", pointerEvents: "auto" }}
          >
            {showButtons ? "Ocultar Botones Clásicos" : "Mostrar Botones Clásicos"}
          </button>
        </div>

        {showButtons && (
          <div style={{ background: "rgba(0,0,0,0.85)", padding: "15px", borderRadius: "10px", width: "100%", overflowY: "auto", pointerEvents: "auto" }}>
            <PrayerButtons
              prayers={RosarioPrayerBook}
              countUp={handleCountClick}
              reset={handleResetClick}
              setPrayer={setPrayer}
              setPrayerImg={setPrayerImg}
              currentMystery={currentMystery}
              setcurrentMystery={setcurrentMystery}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
