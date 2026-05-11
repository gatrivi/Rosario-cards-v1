import React from "react";
import Boton from "../Boton/Boton";
import AveMaria from "../../data/assets/img/Theotokos.jpg";
import AveMariaD from "../../data/assets/img/AllMary17thLith.jpeg";
function ViewPrayers({ prayer, count, prayerImg, currentMystery }) {
  const currentTheme = localStorage.getItem("theme");
  const isDark = currentTheme === "dark";
  return (
    <div className="top-section" style={{ display: "flex", height: "58vh", userSelect: "none" }}>
      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "auto",
          padding: "15px",
          color: isDark ? "#fff" : "#333",
          background: isDark ? "transparent" : "rgba(255,255,255,0.85)",
        }}
      >
        <div style={{ fontSize: "1.5rem", lineHeight: "1.4", whiteSpace: "pre-line" }}>
          {prayer}
        </div>
      </div>
    </div>
  );
}

export default ViewPrayers;
