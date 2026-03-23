import React from "react";
import Boton from "../Boton/Boton";
import AveMaria from "../../data/assets/img/Theotokos.jpg";
import AveMariaD from "../../data/assets/img/AllMary17thLith.jpeg";
function ViewPrayers({ prayer, count, prayerImg, currentMystery }) {
  console.log(" prayer prop in ViewPrayers:", prayer);
  let baseImageUrl;
  const finalImageUrl = prayerImg ? prayerImg : baseImageUrl;
  const currentTheme = localStorage.getItem("theme");
  console.log("currentMystery in ViewPrayers:", currentMystery);
  if (currentTheme === "dark") {
    if (currentMystery === "gloriosos") {
      baseImageUrl = "/gallery-images/misterios/modooscuro/misteriogloria0.jpg";
    }
  } else {
    baseImageUrl = AveMariaD;
  }
  console.log("prayerImg prop in ViewPrayers:", prayerImg);
  console.log("baseImageUrl:", baseImageUrl);
  console.log("currentTheme:", currentTheme);
  console.log("finalImageUrl:", finalImageUrl);
  return (
    <div className="top-section" style={{ display: "flex", height: "58vh", userSelect: "none" }}>
      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "scroll",
          padding: "4px",
        }}
      >
        <span style={{ color: "gold" }}>
          {" "}
          {prayer ===
          "Dios te salve, María, \nllena eres de gracia, \nel Señor es contigo. \nBendita tú eres entre todas las mujeres, \ny bendito es el fruto de tu vientre, \nJesús. \nSanta María, \nMadre de Dios, \nruega por nosotros, pecadores, \nahora y en la hora de nuestra muerte. \nAmén."
            ? count
            : ""}
        </span>
        <p style={{ whiteSpace: "pre-line" }}>{prayer}</p>
      </div>
    </div>
  );
}

export default ViewPrayers;
