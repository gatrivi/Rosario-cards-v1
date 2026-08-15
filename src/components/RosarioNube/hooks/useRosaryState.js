import { useState, useEffect } from "react";

const getDefaultRosaryZoom = () => {
  if (typeof window === "undefined") return 1.2;

  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
  const mobileViewport = window.innerWidth <= 768;
  return coarsePointer || mobileViewport ? 1.6 : 1.2;
};

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
      const savedZoom = parseFloat(localStorage.getItem("rosaryZoom"));
      return Number.isFinite(savedZoom) && savedZoom > 0
        ? savedZoom
        : getDefaultRosaryZoom();
    } catch (error) {
      console.warn("localStorage not available:", error);
      return getDefaultRosaryZoom();
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
