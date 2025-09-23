import React from "react";

import ThemeToggle from "./ThemeToggle";
function Header({ logo }) {
  return (
    <header
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        textAlign: "center",
        borderBottom: "1px solid #ccc",
      }}
      className="App-header"
    >
      <img
        id="logo"
        src={logo}
        className="App-logo"
        alt="logo"
        style={{ height: "20px" }}
      />
      <ThemeToggle />
    </header>
  );
}

export default Header;
