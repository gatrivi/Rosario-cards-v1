import ThemeToggle from "../common/ThemeToggle";
import "./PrayerButtons.css";
import { useState, useEffect } from "react";
function PrayerButtons({ prayers, setPrayer, reset, countUp, setPrayerImg }) {
  // Estado para controlar si mostramos apertura o cierre
  const [showOpening, setShowOpening] = useState(true);
  // Estado para el grupo de misterios actual

  const handlePrayerAndCount = (prayerText, prayerImg) => {
    setPrayer(prayerText);
    setPrayerImg(prayerImg);

    if (
      prayerText ==
      "Dios te salve, María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén."
    ) {
      countUp();
    } else {
      reset();
    }
  };
  const getDefaultMysteries = () => {
    const today = new Date().getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
    switch (today) {
      case 1: // Lunes
      case 6: // Sábado
        return "gozosos";
      case 2: // Martes
      case 5: // Viernes
        return "dolorosos";
      case 3: // Miércoles
      case 0: // Domingo
        return "gloriosos";
      case 4: // Jueves
        return "luminosos";
      default:
        return "gozosos"; // Fallback
    }
  };
  const [currentMysteries, setCurrentMysteries] = useState(
    getDefaultMysteries()
  );
  function makeAcronym(str) {
    return str;
    /*   .split(/\s+/) // Split by whitespace
      .map((word) => word[0]?.toUpperCase()) // Get first letter of each word, uppercase
      .join("") // Join letters
      .slice(0, 5); */
  }
  // Lista de tipos de misterios para el selector
  const mysteryTypes = ["gozosos", "dolorosos", "gloriosos", "luminosos"];

  // Oraciones a mostrar (apertura o cierre)
  const currentPrayers = showOpening ? prayers.apertura : prayers.cierre;
  return (
    <div
      className="button-grid"
      style={{
        height: "38vh",
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "1px",
        padding: "1px",
      }}
    >
      {/* Selector de misterios */}
      {mysteryTypes.map((type) => (
        <button
          key={type}
          onClick={() => setCurrentMysteries(type)}
          className={`button-base ${
            currentMysteries === type ? "button-active" : "button-inactive"
          }`}
          style={{
            padding: "8px",
            borderRadius: "5px",
          }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}

      {/* Botones de misterios */}

      {!prayers.mysteries[currentMysteries] ||
      prayers.mysteries[currentMysteries].length === 0 ? (
        <div>Cargando Misterios...</div>
      ) : (
        prayers.mysteries[currentMysteries].map((prayer, index) => (
          <button
            onClick={() => handlePrayerAndCount(prayer.text, prayer.img)}
            key={index}
            style={{ padding: "4px" }}
          >
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}
      <button onClick={reset}>Reset</button>
      <ThemeToggle />
      <button disabled>Oraciones de la década:</button>
      {/* Botones de oraciones de la década (siempre visibles) */}
      {!prayers.decada || prayers.decada.length === 0 ? (
        <div>Cargando Oraciones de la Decada...</div>
      ) : (
        prayers.decada.map((prayer, index) => (
          <button
            onClick={() => handlePrayerAndCount(prayer.text, prayer.img)}
            key={index}
            style={{ padding: "4px" }}
          >
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}
      {/* Botón para alternar apertura/cierre */}
      <button
        onClick={() => setShowOpening(!showOpening)}
        className="button-inactive"
        style={{
          padding: "4x",
        }}
      >
        {showOpening ? "Oraciones de Apertura:" : "Oraciones de Cierre:"}
      </button>

      {/* Botones de oraciones de apertura/cierre */}

      {!currentPrayers || currentPrayers.length === 0 ? (
        <div>Cargando Oraciones Iniciales o de Cierre...</div>
      ) : (
        currentPrayers.map((prayer, index) => (
          <button
            onClick={() => handlePrayerAndCount(prayer.text, prayer.img)}
            key={index}
            style={{ padding: "4px" }}
          >
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}
    </div>
  );
}
export default PrayerButtons;
