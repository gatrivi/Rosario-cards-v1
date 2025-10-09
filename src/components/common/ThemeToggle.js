import React, { useState, useEffect } from "react";
import { FaLightbulb, FaMoon } from "react-icons/fa";
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
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Light" : "Dark"}
    >
      {darkMode ? <FaLightbulb size={15} /> : <FaMoon size={15} />}
    </button>
  );
};

export default ThemeToggle;
