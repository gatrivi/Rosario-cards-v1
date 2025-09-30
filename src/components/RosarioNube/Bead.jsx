import React, { useRef, useEffect } from "react";

const Bead = ({ position, onMove }) => {
  const beadRef = useRef(null);
  useEffect(() => {
    const bead = beadRef.current;
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      offset.x = e.clientX - bead.getBoundingClientRect().left;
      offset.y = e.clientY - bead.getBoundingClientRect().top;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        onMove({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    bead.addEventListener("mousedown", handleMouseDown);
    return () => bead.removeEventListener("mousedown", handleMouseDown);

    {
      /* Mobile support */
    }
    const handleTouchStart = (e) => {
      e.preventDefault();
      isDragging = true;
      offset.x = e.touches[0].clientX - bead.getBoundingClientRect().left;
      offset.y = e.touches[0].clientY - bead.getBoundingClientRect().top;
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (isDragging) {
        onMove({
          x: e.touches[0].clientX - offset.x,
          y: e.touches[0].clientY - offset.y,
        });
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    bead.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => bead.removeEventListener("touchstart", handleTouchStart);

    {
      /* closing useEffect */
    }
  }, [onMove]);
  return (
    <div
      ref={beadRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "22px",
        height: "22px",
        border: "1px solid chocolate",
        backgroundColor: "linear-gradient(coral, chocolate)",
        borderRadius: "50%",
        cursor: "grab",
        userSelect: "none", // Evita selección de texto
      }}
    />
  );
};
export default Bead;
