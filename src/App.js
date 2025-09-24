import "./App.css";
import logo from "./logo.svg";

import Rosario from "./data/Rosario";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons/PrayerButtons";
import Header from "./components/common/Header";
function App() {
  const [prayer, setPrayer] = useState("Selecciona una oración");
  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header logo={logo} style={{ height: "4vh" }} />
      <ViewPrayers prayer={prayer} />
      <PrayerButtons prayers={Rosario} setPrayer={setPrayer} />
    </div>
  );
}

export default App;
