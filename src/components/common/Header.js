import React from "react";

function Header({ logo }) {
  return (
    <header
      style={{
        textAlign: "center",
        padding: "16px",
        background: "var(--card-background)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--separator)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      }}
      className="App-header"
    >
      <img
        id="logo"
        src={logo}
        className="App-logo"
        alt="logo"
        style={{ 
          height: "40px",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
        }}
      />
    </header>
  );
}

export default Header;
