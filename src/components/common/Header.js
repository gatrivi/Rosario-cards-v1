import React from "react";

function Header({ logo }) {
  return (
    <header className="nav-bar" role="banner">
      <img
        id="logo"
        src={logo}
        alt="App logo"
        style={{ height: 28 }}
      />
    </header>
  );
}

export default Header;
