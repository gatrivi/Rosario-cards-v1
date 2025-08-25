import logo from "./logo.svg";
import "./App.css";
import ViewPrayers from "./components/ViewPrayers";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img id="logo" src={logo} className="App-logo" alt="logo" />
        <ViewPrayers />
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
