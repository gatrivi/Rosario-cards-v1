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
    <div className="top-section" style={{ display: "flex", height: "58vh" }}>
      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "scroll",
          padding: "4px",
        }}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {prayer ===
          "Dios te salve, María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén."
            ? "Selecciona una oración"
            : ""}
          {prayer}
        </p>
      </div>
      <div className="page-right" style={{ flex: 1 }}>
        <img
          className="prayer-image"
          src={finalImageUrl}
          alt={`${prayer.name} illustration`}
          style={{
            width: "47vw",
            height: "56vh",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
}

export default ViewPrayers;
