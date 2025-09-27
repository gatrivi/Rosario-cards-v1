# 📖 Manual de Bolsillo: Construyendo Cuentas Arrastrables en React

¡Bienvenido al taller de beads interactivas! 🌟 Vamos a construir esto paso a paso, como un dev senior: empezamos con lo básico "a mano" para entender las mecánicas (usando solo React y DOM nativo), y luego escalamos a mejores prácticas y librerías para eficiencia. Usaremos enumeraciones anidadas para claridad, y emojis para resaltar secciones clave.

Recuerda:

- **Entorno base**: Asumimos un app React simple (creado con `create-react-app` o Vite). Usaremos hooks como `useState`, `useEffect` y `useRef`.
- **Vista general**: Cada "bead" será un div redondo estilizado. El "hilo" será una línea SVG o CSS entre ellas.
- **Pruebas**: Ejecuta en desktop y mobile (usa dev tools para emular touch).

## 1. 🛠️ Implementación Básica: Bead Arrastrable Simple (Sin Librerías)

Empezamos con una sola bead draggable usando eventos nativos del DOM. Esto enseña las mecánicas de drag (mouse/touch) sin dependencias.

1.1. **Setup Inicial**

- Crea un componente `Bead` en `Bead.js`.
- Usa `useRef` para referenciar el DOM element.
- Estilos básicos: `position: absolute`, `border-radius: 50%` para forma de cuenta.

```jsx
import React, { useRef } from "react";

const Bead = ({ position, onMove }) => {
  const beadRef = useRef(null);
  return (
    <div
      ref={beadRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "50px",
        height: "50px",
        backgroundColor: "coral",
        borderRadius: "50%",
        cursor: "grab",
      }}
    />
  );
};
```

- En `App.js`: Usa `useState` para almacenar posición.

  ```jsx
  import React, { useState } from "react";
  import Bead from "./Bead";

  function App() {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    return <Bead position={position} />;
  }
  ```

  1.2. **Añadir Drag con Mouse** 🚀

- En `Bead.js`, agrega event listeners en `useEffect`.
- Calcula offset al iniciar drag, actualiza posición en move.
  - 1.2.1. Eventos: `mousedown` para start, `mousemove` para drag, `mouseup` para end.
  - 1.2.2. Limpieza: Remueve listeners en cleanup.

```jsx
useEffect(() => {
  const bead = beadRef.current;
  let isDragging = false;
  let offset = { x: 0, y: 0 };

  const handleMouseDown = (e) => {
    isDragging = true;
    offset.x = e.clientX - bead.getBoundingClientRect().left;
    offset.y = e.clientY - bead.getBoundingClientRect().top;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      onMove({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseUp = () => {
    isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  bead.addEventListener("mousedown", handleMouseDown);
  return () => bead.removeEventListener("mousedown", handleMouseDown);
}, [onMove]);
```

- En `App.js`: Pasa `onMove` como `setPosition`. ¡Prueba: Arrastra en desktop! 🖱️

  1.3. **Soporte Mobile (Touch Events)** 📱

- Añade `touchstart`, `touchmove`, `touchend` similares a mouse.
- Usa `e.touches[0]` para posición.
  - 1.3.1. Previene scroll default con `e.preventDefault()`.

```jsx
// Añade en useEffect:
const handleTouchStart = (e) => {
  e.preventDefault();
  isDragging = true;
  offset.x = e.touches[0].clientX - bead.getBoundingClientRect().left;
  offset.y = e.touches[0].clientY - bead.getBoundingClientRect().top;
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
};

const handleTouchMove = (e) => {
  e.preventDefault();
  if (isDragging) {
    onMove({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  }
};

const handleTouchEnd = () => {
  isDragging = false;
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);
};

bead.addEventListener("touchstart", handleTouchStart, { passive: false });
return () => bead.removeEventListener("touchstart", handleTouchStart);
```

- ¡Funciona en mobile! Pero es básico: sin inercia o límites.

## 2. 🔗 Conectar Dos Beads con Hilo (Movimiento Vinculado)

Ahora atamos dos beads: Mover una afecta a la otra vía "hilo" (distancia fija).

2.1. **Setup Múltiple Beads**

- En `App.js`: Usa array de posiciones.

  ```jsx
  const [beads, setBeads] = useState([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 200, y: 100 },
  ]);

  const handleMove = (id, newPos) => {
    setBeads((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...newPos } : b))
    );
  };

  return (
    <>
      {beads.map((b) => (
        <Bead
          key={b.id}
          id={b.id}
          position={{ x: b.x, y: b.y }}
          onMove={(pos) => handleMove(b.id, pos)}
        />
      ))}
    </>
  );
  ```

  2.2. **Dibujar Hilo Básico** 🧵

- Usa SVG line entre beads.
- En `App.js`: Añade `<svg>` con `<line>` usando posiciones.

  ```jsx
  <svg
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
  >
    <line
      x1={beads[0].x + 25}
      y1={beads[0].y + 25}
      x2={beads[1].x + 25}
      y2={beads[1].y + 25}
      stroke="black"
    />
  </svg>
  ```

  - 2.2.1. Centro: +25 asume bead de 50px.

  2.3. **Movimiento Vinculado** ⚙️

- Al mover una, calcula dirección y mueve la otra para mantener distancia (e.g., 100px).
- En `handleMove`: Después de actualizar la movida, ajusta la otra.
  - 2.3.1. Calcula vector: `dx = x2 - x1`, normaliza y escala.
  ```jsx
  const handleMove = (id, newPos) => {
    setBeads((prev) => {
      let updated = prev.map((b) => (b.id === id ? { ...b, ...newPos } : b));
      const [b1, b2] = updated;
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = 100; // Longitud hilo
      if (dist > targetDist) {
        const ratio = targetDist / dist;
        if (id === 1) {
          // Mueve b2 hacia b1
          b2.x = b1.x + dx * ratio;
          b2.y = b1.y + dy * ratio;
        } else {
          b1.x = b2.x - dx * ratio;
          b1.y = b2.y - dy * ratio;
        }
      }
      return [b1, b2];
    });
  };
  ```
- ¡Básico vinculado! Pero sin física real (solo snap).

## 3. 💥 Añadir Colisiones Básicas

Detecta cuando beads se tocan (overlap).

3.1. **Detección Simple**

- En `useEffect` de `App.js`, chequea distancia cada frame (con `requestAnimationFrame`).
  - 3.1.1. Si dist < radio\*2, "colisionan".

```jsx
useEffect(() => {
  const checkCollision = () => {
    const [b1, b2] = beads;
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 50) {
      // Radio 25*2
      console.log("¡Colisión!"); // Placeholder para sonido
    }
    requestAnimationFrame(checkCollision);
  };
  checkCollision();
}, [beads]);
```

- 3.1.2. Para rebote básico: Invierte velocidades (trackea velocity en state).

  3.2. **Mejorar con Velocidad** 🏎️

- Añade `velocity` por bead: `{ vx: 0, vy: 0 }`.
- En drag: Calcula velocity como delta pos / time.
- En colisión: Intercambia velocities para "rebote elástico".
  - 3.2.1. Actualiza posiciones con velocity en RAF loop.

## 4. 🔊 Añadir Sonido al Chocar (Web Audio API)

Sin librerías, usa API nativa para sonido simple.

4.1. **Sonido Básico** 🎵

- Crea `AudioContext` en `App.js`.
- En colisión: Oscilador para "beep".
  ```jsx
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const playSound = () => {
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Tono A
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100); // Duración corta
  };
  ```
- Llama en checkCollision si colisión.

  4.2. **Bonus: Sonido Variable** 🎶

- Dependiendo de velocidad: Cambia frequency (e.g., 440 + speed\*100).
- Orden/Cantidad: Si múltiples beads, varia tipo (sine/square) o volumen.
  - 4.2.1. Trackea "colision chain" en state para secuencia.

## 5. 📈 Mejores Prácticas: Escala con Librerías

¡Ya lo hiciste a mano! Ahora ahorramos tiempo. Como sr dev, prioriza maintainability.

5.1. **Drag: Usa react-draggable** 🛡️

- Instala: `npm install react-draggable`.
- Reemplaza eventos manuales: Envuelve bead en `<Draggable>`.
  - 5.1.1. Soporta mobile out-of-box.

```jsx
import Draggable from 'react-draggable';
<Draggable onStop={(e, data) => onMove({ x: data.x, y: data.y })}>
  <div style={...} />
</Draggable>
```

5.2. **Física y Colisiones: Matter.js** ⚛️

- Instala: `npm install matter-js`.
- Crea engine, bodies (circles para beads), constraint (para hilo).
  - 5.2.1. En `useEffect`: `Matter.Engine.create()`, add bodies y run.
  - 5.2.2. Colisiones: `Matter.Events.on(engine, 'collisionStart', playSound)`.
  - 5.2.3. Render: Usa `Matter.Render` o sync con React state.
- Bonus: Usa velocity en collision event para variar sonido (e.g., gain node para volumen).

  5.3. **Sonido Avanzado: Howler.js o Tone.js** 🔉

- Instala: `npm install howler`.
- Carga samples (e.g., bead-clash.wav).

  - 5.3.1. Varia pitch/volume: `sound.rate(1 + speed/10)`.
  - 5.3.2. Para bonus: Secuencia con múltiples sounds basados en colision data.

  5.4. **Optimizaciones Finales** 💡

- **Performance**: Usa `useMemo` para cálculos pesados, throttle RAF.
- **Mobile**: Testea en real device; añade `touch-action: none`.
- **Escalabilidad**: Para más beads, usa reducer para state.
- **Debug**: Añade logs con emojis (e.g., console.log('💥 Colisión!')).

¡Listo! Empieza con 1-4 para basics, luego 5 para pro. Si atascas, comparte código para debug. 🚀
