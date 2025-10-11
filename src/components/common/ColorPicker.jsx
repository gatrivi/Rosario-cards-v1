import React from "react";

/**
 * ColorPicker Component
 *
 * A color picker input adapted from the TypeScript version
 * Uses inline styles instead of Tailwind classes for compatibility
 *
 * @param {string} label - Label text for the color picker
 * @param {string} color - Current color value (hex format)
 * @param {function} onChange - Callback function when color changes
 */
const ColorPicker = ({ label, color, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          color: "#cbd5e1",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </label>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          width: "32px",
          height: "32px",
          padding: "0",
          backgroundColor: "transparent",
          border: "2px solid #475569",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export default ColorPicker;
