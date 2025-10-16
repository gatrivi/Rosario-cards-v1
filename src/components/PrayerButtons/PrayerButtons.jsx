import "./PrayerButtons.css";
import { useState, useEffect, useCallback, useRef } from "react";
function PrayerButtons({
  prayers,
  setPrayer,
  reset,
  countUp,
  setPrayerImg,
  currentMystery,
  setcurrentMystery,
  jumpToPrayer,
  currentPrayerIndex,
  navigateToIndex,
  getRosarySequence,
  leftHandedMode = false,
  // Litany-specific props
  isInLitany = false,
  nextLitanyVerse = () => false,
  prevLitanyVerse = () => false,
}) {
  // Estados para la botonera segmentada
  const [activeSection, setActiveSection] = useState("none");
  const [cycleIndex, setCycleIndex] = useState(0);
  const [subView, setSubView] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const touchTimer = useRef(null);

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

      // Improved image selection logic with proper fallback
      const theme = localStorage.getItem("theme");
      const isDark = theme === "dark";
      const selectedImage =
        isDark && prayerImg.imgmo ? prayerImg.imgmo : prayerImg.img;
      setPrayerImg(selectedImage);

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
        handleJumpToPrayer(item.id);
      }
    } else {
      // Nuevo: Entra modo
      setActiveSection(section);
      setCycleIndex(0);
      const items = getSectionItems(section);
      if (items.length > 0) {
        const item = items[0];
        // Jump to this prayer in the rosary sequence
        handleJumpToPrayer(item.id);
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
    // If in litany, navigate through litany verses
    if (isInLitany) {
      const moved = prevLitanyVerse();
      if (!moved) {
        // If at beginning of litany, go to previous prayer
        const rosaryArray = getRosarySequence();
        if (rosaryArray.length > 0) {
          const prevIndex =
            (currentPrayerIndex - 1 + rosaryArray.length) % rosaryArray.length;
          const result = navigateToIndex(prevIndex);
          if (result) {
            setPrayer(result.prayer);
            const theme = localStorage.getItem("theme");
            const isDark = theme === "dark";
            const prayerObj = result.prayerImg;
            const selectedImage =
              isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
            setPrayerImg(selectedImage);
          }
        }
      }
    } else {
      // Normal prayer navigation
      const rosaryArray = getRosarySequence();
      if (rosaryArray.length > 0) {
        const prevIndex =
          (currentPrayerIndex - 1 + rosaryArray.length) % rosaryArray.length;
        const result = navigateToIndex(prevIndex);
        if (result) {
          setPrayer(result.prayer);
          const theme = localStorage.getItem("theme");
          const isDark = theme === "dark";
          const prayerObj = result.prayerImg;
          const selectedImage =
            isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
          setPrayerImg(selectedImage);
        }
      }
    }
  };

  const handleNext = () => {
    // If in litany, navigate through litany verses
    if (isInLitany) {
      const moved = nextLitanyVerse();
      if (!moved) {
        // If at end of litany, go to next prayer
        const rosaryArray = getRosarySequence();
        if (rosaryArray.length > 0) {
          const nextIndex = (currentPrayerIndex + 1) % rosaryArray.length;
          const result = navigateToIndex(nextIndex);
          if (result) {
            setPrayer(result.prayer);
            const theme = localStorage.getItem("theme");
            const isDark = theme === "dark";
            const prayerObj = result.prayerImg;
            const selectedImage =
              isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
            setPrayerImg(selectedImage);
          }
        }
      }
    } else {
      // Normal prayer navigation
      const rosaryArray = getRosarySequence();
      if (rosaryArray.length > 0) {
        const nextIndex = (currentPrayerIndex + 1) % rosaryArray.length;
        const result = navigateToIndex(nextIndex);
        if (result) {
          setPrayer(result.prayer);
          const theme = localStorage.getItem("theme");
          const isDark = theme === "dark";
          const prayerObj = result.prayerImg;
          const selectedImage =
            isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
          setPrayerImg(selectedImage);
        }
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
  const rosaryArray = getRosarySequence();
  const rosarySequence = rosaryArray
    .map((id) => getPrayerById(id))
    .filter(Boolean);

  const currentRosaryItem = rosarySequence[currentPrayerIndex];

  // Function to jump to a specific prayer while maintaining progression
  const handleJumpToPrayer = (prayerId) => {
    const rosaryArray = getRosarySequence();
    const targetIndex = rosaryArray.indexOf(prayerId);
    if (targetIndex !== -1) {
      const result = navigateToIndex(targetIndex);
      if (result) {
        setPrayer(result.prayer);

        // Handle theme-based image selection
        const theme = localStorage.getItem("theme");
        const isDark = theme === "dark";
        const prayerObj = result.prayerImg;
        const selectedImage =
          isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
        setPrayerImg(selectedImage);
      }
    }
  };

  // Reset index when mystery type changes
  const handleMysteryChange = () => {
    setcurrentMystery(
      (prev) =>
        mysteryTypes[(mysteryTypes.indexOf(prev) + 1) % mysteryTypes.length]
    );
  };

  // Initialize rosary when component mounts or mystery changes
  useEffect(() => {
    const rosaryArray = getRosarySequence();
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
    getRosarySequence,
    getPrayerById,
    handlePrayerAndCount,
  ]);

  // Touch handlers for mobile tooltips
  const handleTouchStart = (buttonKey) => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => {
      setActiveTooltip(buttonKey);
    }, 500); // Show after 500ms hold
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    // Keep tooltip visible for 2 seconds
    if (activeTooltip) {
      setTimeout(() => setActiveTooltip(null), 2000);
    }
  };

  // Button descriptions for tooltips
  const buttonDescriptions = {
    prev: "Previous Prayer",
    apertura: "Opening Prayers",
    decada: "Decade Prayers",
    misterios: "Select Mystery",
    "misterio-type": "Cycle Mystery Type",
    cierre: "Closing Prayers",
    next: "Next Prayer",
  };

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

  // Calculate progress using existing rosaryArray
  const totalPrayers = rosaryArray.length;
  const progress =
    totalPrayers > 0 ? ((currentPrayerIndex + 1) / totalPrayers) * 100 : 0;

  return (
    <div className="segmented-bar">
      <div className="segments-container">
        {/* Progress bar row */}
        <div className="progress-row">
          <div className="integrated-progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-text">
              {currentPrayerIndex + 1}/{totalPrayers} ({Math.round(progress)}%)
            </div>
          </div>
        </div>

        {/* Navigation buttons row */}
        <div className="navigation-row">
          {segments.map(({ key, icon, onClick, disabled }) => (
            <button
              key={key}
              onClick={onClick}
              onTouchStart={() => handleTouchStart(key)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={`segment-btn ${
                activeSection === key ? "active" : ""
              } ${disabled ? "disabled" : ""}`}
              disabled={disabled}
              data-tooltip={buttonDescriptions[key]}
              aria-label={buttonDescriptions[key]}
              style={{ position: "relative" }}
            >
              <span className="icon">{icon}</span>
              {activeTooltip === key && (
                <div className="mobile-tooltip">{buttonDescriptions[key]}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-bar para misterios específicos */}
      {subView === "misterios" &&
        (() => {
          // Filter out string entries (default images) to get only mystery objects
          const validMysteries =
            prayers.mysteries?.[currentMystery]?.filter(
              (m) => typeof m === "object" && m.id && m.title
            ) || [];

          const mysteryTypeNames = {
            gozosos: "Misterios Gozosos",
            dolorosos: "Misterios Dolorosos",
            gloriosos: "Misterios Gloriosos",
            luminosos: "Misterios Luminosos",
          };

          return (
            <div className="sub-bar active">
              <button
                className="close-btn"
                onClick={handleCloseSubBar}
                title="Cerrar"
              >
                ✕
              </button>

              {/* Mystery section title */}
              <div className="sub-bar-title">
                {mysteryTypeNames[currentMystery]}
              </div>

              {validMysteries.map((mystery, idx) => {
                const isDark = localStorage.getItem("theme") === "dark";
                const thumbnailSrc =
                  isDark && mystery.imgmo ? mystery.imgmo : mystery.img;

                // Extract short name from title (e.g., "MG1: La Anunciación..." -> "La Anunciación")
                const shortName =
                  mystery.title.split(":")[1]?.trim() || mystery.title;

                // Check if this mystery has been visited
                const rosaryArray = getRosarySequence();
                const mysteryStartIndex = rosaryArray.findIndex(
                  (id) => id === mystery.id
                );
                const isVisited = currentPrayerIndex > mysteryStartIndex;

                return (
                  <button
                    key={mystery.id}
                    onClick={() => {
                      setCycleIndex(idx);
                      handleJumpToPrayer(mystery.id);
                      setSubView(null);
                    }}
                    className={`sub-btn ${cycleIndex === idx ? "active" : ""}`}
                  >
                    <img
                      src={thumbnailSrc}
                      alt={shortName}
                      style={{
                        filter: isVisited ? "none" : "grayscale(100%)",
                        opacity: isVisited ? 1 : 0.7,
                        transition: "filter 0.3s ease, opacity 0.3s ease",
                      }}
                    />
                    <div className="mystery-name">{shortName}</div>
                  </button>
                );
              })}
            </div>
          );
        })()}

      {/* Preview actual oración - moved inside bar to prevent off-screen */}
    </div>
  );
}
export default PrayerButtons;
