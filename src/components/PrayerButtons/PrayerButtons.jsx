import ThemeToggle from "../common/ThemeToggle";
import "./PrayerButtons.css";
import { useState, useEffect } from "react";
function PrayerButtons({ prayers, setPrayer }) {
  // Estado para controlar si mostramos apertura o cierre
  const [showOpening, setShowOpening] = useState(true);
  // Estado para el grupo de misterios actual

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
    return str
      .split(/\s+/) // Split by whitespace
      .map((word) => word[0]?.toUpperCase()) // Get first letter of each word, uppercase
      .join("") // Join letters
      .slice(0, 5);
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
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1px",
        padding: "1px",
      }}
    >
      {/* Botón para alternar apertura/cierre */}
      <button
        onClick={() => setShowOpening(!showOpening)}
        style={{ fontWeight: "bold", padding: "10px" }}
      >
        {showOpening ? "Oraciones de Apertura:" : "Oraciones de Cierre:"}
      </button>

      {/* Botones de oraciones de apertura/cierre */}

      {!currentPrayers || currentPrayers.length === 0 ? (
        <div>Loading...</div>
      ) : (
        currentPrayers.map((prayer, index) => (
          <button
            onClick={() => setPrayer(prayer.text)}
            key={index}
            style={{ padding: "8px" }}
          >
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}

      {/* Selector de misterios */}
      {mysteryTypes.map((type) => (
        <button
          key={type}
          onClick={() => setCurrentMysteries(type)}
          style={{
            backgroundColor: currentMysteries === type ? "#4CAF50" : "#ccc",
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
        <div>Loading...</div>
      ) : (
        prayers.mysteries[currentMysteries].map((prayer, index) => (
          <button
            onClick={() => setPrayer(prayer.text)}
            key={index}
            style={{ padding: "8px" }}
          >
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}

      {/* Botones de oraciones de la década (siempre visibles) */}
      {!prayers.decada || prayers.decada.length === 0 ? (
        <div>Loading...</div>
      ) : (
        prayers.decada.map((prayer, index) => (
          <button
            onClick={() => setPrayer(prayer.text)}
            key={index}
            style={{ padding: "8px" }}
          >
            {makeAcronym(prayer.title)}
          </button>
        ))
      )}

      <ThemeToggle />
    </div>
  );
}
export default PrayerButtons;
