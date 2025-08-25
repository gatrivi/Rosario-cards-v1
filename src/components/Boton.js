import React from "react";

function Boton(id, alias, estado) {
  return (
    <button id={id} estilo={estado}>
      {alias}
    </button>
  );
}

export default Boton;
