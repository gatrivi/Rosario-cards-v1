import "./App.css";
import logo from "./logo.svg";

import Rosario from "./data/Rosario";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons";
import Header from "./components/Header";
function App() {
  const [prayer, setPrayer] = useState("Selecciona una oración");
  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header logo={logo} style={{ minHeight: "10px" }} />
      <ViewPrayers prayer={prayer} />
      <PrayerButtons prayers={Rosario} setPrayer={setPrayer} />
    </div>
  );
}

export default App;
