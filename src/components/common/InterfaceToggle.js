import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import PrayerVisibilityMode from "./PrayerVisibilityMode";

/**
 * InterfaceToggle Component
 *
 * Provides a toggle button to hide/show rosary and counters for a clean, distraction-free interface
 * Perfect for users who want to focus solely on prayer without visual distractions
 *
 * Features:
 * - Toggle between full interface and clean prayer mode
 * - Visual indicator of current mode
 * - Smooth transitions between states
 * - Accessible design with proper ARIA labels
 *
 * @param {boolean} showRosary - Whether to show the interactive rosary
 * @param {boolean} showCounters - Whether to show prayer counters
 * @param {function} onToggleRosary - Callback to toggle rosary visibility
 * @param {function} onToggleCounters - Callback to toggle counters visibility
 * @param {string} className - Additional CSS classes for styling
 */
const InterfaceToggle = ({
  showRosary = true,
  showCounters = true,
  onToggleRosary,
  onToggleCounters,
  leftHandedMode = false,
  setLeftHandedMode = () => {},
  focusMode = false,
  onToggleFocusMode = () => {},
  onEnterFocusMode = () => {},
  onExitFocusMode = () => {},
  onReset = () => {}, // NEW: Reset counter function
  onResetRosary = () => {}, // NEW: Reset rosary function
  showDetailedProgress = false,
  onToggleDetailedProgress = () => {},
  developerMode = false,
  onToggleDeveloperMode = () => {},
  showProgressBar = true,
  onToggleProgressBar = () => {},
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem("fontSize") || "medium";
    } catch (error) {
      console.warn("localStorage not available:", error);
      return "medium";
    }
  });

  const [rosaryZoom, setRosaryZoom] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("rosaryZoom")) || 1.0;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return 1.0;
    }
  });

  const [prayerTextOpacity, setPrayerTextOpacity] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("prayerTextOpacity")) || 1.0;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return 1.0;
    }
  });

  const [rosaryOpacity, setRosaryOpacity] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("rosaryOpacity")) || 1.0;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return 1.0;
    }
  });

  // Rosary friction state (air resistance - controls coasting time)
  // Lower values = longer coasting (0.001-0.1 range, default 0.05)
  const [rosaryFriction, setRosaryFriction] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("rosaryFriction")) || 0.05;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return 0.05;
    }
  });

  const [showHelpButton, setShowHelpButton] = useState(() => {
    try {
      return localStorage.getItem("showHelpButton") !== "false";
    } catch (error) {
      return true;
    }
  });

  const [showZoomButtons, setShowZoomButtons] = useState(() => {
    try {
      return localStorage.getItem("showZoomButtons") !== "false";
    } catch (error) {
      return true;
    }
  });

  // Initialize font size on mount
  useEffect(() => {
    const multiplier = getFontSizeMultiplier(fontSize);
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      multiplier
    );
  }, [fontSize]);

  /**
   * Toggle the expanded state of the control panel
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Handle individual toggle for rosary visibility
   */
  const handleRosaryToggle = () => {
    if (onToggleRosary) {
      onToggleRosary();
    }
  };

  /**
   * Handle individual toggle for counters visibility
   */
  const handleCountersToggle = () => {
    if (onToggleCounters) {
      onToggleCounters();
    }
  };

  /**
   * Toggle all interface elements at once
   */
  const handleToggleAll = () => {
    const allVisible = showRosary && showCounters;
    if (onToggleRosary) onToggleRosary(!allVisible);
    if (onToggleCounters) onToggleCounters(!allVisible);
  };

  /**
   * Handle left-handed mode toggle
   */
  const handleLeftHandedToggle = () => {
    const newMode = !leftHandedMode;
    setLeftHandedMode(newMode);
    try {
      localStorage.setItem("leftHandedMode", newMode.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("leftHandedModeChange", {
        detail: { leftHandedMode: newMode },
      })
    );
  };

  /**
   * Handle font size change
   */
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    try {
      localStorage.setItem("fontSize", newSize);
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
    // Apply font size to document
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      getFontSizeMultiplier(newSize)
    );
    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("fontSizeChange", {
        detail: { fontSize: newSize },
      })
    );
  };

  /**
   * Handle rosary zoom change
   */
  const handleRosaryZoomChange = (zoom) => {
    setRosaryZoom(zoom);
    try {
      localStorage.setItem("rosaryZoom", zoom.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // Dispatch event for InteractiveRosary to listen
    window.dispatchEvent(
      new CustomEvent("rosaryZoomChange", {
        detail: { zoom },
      })
    );
  };

  /**
   * Handle prayer text opacity change
   */
  const handlePrayerTextOpacityChange = (opacity) => {
    setPrayerTextOpacity(opacity);
    try {
      localStorage.setItem("prayerTextOpacity", opacity.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // Dispatch event for other components to listen
    window.dispatchEvent(
      new CustomEvent("prayerTextOpacityChange", {
        detail: { opacity },
      })
    );
  };

  /**
   * Handle rosary opacity change
   */
  const handleRosaryOpacityChange = (opacity) => {
    setRosaryOpacity(opacity);
    try {
      localStorage.setItem("rosaryOpacity", opacity.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // Dispatch event for InteractiveRosary to listen
    window.dispatchEvent(
      new CustomEvent("rosaryOpacityChange", {
        detail: { opacity },
      })
    );
  };

  /**
   * Handle rosary friction change (air resistance)
   */
  const handleRosaryFrictionChange = (friction) => {
    setRosaryFriction(friction);
    try {
      localStorage.setItem("rosaryFriction", friction.toString());
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // Dispatch event for InteractiveRosary to listen
    window.dispatchEvent(
      new CustomEvent("rosaryFrictionChange", {
        detail: { friction },
      })
    );
  };

  /**
   * Get font size multiplier based on size name
   */
  const getFontSizeMultiplier = (size) => {
    const multipliers = {
      small: "0.8",
      medium: "1.0",
      large: "1.2",
      xlarge: "1.4",
    };
    return multipliers[size] || "1.0";
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Settings shortcut: Ctrl+, or Cmd+,
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        setIsExpanded(!isExpanded);
      }

      // Escape to close settings
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isExpanded]);

  return (
    <div
      className={`interface-toggle ${className}`}
      style={{
        position: "fixed",
        top: showProgressBar ? "70px" : "10px",
        left: "10px",
        zIndex: 20,
        transition: "top 0.3s ease",
      }}
    >
      {/* Main toggle button */}
      <button
        onClick={toggleExpanded}
        className="main-toggle-btn"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(8px)",
          color: "var(--text-color)",
          border: "2px solid var(--glass-border)",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          fontFamily: "Cloister Black, serif",
          fontWeight: "bold",
        }}
        title="Toggle Interface Controls"
        aria-label="Toggle interface controls"
      >
        {isExpanded ? "✕" : "⚙️"}
      </button>

      {/* Expanded control panel - Sidebar */}
      {isExpanded && (
        <div
          className="control-panel-sidebar"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "min(320px, 85vw)",
            height: "100vh",
            background: "var(--glass-bg)",
            backdropFilter: "blur(12px)",
            color: "var(--text-color)",
            boxShadow: "4px 0 32px rgba(0, 0, 0, 0.5)",
            border: "none",
            borderRight: "2px solid var(--glass-border)",
            fontFamily: "Cloister Black, serif",
            zIndex: 10001,
            overflowY: "auto",
            animation: "slideInLeft 0.3s ease-out",
          }}
        >
          {/* Header with title and close button on same line */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 20px",
              borderBottom: "2px solid var(--glass-border)",
              background:
                "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(139, 0, 0, 0.1))",
              position: "sticky",
              top: "0",
              zIndex: 1,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                color: "var(--catholic-gold)",
                fontSize: "16px",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              ⚙️ Controles
            </div>
            <button
              onClick={toggleExpanded}
              style={{
                background: "transparent",
                border: "2px solid var(--glass-border)",
                borderRadius: "50%",
                color: "var(--catholic-gold)",
                width: "35px",
                height: "35px",
                cursor: "pointer",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              title="Cerrar configuración"
            >
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ padding: "20px" }}>
            {/* Toggle All Button */}
            <button
              onClick={handleToggleAll}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                background:
                  showRosary && showCounters
                    ? "linear-gradient(135deg, var(--catholic-red), #8b0000)"
                    : "linear-gradient(135deg, var(--catholic-gold), var(--catholic-blue))",
                color: "var(--catholic-white)",
                border: "2px solid var(--glass-border)",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              }}
              title={
                showRosary && showCounters
                  ? "Ocultar todos los elementos de la interfaz"
                  : "Mostrar todos los elementos de la interfaz"
              }
            >
              {showRosary && showCounters
                ? "🙈 Ocultar Todo"
                : "👁️ Mostrar Todo"}
            </button>

            {/* Individual toggles */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Interactive Rosary Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  transition: "all 0.3s ease",
                }}
                title="Muestra u oculta el rosario interactivo con físicas"
              >
                <input
                  type="checkbox"
                  checked={showRosary}
                  onChange={handleRosaryToggle}
                  style={{
                    marginRight: "12px",
                    transform: "scale(1.2)",
                    accentColor: "var(--catholic-gold)",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  📿 Rosario Interactivo
                </span>
              </label>

              {/* Counters Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  transition: "all 0.3s ease",
                }}
                title="Muestra u oculta los contadores de oraciones rezadas"
              >
                <input
                  type="checkbox"
                  checked={showCounters}
                  onChange={handleCountersToggle}
                  style={{
                    marginRight: "12px",
                    transform: "scale(1.2)",
                    accentColor: "var(--catholic-gold)",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  📊 Contadores
                </span>
              </label>

              {/* Left-Handed Mode Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  transition: "all 0.3s ease",
                }}
                title="Mueve los controles al lado derecho para personas zurdas"
              >
                <input
                  type="checkbox"
                  checked={leftHandedMode}
                  onChange={handleLeftHandedToggle}
                  style={{
                    marginRight: "12px",
                    transform: "scale(1.2)",
                    accentColor: "var(--catholic-gold)",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  👈 Modo Zurdo
                </span>
              </label>

              {/* Detailed Progress Bar Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  transition: "all 0.3s ease",
                }}
                title="Muestra miniaturas de los misterios en la barra de progreso"
              >
                <input
                  type="checkbox"
                  checked={showDetailedProgress}
                  onChange={onToggleDetailedProgress}
                  style={{
                    marginRight: "12px",
                    transform: "scale(1.2)",
                    accentColor: "var(--catholic-gold)",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  📊 Progreso Detallado
                </span>
              </label>

              {/* Rosary Progress Bar Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  transition: "all 0.3s ease",
                }}
                title="Muestra la barra de progreso del rosario en la parte superior"
              >
                <input
                  type="checkbox"
                  checked={showProgressBar}
                  onChange={onToggleProgressBar}
                  style={{
                    marginRight: "12px",
                    transform: "scale(1.2)",
                    accentColor: "var(--catholic-gold)",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  🏆 Barra de Progreso
                </span>
              </label>

              {/* Developer Mode Toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  transition: "all 0.3s ease",
                }}
                title="Modo desarrollador: muestra información técnica y debug"
              >
                <input
                  type="checkbox"
                  checked={developerMode}
                  onChange={onToggleDeveloperMode}
                  style={{
                    marginRight: "12px",
                    transform: "scale(1.2)",
                    accentColor: "var(--catholic-gold)",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  🔧 Modo Desarrollador
                </span>
              </label>

              {/* Focus Mode Controls */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                }}
                title="Modo enfocado: solo muestra la imagen del misterio para meditación profunda"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  🎯 Modo Enfocado
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    onClick={onToggleFocusMode}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: focusMode
                        ? "2px solid var(--catholic-gold)"
                        : "1px solid var(--glass-border)",
                      background: focusMode
                        ? "linear-gradient(135deg, var(--catholic-gold), var(--catholic-red))"
                        : "var(--glass-bg)",
                      color: focusMode
                        ? "var(--catholic-white)"
                        : "var(--text-color)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title={
                      focusMode
                        ? "Mostrar texto de oración"
                        : "Ocultar texto, solo imagen"
                    }
                  >
                    {focusMode ? "📖 Ver Texto" : "🎯 Enfocar"}
                  </button>
                  <button
                    onClick={focusMode ? onExitFocusMode : onEnterFocusMode}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--glass-border)",
                      background: "var(--glass-bg)",
                      color: "var(--text-color)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title={
                      focusMode
                        ? "Salir del modo enfocado"
                        : "Entrar al modo enfocado"
                    }
                  >
                    {focusMode ? "❌ Salir" : "▶️ Entrar"}
                  </button>
                </div>
              </div>

              {/* Font Size Control */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                }}
                title="Ajusta el tamaño del texto de las oraciones"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  🔤 Tamaño de Letra
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { key: "small", label: "S", title: "Pequeño" },
                    { key: "medium", label: "M", title: "Mediano" },
                    { key: "large", label: "L", title: "Grande" },
                    { key: "xlarge", label: "XL", title: "Extra Grande" },
                  ].map(({ key, label, title }) => (
                    <button
                      key={key}
                      onClick={() => handleFontSizeChange(key)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border:
                          fontSize === key
                            ? "2px solid var(--catholic-gold)"
                            : "1px solid var(--glass-border)",
                        background:
                          fontSize === key
                            ? "linear-gradient(135deg, var(--catholic-gold), var(--catholic-red))"
                            : "var(--glass-bg)",
                        color:
                          fontSize === key
                            ? "var(--catholic-white)"
                            : "var(--text-color)",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        title: title,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prayer Visibility Mode */}
              <PrayerVisibilityMode
                onModeChange={(mode) => {
                  console.log("Prayer visibility mode changed:", mode);
                  // Dispatch event for other components to listen
                  window.dispatchEvent(
                    new CustomEvent("prayerVisibilityModeChange", {
                      detail: { mode },
                    })
                  );
                }}
                onCustomSettingsChange={(settings) => {
                  console.log("Custom prayer settings changed:", settings);
                  // Dispatch event for other components to listen
                  window.dispatchEvent(
                    new CustomEvent("customPrayerVisibilityChange", {
                      detail: { settings },
                    })
                  );
                }}
              />

              {/* Rosary Zoom Control */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  marginTop: "8px",
                }}
                title="Ajusta el tamaño del rosario interactivo (50% - 250%)"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  🔍 Zoom del Rosario
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    onClick={() =>
                      handleRosaryZoomChange(Math.max(0.5, rosaryZoom - 0.1))
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Reducir zoom"
                  >
                    −
                  </button>
                  <span style={{ fontSize: "12px", color: "#666" }}>50%</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={rosaryZoom}
                    onChange={(e) =>
                      handleRosaryZoomChange(parseFloat(e.target.value))
                    }
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "rgba(212, 175, 55, 0.3)",
                      borderRadius: "3px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#666" }}>250%</span>
                  <button
                    onClick={() =>
                      handleRosaryZoomChange(Math.min(2.5, rosaryZoom + 0.1))
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Aumentar zoom"
                  >
                    +
                  </button>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--catholic-gold)",
                      minWidth: "35px",
                      textAlign: "center",
                    }}
                  >
                    {Math.round(rosaryZoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Prayer Text Opacity Control */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  marginTop: "8px",
                }}
                title="Controla la transparencia del texto de oraciones (10% - 100%)"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  📝 Opacidad del Texto
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    onClick={() =>
                      handlePrayerTextOpacityChange(
                        Math.max(0.1, prayerTextOpacity - 0.1)
                      )
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Reducir opacidad"
                  >
                    −
                  </button>
                  <span style={{ fontSize: "12px", color: "#666" }}>10%</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={prayerTextOpacity}
                    onChange={(e) =>
                      handlePrayerTextOpacityChange(parseFloat(e.target.value))
                    }
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "rgba(212, 175, 55, 0.3)",
                      borderRadius: "3px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#666" }}>100%</span>
                  <button
                    onClick={() =>
                      handlePrayerTextOpacityChange(
                        Math.min(1.0, prayerTextOpacity + 0.1)
                      )
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Aumentar opacidad"
                  >
                    +
                  </button>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--catholic-gold)",
                      minWidth: "35px",
                      textAlign: "center",
                    }}
                  >
                    {Math.round(prayerTextOpacity * 100)}%
                  </span>
                </div>
              </div>

              {/* Rosary Opacity Control */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  marginTop: "8px",
                }}
                title="Controla la transparencia del rosario (10% - 100%)"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  📿 Opacidad del Rosario
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    onClick={() =>
                      handleRosaryOpacityChange(
                        Math.max(0.1, rosaryOpacity - 0.1)
                      )
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Reducir opacidad"
                  >
                    −
                  </button>
                  <span style={{ fontSize: "12px", color: "#666" }}>10%</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={rosaryOpacity}
                    onChange={(e) =>
                      handleRosaryOpacityChange(parseFloat(e.target.value))
                    }
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "rgba(212, 175, 55, 0.3)",
                      borderRadius: "3px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#666" }}>100%</span>
                  <button
                    onClick={() =>
                      handleRosaryOpacityChange(
                        Math.min(1.0, rosaryOpacity + 0.1)
                      )
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Aumentar opacidad"
                  >
                    +
                  </button>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--catholic-gold)",
                      minWidth: "35px",
                      textAlign: "center",
                    }}
                  >
                    {Math.round(rosaryOpacity * 100)}%
                  </span>
                </div>
              </div>

              {/* Rosary Friction Control */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  marginTop: "8px",
                }}
                title="Controla cuánto tiempo el rosario sigue moviéndose después de soltarlo (menor valor = movimiento más largo)"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  🌊 Fricción del Rosario
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    onClick={() =>
                      handleRosaryFrictionChange(
                        Math.max(0.001, rosaryFriction - 0.01)
                      )
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Reducir fricción (más movimiento)"
                  >
                    −
                  </button>
                  <span style={{ fontSize: "11px", color: "#666" }}>Más</span>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={rosaryFriction}
                    onChange={(e) =>
                      handleRosaryFrictionChange(parseFloat(e.target.value))
                    }
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "rgba(212, 175, 55, 0.3)",
                      borderRadius: "3px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#666" }}>Menos</span>
                  <button
                    onClick={() =>
                      handleRosaryFrictionChange(
                        Math.min(0.1, rosaryFriction + 0.01)
                      )
                    }
                    style={{
                      background: "rgba(212, 175, 55, 0.3)",
                      border: "1px solid var(--catholic-gold)",
                      borderRadius: "4px",
                      color: "var(--catholic-gold)",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    title="Aumentar fricción (menos movimiento)"
                  >
                    +
                  </button>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--catholic-gold)",
                      minWidth: "45px",
                      textAlign: "center",
                    }}
                  >
                    {(rosaryFriction * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* UI Elements Toggle */}
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  marginTop: "8px",
                }}
                title="Controla la visibilidad de botones de interfaz"
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  🔘 Elementos de UI
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* Help Button Toggle */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.2)",
                    }}
                    title="Muestra u oculta el botón de ayuda en la esquina superior"
                  >
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                      ❓ Botón de Ayuda
                    </span>
                    <button
                      onClick={() => {
                        const newValue = !showHelpButton;
                        setShowHelpButton(newValue);
                        try {
                          localStorage.setItem(
                            "showHelpButton",
                            newValue.toString()
                          );
                        } catch (error) {
                          console.warn("localStorage not available:", error);
                        }
                        // Dispatch event to toggle help button visibility
                        window.dispatchEvent(
                          new CustomEvent("toggleHelpButton", {
                            detail: { visible: newValue },
                          })
                        );
                      }}
                      style={{
                        background: showHelpButton
                          ? "linear-gradient(135deg, var(--catholic-gold), var(--catholic-blue))"
                          : "rgba(128, 128, 128, 0.3)",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 16px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        minWidth: "60px",
                      }}
                    >
                      {showHelpButton ? "Visible" : "Oculto"}
                    </button>
                  </div>

                  {/* Zoom Button Toggle */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.2)",
                    }}
                    title="Muestra u oculta los controles externos de zoom (reservado)"
                  >
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                      🔍 Controles de Zoom
                    </span>
                    <button
                      onClick={() => {
                        const newValue = !showZoomButtons;
                        setShowZoomButtons(newValue);
                        try {
                          localStorage.setItem(
                            "showZoomButtons",
                            newValue.toString()
                          );
                        } catch (error) {
                          console.warn("localStorage not available:", error);
                        }
                        // Note: Zoom controls are within this panel, this is for future external zoom controls
                      }}
                      style={{
                        background: showZoomButtons
                          ? "linear-gradient(135deg, var(--catholic-gold), var(--catholic-blue))"
                          : "rgba(128, 128, 128, 0.3)",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 16px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        minWidth: "60px",
                      }}
                    >
                      {showZoomButtons ? "Visible" : "Oculto"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid var(--glass-border)",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "12px",
                    color: "var(--catholic-gold)",
                  }}
                >
                  🎬 Acciones
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* Reset Counter Button */}
                  <button
                    onClick={onReset}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid var(--glass-border)",
                      background: "var(--glass-bg)",
                      color: "var(--text-color)",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, var(--catholic-gold), var(--catholic-red))";
                      e.target.style.color = "var(--catholic-white)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "var(--glass-bg)";
                      e.target.style.color = "var(--text-color)";
                    }}
                    title="Reinicia el contador de oraciones al principio"
                  >
                    🔄 Reiniciar Contador
                  </button>

                  {/* Start Fresh Rosary Button */}
                  <button
                    onClick={onResetRosary}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid var(--glass-border)",
                      background: "var(--glass-bg)",
                      color: "var(--text-color)",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, var(--catholic-blue), var(--catholic-gold))";
                      e.target.style.color = "var(--catholic-white)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "var(--glass-bg)";
                      e.target.style.color = "var(--text-color)";
                    }}
                    title="Comienza un nuevo rosario desde el inicio"
                  >
                    🌟 Rosario Nuevo
                  </button>

                  {/* Reset Rosary Position Button */}
                  <button
                    onClick={() => {
                      // Dispatch event to reset rosary position
                      window.dispatchEvent(
                        new CustomEvent("resetRosaryPosition", {
                          detail: { x: 0, y: 0 },
                        })
                      );
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid var(--glass-border)",
                      background: "var(--glass-bg)",
                      color: "var(--text-color)",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, var(--catholic-gold), var(--catholic-blue))";
                      e.target.style.color = "var(--catholic-white)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "var(--glass-bg)";
                      e.target.style.color = "var(--text-color)";
                    }}
                    title="Centra el rosario en la pantalla"
                  >
                    📍 Centrar Rosario
                  </button>

                  {/* Theme Toggle */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.2)",
                    }}
                    title="Cambia entre tema oscuro y claro"
                  >
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                      🌙 Tema
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>

            {/* Help text */}
            <div
              style={{
                marginTop: "15px",
                fontSize: "11px",
                color: "var(--catholic-gold)",
                fontStyle: "italic",
                borderTop: "2px solid var(--glass-border)",
                paddingTop: "12px",
                textAlign: "center",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              💡 Consejo: Presiona Ctrl+, para abrir/cerrar
            </div>
          </div>
          {/* End scrollable content */}

          {/* CSS Animation */}
          <style>
            {`
              @keyframes slideInLeft {
                from {
                  transform: translateX(-100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            `}
          </style>
        </div>
      )}

      {/* Backdrop overlay when sidebar is open */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 10000,
            backdropFilter: "blur(2px)",
          }}
          onClick={toggleExpanded}
        />
      )}
    </div>
  );
};

export default InterfaceToggle;
