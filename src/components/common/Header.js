import React from "react";

function Header({ logo, onToggleStats, onToggleRosedal, onToggleDailyTracker }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        height: "5vh"
      }}
      className="App-header"
    >
      <img
        id="logo"
        src={logo}
        className="App-logo"
        alt="logo"
        style={{ height: "4vh" }}
      />
      <div>
        <button 
          onClick={onToggleDailyTracker}
          style={{
            background: "#4b5320",
            color: "#fff",
            border: "none",
            padding: "5px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            pointerEvents: "auto",
            marginRight: "10px"
          }}
        >
          Plan Diario
        </button>
        <button 
          onClick={onToggleRosedal}
          style={{
            background: "#8b4513",
            color: "#fff",
            border: "none",
            padding: "5px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            pointerEvents: "auto",
            marginRight: "10px"
          }}
        >
          Rosedal
        </button>
        <button 
          onClick={onToggleStats}
          style={{
            background: "#d4af37",
            color: "#000",
            border: "none",
            padding: "5px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            pointerEvents: "auto"
          }}
        >
          Estadísticas
        </button>
      </div>
    </header>
  );
}

export default Header;
