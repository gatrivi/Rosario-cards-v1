import { useState, useEffect } from "react";

/**
 * Hook to manage rosary visibility, developer mode, and zoom state
 */
export const useRosaryState = () => {
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem("rosaryVisible");
    return saved !== "false";
  });

  const [developerMode, setDeveloperMode] = useState(false);
  const [rosaryZoom, setRosaryZoom] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("rosaryZoom")) || 1.0;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return 1.0;
    }
  });

  // Listen for visibility toggle events
  useEffect(() => {
    const handleVisibilityChange = (event) => {
      setIsVisible(event.detail.visible);
    };

    window.addEventListener("rosaryVisibilityChange", handleVisibilityChange);
    return () =>
      window.removeEventListener(
        "rosaryVisibilityChange",
        handleVisibilityChange
      );
  }, []);

  // Listen for developer mode toggle events
  useEffect(() => {
    const handleDeveloperModeChange = (event) => {
      setDeveloperMode(event.detail.developerMode);
    };

    window.addEventListener("developerModeChange", handleDeveloperModeChange);
    return () =>
      window.removeEventListener(
        "developerModeChange",
        handleDeveloperModeChange
      );
  }, []);

  // Listen for rosary zoom change events
  useEffect(() => {
    const handleRosaryZoomChange = (event) => {
      const newZoom = event.detail.zoom;
      setRosaryZoom(newZoom);
      console.log("Rosary zoom changed to:", newZoom);
    };

    window.addEventListener("rosaryZoomChange", handleRosaryZoomChange);
    return () =>
      window.removeEventListener("rosaryZoomChange", handleRosaryZoomChange);
  }, []);

  return {
    isVisible,
    developerMode,
    rosaryZoom,
  };
};
