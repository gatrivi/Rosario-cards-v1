import "./App.css";
import logo from "./logo.svg";

import Rosario from "./data/Rosario";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
function App() {
  const [prayer, setPrayer] = useState("Selecciona una oración");
  const [count, setCount] = useState(0);
  const handleCountClick = () => {
    setCount(count + 1);
  };

  const handleResetClick = () => {
    setCount(0);
  };

  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header logo={logo} style={{ height: "4vh" }} />
      <ViewPrayers count={count} prayer={prayer} />
      <PrayerButtons
        prayers={Rosario}
        countUp={handleCountClick}
        reset={handleResetClick}
        setPrayer={setPrayer}
      />
    </div>
  );
}

export default App;
