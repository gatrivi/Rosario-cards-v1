import React from "react";
import SacredDrawing from "../Views/SacredDrawing";
import { SYMBOL_MAP } from "../../data/SacredSymbols";
import RosarioPrayerBook from "../../data/RosarioPrayerBook";

function ViewPrayers({ prayer, count, prayerImg, currentMystery }) {
  const currentTheme = localStorage.getItem("theme");
  const isDark = currentTheme === "dark" || true; // Force dark for sacred feel

  // Get the current prayer ID from the sequence (we need to pass it or derive it)
  // Since we don't have the ID here directly, let's try to find it in the PrayerBook
  // Or better, let's assume App.js could pass the prayerId. 
  // For now, we'll infer it from the sequence if possible, but let's see if we can just match text.
  
  // Actually, App.js uses activeIndex and sequence. 
  // Let's modify App.js to pass the prayerId as well.
  
  const seqMap = {
    'gozosos': 'RGo',
    'dolorosos': 'RDo',
    'gloriosos': 'RGl',
    'luminosos': 'RL'
  };
  const sequence = RosarioPrayerBook[seqMap[currentMystery] || 'RGo'];
  const prayerId = sequence[count];

  let symbolKey = SYMBOL_MAP[prayerId] || 'cross';
  if (prayerId && prayerId.startsWith('M')) {
    const mPrefix = currentMystery.endsWith('os') ? currentMystery.slice(0, -2) : currentMystery;
    const mNum = prayerId.slice(2);
    symbolKey = `${mPrefix}_${mNum}`;
  }

  return (
    <div className="top-section" style={{ 
      display: "flex", 
      flexDirection: "column",
      height: "100%", 
      userSelect: "none",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        opacity: 0.6,
        zIndex: 1
      }}>
        <SacredDrawing 
          symbolKey={symbolKey} 
          progress={1} 
          size={80}
          decadeIndex={count % 10}
        />
      </div>

      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px",
          color: "#D4AF37",
          fontFamily: "'Playfair Display', Georgia, serif",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)"
        }}
      >
        <div style={{ 
          fontSize: "1.6rem", 
          lineHeight: "1.6", 
          whiteSpace: "pre-line",
          textAlign: "center",
          marginTop: "40px"
        }}>
          {prayer}
        </div>
      </div>
    </div>
  );
}

export default ViewPrayers;
