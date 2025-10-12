import React, { useState } from "react";

const PhysicsControls = ({ onPhysicsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ultra-stiff test defaults (user hypothesis) + working friction values
  const DEFAULTS = {
    restitution: 0.8,
    friction: 0.5, // Working value (fixes slingshot)
    frictionAir: 0.05, // Working value (fixes slingshot)
    density: 0.001,
    stiffness: 2.0, // Ultra-stiff test
    damping: 0.5,
  };

  const [physics, setPhysics] = useState(DEFAULTS);

  const handleChange = (key, value) => {
    const updated = { ...physics, [key]: parseFloat(value) };
    setPhysics(updated);
    onPhysicsChange?.(updated);
  };

  const resetToDefaults = () => {
    setPhysics(DEFAULTS);
    onPhysicsChange?.(DEFAULTS);
  };

  return (
    <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 20 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          fontSize: "16px",
          cursor: "pointer",
          border: "none",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.1)",
          color: "inherit",
          transition: "all 0.3s ease",
        }}
        aria-label="Physics Controls"
        title="Adjust Physics Parameters"
      >
        ⚙️ Physics
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "45px",
            background: "rgba(0, 0, 0, 0.95)",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "280px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 15px", color: "white", fontSize: "18px" }}>
            Physics Controls
          </h3>

          {/* Bead Properties */}
          <div style={{ marginBottom: "15px" }}>
            <h4
              style={{
                color: "#4CAF50",
                fontSize: "14px",
                marginBottom: "10px",
              }}
            >
              Bead Properties
            </h4>

            <label
              style={{
                color: "white",
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              Restitution (Bounce):{" "}
              <strong>{physics.restitution.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={physics.restitution}
                onChange={(e) => handleChange("restitution", e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </label>

            <label
              style={{
                color: "white",
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              Friction: <strong>{physics.friction.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={physics.friction}
                onChange={(e) => handleChange("friction", e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </label>

            <label
              style={{
                color: "white",
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              Air Friction: <strong>{physics.frictionAir.toFixed(3)}</strong>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={physics.frictionAir}
                onChange={(e) => handleChange("frictionAir", e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </label>

            <label
              style={{
                color: "white",
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              Density (Weight): <strong>{physics.density.toFixed(4)}</strong>
              <input
                type="range"
                min="0.001"
                max="0.02"
                step="0.001"
                value={physics.density}
                onChange={(e) => handleChange("density", e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </label>
          </div>

          {/* String Properties */}
          <hr
            style={{
              margin: "15px 0",
              borderColor: "#555",
              borderWidth: "1px",
            }}
          />

          <div style={{ marginBottom: "15px" }}>
            <h4
              style={{
                color: "#4CAF50",
                fontSize: "14px",
                marginBottom: "10px",
              }}
            >
              String Properties
            </h4>

             <label
               style={{
                 color: "white",
                 display: "block",
                 marginBottom: "8px",
                 fontSize: "12px",
               }}
             >
               String Stiffness: <strong>{physics.stiffness.toFixed(2)}</strong>
               <input
                 type="range"
                 min="0"
                 max="5"
                 step="0.1"
                 value={physics.stiffness}
                 onChange={(e) => handleChange("stiffness", e.target.value)}
                 style={{ width: "100%", marginTop: "4px" }}
               />
             </label>

            <label
              style={{
                color: "white",
                display: "block",
                marginBottom: "10px",
                fontSize: "12px",
              }}
            >
              String Damping: <strong>{physics.damping.toFixed(2)}</strong>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={physics.damping}
                onChange={(e) => handleChange("damping", e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </label>
          </div>

          <button
            onClick={resetToDefaults}
            style={{
              width: "100%",
              padding: "10px",
              background: "#4CAF50",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#45a049")}
            onMouseLeave={(e) => (e.target.style.background = "#4CAF50")}
          >
            🔄 Reset to Demo Defaults
          </button>

          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              background: "rgba(76, 175, 80, 0.1)",
              borderRadius: "4px",
              fontSize: "11px",
              color: "#aaa",
              textAlign: "center",
            }}
          >
            Note: Changes recreate the rosary
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicsControls;
