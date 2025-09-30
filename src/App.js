import "./App.css";
import logo from "./logo.png";

import Rosario from "./data/Rosario";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import Bead from "./components/RosarioNube/Bead";
function App() {
  const [prayer, setPrayer] = useState(
    "Por la señal de la Santa Cruz \nde nuestros enemigos, líbranos Señor, Dios nuestro. \nAmén.\n\nAbre Señor, mis labios \ny proclamará mi boca tu alabanza."
  );
  const [prayerImg, setPrayerImg] = useState("");
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [beads, setBeads] = useState([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 200, y: 100 },
  ]);

  const handleMove = (id, newPos) => {
    setBeads((prev) => {
      let updated = prev.map((b) => (b.id === id ? { ...b, ...newPos } : b));
      const [b1, b2] = updated;
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = 100; // Longitud hilo
      if (dist > targetDist) {
        const ratio = targetDist / dist;
        if (id === 1) {
          // Mueve b2 hacia b1
          b2.x = b1.x + dx * ratio;
          b2.y = b1.y + dy * ratio;
        } else {
          b1.x = b2.x - dx * ratio;
          b1.y = b2.y - dy * ratio;
        }
      }
      return [b1, b2];
    });
  };
  const handleCountClick = () => {
    if (count < 10) {
      setCount(count + 1);
    }
  };
  console.log("setPrayerImg in App:", setPrayerImg);
  const handleResetClick = () => {
    setCount(0);
  };

  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      {" "}
      <>
        {beads.map((b) => (
          <Bead
            key={b.id}
            id={b.id}
            position={{ x: b.x, y: b.y }}
            onMove={(pos) => handleMove(b.id, pos)}
          />
        ))}
      </>{" "}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <line
          x1={beads[0].x + 11}
          y1={beads[0].y + 11}
          x2={beads[1].x + 11}
          y2={beads[1].y + 11}
          stroke="coral"
        />
      </svg>
      <Header logo={logo} style={{ height: "4vh" }} />
      <ViewPrayers count={count} prayerImg={prayerImg} prayer={prayer} />
      <PrayerButtons
        prayers={Rosario}
        countUp={handleCountClick}
        reset={handleResetClick}
        setPrayer={setPrayer}
        setPrayerImg={setPrayerImg}
      />
    </div>
  );
}

export default App;
