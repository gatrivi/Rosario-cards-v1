import React, { useState, useEffect } from "react";
import { FaLightbulb, FaMoon } from "react-icons/fa"; // Import icons here
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    try {
      if (localStorage.getItem("theme") === "dark") return true;
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // Safely check for matchMedia API
    if (window.matchMedia) {
      try {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      } catch (error) {
        console.warn("matchMedia not supported:", error);
        return false; // Default to light mode if API fails
      }
    }

    return false; // Default to light mode if matchMedia not available
  });

  useEffect(() => {
    // Apply theme to body
    try {
      if (darkMode) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }

      // Dispatch custom event for theme change
      window.dispatchEvent(new CustomEvent("themeChanged"));
    } catch (error) {
      console.warn("Error applying theme:", error);
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <button
      onClick={toggleTheme}
      className=" rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <FaLightbulb size={15} /> : <FaMoon size={15} />}
    </button>
  );
};

export default ThemeToggle;
