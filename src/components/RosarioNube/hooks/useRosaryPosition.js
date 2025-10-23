import { useState, useEffect } from "react";

/**
 * Hook to manage rosary position with localStorage persistence
 */
export const useRosaryPosition = () => {
  const [rosaryPosition, setRosaryPosition] = useState(() => {
    try {
      const saved = localStorage.getItem("rosaryPosition");
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch (error) {
      console.warn("localStorage not available:", error);
      return { x: 0, y: 0 };
    }
  });

  const [isDraggingRosary, setIsDraggingRosary] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Save rosary position to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("rosaryPosition", JSON.stringify(rosaryPosition));
    } catch (error) {
      console.warn("Failed to save rosary position:", error);
    }
  }, [rosaryPosition]);

  // Listen for rosary position reset events
  useEffect(() => {
    const handleResetPosition = (event) => {
      setRosaryPosition(event.detail);
    };

    window.addEventListener("resetRosaryPosition", handleResetPosition);
    return () => {
      window.removeEventListener("resetRosaryPosition", handleResetPosition);
    };
  }, []);

  return {
    rosaryPosition,
    setRosaryPosition,
    isDraggingRosary,
    setIsDraggingRosary,
    dragStart,
    setDragStart,
  };
};
