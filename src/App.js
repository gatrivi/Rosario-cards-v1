import "./App.css";
import logo from "./logo.png";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; // Adjust path as needed
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useEffect } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import VirtualRosary from "./components/RosarioNube/VirtualRosary";
import { getPrayerForNode, getPrayerForLink } from "./utils/prayerMapper";
import StatsView from "./components/StatsView";
import { useRosaryStats } from "./hooks/useRosaryStats";
import RosedalView from "./components/Rosedal/RosedalView";
import DailyTracker from "./components/Rosedal/DailyTracker";

import "./App.css";
import logo from "./logo.png";
import { getDefaultMystery } from "./components/utils/getDefaultMystery"; 
import RosarioPrayerBook from "./data/RosarioPrayerBook";
import { useState, useEffect, useMemo } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import VirtualRosary from "./components/RosarioNube/VirtualRosary";
import { getRosaryBeads, getPhysicalMapping } from "./data/physicsRosaryData";
import StatsView from "./components/StatsView";
import { useRosaryStats } from "./hooks/useRosaryStats";
import RosedalView from "./components/Rosedal/RosedalView";
import DailyTracker from "./components/Rosedal/DailyTracker";

function App({ isEmbedded = false }) {
  const [currentMystery, setcurrentMystery] = useState(getDefaultMystery());
  const [activeIndex, setActiveIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showRosedal, setShowRosedal] = useState(false);
  const [showDailyTracker, setShowDailyTracker] = useState(false);
  const { logRosary } = useRosaryStats();

  // Liturgical sequence for the current mystery
  const sequence = useMemo(() => {
    const seqMap = {
      'gozosos': 'RGo',
      'dolorosos': 'RDo',
      'gloriosos': 'RGl',
      'luminosos': 'RL'
    };
    const key = seqMap[currentMystery] || 'RGo';
    return RosarioPrayerBook[key];
  }, [currentMystery]);

  // Derived current prayer data
  const currentPrayerData = useMemo(() => {
    const prayerId = sequence[activeIndex];
    
    // Search in apertura, decada, mysteries, closure
    let p = RosarioPrayerBook.apertura.find(x => x.id === prayerId) ||
            RosarioPrayerBook.decada.find(x => x.id === prayerId) ||
            RosarioPrayerBook.cierre.find(x => x.id === prayerId);
    
    if (!p) {
      p = RosarioPrayerBook.mysteries[currentMystery]?.find(x => x && x.id === prayerId);
    }
    
    return p || { title: prayerId, text: "" };
  }, [sequence, activeIndex, currentMystery]);

  const prayer = currentPrayerData.text;
  const prayerImg = currentPrayerData.img || RosarioPrayerBook.mysteries[currentMystery]?.[0];

  const handleAdvance = () => {
    if (activeIndex < sequence.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      // Finished the rosary!
      logRosary();
      alert("¡Rosario completado! Que la paz de Dios te acompañe.");
      setActiveIndex(0);
    }
  };

  const handleRetreat = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNodeClick = (index) => {
    // Mapping physical bead index to first liturgical occurrence
    const mapping = getPhysicalMapping(currentMystery);
    // Find the first index in the sequence that maps to this physical bead
    const liturgicalIndex = Object.keys(mapping).find(k => parseInt(mapping[k]) === index);
    if (liturgicalIndex !== undefined) {
      setActiveIndex(parseInt(liturgicalIndex));
    }
  };

  let backgroundImage = prayerImg
    ? `url(${prayerImg})`
    : "url(/gallery-images/cathedral praing.jpg)";

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

  if (!isEmbedded && showStats) {
    return (
      <div style={{ height: "100%", width: "100vw", overflow: "auto", position: "relative", backgroundColor: "#000" }}>
        <div style={{ paddingTop: "20px" }}>
          <StatsView />
        </div>
        <button onClick={() => setShowStats(false)} style={backButtonStyle}>
          <span>🏠</span> Volver al Rosario
        </button>
      </div>
    );
  }

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
    <div
      className="app"
      style={{
        height: "100%",
        width: isEmbedded ? "100%" : "100vw",
        backgroundImage: backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000"
      }}
    >
      {/* 1. Background Image Overlay (Darken to read text) */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 0 }} />

      {/* 2. Prayer Text Layer (Middle) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 5, pointerEvents: "none" }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "20px" }}>
          <div style={{ flex: 1, padding: "20px", background: "rgba(0,0,0,0.7)", borderRadius: "20px", border: "1px solid rgba(212,175,55,0.3)", backdropFilter: "blur(10px)", color: "white" }}>
            <ViewPrayers
              count={activeIndex} // Using activeIndex instead of local count
              prayerImg={prayerImg}
              prayer={prayer}
              currentMystery={currentMystery}
            />
          </div>
        </div>
      </div>

      {/* 3. Physics Rosary Layer (Top) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
        <VirtualRosary 
          activePrayerIndex={activeIndex}
          misterioActual={currentMystery}
          onNodeClick={handleNodeClick} 
          onAdvance={handleAdvance}
          onRetreat={handleRetreat}
          onSwipeAdvance={handleAdvance}
          onSwipeRetreat={handleRetreat}
        />
      </div>

      {/* 4. Navigation Icons (Floating UI) */}
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 100, display: "flex", gap: "10px" }}>
        <button onClick={() => setShowRosedal(true)} style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#d4af37", border: "none", fontSize: "1.5rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}>🌹</button>
        <button onClick={() => setShowStats(true)} style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#d4af37", border: "none", fontSize: "1.5rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}>📊</button>
      </div>

      {/* Version Badge */}
      <div style={{ position: "fixed", bottom: "5px", left: "10px", zIndex: 100, color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", pointerEvents: "none" }}>
        v0.3.1 — Excelencia Sagrada
      </div>
    </div>
  );
}

export default App;
