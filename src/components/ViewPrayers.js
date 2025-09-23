import React from "react";
import Boton from "./Boton";

function ViewPrayers({ prayer }) {
  console.log(" prayer prop in ViewPrayers:", prayer);
  return (
    <div className="top-section" style={{ display: "flex", height: "58vh" }}>
      <div
        className="page left"
        style={{
          flex: 1,
          border: "1px solid #ccc",
          overflow: "scroll",
          padding: "10px",
        }}
      >
        <p> {prayer}</p>
      </div>
      <div
        className="page right"
        style={{ flex: 1, border: "1px solid #ccc", padding: "10px" }}
      >
        <img
          src="path/to/image.jpg"
          alt="Imagen"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}

export default ViewPrayers;
