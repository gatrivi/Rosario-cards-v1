<!-- invisible-bead-collision-fix -->
# Fix Invisible Bead Collisions and Cross Attachment

## Problems Identified

### 1. Invisible Bead Collisions
**Issue**: Invisible beads (beadSize * 0.8 diameter) are colliding with the cross and other beads, causing violent shaking and energy buildup.

**Root Cause**: Matter.js bodies collide by default. Invisible beads need to be exempt from collision detection while remaining tappable.

### 2. Chain Length Calculation Error
**Issue**: When splitting a long chain with an invisible bead in the middle, the total chain length becomes longer than the original.

**Math Error**:
- **Current**: `longChain/2 + invisibleBeadDiameter + longChain/2` = `longChain + invisibleBeadDiameter` ❌
- **Should be**: `(longChain - invisibleBeadDiameter) / 2 + invisibleBeadDiameter + (longChain - invisibleBeadDiameter) / 2` = `longChain` ✅

**Explanation**: The invisible bead takes up physical space. The two chain segments must be shortened to account for the bead's diameter, otherwise the total constraint length increases, causing compression and collision.

### 3. Cross Attachment Point Error
**Issue**: Chain is attached to square #6 (head) top edge, but should attach to square #1 (left arm) outermost edge per reference implementation.

**Cross Layout**:
```

    | <--- chain attached to top of head
    1 (head)
6 - 2 - 5 (6. left arm, 2. center, 5. right arm)
    3 (legs/thighs)
    4 (legs/feet)
```
***more detailed cross diagram***
```
   ***  << chain is attacked to the middle asterisk
   *1* head
   ***
*********
*6**2**5* left arm, center, right arm
*********
   ***
   *3* upper leg
   ***
   ***
   *4* feet
   ***

   where each asterisk is used to draw a portion of sides or corners of each square

   ```

   i can do it a lot more detailed if you want, but the core structure is very simple, i dont know why you get confused



**Current Code**: Attaches to top of square #6 (head, index 5)
**Reference Code**: Attaches to LEFT SIDE of square #1 (left arm, index 0)

### 4. Energy Addition from High Restitution
**Issue**: Restitution values of 0.8-0.95 combined with tight constraints can cause numerical errors in Matter.js constraint solving, leading to energy buildup and perpetual motion.

**Root Cause**: Matter.js doesn't intentionally add energy, but high restitution with overlapping/compressed constraints causes solver instability.

## Solutions

### Solution 1: Disable Collisions for Invisible Beads

**File**: `src/components/RosarioNube/InteractiveRosary.jsx`

**Location**: In `createInvisibleBead` function (around line 400-416)

**Add collision filtering**:
```javascript
const createInvisibleBead = (x, y, prayerIndex, prayerId) => {
  return Matter.Bodies.circle(
    x, y,
    beadSize * 0.8, // Slightly smaller than regular beads
    beadOptions('rgba(0,0,0,0)', {
      // Transparent
      beadNumber: null, // No visible number
      prayerIndex: prayerIndex,
      prayerId: prayerId,
      isInvisible: true, // Flag for rendering/interaction
      // COLLISION FILTERING: Make invisible beads non-collidable
      collisionFilter: {
        category: 0x0002, // Invisible bead category
        mask: 0x0000,     // Don't collide with anything
      },
      render: {
        fillStyle: 'rgba(0,0,0,0)', // Fully transparent
        strokeStyle: 'rgba(0,0,0,0)',
        lineWidth: 0,
      }
    })
  );
};
```

**Explanation**: 
- `category: 0x0002` assigns invisible beads to category 2
- `mask: 0x0000` means "don't collide with any category"
- Beads remain tappable via mouse constraint, but pass through all physics bodies

### Solution 2: Fix Chain Length Calculation

**File**: `src/components/RosarioNube/InteractiveRosary.jsx`

**Locations**: All invisible bead chain splits (lines ~580, ~614, ~719, ~864)

**Current Code Example** (heart to main):
```javascript
const heartToMainLength = beadSize * 1.6; // ~13px = 3 links

// WRONG: Each half is longChain/2
constraints.push(
  Matter.Constraint.create({
    ...springOptions(heartToMainLength / 2), // ❌
    bodyA: centerBead,
    bodyB: heartToMainInvisible,
    pointA: getPoleOffset(centerBead, heartToMainInvisible, centerBeadSize),
    pointB: { x: 0, y: 0 },
    prayerIndex: 10,
    prayerId: rosarySequence[10],
  })
);
```

**Fixed Code**:
```javascript
const heartToMainLength = beadSize * 1.6; // ~13px = 3 links
const invisibleBeadDiameter = beadSize * 0.8 * 2; // Full diameter (radius * 2)
const chainHalfLength = (heartToMainLength - invisibleBeadDiameter) / 2; // ✅

// First half: heart to invisible bead
constraints.push(
  Matter.Constraint.create({
    ...springOptions(chainHalfLength), // ✅ Corrected length
    bodyA: centerBead,
    bodyB: heartToMainInvisible,
    pointA: getPoleOffset(centerBead, heartToMainInvisible, centerBeadSize),
    pointB: { x: 0, y: 0 }, // CENTER anchor on invisible bead
    prayerIndex: 10,
    prayerId: rosarySequence[10],
  })
);

// Second half: invisible bead to first main bead
constraints.push(
  Matter.Constraint.create({
    ...springOptions(chainHalfLength), // ✅ Corrected length
    bodyA: heartToMainInvisible,
    bodyB: mainLoopBeads[0],
    pointA: { x: 0, y: 0 }, // CENTER anchor on invisible bead
    pointB: getPoleOffset(mainLoopBeads[0], heartToMainInvisible, beadSize),
    prayerIndex: 10,
    prayerId: rosarySequence[10],
  })
);
```

**Apply to all 4 invisible bead locations**:
1. Heart → first main bead (line ~580-607)
2. Last main bead → heart (line ~614-655)
3. Heart → last tail bead (line ~719-761)
4. Cross → first tail bead (line ~864-891)

### Solution 3: Fix Cross Attachment Point

**File**: `src/components/RosarioNube/InteractiveRosary.jsx`

**Location**: Around line 896-903

**Current Code** (WRONG - attaches to head):
```javascript
const crossPoleOffset = {
  // Start with vector to center of square #6, then move UP by half a square's height
  x: crossParts[5].position.x - crossBody.position.x, // Square #6 is at index 5
  y: crossParts[5].position.y - crossBody.position.y - cbs / 2, // Move to top edge (north)
};
```

**Fixed Code** (matches reference - attaches to left arm):
```javascript
const crossPoleOffset = {
  // Connect to LEFT SIDE (west edge) of cross square #1 (left arm)
  // Like the reference implementation in MatterScene.tsx line 209-213
  x: (crossParts[0].position.x - crossBody.position.x) - (cbs / 2), // Square #1, left edge
  y: crossParts[0].position.y - crossBody.position.y, // Center height of arm
};
```

**Diagram**:
```
Original (WRONG):          Fixed (CORRECT):
     ↓ chain                    
     6                          6
     2                          2
1 - 2 - 3 - 4            chain→1 - 2 - 3 - 4
     2                          2
     5                          5
```

**Explanation**: 
- Square #1 (index 0) is the leftmost arm piece
- Subtract `cbs / 2` to move from center to LEFT edge
- This matches how real rosaries hang from the side of the cross

### Solution 4: Lower Cross Restitution

**File**: `src/components/RosarioNube/InteractiveRosary.jsx`

**Location**: Cross body creation (around line 878-888)

**Current Code**:
```javascript
const crossBody = Matter.Body.create({
  parts: crossParts,
  friction: 0.5,
  frictionAir: rosaryFriction,
  restitution: 0.8, // ❌ Too bouncy, causes instability
  isCrossComposite: true,
  crossParts: crossParts,
  beadNumber: 0,
  prayerIndex: 0,
  prayerId: rosarySequence[0] || "unknown",
});
```

**Fixed Code**:
```javascript
const crossBody = Matter.Body.create({
  parts: crossParts,
  friction: 0.5,
  frictionAir: rosaryFriction,
  restitution: 0.5, // ✅ Lower restitution for stability (instead of using vitality-based)
  isCrossComposite: true,
  crossParts: crossParts,
  beadNumber: 0,
  prayerIndex: 0,
  prayerId: rosarySequence[0] || "unknown",
});
```

**Alternative**: Override vitality-based restitution for cross only:
```javascript
const crossBody = Matter.Body.create({
  parts: crossParts,
  friction: 0.5,
  frictionAir: rosaryFriction,
  restitution: Math.min(baseRestitution, 0.5), // ✅ Cap at 0.5 for cross
  // ... rest of properties
});
```

## Implementation Checklist

- [ ] Add collision filtering to `createInvisibleBead` function (mask: 0x0000)
- [ ] Calculate `invisibleBeadDiameter = beadSize * 0.8 * 2` before chain splits
- [ ] Fix heart → first main bead chain lengths (subtract bead diameter)
- [ ] Fix last main bead → heart chain lengths (subtract bead diameter)
- [ ] Fix heart → last tail bead chain lengths (subtract bead diameter)
- [ ] Fix cross → first tail bead chain lengths (subtract bead diameter)
- [ ] Change cross attachment from square #6 (head) to square #1 (left arm)
- [ ] Lower cross restitution to 0.5 or cap vitality-based restitution

## Expected Results

After fixes:

1. **No Collisions**: Invisible beads pass through all bodies, eliminating shake
2. **Correct Chain Tension**: Total constraint length remains constant (longChain), no compression
3. **Natural Cross Hang**: Cross hangs from left arm like a real rosary
4. **Stable Physics**: Lower cross restitution prevents energy buildup

## Testing

1. Enable developer mode to see invisible beads (magenta ghosts)
2. Click on long chain sections - should navigate to chain prayers smoothly
3. Observe cross - should hang naturally without violent shaking
4. Drag cross - should settle quickly without perpetual motion
5. Check all chain sections have proper tension (no slack, no compression)

## Reference

**Working Implementation**: `react-matter.js-draggable-rosary/components/MatterScene.tsx`
- Cross attachment: Lines 208-214
- Chain structure: Lines 190-206
- No invisible beads in reference (we're adding that feature)


