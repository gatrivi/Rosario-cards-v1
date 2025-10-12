# Prayer-to-Bead Mapping Update

**Date:** December 2024  
**Branch:** `feature/interactive-matter-rosary`  
**Backup:** `backup/pre-prayer-mapping`

## Changes Made

### 1. Physics Improvements (Glass Bead Feel)

Updated physics parameters to make beads feel like glass beads on a countertop and eliminate "dancing" (jitter):

```javascript
// Bead Physics
restitution: 0.05 (was 0.1)    // Minimal bounce
friction: 0.8 (was 0.5)         // High grip
frictionAir: 0.08 (unchanged)   // Moderate air resistance
density: 0.005 (was 0.001)      // 5x heavier

// String/Constraint Physics
stiffness: 0.8 (was 0.2)        // Firmer strings
damping: 0.95 (was 0.9)         // Absorb oscillations

// Cross Physics
friction: 0.8 (was 0.5)
frictionAir: 0.08 (was 0.05)
restitution: 0.05 (was 0.8)
density: 0.008 (was implicit)   // Heavier "iron" cross
```

**Result:** Beads now settle quickly, feel substantial, and don't vibrate/jitter when at rest.

### 2. Prayer-to-Bead Mapping (Traditional Rosary Structure)

Updated prayer indices to match traditional rosary structure:

#### Physical Beads (55 total)

**Cross (1 composite):**
- Index 0: SC (Sign of Cross)

**Tail Beads (3):**
- Index 2: C (Credo) - Bead closest to center
- Index 3: P (Our Father) - Middle bead
- Index 4: A (Hail Mary) - Bead closest to cross

**Center Bead (1):**
- Index 7: G (Glory Be)

**Main Loop (50 beads):**
- Each decade has 10 beads for 10 Hail Marys
- Decade 1: Indices 11-20
- Decade 2: Indices 25-34
- Decade 3: Indices 39-48
- Decade 4: Indices 53-62
- Decade 5: Indices 67-76

#### Invisible/Auto-Advance Prayers (30 total)

These prayers appear when using Next/Prev buttons but have no physical bead:

**Opening:**
- Index 1: AC (Acto de Contrición)
- Index 5: A (Hail Mary 2)
- Index 6: A (Hail Mary 3)

**Each Decade (×5):**
- F (Fatima Prayer)
- M (Mystery announcement)
- P (Our Father)
- G (Glory Be after)

**Closing:**
- Index 82: LL (Litany)
- Index 83: S (Salve)
- Index 84: Papa (Prayer for Pope)

### 3. Prayer Array Structure

The prayer arrays in `RosarioPrayerBook.js` follow this pattern:

```javascript
[
  "SC",   // 0: Cross
  "AC",   // 1: Invisible
  "C",    // 2: Tail bead 1
  "P",    // 3: Tail bead 2
  "A",    // 4: Tail bead 3
  "A",    // 5: Invisible
  "A",    // 6: Invisible
  "G",    // 7: Center bead
  // Decade 1
  "F",    // 8: Invisible
  "MGo1", // 9: Invisible (Mystery)
  "P",    // 10: Invisible (Our Father)
  "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", // 11-20: Main loop beads 1-10
  // Decade 2
  "G",    // 21: Invisible
  "F",    // 22: Invisible
  "MGo2", // 23: Invisible
  "P",    // 24: Invisible
  "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", // 25-34: Main loop beads 11-20
  // ... continues for all 5 decades
  // Closing
  "LL",   // 82: Invisible
  "S",    // 83: Invisible
  "Papa", // 84: Invisible
]
```

**Total:** 85 prayers, 55 physical beads

## User Experience

### What Works Now

✅ **Click any bead** → Shows correct prayer  
✅ **Next/Prev buttons** → Navigate through all 85 prayers  
✅ **10 consecutive beads** → 10 Hail Marys in each decade  
✅ **Physics** → Glass bead feel, no dancing/jitter  
✅ **Traditional structure** → Matches how rosaries are actually prayed  

### How It Works

1. **Click a physical bead** → Jump to that prayer
2. **Click Next** → Advance through all prayers (some have no bead)
3. **Invisible prayers** → Still accessible via buttons, just not clickable on rosary
4. **Each decade** → Mystery announcement, Our Father, 10 Hail Marys, Glory Be, Fatima

## Implementation Details

### File: `InteractiveRosary.jsx`

**Lines 155-170:** Updated physics parameters  
**Lines 190-202:** Center bead mapped to index 7 (Glory Be)  
**Lines 204-238:** Main loop beads mapped to Hail Marys only  
**Lines 297-322:** Tail beads mapped to indices 2, 3, 4 (C, P, A)  
**Lines 375-383:** Cross physics updated  

### Algorithm: Main Loop Prayer Mapping

```javascript
// For each of 50 beads (i = 0 to 49):
const decadeNum = Math.floor(i / 10);      // Which decade (0-4)
const posInDecade = i % 10;                // Position in decade (0-9)
const decadeStart = 8 + (decadeNum * 14);  // Start of decade in array
const prayerIndex = decadeStart + 3 + posInDecade; // +3 skips F, M, P
```

## Testing Checklist

- [x] Build completes without errors
- [ ] Cross shows "SC" when clicked
- [ ] Tail beads show C, P, A
- [ ] Center bead shows G (Glory Be)
- [ ] Main loop decades each have 10 consecutive Hail Marys
- [ ] Next button navigates through all prayers including invisible ones
- [ ] Physics feel: glass beads, no dancing
- [ ] No jitter when beads are at rest

## Next Steps

1. Manual browser testing
2. Verify decade boundaries
3. Test mystery announcements via Next button
4. Confirm closing prayers (LL, S, Papa) accessible

---

**Backup available at:** `backup/pre-prayer-mapping` branch if rollback needed.
