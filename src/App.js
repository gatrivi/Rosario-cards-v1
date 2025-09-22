import logo from "./logo.svg";
import "./App.css";
import Rosario from "./data/Rosario";
import { useState } from "react";
import ViewPrayers from "./components/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons";
function App() {
  const [prayer, setPrayer] = useState("Selecciona una oración");

  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <header className="App-header">
        <img id="logo" src={logo} className="App-logo" alt="logo" />
      </header>{" "}
      <ViewPrayers prayer={prayer} />
      <PrayerButtons prayers={Rosario} setPrayer={setPrayer} />
    </div>
  );
}

export default App;
