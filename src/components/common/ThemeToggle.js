import React, { useState, useEffect } from "react";
import { FaLightbulb, FaMoon } from "react-icons/fa"; // Import icons here
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    if (localStorage.getItem("theme") === "dark") return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply theme to body
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themeChanged'));
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
