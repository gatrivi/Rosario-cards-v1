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
          overflow: "scroll",
          padding: "4px",
          color: isDark ? "#fff" : "#333",
          background: isDark ? "transparent" : "rgba(255,255,255,0.85)",
        }}
      >
        <span style={{ color: isDark ? "gold" : "#8B0000" }}>
          {prayer ===
          "Dios te salve, María, \nllena eres de gracia, \nel Señor es contigo. \nBendita tú eres entre todas las mujeres, \ny bendito es el fruto de tu vientre, \nJesús. \nSanta María, \nMadre de Dios, \nruega por nosotros, pecadores, \nahora y en la hora de nuestra muerte. \nAmén."
            ? count
            : ""}
        </span>
        <p style={{ whiteSpace: "pre-line" }}>{prayer}</p>
      </div>
    </div>
  );

export default ViewPrayers;
