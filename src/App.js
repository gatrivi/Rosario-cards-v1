import "./App.css";
import logo from "./logo.png";

import Rosario from "./data/Rosario";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
import Bead from "./components/RosarioNube/Bead";
function App() {
  const [prayer, setPrayer] = useState("Selecciona una oración");
  const [prayerImg, setPrayerImg] = useState("");
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [beads, setBeads] = useState([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 200, y: 100 },
  ]);

  const handleMove = (id, newPos) => {
    setBeads((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...newPos } : b))
    );
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
