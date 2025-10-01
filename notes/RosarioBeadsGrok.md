# 📖 Manual de Bolsillo: Rosario Completo en React con Física de Cuentas

¡No te preocupes! Entiendo el miedo a la complejidad—es un hobby, no un crunch de startup. Vamos a desglosar el rosario usando la arquitectura de componentes de React para mantenerlo modular y no freír tu cerebro. Un rosario típico tiene ~59 beads en un bucle circular (5 décadas de 10 beads + separadores), más una "cola" con 3-5 beads y una cruz. Lo aproximaremos a 60 beads en círculo + 3 en la cola para simplicidad.

**Estrategia**:

- Usa DOM para el prototipo (fácil de entender). Si laggea con 60 beads, migra a Canvas reutilizando la lógica (como discutimos antes).
- Componentes anidados: `<Rosary>` (contenedor), `<BeadChain>` (cadena de beads), `<Bead>` (cuenta individual).
- Física básica: Hilos como restricciones de distancia, colisiones simples (rebotes), sonidos al chocar.
- Soporte móvil: Ya incluido en drag.
- Bonus: Círculo inicial (posiciones en arco), sonidos variados basados en impacto.

Esto es "completo" pero básico—itera sobre él. Si es demasiado, empieza con 10 beads y escala.

## 🧱 Arquitectura de Componentes

Usamos hooks y componentes para modularidad:

- **Bead**: Cuenta individual, draggable, con ref.
- **BeadChain**: Maneja array de beads, hilos, colisiones, animación.
- **Rosary**: Contenedor top-level, configura el círculo + cola, añade sonidos.

Estado central en `BeadChain` para beads: `[{ id, x, y, vx: 0, vy: 0 }]`.

## 1. 🔗 Código Completo: Rosario con DOM

Copia esto en un proyecto React (usa `create-react-app`). Incluye audio files (ej. 'clack1.mp3', 'clack2.mp3') en public/.

### 1.1 Componente `Bead` (Draggable Individual)

```jsx
import React, { useRef, useEffect } from "react";

const Bead = ({ position, onMove, id }) => {
  const beadRef = useRef(null);

  useEffect(() => {
    const bead = beadRef.current;
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const startDrag = (e) => {
      e.preventDefault();
      document.body.classList.add("dragging");
      isDragging = true;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      offset.x = clientX - position.x;
      offset.y = clientY - position.y;
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);
    };

    const drag = (e) => {
      e.preventDefault();
      if (isDragging) {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        onMove(id, { x: clientX - offset.x, y: clientY - offset.y });
      }
    };

    const endDrag = () => {
      isDragging = false;
      document.body.classList.remove("dragging");
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchend", endDrag);
    };

    bead.addEventListener("mousedown", startDrag);
    bead.addEventListener("touchstart", startDrag, { passive: false });
    return () => {
      bead.removeEventListener("mousedown", startDrag);
      bead.removeEventListener("touchstart", startDrag);
    };
  }, [position, onMove, id]);

  return (
    <div
      ref={beadRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "22px",
        height: "22px",
        backgroundColor: "coral",
        borderRadius: "50%",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
      }}
    />
  );
};

export default React.memo(Bead);
```

### 1.2 Componente `BeadChain` (Cadena con Física)

Maneja beads, hilos (distancia fija), colisiones, inercia, sonidos.

```jsx
import React, { useState, useEffect, useCallback } from "react";
import Bead from "./Bead";

const THREAD_LENGTH = 30;
const BEAD_RADIUS = 11;
const FRICTION = 0.98;

const BeadChain = ({ initialBeads, isLoop = false, audioFiles }) => {
  const [beads, setBeads] = useState(initialBeads);

  // Pre-carga audios
  const audios = useMemo(
    () => audioFiles.map((file) => new Audio(file)),
    [audioFiles]
  );

  const handleMove = useCallback(
    (id, newPosition) => {
      setBeads((prev) => {
        const newBeads = [...prev];
        const index = newBeads.findIndex((b) => b.id === id);
        const oldPos = newBeads[index];
        newBeads[index] = {
          ...oldPos,
          ...newPosition,
          vx: (newPosition.x - oldPos.x) * 0.1,
          vy: (newPosition.y - oldPos.y) * 0.1,
        }; // Inercia simple

        // Aplicar hilos (restricciones de distancia)
        const applyConstraints = (i, j) => {
          const dx = newBeads[j].x - newBeads[i].x;
          const dy = newBeads[j].y - newBeads[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > THREAD_LENGTH) {
            const angle = Math.atan2(dy, dx);
            const midX = (newBeads[i].x + newBeads[j].x) / 2;
            const midY = (newBeads[i].y + newBeads[j].y) / 2;
            newBeads[i].x = midX - (THREAD_LENGTH / 2) * Math.cos(angle);
            newBeads[i].y = midY - (THREAD_LENGTH / 2) * Math.sin(angle);
            newBeads[j].x = midX + (THREAD_LENGTH / 2) * Math.cos(angle);
            newBeads[j].y = midY + (THREAD_LENGTH / 2) * Math.sin(angle);
          }
        };

        // Hilos en cadena
        if (index > 0) applyConstraints(index - 1, index);
        if (index < newBeads.length - 1) applyConstraints(index, index + 1);
        if (isLoop && index === 0) applyConstraints(newBeads.length - 1, 0); // Cierra el loop
        if (isLoop && index === newBeads.length - 1)
          applyConstraints(newBeads.length - 1, 0);

        return newBeads;
      });
    },
    [isLoop]
  );

  // Animación: Inercia, colisiones, sonidos
  useEffect(() => {
    let raf;
    const animate = () => {
      setBeads((prev) => {
        const newBeads = prev.map((b) => ({
          ...b,
          x: b.x + (b.vx || 0),
          y: b.y + (b.vy || 0),
          vx: (b.vx || 0) * FRICTION,
          vy: (b.vy || 0) * FRICTION,
        }));

        // Colisiones simples (solo adyacentes para eficiencia)
        for (let i = 0; i < newBeads.length - 1; i++) {
          const dx = newBeads[i + 1].x - newBeads[i].x;
          const dy = newBeads[i + 1].y - newBeads[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BEAD_RADIUS * 2) {
            // Rebote
            const tempVx = newBeads[i].vx;
            const tempVy = newBeads[i].vy;
            newBeads[i].vx = newBeads[i + 1].vx;
            newBeads[i].vy = newBeads[i + 1].vy;
            newBeads[i + 1].vx = tempVx;
            newBeads[i + 1].vy = tempVy;

            // Sonido variado basado en impacto y orden
            const impact =
              Math.abs(newBeads[i].vx - newBeads[i + 1].vx) +
              Math.abs(newBeads[i].vy - newBeads[i + 1].vy);
            const audioIndex = Math.floor(impact % audios.length);
            audios[audioIndex].playbackRate = 1 + i * 0.05; // Variación por orden
            audios[audioIndex].play();
          }
        }
        // Colisión loop si es círculo
        if (isLoop) {
          const dx = newBeads[0].x - newBeads[newBeads.length - 1].x;
          const dy = newBeads[0].y - newBeads[newBeads.length - 1].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BEAD_RADIUS * 2) {
            // Rebote similar
            const tempVx = newBeads[0].vx;
            const tempVy = newBeads[0].vy;
            newBeads[0].vx = newBeads[newBeads.length - 1].vx;
            newBeads[0].vy = newBeads[newBeads.length - 1].vy;
            newBeads[newBeads.length - 1].vx = tempVx;
            newBeads[newBeads.length - 1].vy = tempVy;

            // Sonido
            const impact =
              Math.abs(tempVx - newBeads[0].vx) +
              Math.abs(tempVy - newBeads[0].vy);
            const audioIndex = Math.floor(impact % audios.length);
            audios[audioIndex].play();
          }
        }

        return newBeads;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [audios]);

  // Dibujar hilos con SVG
  const renderThreads = () => {
    const lines = [];
    for (let i = 0; i < beads.length - 1; i++) {
      lines.push(
        <line
          key={`line-${i}`}
          x1={beads[i].x + BEAD_RADIUS}
          y1={beads[i].y + BEAD_RADIUS}
          x2={beads[i + 1].x + BEAD_RADIUS}
          y2={beads[i + 1].y + BEAD_RADIUS}
          stroke="black"
        />
      );
    }
    if (isLoop) {
      lines.push(
        <line
          key="loop-line"
          x1={beads[beads.length - 1].x + BEAD_RADIUS}
          y1={beads[beads.length - 1].y + BEAD_RADIUS}
          x2={beads[0].x + BEAD_RADIUS}
          y2={beads[0].y + BEAD_RADIUS}
          stroke="black"
        />
      );
    }
    return lines;
  };

  return (
    <>
      {beads.map((bead) => (
        <Bead
          key={bead.id}
          id={bead.id}
          position={{ x: bead.x, y: bead.y }}
          onMove={handleMove}
        />
      ))}
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
        {renderThreads()}
      </svg>
    </>
  );
};

export default BeadChain;
```

### 1.3 Componente `Rosary` (Contenedor Completo)

Configura círculo + cola.

```jsx
import React from "react";
import BeadChain from "./BeadChain";

const CENTER_X = window.innerWidth / 2;
const CENTER_Y = window.innerHeight / 2;
const RADIUS = 200; // Radio del círculo

function generateCircleBeads(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return {
      id: i + 1,
      x: CENTER_X + RADIUS * Math.cos(angle),
      y: CENTER_Y + RADIUS * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });
}

function generateTailBeads(startBead) {
  return [
    { id: "tail1", x: startBead.x, y: startBead.y + 50, vx: 0, vy: 0 },
    { id: "tail2", x: startBead.x, y: startBead.y + 100, vx: 0, vy: 0 },
    { id: "tail3", x: startBead.x, y: startBead.y + 150, vx: 0, vy: 0 }, // + Cruz (puedes añadir un div)
  ];
}

function Rosary() {
  const circleBeads = generateCircleBeads(60); // Círculo principal
  const tailBeads = generateTailBeads(circleBeads[0]); // Cola desde bead 0

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        userSelect: "none",
      }}
    >
      <BeadChain
        initialBeads={circleBeads}
        isLoop={true}
        audioFiles={["/clack1.mp3", "/clack2.mp3", "/clack3.mp3"]} // Variados
      />
      <BeadChain
        initialBeads={tailBeads}
        isLoop={false}
        audioFiles={["/clack1.mp3", "/clack2.mp3", "/clack3.mp3"]}
      />
      {/* Cruz simple al final de la cola */}
      <div
        style={{
          position: "absolute",
          left: `${tailBeads[2].x}px`,
          top: `${tailBeads[2].y + 50}px`,
          width: "20px",
          height: "40px",
          backgroundColor: "gold",
        }}
      />
    </div>
  );
}

export default Rosary;
```

### 1.4 CSS Global (en index.css)

```css
body {
  margin: 0;
  overflow: hidden;
}

.dragging * {
  user-select: none !important;
}
```

## 2. 💡 Cómo Tacklearlo Ahora

- **¿Es manejable?** Sí, si lo tomas en pedazos. Empieza con `Bead` (ya lo tienes), añade `BeadChain` con 2 beads, prueba drag/hilos. Luego colisiones/sonidos. Escala a 60 en círculo. El código arriba es ~300 líneas—modular, no un monolito.
- **Complejidad**: La física es simple (no simulación real). Para 60 beads, colisiones solo adyacentes evitan O(n²). Si laggea (prueba en móvil), migra a Canvas: Reemplaza render con `ctx.arc` en un `useEffect` loop, reutiliza estado y lógica (handleMove, animate).
- **Consejos Hobby**:
  - Prueba con 10 beads en círculo primero.
  - Añade gravedad: En animate, `vy += 0.1`.
  - Sonidos: Descarga free clack sounds, varia con `playbackRate`.
  - Si se complica, introduce Matter.js (lib física) después de manual.

Si es demasiado, usa una lib como Konva.js para Canvas interactivo—ahorra tiempo.

## 3. 📝 Prompt Completo para Recrear (en Caso de Límite de Contexto)

"Create a complete React app for a digital rosary with ~60 beads forming a circular chain that meets at the ends, plus a third strand (tail) with 3-5 beads and a cross. Use DOM elements for beads (divs) and SVG for threads. Make beads draggable with mouse/touch, connected by fixed-length threads (distance constraints). Implement basic physics: inertia on release, collisions with rebounds and sounds (varied by impact strength, order, and number of colliding beads). Support mobile. Break it down into components: Bead (draggable), BeadChain (handles array, physics, collisions), Rosary (top-level, generates circle + tail). Use requestAnimationFrame for animation loop. Provide full code, optimizations for performance with 60 beads, and notes on migrating to Canvas if needed. Style beads as coral circles, threads black. Include pre-loaded audio for clacks with variations."
