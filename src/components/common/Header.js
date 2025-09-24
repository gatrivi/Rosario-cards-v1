import React from "react";

function Header({ logo }) {
  return (
    <header
      style={{
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
        style={{ height: "4vh" }}
      />
    </header>
  );
}

export default Header;
