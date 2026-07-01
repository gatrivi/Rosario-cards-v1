import { useState } from "react";

/**
 * Hook to handle rosary dragging (mouse and touch)
 *
 * isPointerOnBead: optional (clientX, clientY) => boolean, supplied by
 * InteractiveRosary. When it returns true, the pointer landed on a bead body,
 * so container pan must NOT start — the bead/string physics owns the gesture
 * instead. Pan only starts for empty-space presses.
 */
export const useRosaryDragging = (
  sceneRef,
  rosaryPosition,
  setRosaryPosition,
  isDraggingRosary,
  setIsDraggingRosary,
  dragStart,
  setDragStart,
  isPointerOnBead
) => {
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Mouse event handlers
  const handleRosaryMouseDown = (e) => {
    if (!sceneRef.current?.contains(e.target)) return;
    if (isPointerOnBead?.(e.clientX, e.clientY)) return;
    setIsDraggingRosary(true);
    setDragStart({
      x: e.clientX - rosaryPosition.x,
      y: e.clientY - rosaryPosition.y,
    });
    e.preventDefault();
  };

  const handleRosaryMouseMove = (e) => {
    if (isDraggingRosary) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const container = sceneRef.current;
      if (container) {
        const maxX = container.clientWidth / 2;
        const maxY = container.clientHeight / 2;
        const constrainedX = Math.max(-maxX, Math.min(maxX, newX));
        const constrainedY = Math.max(-maxY, Math.min(maxY, newY));

        setRosaryPosition({ x: constrainedX, y: constrainedY });
      }
    }
  };

  const handleRosaryMouseUp = () => {
    setIsDraggingRosary(false);
  };

  // Touch event handlers
  const handleRosaryTouchStart = (e) => {
    if (e.touches.length === 1 && sceneRef.current?.contains(e.target)) {
      const touch = e.touches[0];
      if (isPointerOnBead?.(touch.clientX, touch.clientY)) return;
      setIsDraggingRosary(true);
      setDragStart({
        x: touch.clientX - rosaryPosition.x,
        y: touch.clientY - rosaryPosition.y,
      });
      setTouchStartTime(Date.now());
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setHasMoved(false);
      e.preventDefault();
    }
  };

  const handleRosaryTouchMove = (e) => {
    if (isDraggingRosary && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPos.x, 2) +
          Math.pow(touch.clientY - touchStartPos.y, 2)
      );
      if (moveDistance > 10) {
        setHasMoved(true);
      }

      const container = sceneRef.current;
      if (container) {
        const maxX = container.clientWidth / 2;
        const maxY = container.clientHeight / 2;
        const constrainedX = Math.max(-maxX, Math.min(maxX, newX));
        const constrainedY = Math.max(-maxY, Math.min(maxY, newY));

        setRosaryPosition({ x: constrainedX, y: constrainedY });
      }
      e.preventDefault();
    }
  };

  const handleRosaryTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime;

    if (touchDuration < 300 && !hasMoved) {
      window.dispatchEvent(
        new CustomEvent("toggleNavigationButtons", {
          detail: { action: "hide" },
        })
      );
    }

    setIsDraggingRosary(false);
  };

  return {
    handleRosaryMouseDown,
    handleRosaryMouseMove,
    handleRosaryMouseUp,
    handleRosaryTouchStart,
    handleRosaryTouchMove,
    handleRosaryTouchEnd,
  };
};
