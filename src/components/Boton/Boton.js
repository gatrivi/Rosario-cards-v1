import React from "react";

function Boton(identificacion, texto, estilo) {
  return (
    <button id={identificacion} estilo={estilo}>
      {texto}
    </button>
  );
}

export default Boton;
