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
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "var(--system-fill)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "var(--text-color)",
        border: "none",
        borderRadius: "50%",
        width: "44px",
        height: "44px",
        minWidth: "44px",
        minHeight: "44px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <FaLightbulb size={18} /> : <FaMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
