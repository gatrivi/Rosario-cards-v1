import logo from "./logo.svg";
import "./App.css";
import { rosario } from "./data/rosario";

import ViewPrayers from "./components/ViewPrayers";
import PrayerButtons from "./components/PrayerButtons";
function App() {
  return (
    <div
      className="app"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <header className="App-header">
        <img id="logo" src={logo} className="App-logo" alt="logo" />
        <ViewPrayers />
        <PrayerButtons />
        <p>
          Por la señal de la Santa Cruz, de nuestros enemigos líbranos Señor
          Dios nuestro{" "}
        </p>
        <a
          className="App-link"
          href="https://www.vatican.va/special/rosary/index_rosary_sp.htm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aprende el Rosario
        </a>
      </header>
    </div>
  );
}

export default App;
