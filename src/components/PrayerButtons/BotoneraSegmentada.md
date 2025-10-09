# 📱 Botonera Segmentada Responsiva en React: De Tabs Básicos a UX Fluida

¡Ey, dev en ascenso! Este extracto de tu manual personal de dev se enfoca en tu rediseño: pasar de grid caótico a una **botonera inferior segmentada** (como un tab bar moderno, tipo iOS TabBar o Material Design Bottom Navigation). Objetivo: **7 segmentos horizontales** en una barra full-width fixed-bottom, con iconos (no texto) para fit en mobile. Taps rotan opciones (ciclo simple), y prev/next para flujo rosario.

Para el pain point de "15 taps en misterios": **Estándar UX hoy** es **jerarquía + gestos**: Botón principal para "Misterios" → Sub-ciclo o swipe para los 5 por tipo. Evitamos overload (no 2 botones dedicados); usamos un solo segmento que toggles sub-modo. Vamos **básico** (Flexbox + state cycle) sin libs, para que domines mecánicas. Luego, pro: Gestos swipe (touch events) y animaciones suaves.

Copia-pega en tu `PrayerButtons.jsx` y CSS. Asume `prayers` ya tiene estructura (e.g., `apertura: [{text, title, img}]`). Para data: Sugiero un array flat con `type: 'apertura' | 'misterio' | etc.`, y `mysteryType` para filtrar – fácil ciclo por sección.

## 🔍 1. Diagnóstico Rápido: Mecánicas Clave del Rediseño

- **Layout base**: Barra fixed-bottom (tu 38vh → ajusta a ~10vh para slim). Subdividida en 7: e.g., [Prev, Apertura, Decada, Misterios, Gloriosos/Dolorosos/etc., Cierre, Next]. Icons: Emoji (🌟 para Apertura, 🔮 para Misterios) o SVG inline.
- **Interacción**: Tap segmento → Entra "modo ciclo" para esa sección (state: currentSection). Cada tap extra rota al siguiente item (useState index). Escape: Tap fuera o prev/next.
- **Flujo rosario**: Prev/Next global: Avanza array maestro (e.g., secuencia: apertura[0] → decada[1] → misterio[2] → ...). Para misterios: Al tap "Misterios", ciclo interno por 5, pero con selector rápido (sub-icons o swipe).
- **Pain de 15 taps**: **Estándar**: No ciclo puro para >4 items. Usa **accordion/sub-list** o **horizontal scroll/swipe** en sub-view (como Netflix carousel). UX win: Reduce taps a 1-2 por misterio.
- **Mobile-first**: Flexbox para equal-width segments. Touch-friendly (min 44px height).

**Acción inicial**: Sketch en papel: 7 icons en barra. Test: ¿Fluye el ciclo? Sí → Escala.

## 🛠️ 2. Implementación Básica: Flexbox Barra + Ciclo Simple por State

¡Manos a la obra! Sin libs (puro React + CSS). Barra horizontal con 7 botones flex. State maneja sección activa y index de ciclo. Para data: Usa arrays existentes; ciclo con `% length`.

### Paso 1: Estructura Data Ligera (Opcional, pero Ayuda)

- En tu componente, agrega:
  ```js:disable-run
  // Ejemplo flat array para flujo global (rosario secuencia)
  const rosarySequence = [
    ...prayers.apertura, // 3-4 items
    ...prayers.decada,   // 10 Ave Marías? → Agrupa si many
    ...prayers.mysteries[currentMystery], // 5 por misterio
    ...prayers.cierre    // 3-4
  ];
  // O por sección: const sections = { apertura: prayers.apertura, ... }
  ```
- **Por qué**: Fácil prev/next: `setGlobalIndex((prev) => (prev + 1) % rosarySequence.length)`. Para misterios: Filtra por `type`.

### Paso 2: JSX Base – Barra Segmentada

- Reemplaza tu `<div className="button-grid">` por esto en `PrayerButtons.jsx`:

  ```jsx
  import { useState } from "react"; // Ya lo tienes
  // ... resto imports

  function PrayerButtons({ prayers, setPrayer, /* ... props */ }) {
    const [activeSection, setActiveSection] = useState('none'); // 'apertura' | 'misterios' | etc.
    const [cycleIndex, setCycleIndex] = useState(0); // Para rotación en sección
    const [globalIndex, setGlobalIndex] = useState(0); // Para prev/next rosario

    // Handlers (integra tu handlePrayerAndCount)
    const handleSegmentTap = (section) => {
      if (activeSection === section) {
        // Ya activo: Cicla al siguiente
        setCycleIndex((prev) => (prev + 1) % getSectionItems(section).length);
        const item = getSectionItems(section)[cycleIndex]; // Corrige index post-update? Usa useEffect si async
        handlePrayerAndCount(item.text, item);
      } else {
        // Nuevo: Entra modo
        setActiveSection(section);
        setCycleIndex(0);
        const item = getSectionItems(section)[0];
        handlePrayerAndCount(item.text, item);
      }
    };

    const handlePrev = () => setGlobalIndex((prev) => (prev - 1 + rosarySequence.length) % rosarySequence.length);
    const handleNext = () => setGlobalIndex((prev) => (prev + 1) % rosarySequence.length);

    // Helper: Items por sección (ajusta a tu data)
    const getSectionItems = (section) => {
      switch (section) {
        case 'apertura': return prayers.apertura;
        case 'decada': return prayers.decada;
        case 'misterios': return prayers.mysteries[currentMystery] || [];
        case 'cierre': return prayers.cierre;
        default: return [];
      }
    };

    // Secuencia global para prev/next (ejemplo)
    const rosarySequence = [... /* como arriba */ ];
    const currentRosaryItem = rosarySequence[globalIndex];
    if (currentRosaryItem) handlePrayerAndCount(currentRosaryItem.text, currentRosaryItem); // Auto-load? Opcional

    // Iconos simples (emoji; usa SVG después)
    const segments = [
      { key: 'prev', icon: '⬅️', onClick: handlePrev, disabled: false },
      { key: 'apertura', icon: '🌟', onClick: () => handleSegmentTap('apertura') },
      { key: 'decada', icon: '📿', onClick: () => handleSegmentTap('decada') },
      { key: 'misterios', icon: '🔮', onClick: () => handleSegmentTap('misterios') },
      { key: 'misterio-type', icon: currentMystery.charAt(0), onClick: () => setcurrentMystery((prev) => mysteryTypes[(mysteryTypes.indexOf(prev) + 1) % mysteryTypes.length]) }, // Ciclo tipos
      { key: 'cierre', icon: '✨', onClick: () => handleSegmentTap('cierre') },
      { key: 'next', icon: '➡️', onClick: handleNext, disabled: false }
    ];

    return (
      <div className="segmented-bar">
        <div className="segments-container">
          {segments.map(({ key, icon, onClick, disabled }) => (
            <button
              key={key}
              onClick={onClick}
              className={`segment-btn ${activeSection === key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              disabled={disabled}
            >
              <span className="icon">{icon}</span>
              {activeSection === key && <span className="label">{getSectionItems(key)?.[cycleIndex]?.title?.slice(0,3) || ''}</span>} {/* Mini-label opcional */}
            </button>
          ))}
        </div>
        {/* Opcional: Preview actual oración abajo */}
        <div className="preview">{currentRosaryItem?.title || 'Listo para rezar'}</div>
      </div>
    );
  }
  ```

- **Mecánica**: 7 botones flex. Tap → Cicla si activo, entra si no. Prev/Next global.

### Paso 3: CSS Básico – Flexbox para Subdivisión

- Actualiza `PrayerButtons.css`:

  ```css
  .segmented-bar {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 60px; /* Slim: ~10vh equiv */
    background: var(--primary);
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 4px;
    box-sizing: border-box;
  }

  .segments-container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .segment-btn {
    flex: 1; /* Equal width: 7 parts */
    border: none;
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    font-size: 20px; /* Icono grande */
    transition: background 0.2s ease;
    position: relative;
  }

  .segment-btn.active {
    background: var(--accent);
    border-radius: 8px; /* Modern pill */
  }

  .segment-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .icon {
    margin-bottom: 2px;
  }

  .label {
    font-size: 10px; /* Solo si activo: Muestra acronym */
  }

  .preview {
    position: absolute;
    bottom: -20px; /* Sobre barra? Ajusta */
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }

  /* Mobile: Ya responsive por flex */
  @media (max-width: 480px) {
    .segmented-bar {
      height: 56px;
    }
    .segment-btn {
      font-size: 18px;
    }
  }
  ```

- **Por qué básico funciona**: Flex:1 = 7 partes auto. Icons emoji = 0 assets. Ciclo: State simple, no re-renders extras.

**Test básico**: Recarga. Tap Apertura → Cicla prayers. ¿Rota? ¡Boom! Anota: "7 segments OK, ciclo fluido".

## 🚀 3. Mejores Prácticas: Manejo de Muchos Items (Misterios) + Gestos Pro

Ahora que "lo haces a mano" (barra + ciclo), escalamos UX. Para 5+ misterios: **No taps infinitos**. Estándar: **Swipe horizontal** en sub-view (como TikTok/Gallery) o **sub-segmentos pop-up**. Agrega animaciones CSS para "dropdown moderno" (slide-up).

### Nivel 1: Sub-Ciclo para Misterios (Reduce Taps)

- Modifica `handleSegmentTap` para 'misterios':
  ```js
  // En handler:
  if (section === "misterios") {
    // Muestra sub-bar temporal: 5 icons para los 5 misterios
    setSubView("misterios"); // Nuevo state: null | 'misterios'
    // O ciclo rápido: Cada tap +1 en sub-index
  }
  ```
- Agrega sub-view en JSX (conditional):
  ```jsx
  {
    activeSection === "misterios" && (
      <div className="sub-bar">
        {/* 5 botones mini para misterios específicos */}
        {prayers.mysteries[currentMystery].map((prayer, idx) => (
          <button
            key={idx}
            onClick={() => {
              /* Set sub-index y prayer */
            }}
          >
            {idx + 1} {/* O icono número */}
          </button>
        ))}
      </div>
    );
  }
  ```
- CSS para sub-bar:
  ```css
  .sub-bar {
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    height: 50px;
    background: var(--primary);
    display: flex;
    gap: 4px;
    padding: 4px;
    /* Anim: Slide up */
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  .sub-bar.active {
    transform: translateY(0);
  }
  ```
- **UX win**: 1 tap en "Misterios" → Sub-bar con 5 taps max. Estándar: Como iOS picker wheel, pero horizontal.

### Nivel 2: Gestos Swipe para Ciclo (Toque Natural)

- **Mecánica**: Detecta touch/swipe left/right → Cicla index. Reduce taps a drags.
- Agrega a botón activo (usa `onTouchStart/End`):

  ```jsx
  const [touchStartX, setTouchStartX] = useState(0);
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // Threshold swipe
      setCycleIndex((prev) => diff > 0 ? (prev + 1) % length : (prev - 1 + length) % length);
    }
  };

  // En botón activo:
  <button
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    // ... resto
  >
  ```

- **Por qué pro**: Estándar en apps modernas (Instagram stories). Funciona en >4 items sin fatiga.

### Nivel 3: ¿Cuándo Libs? (Ahora Sí, Ahorra Tiempo)

- **Domines basics**: ¡Check! (Flex + touch events).
- **Siguiente**: Para swipe polish, usa **react-swipeable** (`npm i react-swipeable`). Hook simple:
  ```js
  import { useSwipeable } from "react-swipeable";
  const handlers = useSwipeable({
    onSwipedLeft: () => setCycleIndex((prev) => (prev + 1) % length),
    onSwipedRight: () => setCycleIndex((prev) => (prev - 1 + length) % length),
    trackMouse: true, // Para desktop
  });
  // En div: {...handlers}
  ```
- **Por qué ahora**: Maneja edge cases (velocidad swipe, multi-touch). Ahorra 30% debug. Alternativa: Framer Motion para anims (`npm i framer-motion`): `<motion.div initial={{ x: 100 }} animate={{ x: 0 }}>` en sub-bar.
- **Full-lib si escala**: React Native? No, pero para web: Headless UI para accessible tabs.

## 📝 Notas para Tu Manual Personal

- **Itera**: Básico → Agrega sub-bar para misterios → Test swipe en mobile (DevTools touch sim). Métrica: ¿<3 taps por oración? Sí.
- **Pitfalls comunes**: Touch events no fire en desktop (agrega mouse equiv). Data flat: Si misterios cambian, usa `useMemo` para sequence.
- **Siguiente capítulo**: "Flujo Rosario con useReducer" (state machine para secuencias complejas).
- **Follow-up**: ¿Data exacta de prayers? (e.g., cuántos en decada). Si swipe rompe, paste console.

¡Arma tu manual con esto, tweak y fluye! ¿Swipe o sub-bar primero? 🔥

```

```
