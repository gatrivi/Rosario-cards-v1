# Cross Structure Diagram & Technical Documentation

## Cross Composition

The rosary cross is made of **6 square bodies** arranged in a classic cruciform pattern.

---

## Visual Diagram

```
                              ┌─────────────────┐
                              │   SQUARE #5     │
                              │    (TOP ARM)    │
                              │   crossNumber:5 │
                              │                 │
                              │     CENTER:     │
                              │  (crossCenterX, │
                              │  crossCenterY   │
                              │    - cbs)       │
                              └────────┬────────┘
                                       │
                                       │
     ┌─────────────┬─────────────┬────┴────┬─────────────┐
     │             │             │         │             │
     │ SQUARE #1   │ SQUARE #2   │SQUARE #3│ SQUARE #4   │
     │ (LEFT ARM)  │(CENTER-LEFT)│(CENTER- │ (RIGHT ARM) │
     │             │             │ RIGHT)  │             │
     │crossNumber:1│crossNumber:2│crossNum:│crossNumber:4│
     │             │             │    3    │             │
     │   CENTER:   │   CENTER:   │ CENTER: │   CENTER:   │
     │(crossCenterX│(crossCenterX│(crossCX │(crossCenterX│
     │ - cbs*1.5,  │ - cbs*0.5,  │+cbs*0.5,│ + cbs*1.5,  │
     │crossCenterY)│crossCenterY)│crossCY) │crossCenterY)│
     │             │             │         │             │
     └─────────────┴─────────────┴────┬────┴─────────────┘
                                      │
                                      │
                              ┌───────┴────────┐
                              │   SQUARE #6    │
                              │  (BOTTOM ARM)  │
                              │  crossNumber:6 │
                              │                │
                              │    CENTER:     │
                              │ (crossCenterX, │
                              │  crossCenterY  │
                              │    + cbs)      │
                              └────────────────┘
```

---

## Square Identifiers & Positions

### Constants
- `cbs` = `crossBeadSize` = size of each square
- `crossCenterX` = horizontal center of the cross
- `crossCenterY` = vertical center of the cross

### Square Positions (from code)

| Square # | crossNumber | X Position | Y Position | Description |
|----------|-------------|------------|------------|-------------|
| 1 | 1 | `crossCenterX - cbs * 1.5` | `crossCenterY` | **LEFTMOST** (horizontal arm) |
| 2 | 2 | `crossCenterX - cbs * 0.5` | `crossCenterY` | **LEFT-CENTER** (horizontal arm) |
| 3 | 3 | `crossCenterX + cbs * 0.5` | `crossCenterY` | **RIGHT-CENTER** (horizontal arm) |
| 4 | 4 | `crossCenterX + cbs * 1.5` | `crossCenterY` | **RIGHTMOST** (horizontal arm) |
| 5 | 5 | `crossCenterX` | `crossCenterY - cbs` | **TOP** (vertical arm) |
| 6 | 6 | `crossCenterX` | `crossCenterY + cbs` | **BOTTOM** (vertical arm) |

---

## Detailed Square #1 (Chain Attachment Point)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  TOP SIDE                       │
│         (y: position.y - cbs/2)                 │
│                                                 │
├───────────────────────────────────────────────┬─┤
│                                               │ │
│                                               │ │
│                                               │ │
│   LEFT SIDE           SQUARE #1           R │ │
│ (x: position.x        crossNumber: 1      I │ │
│     - cbs/2)                               G │T│
│                      CENTER:               H │A│
│                   (crossCenterX            T │I│
│ ★ CHAIN              - cbs * 1.5,            │L│
│ ATTACH              crossCenterY)         S │ │
│ POINT                                     I │B│
│ HERE!                                     D │E│
│                                           E │A│
│                                               │D│
│                                               │S│
│                                               │ │
├───────────────────────────────────────────────┴─┤
│                                                 │
│                 BOTTOM SIDE                     │
│           (y: position.y + cbs/2)               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Chain Attachment Calculation

```javascript
// File: InteractiveRosary.jsx, lines 755-759
const crossPoleOffset = {
  // X: Center of square #1, then move LEFT by half a square's width
  x: crossParts[0].position.x - crossBody.position.x - cbs / 2,
  
  // Y: Vertical center of square #1 (no offset from center)
  y: crossParts[0].position.y - crossBody.position.y,
};
```

**Result**: Chain attaches to the **LEFT SIDE, CENTER POINT** of Square #1

```
Attachment Point Coordinates (relative to cross center):
  X = (crossCenterX - cbs * 1.5) - crossCenterX - cbs/2
    = -cbs * 1.5 - cbs/2
    = -cbs * 2.0
  
  Y = crossCenterY - crossCenterY
    = 0 (at vertical center)
```

---

## Side Identifiers for Each Square

Each square has **4 sides** and **4 corners**:

```
        TOP SIDE (North)
      (y: center.y - cbs/2)
              │
              │
       ┌──────┴──────┐
       │              │
       │  NW      NE  │← NE Corner
  LEFT │      ☐       │ RIGHT SIDE (East)
  SIDE │  (Center)    │ (x: center.x + cbs/2)
(West) │              │
       │  SW      SE  │← SE Corner
       └──────┬──────┘
              │
              │
       BOTTOM SIDE (South)
     (y: center.y + cbs/2)
```

### Side Coordinates Formula (for any square)

Given a square with `center = {x, y}` and size `cbs`:

| Side | Identifier | Position | Formula |
|------|------------|----------|---------|
| **Left** | West | Center-left edge | `{ x: center.x - cbs/2, y: center.y }` |
| **Right** | East | Center-right edge | `{ x: center.x + cbs/2, y: center.y }` |
| **Top** | North | Center-top edge | `{ x: center.x, y: center.y - cbs/2 }` |
| **Bottom** | South | Center-bottom edge | `{ x: center.x, y: center.y + cbs/2 }` |

### Corner Coordinates Formula

| Corner | Identifier | Position | Formula |
|--------|------------|----------|---------|
| **Top-Left** | NW (Northwest) | Upper-left corner | `{ x: center.x - cbs/2, y: center.y - cbs/2 }` |
| **Top-Right** | NE (Northeast) | Upper-right corner | `{ x: center.x + cbs/2, y: center.y - cbs/2 }` |
| **Bottom-Left** | SW (Southwest) | Lower-left corner | `{ x: center.x - cbs/2, y: center.y + cbs/2 }` |
| **Bottom-Right** | SE (Southeast) | Lower-right corner | `{ x: center.x + cbs/2, y: center.y + cbs/2 }` |

---

## Connection Points Between Squares

The 6 squares are welded together using Matter.js composite body:

```javascript
const crossBody = Matter.Body.create({
  parts: crossParts,  // All 6 squares as sub-bodies
  // ... properties
});
```

**Internal Connections** (automatic via Matter.js):
- Square #2 (LEFT SIDE) ↔ Square #1 (RIGHT SIDE)
- Square #3 (LEFT SIDE) ↔ Square #2 (RIGHT SIDE)  
- Square #4 (LEFT SIDE) ↔ Square #3 (RIGHT SIDE)
- Square #5 (BOTTOM SIDE) ↔ Square #2/3 junction (TOP SIDE)
- Square #6 (TOP SIDE) ↔ Square #2/3 junction (BOTTOM SIDE)

---

## Chain Connection Details

### Connection Constraint

```javascript
// File: InteractiveRosary.jsx, lines 761-769
Matter.Constraint.create({
  bodyA: tailBeads[0],          // First tail bead (Our Father bead)
  bodyB: crossBody,             // The cross composite body
  pointA: getOppositePoleOffset(tailBeads[0], crossBody, beadSize),
  pointB: crossPoleOffset,      // ★ LEFT SIDE of Square #1
  length: crossToTailLength,    // beadSize * 1.6 (~13px)
  prayerIndex: 1,               // Apostles' Creed prayer
});
```

### Visual Chain Connection

```
                                            TAIL BEADS
                                                ↑
                                                │
                                            [Our Father]
                                            Bead (index 3)
                                                │
                                                │ Chain length: 
                                                │ beadSize * 1.6
                                                │ (~13px)
                                                │ Prayer: AC (Apostles' Creed)
                                                │
                                                ↓
    ┌───────┐                              ★ ATTACH POINT
    │   1   │←─────────────────────────────  (Left side center)
    │       │                                 of Square #1
    └───────┘
```

---

## Circular Glow Implementation (Your Recent Fix!)

### Glow Center Calculation

```javascript
// File: InteractiveRosary.jsx, lines 1215-1218
const crossCenter = {
  x: bead.crossParts.reduce((sum, p) => sum + p.position.x, 0) / bead.crossParts.length,
  y: bead.crossParts.reduce((sum, p) => sum + p.position.y, 0) / bead.crossParts.length
};
```

**Result**: Averages the positions of all 6 squares to get the geometric center of the cross.

### Why This Works

- Cross can rotate, so individual squares move
- But the **geometric center** (average of all positions) stays stable
- Circular glow is drawn at this center point → looks unified and sacred! ✨

### Glow Radius

```javascript
// Circular halo encompasses entire cross
radius = crossBeadSize * 2.2 + pulseSize
```

This creates a glow large enough to surround all 6 squares when viewed as a single cruciform shape.

---

## Summary

### Cross Structure
- **6 squares** arranged in classic cross shape (+)
- **Horizontal arm**: Squares 1, 2, 3, 4 (left to right)
- **Vertical arm**: Square 5 (top), Squares 2/3 (center), Square 6 (bottom)

### Chain Attachment
- **Location**: Square #1 (leftmost)
- **Side**: Left side (West)
- **Position**: Vertical center of left edge
- **Distance from cross center**: `-cbs * 2.0` (horizontal), `0` (vertical)

### Prayer Assignment
- **Cross**: Prayer index 0 (Sign of the Cross)
- **Chain to tail**: Prayer index 1 (Apostles' Creed, "AC")

### Visual Glow
- **Type**: Circular (not rectangular)
- **Center**: Geometric average of all 6 square positions
- **Effect**: Sacred golden pulse that stays centered as cross rotates! ✝️

---

**Key Code References**:
- Cross creation: Lines 713-747
- Chain attachment: Lines 749-769  
- Glow rendering: Lines 1213-1279

