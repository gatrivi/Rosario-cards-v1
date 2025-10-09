import ThemeToggle from "../common/ThemeToggle";
import LeftHandedToggle from "../common/LeftHandedToggle";
import "./PrayerButtons.css";
import { useState, useEffect, useCallback } from "react";
function PrayerButtons({
  prayers,
  setPrayer,
  reset,
  countUp,
  setPrayerImg,
  currentMystery,
  setcurrentMystery,
  leftHandedMode = false,
}) {
  // Estados para la botonera segmentada
  const [activeSection, setActiveSection] = useState("none");
  const [cycleIndex, setCycleIndex] = useState(0);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [subView, setSubView] = useState(null);

  // Helper function to get the correct rosary array based on mystery type
  const getRosaryArray = useCallback(
    (mysteryType) => {
      const mysteryToArray = {
        gozosos: "RGo",
        dolorosos: "RDo",
        gloriosos: "RGl",
        luminosos: "RL",
      };
      return prayers[mysteryToArray[mysteryType]] || [];
    },
    [prayers]
  );

  // Helper function to get prayer object by ID
  const getPrayerById = useCallback(
    (id) => {
      // Check in apertura
      const aperturaPrayer = prayers.apertura?.find((p) => p.id === id);
      if (aperturaPrayer) return aperturaPrayer;

      // Check in decada
      const decadaPrayer = prayers.decada?.find((p) => p.id === id);
      if (decadaPrayer) return decadaPrayer;

      // Check in mysteries
      const mysteryPrayer = prayers.mysteries?.[currentMystery]?.find(
        (p) => p.id === id
      );
      if (mysteryPrayer) return mysteryPrayer;

      // Check in cierre
      const cierrePrayer = prayers.cierre?.find((p) => p.id === id);
      if (cierrePrayer) return cierrePrayer;

      return null;
    },
    [prayers, currentMystery]
  );

  const handlePrayerAndCount = useCallback(
    (prayerText, prayerImg) => {
      setPrayer(prayerText);
      if (prayerImg.imgmo && localStorage.getItem("theme") === "dark")
        return setPrayerImg(prayerImg.imgmo);
      if (localStorage.getItem("theme") === "light")
        return setPrayerImg(prayerImg.img);

      if (
        prayerText ===
        "Dios te salve, María, \nllena eres de gracia, \nel Señor es contigo. \nBendita tú eres entre todas las mujeres, \ny bendito es el fruto de tu vientre, Jesús. \nSanta María, \nMadre de Dios, \nruega por nosotros, \npecadores, \nahora y en la hora de nuestra muerte. \nAmén."
      ) {
        countUp();
      } else {
        reset();
      }
    },
    [setPrayer, setPrayerImg, countUp, reset]
  );

  // Helper: Items por sección
  const getSectionItems = (section) => {
    switch (section) {
      case "apertura":
        return prayers.apertura || [];
      case "decada":
        return prayers.decada || [];
      case "misterios":
        return prayers.mysteries?.[currentMystery] || [];
      case "cierre":
        return prayers.cierre || [];
      default:
        return [];
    }
  };

  // Handlers para la botonera segmentada
  const handleSegmentTap = (section) => {
    if (activeSection === section) {
      // Ya activo: Cicla al siguiente
      const items = getSectionItems(section);
      if (items.length > 0) {
        setCycleIndex((prev) => (prev + 1) % items.length);
        const item = items[(cycleIndex + 1) % items.length];
        // Jump to this prayer in the rosary sequence
        jumpToPrayer(item.id);
      }
    } else {
      // Nuevo: Entra modo
      setActiveSection(section);
      setCycleIndex(0);
      const items = getSectionItems(section);
      if (items.length > 0) {
        const item = items[0];
        // Jump to this prayer in the rosary sequence
        jumpToPrayer(item.id);
      }

      // Para misterios, mostrar sub-bar
      if (section === "misterios") {
        setSubView("misterios");
      } else {
        setSubView(null);
      }
    }
  };

  const handlePrev = () => {
    const rosaryArray = getRosaryArray(currentMystery);
    if (rosaryArray.length > 0) {
      setGlobalIndex(
        (prev) => (prev - 1 + rosaryArray.length) % rosaryArray.length
      );
      const prevPrayerId =
        rosaryArray[
          (globalIndex - 1 + rosaryArray.length) % rosaryArray.length
        ];
      const prevPrayer = getPrayerById(prevPrayerId);
      if (prevPrayer) {
        handlePrayerAndCount(prevPrayer.text, prevPrayer);
      }
    }
  };

  const handleNext = () => {
    const rosaryArray = getRosaryArray(currentMystery);
    if (rosaryArray.length > 0) {
      setGlobalIndex((prev) => (prev + 1) % rosaryArray.length);
      const nextPrayerId = rosaryArray[(globalIndex + 1) % rosaryArray.length];
      const nextPrayer = getPrayerById(nextPrayerId);
      if (nextPrayer) {
        handlePrayerAndCount(nextPrayer.text, nextPrayer);
      }
    }
  };

  const handleCloseSubBar = () => {
    setSubView(null);
    setActiveSection("none");
  };

  // Lista de tipos de misterios para el selector
  const mysteryTypes = ["gozosos", "dolorosos", "gloriosos", "luminosos"];

  // Get current rosary sequence based on mystery type
  const rosaryArray = getRosaryArray(currentMystery);
  const rosarySequence = rosaryArray
    .map((id) => getPrayerById(id))
    .filter(Boolean);

  const currentRosaryItem = rosarySequence[globalIndex];

  // Function to jump to a specific prayer while maintaining progression
  const jumpToPrayer = (prayerId) => {
    const rosaryArray = getRosaryArray(currentMystery);
    const targetIndex = rosaryArray.indexOf(prayerId);
    if (targetIndex !== -1) {
      setGlobalIndex(targetIndex);
      const prayer = getPrayerById(prayerId);
      if (prayer) {
        handlePrayerAndCount(prayer.text, prayer);
      }
    }
  };

  // Reset global index when mystery type changes
  const handleMysteryChange = () => {
    setGlobalIndex(0);
    setcurrentMystery(
      (prev) =>
        mysteryTypes[(mysteryTypes.indexOf(prev) + 1) % mysteryTypes.length]
    );
  };

  // Initialize rosary when component mounts or mystery changes
  useEffect(() => {
    const rosaryArray = getRosaryArray(currentMystery);
    if (rosaryArray.length > 0 && globalIndex === 0) {
      const firstPrayerId = rosaryArray[0];
      const firstPrayer = getPrayerById(firstPrayerId);
      if (firstPrayer) {
        handlePrayerAndCount(firstPrayer.text, firstPrayer);
      }
    }
  }, [
    currentMystery,
    globalIndex,
    getRosaryArray,
    getPrayerById,
    handlePrayerAndCount,
  ]);

  // Iconos simples (emoji)
  // Navigation buttons are ordered based on left-handed mode preference
  const navigationSegments = [
    { key: "prev", icon: "⬅️", onClick: handlePrev, disabled: false },
    {
      key: "apertura",
      icon: "🌟",
      onClick: () => handleSegmentTap("apertura"),
    },
    { key: "decada", icon: "📿", onClick: () => handleSegmentTap("decada") },
    {
      key: "misterios",
      icon: "🔮",
      onClick: () => handleSegmentTap("misterios"),
    },
    {
      key: "misterio-type",
      icon: currentMystery.charAt(0).toUpperCase(),
      onClick: handleMysteryChange,
    },
    { key: "cierre", icon: "✨", onClick: () => handleSegmentTap("cierre") },
    { key: "next", icon: "➡️", onClick: handleNext, disabled: false },
  ];

  // Reverse button order for left-handed mode (Next button on left side)
  const segments = leftHandedMode 
    ? [...navigationSegments].reverse() 
    : navigationSegments;
  return (
    <div className="segmented-bar">
      <div className="segments-container">
        {segments.map(({ key, icon, onClick, disabled }) => (
          <button
            key={key}
            onClick={onClick}
            className={`segment-btn ${activeSection === key ? "active" : ""} ${
              disabled ? "disabled" : ""
            }`}
            disabled={disabled}
          >
            <span className="icon">{icon}</span>
            {activeSection === key && (
              <span className="label">
                {getSectionItems(key)?.[cycleIndex]?.title?.slice(0, 3) || ""}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-bar para misterios específicos */}
      {subView === "misterios" && (
        <div className="sub-bar active">
          <button
            className="close-btn"
            onClick={handleCloseSubBar}
            title="Cerrar"
          >
            ✕
          </button>
          {prayers.mysteries?.[currentMystery]?.map((prayer, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCycleIndex(idx);
                jumpToPrayer(prayer.id);
                setSubView(null); // Close sub-bar after selection
              }}
              className={`sub-btn ${cycleIndex === idx ? "active" : ""}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Preview actual oración */}
      <div className="preview">
        {currentRosaryItem?.title || "Listo para rezar"}
      </div>

      {/* Botones adicionales */}
      <div className="additional-controls">
        <button onClick={reset} className="control-btn">
          Reset
        </button>
        <LeftHandedToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
export default PrayerButtons;
