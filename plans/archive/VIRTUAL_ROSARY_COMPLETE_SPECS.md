# Virtual Rosary Implementation - Complete Technical Specifications

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Interactive Rosary (Matter.js Physics)](#2-interactive-rosary-matterjs-physics)
3. [Prayer Navigation System](#3-prayer-navigation-system)
4. [UI Components & Features](#4-ui-components--features)
5. [Theme & Styling System](#5-theme--styling-system)
6. [Prayer Data Structure](#6-prayer-data-structure)
7. [Critical Implementation Details](#7-critical-implementation-details)
8. [Known Issues & Solutions](#8-known-issues--solutions)
9. [Integration Points](#9-integration-points)
10. [File Reference Map](#10-file-reference-map)

---

## 1. System Architecture

### Component Hierarchy
The application follows a hierarchical structure orchestrated by `App.js`:

```
App.js (Root Component)
├── InterfaceToggle (Settings Panel)
├── InteractiveRosary (Physics-based Rosary)
├── ViewPrayers (Prayer Display)
└── PrayerButtons (Navigation Controls)
```

### State Management Flow
The application uses a custom hook `useRosaryState` for centralized state management:

```javascript
// State flow diagram:
App.js
├── useRosaryState hook
│   ├── currentPrayerIndex (number)
│   ├── highlightedBead (number)
│   ├── handleBeadClick (function)
│   ├── jumpToPrayer (function)
│   ├── navigateToIndex (function)
│   └── getRosarySequence (function)
├── Local state for UI visibility
│   ├── showRosary (boolean)
│   ├── showCounters (boolean)
│   ├── focusMode (boolean)
│   └── leftHandedMode (boolean)
└── Prayer content state
    ├── prayer (string)
    ├── prayerImg (string/object)
    └── currentMystery (string)
```

### Data Structure Overview
The `RosarioPrayerBook` object contains all prayer data:

```javascript
RosarioPrayerBook = {
  // Prayer sequences for each mystery type
  RGo: [...], // Gozosos (Joyful)
  RDo: [...], // Dolorosos (Sorrowful) 
  RGl: [...], // Gloriosos (Glorious)
  RL: [...],  // Luminosos (Luminous)
  
  // Prayer content sections
  apertura: [...], // Opening prayers
  decada: [...],   // Decade prayers
  mysteries: {
    gozosos: [...],
    dolorosos: [...],
    gloriosos: [...],
    luminosos: [...]
  },
  cierre: [...] // Closing prayers
}
```

### Event System
The application uses custom events for component communication:

```javascript
// Custom Events:
- themeChanged: Triggered when theme switches
- prayerScrollNext: Triggered when scrolling down at bottom
- prayerScrollPrev: Triggered when scrolling up at top
- leftHandedModeChange: Triggered when left-handed mode toggles
- fontSizeChange: Triggered when font size changes
- rosaryVisibilityChange: Triggered when rosary visibility toggles
```

---

## 2. Interactive Rosary (Matter.js Physics)

### Physics Configuration
The Matter.js engine is configured for floating rosary behavior:

```javascript
// Engine Settings
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 0 } // Zero gravity for floating effect
});

// Renderer Settings
const render = Matter.Render.create({
  element: container,
  engine: engine,
  options: {
    width: width,
    height: height,
    wireframes: false,
    background: "transparent"
  }
});
```

### Bead Structure
The rosary consists of 60 total beads arranged in specific patterns:

#### Cross Structure (6 beads)
```javascript
// Cross positions (6 squares in traditional cross pattern)
const crossPositions = [
  { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 }, // Left arm
  { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 }, // Center
  { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 }, // Right arm
  { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 }, // Right end
  { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // Bottom
  { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }  // Top
];
```

#### Tail Structure (3 beads)
```javascript
// Tail beads connecting cross to main loop
// Positions: centerBead -> tailBead1 -> tailBead2 -> tailBead3 -> cross
// Prayer mapping: G (Glory Be) -> C (Credo) -> P (Our Father) -> A (Hail Mary)
```

#### Main Loop Structure (50 beads)
```javascript
// 50 beads arranged in circular pattern
// 5 decades of 10 beads each
// Every 10th bead is larger (decade marker)
// Prayer mapping: Each decade contains 10 Hail Marys (A)
```

### Constraint/Spring System
All beads are connected with spring constraints:

```javascript
// Spring Options
const springOptions = (length, stiffness = 0.08) => ({
  stiffness: stiffness,
  damping: 0.5,
  length: length,
  render: { 
    strokeStyle: "#94a3b8", 
    lineWidth: 2, 
    type: "line" 
  }
});

// Critical Values:
- Base chain segment length: 15px
- Long spring multiplier: 1.5x
- Spring length adjustment: doubled and reduced by bead radii
- Pole connection offsets: calculated for edge-to-edge connections
```

### Prayer Index Mapping
Physical beads map to prayer sequence indices:

```javascript
// Cross: prayerIndex: 0 (Sign of the Cross)
// Tail beads: prayerIndex: 2, 3, 4 (Credo, Our Father, Hail Mary)
// Center bead: prayerIndex: 7 (Glory Be)
// Main loop beads: prayerIndex: 8-57 (Decade prayers)
// Each decade: 14 prayers total (F, M, P, A×10, G, F)
```

### Highlighting Logic
Current prayer bead is highlighted with gold stroke:

```javascript
// Highlighting implementation
if (bead.prayerIndex === currentPrayerIndexRef.current) {
  context.strokeStyle = colors.highlight; // #FFD700
  context.lineWidth = 3;
  context.beginPath();
  context.arc(bead.position.x, bead.position.y, size + 2, 0, 2 * Math.PI);
  context.stroke();
}
```

### Color Schemes
Mystery-specific color palettes:

```javascript
const colorSchemes = {
  dolorosos: {
    beads: "#D2B48C",    // Tan
    cross: "#8B4513",    // Saddle Brown
    chain: "#708090",    // Slate Gray
    highlight: "#FFD700" // Gold
  },
  gloriosos: {
    beads: "#2F2F2F",    // Dark Gray
    cross: "#1C1C1C",    // Very Dark Gray
    chain: "#708090",    // Slate Gray
    highlight: "#FFD700" // Gold
  },
  gozosos: {
    beads: "#FF7F7F",    // Light Coral
    cross: "#CD5C5C",    // Indian Red
    chain: "#708090",    // Slate Gray
    highlight: "#FFD700" // Gold
  },
  luminosos: {
    beads: "#F5F5DC",    // Beige
    cross: "#DEB887",    // Burlywood
    chain: "#C0C0C0",    // Silver
    highlight: "#FFD700" // Gold
  }
};
```

---

## 3. Prayer Navigation System

### Rosary Sequences
Each mystery type has a specific prayer sequence:

```javascript
// Sequence mapping
const mysteryToArray = {
  gozosos: "RGo",    // Joyful Mysteries
  dolorosos: "RDo",  // Sorrowful Mysteries
  gloriosos: "RGl",  // Glorious Mysteries
  luminosos: "RL"    // Luminous Mysteries
};

// Example sequence (RGo - Joyful Mysteries):
[
  "SC",    // Sign of the Cross
  "AC",    // Act of Contrition
  "C",     // Credo
  "P",     // Our Father
  "A", "A", "A", // 3 Hail Marys
  "G",     // Glory Be
  "F",     // Fatima Prayer
  "MGo1",  // First Mystery
  "P",     // Our Father
  "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", // 10 Hail Marys
  "G",     // Glory Be
  "F",     // Fatima Prayer
  // ... continues for 5 decades
  "LL",    // Litany
  "S",     // Salve Regina
  "Papa"   // Prayer for Pope
]
```

### Navigation Methods

#### Bead Clicks
```javascript
// Event listener for bead clicks
Matter.Events.on(mouseConstraint, "mousedown", (event) => {
  let clickedBody = event.source.body;
  const clickedBead = matterInstance.current?.allBeads.find(
    (b) => b.id === clickedBody.id
  );
  if (clickedBead && clickedBead.prayerIndex !== undefined) {
    onBeadClick(clickedBead.prayerIndex, clickedBead.prayerId);
  }
});
```

#### Button Navigation
```javascript
// Previous prayer
const handlePrev = () => {
  const rosaryArray = getRosarySequence();
  const prevIndex = (currentPrayerIndex - 1 + rosaryArray.length) % rosaryArray.length;
  navigateToIndex(prevIndex);
};

// Next prayer
const handleNext = () => {
  const rosaryArray = getRosarySequence();
  const nextIndex = (currentPrayerIndex + 1) % rosaryArray.length;
  navigateToIndex(nextIndex);
};
```

#### Jump to Prayer
```javascript
// Jump to specific prayer by ID
const jumpToPrayer = (prayerId) => {
  const rosarySequence = getRosarySequence();
  const targetIndex = rosarySequence.indexOf(prayerId);
  if (targetIndex !== -1) {
    setCurrentPrayerIndex(targetIndex);
    setHighlightedBead(targetIndex);
    return targetIndex;
  }
  return currentPrayerIndex;
};
```

#### Scroll-based Navigation
```javascript
// Scroll detection in ViewPrayers component
const handleWheel = (event) => {
  const { deltaY } = event;
  const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
  
  const isAtTop = scrollTop <= 10;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
  
  if (deltaY > 0 && isAtBottom) {
    // Scroll down at bottom - go to next prayer
    window.dispatchEvent(new CustomEvent("prayerScrollNext"));
  } else if (deltaY < 0 && isAtTop) {
    // Scroll up at top - go to previous prayer
    window.dispatchEvent(new CustomEvent("prayerScrollPrev"));
  }
};
```

### Index Calculation
Decade positions and mystery numbers are calculated dynamically:

```javascript
// Get current mystery number based on prayer index
const getCurrentMysteryNumber = () => {
  const rosarySequence = getRosarySequence();
  const currentPrayerId = rosarySequence[currentPrayerIndex];
  
  // Find which mystery this prayer belongs to
  if (prayers.mysteries?.[currentMystery]) {
    const mysteryIndex = prayers.mysteries[currentMystery].findIndex(
      (mystery) => mystery.id === currentPrayerId
    );
    if (mysteryIndex !== -1) {
      return mysteryIndex + 1;
    }
  }
  
  // Default logic: roughly every 14 prayers is a new mystery
  return Math.floor(currentPrayerIndex / 14) + 1;
};
```

### Hail Mary Counter
Algorithm for counting Hail Marys in current decade:

```javascript
const getHailMaryCount = () => {
  const rosarySequence = prayers[mysteryToArray[currentMystery]] || [];
  
  // Find decade starting positions
  const decadeStarts = [];
  for (let i = 0; i < rosarySequence.length; i++) {
    if (rosarySequence[i] && rosarySequence[i].startsWith("M")) {
      // Find next "P" after mystery
      for (let j = i + 1; j < rosarySequence.length; j++) {
        if (rosarySequence[j] === "P") {
          decadeStarts.push(j);
          break;
        }
      }
    }
  }
  
  // Find current decade
  let currentDecadeStart = 0;
  for (let i = decadeStarts.length - 1; i >= 0; i--) {
    if (currentPrayerIndex >= decadeStarts[i]) {
      currentDecadeStart = decadeStarts[i];
      break;
    }
  }
  
  // Count Hail Marys in current decade
  let count = 0;
  for (let i = currentDecadeStart; i <= currentPrayerIndex && i < rosarySequence.length; i++) {
    if (rosarySequence[i] === "A") {
      count++;
    }
  }
  
  return count;
};
```

---

## 4. UI Components & Features

### ViewPrayers Component

#### Focus Mode Implementation
```javascript
// Focus mode shows only image with discreet counter
if (focusMode) {
  return (
    <div className="stained-glass-prayer-container focus-mode">
      {/* Full-screen background image */}
      <div className="page-right">
        <img src={finalImageUrl} alt="Prayer illustration" />
      </div>
      
      {/* Discreet rosary counter */}
      <div className="focus-counter" onClick={onToggleFocusMode}>
        <div>📿</div>
        <div>{hailMaryCount}</div>
        <div>Tap to show text</div>
      </div>
    </div>
  );
}
```

#### Scroll Detection
```javascript
// Wheel event handler for scroll-based navigation
useEffect(() => {
  const handleWheel = (event) => {
    const { deltaY } = event;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    const isAtTop = scrollTop <= 10;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (deltaY > 0 && isAtBottom) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("prayerScrollNext"));
    } else if (deltaY < 0 && isAtTop) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("prayerScrollPrev"));
    }
  };
  
  const container = scrollContainerRef.current;
  if (container) {
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }
}, []);
```

#### Theme-based Image Selection
```javascript
// Image selection logic
const theme = localStorage.getItem("theme");
const isDark = theme === "dark";
const prayerObj = result.prayerImg;
const selectedImage = isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
setPrayerImg(selectedImage);
```

#### Progress Bar Segments
```javascript
// 7-segment progress bar
const getProgressSegments = () => {
  const segments = [
    { label: "Opening", start: 0, end: 8 },
    { label: "M1", start: 9, end: 22 },
    { label: "M2", start: 23, end: 36 },
    { label: "M3", start: 37, end: 50 },
    { label: "M4", start: 51, end: 64 },
    { label: "M5", start: 65, end: 78 },
    { label: "Closing", start: 79, end: 81 }
  ];
  
  const currentSegment = segments.find(
    (seg) => currentPrayerIndex >= seg.start && currentPrayerIndex <= seg.end
  );
  
  return { segments, currentSegment };
};
```

#### Sound Effects Integration
```javascript
// Sound effects for navigation
const soundEffectsRef = useRef(new SoundEffects());

// Play sounds on different events
soundEffectsRef.current.playScrollSound();        // Normal scrolling
soundEffectsRef.current.playEndOfScrollSound();   // At boundaries
soundEffectsRef.current.playPrayerChangeSound();   // Prayer changes
```

### PrayerButtons Component

#### Segmented Navigation Bar
```javascript
// Navigation segments with icons
const navigationSegments = [
  { key: "prev", icon: "⬅️", onClick: handlePrev },
  { key: "apertura", icon: "🌟", onClick: () => handleSegmentTap("apertura") },
  { key: "decada", icon: "📿", onClick: () => handleSegmentTap("decada") },
  { key: "misterios", icon: "🔮", onClick: () => handleSegmentTap("misterios") },
  { key: "misterio-type", icon: currentMystery.charAt(0).toUpperCase(), onClick: handleMysteryChange },
  { key: "cierre", icon: "✨", onClick: () => handleSegmentTap("cierre") },
  { key: "next", icon: "➡️", onClick: handleNext }
];
```

#### Left-handed Mode
```javascript
// Reverse button order for left-handed users
const segments = leftHandedMode 
  ? [...navigationSegments].reverse() 
  : navigationSegments;
```

#### Mystery Type Cycling
```javascript
// Cycle through mystery types
const handleMysteryChange = () => {
  setcurrentMystery(
    (prev) => mysteryTypes[(mysteryTypes.indexOf(prev) + 1) % mysteryTypes.length]
  );
};
```

#### Progress Indicator
```javascript
// Calculate progress percentage
const totalPrayers = rosaryArray.length;
const progress = totalPrayers > 0 ? ((currentPrayerIndex + 1) / totalPrayers) * 100 : 0;

// Display progress
<div className="progress-fill" style={{ width: `${progress}%` }} />
<div className="progress-text">
  {currentPrayerIndex + 1}/{totalPrayers} ({Math.round(progress)}%)
</div>
```

### InterfaceToggle Component

#### Settings Panel Features
```javascript
// Main toggle button
<button onClick={toggleExpanded} className="main-toggle-btn">
  {isExpanded ? "✕" : "⚙️"}
</button>

// Expanded control panel with:
- Toggle All button
- Individual toggles for rosary and counters
- Left-handed mode toggle
- Focus mode controls
- Font size control
```

#### Font Size Control
```javascript
// Font size options
const fontSizes = [
  { key: 'small', label: 'S', multiplier: '0.8' },
  { key: 'medium', label: 'M', multiplier: '1.0' },
  { key: 'large', label: 'L', multiplier: '1.2' },
  { key: 'xlarge', label: 'XL', multiplier: '1.4' }
];

// Apply font size
const handleFontSizeChange = (newSize) => {
  setFontSize(newSize);
  localStorage.setItem("fontSize", newSize);
  document.documentElement.style.setProperty('--font-size-multiplier', getFontSizeMultiplier(newSize));
};
```

#### Focus Mode Controls
```javascript
// Focus mode buttons
<button onClick={onToggleFocusMode}>
  {focusMode ? "📖 Show Text" : "🎯 Focus Mode"}
</button>
<button onClick={focusMode ? onExitFocusMode : onEnterFocusMode}>
  {focusMode ? "❌ Exit" : "▶️ Enter"}
</button>
```

---

## 5. Theme & Styling System

### CSS Variables
The application uses CSS custom properties for consistent theming:

```css
:root {
  /* Background gradients */
  --background: linear-gradient(135deg, #1a0b2e 0%, #2d1b69 50%, #1a0b2e 100%);
  
  /* Text colors */
  --text-color: #f8f4e6;
  
  /* Surface colors */
  --surface: rgba(139, 69, 19, 0.15);
  
  /* Primary colors */
  --primary: #d4af37;
  --secondary: #8b4513;
  --accent: #4a148c;
  
  /* Glass morphism */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(212, 175, 55, 0.3);
  
  /* Catholic color palette */
  --catholic-gold: #d4af37;
  --catholic-red: #8b0000;
  --catholic-blue: #1e3a8a;
  --catholic-purple: #4a148c;
  --catholic-white: #f8f4e6;
  
  /* Dynamic properties */
  --font-size-multiplier: 1.0;
}
```

### Dark Mode Implementation
```css
.dark {
  --background: linear-gradient(135deg, #0d0a1a 0%, #1a0b2e 50%, #0d0a1a 100%);
  --text-color: #f8f4e6;
  --surface: rgba(139, 69, 19, 0.2);
  --primary: #d4af37;
  --secondary: #8b4513;
  --accent: #6a1b9a;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(212, 175, 55, 0.4);
}
```

### Stained Glass Effect
Glass morphism styling with backdrop filters:

```css
.stained-glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(2px);
  border: 3px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: inset 0 0 50px rgba(212, 175, 55, 0.1);
  pointer-events: none;
  z-index: 1;
}

.page-left {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  color: var(--text-color);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
```

### Responsive Design
Mobile breakpoints and adaptations:

```css
/* Mobile breakpoint */
@media (max-width: 768px) {
  .page-left {
    font-size: clamp(16px, 4vw, 20px);
    padding: 16px;
    line-height: 1.7;
    margin: 10px;
  }
  
  .interactive-rosary {
    position: relative;
    min-height: 300px;
  }
}

/* Small mobile breakpoint */
@media (max-width: 480px) {
  .button {
    font-size: 14px;
    padding: 8px 12px;
    min-height: 48px;
    border-radius: 8px;
  }
  
  .page-left {
    font-size: clamp(14px, 3.5vw, 18px);
    padding: 12px;
    margin: 8px;
  }
}
```

---

## 6. Prayer Data Structure

### Prayer Book Schema
The `RosarioPrayerBook` object follows a hierarchical structure:

```javascript
const RosarioPrayerBook = {
  // Prayer sequences (arrays of prayer IDs)
  RGo: ["SC", "AC", "C", "P", "A", "A", "A", "G", "F", "MGo1", ...],
  RDo: ["SC", "AC", "C", "P", "A", "A", "A", "G", "F", "MD1", ...],
  RGl: ["SC", "AC", "C", "P", "A", "A", "A", "G", "F", "MGl1", ...],
  RL:  ["SC", "AC", "C", "P", "A", "A", "A", "G", "F", "ML1", ...],
  
  // Prayer content sections
  apertura: [
    {
      id: "SC",
      title: "Señal de la Cruz",
      img: "/gallery-images/misterios/senalcruz.jpg",
      imgmo: "/gallery-images/misterios/modooscuro/francisco_de_asis_2.jpg",
      text: "En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén."
    },
    // ... more opening prayers
  ],
  
  decada: [
    {
      id: "P",
      title: "Padre Nuestro",
      img: "/gallery-images/misterios/latin-pater-noster.jpg",
      imgmo: "/gallery-images/misterios/modooscuro/padre-nuestro.jpg",
      text: "Padre nuestro,\nque estás en el cielo,\n..."
    },
    // ... more decade prayers
  ],
  
  mysteries: {
    gozosos: [
      {
        id: "MGo1",
        num: 1,
        title: "MG1: La Anunciación del Ángel a María",
        img: "/gallery-images/misterios/misteriogozo1.jpg",
        imgmo: "/gallery-images/misterios/modooscuro/misteriogozo1.webp",
        text: "Lucas 1:28: Y entrando el ángel..."
      },
      // ... more mysteries
    ],
    // ... other mystery types
  },
  
  cierre: [
    {
      id: "LL",
      title: "Letanía Lauretana",
      img: "/gallery-images/litany/01.JPG",
      imgmo: "/gallery-images/misterios/modooscuro/francisco_de_asis_2.jpg",
      text: "Señor, ten piedad: Señor, ten piedad\n..."
    },
    // ... more closing prayers
  ]
};
```

### Image Management
Dual image system for light/dark themes:

```javascript
// Image selection logic
const getPrayerImage = (prayerObj) => {
  const theme = localStorage.getItem("theme");
  const isDark = theme === "dark";
  
  // Check for dark mode image first, fallback to regular image
  return isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
};
```

### Mystery Assignment
Default mystery by day of week algorithm:

```javascript
export const getDefaultMystery = () => {
  const today = new Date().getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  switch (today) {
    case 1: // Lunes
    case 6: // Sábado
      return "gozosos";
    case 2: // Martes
    case 5: // Viernes
      return "dolorosos";
    case 3: // Miércoles
    case 0: // Domingo
      return "gloriosos";
    case 4: // Jueves
      return "luminosos";
    default:
      return "gozosos"; // Fallback
  }
};
```

### Text Formatting
Prayer text includes line breaks and special characters:

```javascript
// Example prayer text formatting
text: "Padre nuestro,\nque estás en el cielo,\nsantificado sea tu nombre;\nvenga a nosotros tu reino;\nhágase tu voluntad\nen la tierra como en el cielo.\n\nDanos hoy nuestro pan de cada día;\nperdona nuestras ofensas,\ncomo también nosotros perdonamos\na los que nos ofenden;\nno nos dejes caer en la tentación,\ny líbranos del mal.\n\nAmén."
```

---

## 7. Critical Implementation Details

### React Hooks Dependencies
**CRITICAL**: Some useEffect hooks must have empty dependency arrays:

```javascript
// InteractiveRosary useEffect - MUST have empty dependencies
useEffect(() => {
  // Matter.js initialization code
  // ...
}, []); // Empty dependency array - only run once!

// If dependencies are added, it will break the physics simulation
```

### Matter.js Cleanup
Proper cleanup prevents memory leaks:

```javascript
// Cleanup previous instance
if (matterInstance.current) {
  const { render, runner, world, engine } = matterInstance.current;
  Matter.Render.stop(render);
  Matter.Runner.stop(runner);
  Matter.World.clear(world, false);
  Matter.Engine.clear(engine);
  if (render.canvas) {
    render.canvas.remove();
  }
  render.textures = {};
}

// Component unmount cleanup
return () => {
  console.log("🧹 InteractiveRosary: Component unmounting");
};
```

### Pole Connection Offsets
Edge-to-edge constraint connections prevent overlap:

```javascript
// Calculate pole connection offsets
const getPoleOffset = (beadA, beadB, radiusA) => {
  const dx = beadB.position.x - beadA.position.x;
  const dy = beadB.position.y - beadA.position.y;
  const angle = Math.atan2(dy, dx);
  return {
    x: radiusA * Math.cos(angle),
    y: radiusA * Math.sin(angle)
  };
};

// Apply offsets to constraints
constraint = Matter.Constraint.create({
  ...springOptions(adjustedLength),
  bodyA: beadA,
  bodyB: beadB,
  pointA: getPoleOffset(beadA, beadB, beadSize),
  pointB: getPoleOffset(beadB, beadA, beadSize)
});
```

### Friction/Damping Values
Exact physics values that prevent slingshot effect:

```javascript
// CRITICAL VALUES - Do not change without testing
const beadOptions = (color, extraOptions = {}) => ({
  restitution: 0.8,
  friction: 0.5,        // Increased from 0.1 (fixes slingshot)
  frictionAir: 0.05,    // Increased from 0.01 (fixes slingshot)
  density: 0.001,
  render: { fillStyle: color, strokeStyle: colors.chain, lineWidth: 1 },
  ...extraOptions
});
```

### Double Spring Length
Spring lengths are doubled and adjusted for bead radii:

```javascript
// Why spring lengths are doubled:
// 1. Matter.js constraints connect bead centers by default
// 2. We want edge-to-edge connections
// 3. Doubling compensates for bead radii
// 4. Additional adjustment prevents overlap

const adjustedLength = Math.max(1, baseLength * 2 - 2 * beadSize);
```

### Bead Highlighting with Refs
Using refs prevents stale closure issues:

```javascript
// Use ref to track current prayer index
const currentPrayerIndexRef = useRef(currentPrayerIndex);

// Update ref when prop changes
React.useEffect(() => {
  currentPrayerIndexRef.current = currentPrayerIndex;
}, [currentPrayerIndex]);

// Use ref in render function
if (bead.prayerIndex === currentPrayerIndexRef.current) {
  // Highlight bead
}
```

---

## 8. Known Issues & Solutions

### Slingshot Prevention
**Issue**: Beads fly away when dragged (slingshot effect)
**Solution**: Increase friction and air resistance values

```javascript
// SOLUTION: These exact values prevent slingshot
friction: 0.5,        // Was 0.1
frictionAir: 0.05,    // Was 0.01
```

### Bead Highlighting
**Issue**: Highlighted bead doesn't update when prayer changes
**Solution**: Use refs instead of state in render function

```javascript
// PROBLEM: Stale closure
if (bead.prayerIndex === currentPrayerIndex) { ... }

// SOLUTION: Use ref
if (bead.prayerIndex === currentPrayerIndexRef.current) { ... }
```

### Mystery Switching
**Issue**: Rosary doesn't reset when mystery type changes
**Solution**: Reset prayer index to 0

```javascript
// SOLUTION: Reset state when mystery changes
useEffect(() => {
  setCurrentPrayerIndex(0);
  setHighlightedBead(0);
}, [currentMystery]);
```

### Theme Image Selection
**Issue**: Dark mode images not showing
**Solution**: Always check for imgmo property first

```javascript
// PROBLEM: Only checking img
const selectedImage = prayerObj.img;

// SOLUTION: Check imgmo first
const selectedImage = isDark && prayerObj.imgmo ? prayerObj.imgmo : prayerObj.img;
```

### Matter.js Memory Leaks
**Issue**: Multiple Matter.js instances running simultaneously
**Solution**: Proper cleanup before creating new instance

```javascript
// SOLUTION: Clean up before creating new instance
if (matterInstance.current) {
  const { render, runner, world, engine } = matterInstance.current;
  Matter.Render.stop(render);
  Matter.Runner.stop(runner);
  Matter.World.clear(world, false);
  Matter.Engine.clear(engine);
  if (render.canvas) {
    render.canvas.remove();
  }
  render.textures = {};
}
```

### Scroll Navigation Edge Cases
**Issue**: Scroll navigation triggers when not at boundaries
**Solution**: Add threshold checks

```javascript
// SOLUTION: Use thresholds to prevent false triggers
const isAtTop = scrollTop <= 10;
const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
```

---

## 9. Integration Points

### Event Listeners
All window events and custom event dispatchers:

```javascript
// Theme change events
window.addEventListener("themeChanged", handleThemeChange);
window.dispatchEvent(new CustomEvent("themeChanged"));

// Prayer navigation events
window.addEventListener("prayerScrollNext", handlePrayerScrollNext);
window.addEventListener("prayerScrollPrev", handlePrayerScrollPrev);
window.dispatchEvent(new CustomEvent("prayerScrollNext"));
window.dispatchEvent(new CustomEvent("prayerScrollPrev"));

// Left-handed mode events
window.addEventListener("leftHandedModeChange", handleLeftHandedModeChange);
window.dispatchEvent(new CustomEvent("leftHandedModeChange", {
  detail: { leftHandedMode: newMode }
}));

// Font size events
window.addEventListener("fontSizeChange", handleFontSizeChange);
window.dispatchEvent(new CustomEvent("fontSizeChange", {
  detail: { fontSize: newSize }
}));

// Rosary visibility events
window.addEventListener("rosaryVisibilityChange", handleVisibilityChange);
window.dispatchEvent(new CustomEvent("rosaryVisibilityChange", {
  detail: { visible: newVisibility }
}));
```

### LocalStorage Keys
Keys used for persistent settings:

```javascript
// LocalStorage keys
localStorage.setItem("theme", "dark");                    // Theme preference
localStorage.setItem("leftHandedMode", "true");           // Left-handed mode
localStorage.setItem("fontSize", "large");               // Font size preference
localStorage.setItem("rosaryVisible", "false");           // Rosary visibility
```

### Sound Effects
Web Audio API implementation for scroll/navigation sounds:

```javascript
class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.soundVariation = 0;
  }
  
  // Scroll sound - soft rustling like parchment
  playScrollSound() {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    const baseFreq = 200 + this.soundVariation * 50;
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 0.7, ctx.currentTime + 0.1
    );
    
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.type = "sawtooth";
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }
  
  // End-of-scroll sound - gentle bump
  playEndOfScrollSound() {
    // Implementation with dual oscillators for "thud" effect
  }
  
  // Prayer change sound - like turning a page
  playPrayerChangeSound() {
    // Implementation with multiple oscillators for page turn effect
  }
}
```

### Custom Fonts
Cloister Black font loading and usage:

```css
@font-face {
  font-family: "Cloister Black";
  src: url("./data/fonts/Remingtoned.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

/* Usage throughout the app */
body {
  font-family: "Cloister Black", serif;
}

.page-left {
  font-family: "Cloister Black", serif;
}

button {
  font-family: "Cloister Black", serif;
}
```

---

## 10. File Reference Map

### Core Application Files
```
src/
├── App.js                          # Main application component
├── App.css                         # Global styles and CSS variables
├── index.js                        # Application entry point
└── index.css                       # Base styles
```

### Data Files
```
src/data/
├── RosarioPrayerBook.js            # All prayer data and sequences
├── Liturgias.js                    # Additional liturgical content
└── assets/                         # Images and fonts
    ├── fonts/
    │   ├── CloisterBlack.ttf       # Custom font
    │   └── Remingtoned.ttf         # Alternative font
    └── img/                        # Prayer images
```

### Component Files
```
src/components/
├── RosarioNube/
│   ├── InteractiveRosary.jsx      # Matter.js physics rosary
│   ├── InteractiveRosary.css      # Rosary-specific styles
│   └── useRosaryState.js          # State management hook
├── ViewPrayers/
│   └── ViewPrayers.js             # Prayer display component
├── PrayerButtons/
│   ├── PrayerButtons.jsx          # Navigation controls
│   └── PrayerButtons.css          # Button styles
├── common/
│   ├── InterfaceToggle.js         # Settings panel
│   ├── ThemeToggle.js             # Theme switcher
│   ├── LeftHandedToggle.js        # Left-handed mode
│   └── [other utility components]
└── utils/
    ├── getDefaultMystery.jsx       # Mystery assignment logic
    └── soundEffects.js            # Audio feedback system
```

### Configuration Files
```
├── package.json                    # Dependencies and scripts
├── public/
│   ├── index.html                 # HTML template
│   ├── manifest.json              # PWA manifest
│   └── gallery-images/            # Prayer images
│       ├── litany/                # Litany images
│       └── misterios/             # Mystery images
│           └── modooscuro/        # Dark mode images
└── README.md                      # Project documentation
```

### Key Dependencies
```json
{
  "matter-js": "^0.20.0",          # Physics engine
  "react": "^19.1.1",              # UI framework
  "react-dom": "^19.1.1",          # DOM rendering
  "react-icons": "^5.5.0"          # Icon library
}
```

### File Responsibilities

#### App.js
- **Purpose**: Main application orchestrator
- **Responsibilities**: 
  - State management coordination
  - Component integration
  - Event listener setup
  - Theme management
  - Focus mode controls

#### InteractiveRosary.jsx
- **Purpose**: Physics-based interactive rosary
- **Responsibilities**:
  - Matter.js engine setup
  - Bead creation and positioning
  - Constraint/spring system
  - Click event handling
  - Visual highlighting
  - Cleanup management

#### useRosaryState.js
- **Purpose**: Centralized state management
- **Responsibilities**:
  - Prayer index tracking
  - Navigation functions
  - Prayer lookup
  - Sequence management
  - Mystery calculations

#### ViewPrayers.js
- **Purpose**: Prayer content display
- **Responsibilities**:
  - Prayer text rendering
  - Image display
  - Focus mode implementation
  - Scroll detection
  - Progress tracking
  - Sound effects

#### PrayerButtons.jsx
- **Purpose**: Navigation controls
- **Responsibilities**:
  - Segmented navigation bar
  - Prayer jumping
  - Mystery cycling
  - Progress indication
  - Left-handed mode support

#### RosarioPrayerBook.js
- **Purpose**: Prayer data repository
- **Responsibilities**:
  - Prayer sequences
  - Prayer content
  - Image references
  - Text formatting
  - Mystery organization

---

## Conclusion

This documentation captures every critical aspect of the virtual rosary implementation. The system is built on Matter.js physics engine with React components, featuring:

- **60-bead interactive rosary** with realistic physics
- **Complete prayer sequences** for all four mystery types
- **Multiple navigation methods** (bead clicks, buttons, scroll)
- **Theme system** with dark/light modes
- **Focus mode** for distraction-free prayer
- **Sound effects** for enhanced experience
- **Responsive design** for all devices

The implementation is stable and working correctly. All critical parameters, dependencies, and configurations are documented above. If the system breaks in the future, this documentation provides everything needed to restore it exactly as it currently functions.

**Key Success Factors:**
1. Exact physics parameters prevent slingshot effects
2. Proper Matter.js cleanup prevents memory leaks
3. Ref-based highlighting avoids stale closures
4. Empty dependency arrays in critical useEffect hooks
5. Edge-to-edge constraint connections prevent bead overlap
6. Theme-based image selection with proper fallbacks

This virtual rosary represents a complete, production-ready implementation that successfully combines Catholic prayer tradition with modern web technology.

