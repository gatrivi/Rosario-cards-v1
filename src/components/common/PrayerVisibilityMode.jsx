import React, { useState, useEffect } from "react";
import "./PrayerVisibilityMode.css";

/**
 * PrayerVisibilityMode Component
 *
 * Provides four different prayer visibility modes to accommodate different user types:
 * 1. Full - Shows all prayers (current behavior)
 * 2. Mysteries - Shows only mysteries, Litany, Salve Regina, Papa prayer
 * 3. Dedicated - Shows only mysteries (for users who know all prayers by heart)
 * 4. Custom - User selects which prayers to show/hide
 *
 * State is persisted in localStorage and affects prayer navigation.
 */
const PrayerVisibilityMode = ({
  onModeChange = () => {},
  onCustomSettingsChange = () => {},
}) => {
  const [currentMode, setCurrentMode] = useState(() => {
    return localStorage.getItem("prayerVisibilityMode") || "full";
  });

  const [customSettings, setCustomSettings] = useState(() => {
    const saved = localStorage.getItem("customPrayerVisibility");
    return saved ? JSON.parse(saved) : getDefaultCustomSettings();
  });

  const [showCustomSettings, setShowCustomSettings] = useState(false);

  // Default custom settings - all prayers visible
  function getDefaultCustomSettings() {
    return {
      SC: true, // Señal de la Cruz
      AC: true, // Acto de Contrición
      C: true, // Credo
      P: true, // Padre Nuestro
      A: true, // Ave María
      G: true, // Gloria
      F: true, // Oración de Fátima
      S: true, // Salve Regina
      Papa: true, // Oración por el Papa
      LL: true, // Letanías de Loreto
      // Mysteries are always shown
      MGo1: true,
      MGo2: true,
      MGo3: true,
      MGo4: true,
      MGo5: true,
      MDo1: true,
      MDo2: true,
      MDo3: true,
      MDo4: true,
      MDo5: true,
      MGl1: true,
      MGl2: true,
      MGl3: true,
      MGl4: true,
      MGl5: true,
      ML1: true,
      ML2: true,
      ML3: true,
      ML4: true,
      ML5: true,
    };
  }

  // Prayer definitions for custom mode
  const prayerDefinitions = {
    // Basic prayers
    SC: { name: "Señal de la Cruz", category: "Basic" },
    AC: { name: "Acto de Contrición", category: "Basic" },
    C: { name: "Credo", category: "Basic" },
    P: { name: "Padre Nuestro", category: "Basic" },
    A: { name: "Ave María", category: "Basic" },
    G: { name: "Gloria", category: "Basic" },
    F: { name: "Oración de Fátima", category: "Basic" },
    S: { name: "Salve Regina", category: "Closing" },
    Papa: { name: "Oración por el Papa", category: "Closing" },
    LL: { name: "Letanías de Loreto", category: "Closing" },

    // Mysteries
    MGo1: { name: "Primer Misterio Gozoso", category: "Mysteries" },
    MGo2: { name: "Segundo Misterio Gozoso", category: "Mysteries" },
    MGo3: { name: "Tercer Misterio Gozoso", category: "Mysteries" },
    MGo4: { name: "Cuarto Misterio Gozoso", category: "Mysteries" },
    MGo5: { name: "Quinto Misterio Gozoso", category: "Mysteries" },
    MDo1: { name: "Primer Misterio Doloroso", category: "Mysteries" },
    MDo2: { name: "Segundo Misterio Doloroso", category: "Mysteries" },
    MDo3: { name: "Tercer Misterio Doloroso", category: "Mysteries" },
    MDo4: { name: "Cuarto Misterio Doloroso", category: "Mysteries" },
    MDo5: { name: "Quinto Misterio Doloroso", category: "Mysteries" },
    MGl1: { name: "Primer Misterio Glorioso", category: "Mysteries" },
    MGl2: { name: "Segundo Misterio Glorioso", category: "Mysteries" },
    MGl3: { name: "Tercer Misterio Glorioso", category: "Mysteries" },
    MGl4: { name: "Cuarto Misterio Glorioso", category: "Mysteries" },
    MGl5: { name: "Quinto Misterio Glorioso", category: "Mysteries" },
    ML1: { name: "Primer Misterio Luminoso", category: "Mysteries" },
    ML2: { name: "Segundo Misterio Luminoso", category: "Mysteries" },
    ML3: { name: "Tercer Misterio Luminoso", category: "Mysteries" },
    ML4: { name: "Cuarto Misterio Luminoso", category: "Mysteries" },
    ML5: { name: "Quinto Misterio Luminoso", category: "Mysteries" },
  };

  // Save mode to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem("prayerVisibilityMode", currentMode);
    onModeChange(currentMode);
  }, [currentMode, onModeChange]);

  // Save custom settings to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem(
      "customPrayerVisibility",
      JSON.stringify(customSettings)
    );
    onCustomSettingsChange(customSettings);
  }, [customSettings, onCustomSettingsChange]);

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    if (mode === "custom") {
      setShowCustomSettings(true);
    } else {
      setShowCustomSettings(false);
    }
  };

  const handleCustomSettingChange = (prayerId, visible) => {
    setCustomSettings((prev) => ({
      ...prev,
      [prayerId]: visible,
    }));
  };

  const resetCustomSettings = () => {
    setCustomSettings(getDefaultCustomSettings());
  };

  const getModeDescription = (mode) => {
    switch (mode) {
      case "full":
        return "Shows all prayers and mysteries";
      case "mysteries":
        return "Shows mysteries, Litany, Salve Regina, and Papa prayer";
      case "dedicated":
        return "Shows only mysteries (for experienced users)";
      case "custom":
        return "Custom selection of prayers to show/hide";
      default:
        return "";
    }
  };

  // Group prayers by category for custom mode
  const groupedPrayers = Object.entries(prayerDefinitions).reduce(
    (acc, [id, prayer]) => {
      if (!acc[prayer.category]) {
        acc[prayer.category] = [];
      }
      acc[prayer.category].push({ id, ...prayer });
      return acc;
    },
    {}
  );

  return (
    <div className="prayer-visibility-mode">
      <div className="prayer-visibility-header">
        <h3>Prayer Visibility Mode</h3>
        <p className="mode-description">{getModeDescription(currentMode)}</p>
      </div>

      <div className="mode-selector">
        {[
          { id: "full", label: "Full", icon: "📖" },
          { id: "mysteries", label: "Mysteries", icon: "🙏" },
          { id: "dedicated", label: "Dedicated", icon: "⛪" },
          { id: "custom", label: "Custom", icon: "⚙️" },
        ].map((mode) => (
          <button
            key={mode.id}
            className={`mode-button ${currentMode === mode.id ? "active" : ""}`}
            onClick={() => handleModeChange(mode.id)}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
          </button>
        ))}
      </div>

      {showCustomSettings && (
        <div className="custom-settings">
          <div className="custom-settings-header">
            <h4>Custom Prayer Selection</h4>
            <button
              className="reset-button"
              onClick={resetCustomSettings}
              title="Reset to show all prayers"
            >
              Reset All
            </button>
          </div>

          {Object.entries(groupedPrayers).map(([category, prayers]) => (
            <div key={category} className="prayer-category">
              <h5 className="category-title">{category}</h5>
              <div className="prayer-list">
                {prayers.map((prayer) => (
                  <label key={prayer.id} className="prayer-checkbox">
                    <input
                      type="checkbox"
                      checked={customSettings[prayer.id] || false}
                      onChange={(e) =>
                        handleCustomSettingChange(prayer.id, e.target.checked)
                      }
                    />
                    <span className="checkbox-label">{prayer.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrayerVisibilityMode;

