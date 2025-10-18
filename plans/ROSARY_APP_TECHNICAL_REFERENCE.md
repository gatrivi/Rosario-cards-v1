# Rosary App Technical Reference

## Matter.js Fundamentals

### Core Concepts

1. **Bodies** - Physical objects with mass, position, velocity
   - `Matter.Bodies.circle(x, y, radius, options)` - creates a circular body
   - `Matter.Bodies.rectangle(x, y, width, height, options)` - creates a rectangular body
   - Each body has:
     - `position: {x, y}` - absolute world coordinates
     - `velocity: {x, y}` - movement speed
     - Custom properties (e.g., `beadNumber`, `prayerIndex`)

2. **Constraints** - Springs/chains connecting bodies
   - `Matter.Constraint.create(options)` - creates a constraint
   - Key properties:
     - `bodyA, bodyB` - the two bodies to connect
     - `pointA, pointB` - offset from each body's center (relative coordinates)
     - `stiffness` - how rigid (0.8 = fairly stiff)
     - `damping` - how much oscillation is dampened (0.05 = smooth)
     - `length` - rest length of the spring
   
   **CRITICAL:** `pointA` and `pointB` are **relative** to the body's center, not absolute positions!

3. **Composite Bodies** - Multiple shapes treated as ONE rigid object
   - `Matter.Body.create({ parts: [body1, body2, ...] })` - creates composite
   - The composite's `position` is the **center of mass** of all parts
   - Each part retains its own absolute `position`
   - To find attachment point offset:
     ```javascript
     offset = {
       x: part.position.x - compositeBody.position.x,
       y: part.position.y - compositeBody.position.y
     }
     ```

4. **MouseConstraint** - Allows dragging bodies with mouse/touch
   - Automatically creates temporary constraints when you click/drag
   - Events: `mousedown`, `mousemove`, `mouseup`, `startdrag`, `enddrag`

### Coordinate System
- Origin (0, 0) is TOP-LEFT of canvas
- X increases RIGHT
- Y increases DOWN
- All positions are in pixels

---

## Rosary Code Architecture

### File Structure

#### **Primary Physics File**
**`src/components/RosarioNube/InteractiveRosary.jsx`** (~1900 lines)
- Contains ALL Matter.js logic
- Creates beads, cross, constraints
- Handles user interactions
- Renders visual effects

**Key sections (by line number):**
- Lines 1-200: Imports, component setup, state
- Lines 200-400: Helper functions (pole offsets, spring options, audio)
- Lines 400-500: Main loop beads (55 beads, 5 decades)
- Lines 500-700: Tail beads (5 beads below heart to cross)
- Lines 700-800: **CROSS CONSTRUCTION** (6 squares)
- Lines 800-900: Adding all bodies to world
- Lines 900-1100: Mouse interaction handlers (click, drag)
- Lines 1100-1900: Rendering loop (draw highlights, glows, decorations)

#### **State Management**
**`src/components/RosarioNube/useRosaryState.js`**
- Tracks current prayer, mystery, progress
- Manages chain prayer sub-index
- Handles pressed beads for progress meter

#### **Prayer Display**
**`src/components/ViewPrayers/ViewPrayers.js`**
- Displays prayer text and images
- Handles bidirectional scrolling via bead drag events

#### **UI Components**
- **`src/App.js`** - Main app, coordinates all components
- **`src/components/common/RosaryProgressBar.jsx`** - Progress display
- **`src/components/PrayerButtons/PrayerButtons.jsx`** - Navigation buttons

#### **Sound Effects**
**`src/utils/soundEffects.js`**
- Audio synthesis for chimes, scrolls, collisions

---

## Cross Construction Details

### Location
**File:** `src/components/RosarioNube/InteractiveRosary.jsx`
**Lines:** 712-780

### Current Code Structure

```javascript
// Line 714-716: Calculate cross position
const crossCenterX = tailBeads[numTailBeads - 1].position.x;
const crossCenterY = tailBeads[numTailBeads - 1].position.y + chainSegmentLength * 2;
const cbs = crossBeadSize; // Square size

// Line 719-726: Define 6 square positions
const crossPositions = [
  { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 }, // Left arm
  { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 }, // Center-left (body)
  { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 }, // Center-right (body)
  { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 }, // Right arm
  { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // Bottom (legs)
  { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }, // Top (head)
];

// Line 728-734: Create square bodies
crossPositions.forEach((pos) => {
  const part = Matter.Bodies.rectangle(pos.x, pos.y, cbs, cbs, {
    crossNumber: pos.num,
    render: { fillStyle: colors.beads },
  });
  crossParts.push(part);
});

// Line 736-747: Create composite body
const crossBody = Matter.Body.create({
  parts: crossParts,
  friction: 0.5,
  frictionAir: rosaryFriction,
  restitution: 0.8,
  isCrossComposite: true,
  crossParts: crossParts,
  beadNumber: 0,
  prayerIndex: 0,
  prayerId: rosarySequence[0],
});

// Line 749-760: Create chain attachment
const crossToTailLength = beadSize * 1.6;

const crossPoleOffset = {
  x: crossParts[5].position.x - crossBody.position.x, // Square #6 x-offset
  y: crossParts[5].position.y - crossBody.position.y - cbs / 2, // Top edge
};

// Line 762-770: Create constraint
constraints.push(
  Matter.Constraint.create({
    ...springOptions(crossToTailLength),
    bodyA: tailBeads[0], // Our Father bead
    bodyB: crossBody,
    pointA: getOppositePoleOffset(tailBeads[0], crossBody, beadSize),
    pointB: crossPoleOffset,
    prayerIndex: 1,
    prayerId: rosarySequence[1],
  })
);
```

### Current Cross Layout

```
        #6 (head, index 5)
         |
#1 - #2-#3 - #4
         |
        #5 (legs, index 4)
```

**PROBLEM:** Squares #2, #5, #6 are at `crossCenterX - 0.5*cbs` (LEFT of center)
- This makes the vertical arm off-center
- Chain attaches to the left side instead of center

### The Issue with Chain Attachment

1. **CrossBody center of mass** = average position of all 6 squares
2. **Square #6 position** = `crossCenterX - 0.5*cbs, crossCenterY - cbs`
3. **crossPoleOffset calculation:**
   ```javascript
   x: crossParts[5].position.x - crossBody.position.x
   // = (crossCenterX - 0.5*cbs) - (average of all parts)
   // = NEGATIVE value (left side)
   ```

---

## Helper Functions Reference

### Pole Offset Functions (Lines 349-368)

```javascript
// Returns offset pointing FROM beadA TOWARD beadB
const getPoleOffset = (beadA, beadB, radiusA) => {
  const dx = beadB.position.x - beadA.position.x;
  const dy = beadB.position.y - beadA.position.y;
  const angle = Math.atan2(dy, dx);
  return {
    x: radiusA * Math.cos(angle),
    y: radiusA * Math.sin(angle),
  };
};

// Returns offset pointing AWAY from beadB (opposite direction)
const getOppositePoleOffset = (beadA, beadB, radiusA) => {
  const dx = beadB.position.x - beadA.position.x;
  const dy = beadB.position.y - beadA.position.y;
  const angle = Math.atan2(dy, dx);
  return {
    x: -radiusA * Math.cos(angle), // Negative = opposite
    y: -radiusA * Math.sin(angle),
  };
};
```

### Spring Options Function (Lines 334-347)

```javascript
const springOptions = (length) => ({
  stiffness: 0.8,    // High = more rigid
  damping: 0.05,     // Low = less wobble
  length: length,
  render: {
    strokeStyle: colors.chain,
    lineWidth: 2.5,
  },
});
```

---

## How to Fix the Cross Alignment

### Option 1: Center the vertical arm (RECOMMENDED)

**Change lines 724-725:**
```javascript
// OLD:
{ x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // Bottom
{ x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }, // Top

// NEW:
{ x: crossCenterX, y: crossCenterY + cbs, num: 5 }, // Bottom - CENTERED
{ x: crossCenterX, y: crossCenterY - cbs, num: 6 }, // Top - CENTERED
```

This creates a symmetric cross:
```
        #6
         |
#1 - #2-#3 - #4
         |
        #5
```

### Option 2: Adjust the offset calculation

Keep the asymmetric cross but recalculate attachment to Square #6's center:
```javascript
// Line 756-760
const crossPoleOffset = {
  x: crossParts[5].position.x - crossBody.position.x, // Keep as is
  y: crossParts[5].position.y - crossBody.position.y - cbs / 2, // Top edge
};
```

**BUT** you'd also need to adjust which square to use. Currently Square #6 (index 5) is the top, but it's offset left.

---

## Event System

### Custom Events Used

1. **`beadDragPosition`** - Fired during bead drag
   - `detail: { isDragging, pushAmount, beadPositionRatio, textHeightPercentage, navButtonOpacity, scrollDirection }`

2. **`heartBeadPressed`** - Fired when heart bead clicked
   - Used for litany navigation

3. **`beadRepeatTouch`** - Fired when same bead touched multiple times
   - Used for content scrolling

4. **`contentExhausted`** - Fired when prayer text fully scrolled
   - Triggers auto-advance to next prayer

---

## Quick Debugging Tips

### View Bodies in Console
```javascript
console.log('Cross Body:', crossBody);
console.log('Cross Parts:', crossParts);
console.log('Cross center:', crossBody.position);
console.log('Square #6:', crossParts[5].position);
```

### Visualize Attachment Points
Add to rendering loop (after line 1800):
```javascript
// Draw attachment point on cross
const attachX = crossBody.position.x + crossPoleOffset.x;
const attachY = crossBody.position.y + crossPoleOffset.y;
context.beginPath();
context.arc(attachX, attachY, 5, 0, Math.PI * 2);
context.fillStyle = 'red';
context.fill();
```

### Check Constraint
```javascript
console.log('Cross constraint:', constraints[constraints.length - 1]);
```

---

## Common Pitfalls

1. **Confusing absolute vs relative positions**
   - Body positions are absolute
   - Constraint points are relative to body center

2. **Forgetting composite body center ≠ any part's center**
   - Use offset calculations, don't assume positions match

3. **Using wrong array index**
   - `crossParts[5]` = Square #6 (arrays are 0-indexed)

4. **Forgetting to update constraints after changing body positions**
   - Constraints calculate once at creation
   - Changing body positions later doesn't update constraints

---

## Testing Your Changes

1. Save the file
2. App auto-reloads (React hot reload)
3. Look for the cross at the bottom
4. Check if chain connects to center-top of cross
5. Try dragging cross to see if it swings naturally

**Quick test:** The chain should be in the CENTER of the cross's top edge, not on the left side.

