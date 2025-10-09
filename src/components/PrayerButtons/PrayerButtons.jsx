import ThemeToggle from "../common/ThemeToggle";
import "./PrayerButtons.css";
import { useState, useEffect, useCallback } from "react";
import soundEffects from "../../utils/soundEffects";

function PrayerButtons({
  prayers,
  setPrayer,
  reset,
  countUp,
  setPrayerImg,
  currentMystery,
  setcurrentMystery,
  scrollControlRef,
  jumpToPrayer,
  currentPrayerIndex,
}) {
  // Estados para la botonera segmentada
  const [activeSection, setActiveSection] = useState("none");
  const [cycleIndex, setCycleIndex] = useState(0);
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

  /**
   * Handle Previous button - scroll up first, then navigate to previous prayer
   * Implements scroll-first behavior with sound feedback
   */
  const handlePrev = () => {
    // Check if we can scroll up first
    if (scrollControlRef?.current?.canScrollUp()) {
      // Still can scroll up - just scroll
      scrollControlRef.current.scrollUp();
      soundEffects.playScrollSound();
      return;
    }
    
    // At the top - play end sound to indicate we'll change prayer
    soundEffects.playEndSound();
    
    // Small delay to let user hear the end sound
    setTimeout(() => {
      const rosaryArray = getRosaryArray(currentMystery);
      if (rosaryArray.length > 0) {
        const prevIndex = (currentPrayerIndex - 1 + rosaryArray.length) % rosaryArray.length;
        const prevPrayerId = rosaryArray[prevIndex];
        const prevPrayer = getPrayerById(prevPrayerId);
        if (prevPrayer) {
          // Use jumpToPrayer to keep state in sync
          jumpToPrayer(prevPrayerId);
          handlePrayerAndCount(prevPrayer.text, prevPrayer);
          // Reset scroll to bottom when moving to previous prayer
          setTimeout(() => {
            if (scrollControlRef?.current) {
              // Scroll to bottom for previous prayer
              const scrollContainer = document.querySelector('.page-left');
              if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
              }
            }
          }, 100);
          soundEffects.playPageTurnSound();
        }
      }
    }, 200);
  };

  /**
   * Handle Next button - scroll down first, then navigate to next prayer
   * Implements scroll-first behavior with sound feedback
   */
  const handleNext = () => {
    // Check if we can scroll down first
    if (scrollControlRef?.current?.canScrollDown()) {
      // Still can scroll down - just scroll
      scrollControlRef.current.scrollDown();
      soundEffects.playScrollSound();
      return;
    }
    
    // At the bottom - play end sound to indicate we'll change prayer
    soundEffects.playEndSound();
    
    // Small delay to let user hear the end sound
    setTimeout(() => {
      const rosaryArray = getRosaryArray(currentMystery);
      if (rosaryArray.length > 0) {
        const nextIndex = (currentPrayerIndex + 1) % rosaryArray.length;
        const nextPrayerId = rosaryArray[nextIndex];
        const nextPrayer = getPrayerById(nextPrayerId);
        if (nextPrayer) {
          // Use jumpToPrayer to keep state in sync
          jumpToPrayer(nextPrayerId);
          handlePrayerAndCount(nextPrayer.text, nextPrayer);
          // Reset scroll to top when moving to next prayer
          setTimeout(() => {
            scrollControlRef?.current?.resetScroll();
          }, 100);
          soundEffects.playPageTurnSound();
        }
      }
    }, 200);
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

  const currentRosaryItem = rosarySequence[currentPrayerIndex];

  // Reset to first prayer when mystery type changes
  const handleMysteryChange = () => {
    const newMystery = mysteryTypes[(mysteryTypes.indexOf(currentMystery) + 1) % mysteryTypes.length];
    setcurrentMystery(newMystery);
    // Jump to first prayer of new mystery
    setTimeout(() => {
      const rosaryArray = getRosaryArray(newMystery);
      if (rosaryArray.length > 0) {
        jumpToPrayer(rosaryArray[0]);
        const firstPrayer = getPrayerById(rosaryArray[0]);
        if (firstPrayer) {
          handlePrayerAndCount(firstPrayer.text, firstPrayer);
        }
      }
    }, 100);
  };

  // Initialize rosary when component mounts
  useEffect(() => {
    const rosaryArray = getRosaryArray(currentMystery);
    if (rosaryArray.length > 0 && currentPrayerIndex === 0) {
      const firstPrayerId = rosaryArray[0];
      const firstPrayer = getPrayerById(firstPrayerId);
      if (firstPrayer) {
        handlePrayerAndCount(firstPrayer.text, firstPrayer);
      }
    }
  }, [
    currentMystery,
    currentPrayerIndex,
    getRosaryArray,
    getPrayerById,
    handlePrayerAndCount,
  ]);

  // Iconos simples (emoji)
  const segments = [
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
        <ThemeToggle />
      </div>
    </div>
  );
}
export default PrayerButtons;
