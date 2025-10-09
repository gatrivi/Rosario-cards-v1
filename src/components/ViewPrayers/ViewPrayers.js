import React from "react";
import AveMariaD from "../../data/assets/img/AllMary17thLith.jpeg";
function ViewPrayers({
  prayer,
  count,
  prayerImg,
  currentMystery,
  currentPrayerIndex,
  prayers,
}) {
  let baseImageUrl;
  const finalImageUrl = prayerImg ? prayerImg : baseImageUrl;
  const currentTheme = localStorage.getItem("theme");

  // Count Hail Marys based on actual prayer sequence
  const getHailMaryCount = () => {
    if (!prayers) return 0;

    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };

    const rosarySequence = prayers[mysteryToArray[currentMystery]] || [];
    let count = 0;

    // Count "A" entries (Ave Maria/Hail Mary) up to current prayer index
    for (let i = 0; i <= currentPrayerIndex && i < rosarySequence.length; i++) {
      if (rosarySequence[i] === "A") {
        count++;
      }
    }

    return count;
  };

  const hailMaryCount = getHailMaryCount();

  if (currentTheme === "dark") {
    if (currentMystery === "gloriosos") {
      baseImageUrl = "/gallery-images/misterios/modooscuro/misteriogloria0.jpg";
    }
  } else {
    baseImageUrl = AveMariaD;
  }
  return (
    <div
      className="top-section prayer-content-overlay"
      style={{
        display: "flex",
        height: "58vh",
        background: "rgba(255, 255, 255, 0.1)", // More transparent
        backdropFilter: "blur(0.5px)", // Less blur
        borderRadius: "8px",
        margin: "10px",
        padding: "10px",
        pointerEvents: "none", // Allow clicks to pass through
      }}
    >
      <div
        className="page-left"
        style={{
          flex: 1,
          overflow: "scroll",
          padding: "4px",
        }}
      >
        <span style={{ color: "gold", fontSize: "18px", fontWeight: "bold" }}>
          📿 Hail Marys: {hailMaryCount} (Index: {currentPrayerIndex})
        </span>
        <p>{prayer}</p>
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
