import React from "react";
import Boton from "./Boton";
function Pie() {
  return (
    <div id="Pie">
      <p>
        Por la señal de la Santa Cruz, de nuestros enemigos líbranos Señor Dios
        nuestro{" "}
      </p>
      <a
        className="App-link"
        href="https://www.vatican.va/special/rosary/index_rosary_sp.htm"
        target="_blank"
        rel="noopener noreferrer"
      >
        Aprende el Rosario
      </a>
      <Boton id="btn1" alias="Inicio" estado="activo" />
      <Boton id="btn2" alias="Apertura" estado="inactivo" />
      <Boton id="btn3" alias="Cuentas" estado="inactivo" />
      <Boton id="btn4" alias="Guardar" estado="inactivo" />
      <Boton id="btn5" alias="Salir" estado="inactivo" />
    </div>
  );
}

export default Pie;
