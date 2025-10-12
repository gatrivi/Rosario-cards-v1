# Interactive Rosary Specifications

## Overview
A physics-based interactive rosary using Matter.js that provides realistic bead physics with prayer navigation.

## Technical Implementation

### Cross Structure
- **Method**: Composite body using `Matter.Body.create({ parts: crossParts })`
- **Shape**: 6 squares arranged in traditional cross pattern
- **Prayer Index**: Treated as single prayer (index 0-5)
- **Stability**: Extremely stable (acts as single rigid body)

```javascript
// Cross creation approach
const crossParts = [];
const crossPositions = [
  { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 }, // Left
  { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 }, // Center
  { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 }, // Right 1
  { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 }, // Right 2
  { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // Bottom
  { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }, // Top
];

crossPositions.forEach((pos) => {
  const part = Matter.Bodies.rectangle(pos.x, pos.y, cbs, cbs, {
    crossNumber: pos.num,
    render: { fillStyle: colors.cross },
  });
  crossParts.push(part);
});

const crossBody = Matter.Body.create({
  parts: crossParts,
  friction: 0.5,
  frictionAir: 0.05,
  restitution: 0.8,
  isCrossComposite: true,
  crossParts: crossParts,
});
```

### Bead Structure
- **Total Beads**: 60 (Cross: 6, Tail: 3, Center: 1, Main Loop: 50)
- **Main Loop**: 5 decades of 10 beads each
- **Numbering**: 1-60 in prayer order
- **Physics**: Low restitution (0.1), high frictionAir (0.08)

### String Constraints
- **Appearance**: Thin dark strings (0.5px, #555 color)
- **Connection**: Pole-to-pole (bead edges, not centers)
- **Lengths**:
  - Cross to tail: Half size
  - All other strings: Double size
- **Stiffness**: 0.2 (soft springs)
- **Damping**: 0.9 (high damping)

### Prayer Navigation
- **Click Navigation**: Click any bead to jump to that prayer
- **Button Navigation**: Next/Previous buttons should scroll through prayers
- **Visual Feedback**: Current prayer highlighted with gold outline
- **Cross Highlighting**: Rectangle outline for cross parts

### Mystery-Specific Colors
```javascript
const colorSchemes = {
  dolorosos: { beads: "#D2B48C", cross: "#8B4513", chain: "#708090", highlight: "#FFD700" },
  gloriosos: { beads: "#2F2F2F", cross: "#1C1C1C", chain: "#708090", highlight: "#FFD700" },
  gozosos: { beads: "#FF7F7F", cross: "#CD5C5C", chain: "#708090", highlight: "#FFD700" },
  luminosos: { beads: "#F5F5DC", cross: "#DEB887", chain: "#C0C0C0", highlight: "#FFD700" },
};
```

### Toggle Controls
- **Rosary Toggle**: 📿/🙏 button in upper right (hide/show rosary)
- **Left-Handed Toggle**: Button next to rosary toggle
- **State Persistence**: Both toggles save to localStorage

## Current Issues to Fix

### 1. Prayer Navigation Broken
- **Problem**: Next/Previous buttons not updating highlighted bead
- **Root Cause**: Need to investigate `currentPrayerIndex` updates
- **Solution**: Ensure `onBeadClick` callback properly updates parent state

### 2. String Length Adjustments
- **Cross to Tail**: Should be half size
- **All Other Strings**: Should be double size
- **Implementation**: Modify `springOptions` calls with different lengths

### 3. Cross Prayer Index
- **Current**: Cross parts have individual prayer indices (0-5)
- **Desired**: Entire cross treated as single prayer (index 0)
- **Implementation**: Update prayer mapping logic

## Future Enhancements

### Physics Control Panel
- **Bead Size**: 4-16px slider
- **String Length**: 8-30px slider  
- **Friction**: 0.0-0.3 slider
- **Position**: Lower-left corner
- **Real-time**: Apply changes immediately

### Collision Sounds
- **Bead Collisions**: Different sounds based on speed/angle
- **String Dampening**: Affect sound based on constraint tension
- **Web Audio API**: Use existing `soundEffects.js` infrastructure

### Advanced Features
- **Invisible Chain Bead**: For chain prayer visibility
- **String Visualization**: Show constraint lines as actual strings
- **Prayer Line Breaks**: Format prayers with proper line breaks

## File Structure
```
src/components/RosarioNube/
├── InteractiveRosary.jsx     # Main component
├── InteractiveRosary.css      # Styles
├── useRosaryState.js          # State management
└── Bead.jsx                   # Individual bead component

src/components/common/
├── RosaryToggle.js            # Toggle button
├── LeftHandedToggle.js        # Left-handed mode
└── ThemeToggle.js             # Dark/light mode
```

## Dependencies
- **Matter.js**: Physics engine
- **React**: Component framework
- **Custom Events**: For component communication
- **LocalStorage**: For state persistence

## Performance Considerations
- **Empty Dependencies**: `useEffect` uses `[]` to prevent re-renders
- **Composite Bodies**: Cross uses single composite body for efficiency
- **Event Cleanup**: Proper cleanup of Matter.js events on unmount
- **Canvas Rendering**: Matter.js handles canvas rendering efficiently

---
*Last Updated: December 2024*
*Based on working implementation from react-matter.js-draggable-rosary*
