import React from "react";
import Boton from "../Boton/Boton";
import AveMaria from "../../data/assets/img/Theotokos.jpg";
function ViewPrayers({ prayer }) {
  console.log(" prayer prop in ViewPrayers:", prayer);
  return (
    <div className="top-section" style={{ display: "flex", height: "58vh" }}>
      <div
        className="page-left"
        style={{
          flex: 1,
          border: "1px solid #ccc",
          overflow: "scroll",
          padding: "4px",
        }}
      >
        <p> {prayer}</p>
      </div>
      <div className="page right" style={{ flex: 1, border: "1px solid #ccc" }}>
        <img
          src={AveMaria}
          alt={`${prayer.name} illustration`}
          style={{
            width: "44vw",
            height: "56vh",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
}

export default ViewPrayers;
