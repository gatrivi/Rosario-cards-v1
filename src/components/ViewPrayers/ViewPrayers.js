import React from "react";
import Boton from "../Boton/Boton";
import AveMaria from "../../data/assets/img/Theotokos.jpg";
import AveMariaD from "../../data/assets/img/AllMary17thLith.jpeg";
function ViewPrayers({ prayer, count, prayerImg }) {
  console.log(" prayer prop in ViewPrayers:", prayer);

  const currentTheme = localStorage.getItem("theme");
  let baseImageUrl;
  if (currentTheme === "dark") {
    baseImageUrl = AveMaria;
  } else {
    baseImageUrl = AveMariaD;
  }
  const finalImageUrl = prayerImg ? prayerImg : baseImageUrl;
  console.log("finalImageUrl:", finalImageUrl);
  console.log("prayerImg prop in ViewPrayers:", prayerImg);
  console.log("currentTheme:", currentTheme);
  console.log("baseImageUrl:", baseImageUrl);
  return (
    <div className="top-section" style={{ display: "flex", height: "58vh" }}>
      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "scroll",
          padding: "4px",
        }}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>
          {count} {prayer}
        </p>
      </div>
      <div className="page-right" style={{ flex: 1 }}>
        <img
          className="prayer-image"
          src={finalImageUrl}
          alt={`${prayer.name} illustration`}
          style={{
            width: "47vw",
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
