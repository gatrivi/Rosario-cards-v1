import React from "react";

function Header({ logo, onToggleStats }) {
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
    </header>
  );
}

export default Header;
