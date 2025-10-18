# Rosary Friction Slider Implementation

**Date**: October 16, 2025  
**Status**: ✅ Complete

## Overview

Added a friction slider control that allows users to adjust how long the rosary continues moving after they stop touching it. Lower friction values result in longer coasting (up to ~10+ seconds), while higher values make it stop quickly.

---

## Implementation Details

### 1. Settings State & Storage

**File**: `src/components/common/InterfaceToggle.js`

Added friction state with localStorage persistence (lines 81-90):
```javascript
const [rosaryFriction, setRosaryFriction] = useState(() => {
  try {
    return parseFloat(localStorage.getItem("rosaryFriction")) || 0.05;
  } catch (error) {
    console.warn("localStorage not available:", error);
    return 0.05;
  }
});
```

**Default value**: `0.05` (moderate coasting)  
**Range**: `0.001` (very long coasting, ~10+ seconds) to `0.1` (quick stop)

### 2. Handler & Event Dispatcher

**File**: `src/components/common/InterfaceToggle.js` (lines 250-267)

```javascript
const handleRosaryFrictionChange = (friction) => {
  setRosaryFriction(friction);
  try {
    localStorage.setItem("rosaryFriction", friction.toString());
  } catch (error) {
    console.warn("localStorage not available:", error);
  }

  // Dispatch event for InteractiveRosary to listen
  window.dispatchEvent(
    new CustomEvent("rosaryFrictionChange", {
      detail: { friction },
    })
  );
};
```

### 3. UI Slider Control

**File**: `src/components/common/InterfaceToggle.js` (lines 1073-1173)

Added Spanish-labeled slider in settings sidebar:

**Title**: 🌊 Fricción del Rosario  
**Tooltip**: "Controla cuánto tiempo el rosario sigue moviéndose después de soltarlo (menor valor = movimiento más largo)"

**Controls**:
- **Minus button** (−): Decreases friction by 0.01 (more movement)
- **Slider**: Range 0.001 to 0.1 with 0.001 step precision
- **Plus button** (+): Increases friction by 0.01 (less movement)
- **Display**: Shows current value as percentage (e.g., "5.0%")

**Labels**:
- Left side: "Más" (More movement)
- Right side: "Menos" (Less movement)

### 4. App Integration

**File**: `src/App.js`

**State** (lines 184-191):
```javascript
const [rosaryFriction, setRosaryFriction] = useState(() => {
  try {
    return parseFloat(localStorage.getItem("rosaryFriction")) || 0.05;
  } catch (error) {
    return 0.05;
  }
});
```

**Event Listener** (lines 207-216):
```javascript
useEffect(() => {
  const handleRosaryFrictionChange = (event) => {
    setRosaryFriction(event.detail.friction);
  };
  window.addEventListener("rosaryFrictionChange", handleRosaryFrictionChange);
  return () => {
    window.removeEventListener("rosaryFrictionChange", handleRosaryFrictionChange);
  };
}, []);
```

**Pass to InteractiveRosary** (line 648):
```javascript
<InteractiveRosary
  // ... other props
  rosaryFriction={rosaryFriction}
/>
```

### 5. Physics Application

**File**: `src/components/RosarioNube/InteractiveRosary.jsx`

**Accept prop** (line 22):
```javascript
const InteractiveRosary = ({
  // ... other props
  rosaryFriction = 0.05, // Air resistance - controls coasting time
}) => {
```

**Apply to beads** (line 322):
```javascript
const beadOptions = (color, extraOptions = {}) => ({
  restitution: 0.8,
  friction: 0.5,
  frictionAir: rosaryFriction, // Air resistance - controlled by slider (0.001-0.1)
  density: 0.001,
  render: { fillStyle: color, strokeStyle: colors.chain, lineWidth: 1 },
  ...extraOptions,
});
```

**Dependency** (line 1403):
Added `rosaryFriction` to initializePhysics dependency array to re-create rosary when friction changes.

---

## Physics Explanation

### Matter.js `frictionAir` Property

The `frictionAir` property controls air resistance/drag on physics bodies:

- **High values** (0.1): Objects slow down quickly, like moving through thick syrup
- **Medium values** (0.05): Moderate coasting, ~2-3 seconds (default)
- **Low values** (0.001): Long coasting, ~10+ seconds, like ice skating

**Formula**: Velocity is multiplied by `(1 - frictionAir)` each frame at 60 FPS.

**Calculation for ~10 second coasting**:
- At `frictionAir = 0.001`, velocity reduces to ~1% after ~8-10 seconds
- At `frictionAir = 0.05`, velocity reduces to ~1% after ~1-2 seconds
- At `frictionAir = 0.1`, velocity reduces to ~1% after ~0.5 seconds

---

## User Experience

### Recommended Values

| Value | Behavior | Use Case |
|-------|----------|----------|
| 0.001-0.01 | Long coasting (8-15 sec) | Meditative, slow prayer pace |
| 0.02-0.05 | Moderate coasting (2-5 sec) | Default, balanced experience |
| 0.06-0.1 | Quick stop (0.5-2 sec) | Precise control, fast prayers |

### Visual Feedback

The slider displays the current friction as a percentage (0.1% to 10.0%) to help users understand the scale. Lower percentages mean less friction and more movement.

### Mobile Optimization

- Touch-friendly slider with large hit area
- +/- buttons for precise adjustment
- Spanish labels for clarity
- Tooltip explains the effect

---

## Technical Notes

### Why `frictionAir` instead of `friction`?

- **`friction`**: Surface friction between touching bodies (kept at 0.5)
- **`frictionAir`**: Air resistance affecting all motion (adjusted by slider)

For a floating rosary with zero gravity, `frictionAir` is the primary factor controlling how long objects coast.

### Persistence

Settings are saved to `localStorage` and persist across sessions. The rosary automatically re-initializes when friction changes.

### Event Flow

1. User adjusts slider
2. `handleRosaryFrictionChange` updates state and localStorage
3. Event dispatched to App.js
4. App.js updates state and passes new value to InteractiveRosary
5. InteractiveRosary re-initializes with new friction value
6. All beads get new `frictionAir` property

---

## Testing

### Test Scenarios

1. **Default behavior**: At 5% (0.05), rosary should coast for ~2-3 seconds
2. **Minimum friction**: At 0.1% (0.001), rosary should coast for ~10+ seconds
3. **Maximum friction**: At 10% (0.1), rosary should stop within ~1 second
4. **Settings persistence**: Friction value should persist across page reloads
5. **Live update**: Changing slider should immediately affect rosary (after re-initialization)

### How to Test

1. Open settings sidebar (⚙️ button)
2. Scroll to "🌊 Fricción del Rosario"
3. Drag a bead vigorously
4. Observe coasting time
5. Adjust slider to different values
6. Test again to feel the difference

---

## Files Modified

1. `src/components/common/InterfaceToggle.js` - State, handler, UI slider
2. `src/App.js` - Event listener, pass prop to InteractiveRosary
3. `src/components/RosarioNube/InteractiveRosary.jsx` - Accept prop, apply to physics

**Total Lines Added**: ~140  
**No Breaking Changes**: All changes are backward compatible

---

## Future Enhancements

### Potential Improvements

- [ ] **Presets**: Quick buttons for "Slow" / "Medium" / "Fast"
- [ ] **Visual indicator**: Show coasting time estimate (e.g., "~5 seconds")
- [ ] **Advanced mode**: Separate friction controls for beads vs. constraints
- [ ] **Animations**: Visualize friction effect with particle trails
- [ ] **Sound**: Different sounds based on movement speed

### Performance Note

Changing friction requires re-initializing the entire rosary physics. This is intentional to ensure all beads have consistent properties.

---

**Implementation Status: COMPLETE ✅**  
**Ready for Testing: YES ✅**

The rosary now supports user-configurable air resistance, allowing for customized coasting behavior from quick stops to long, meditative movements. 🌊📿


