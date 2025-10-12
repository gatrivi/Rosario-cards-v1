# Save State 02: Expanded Ranges, Strings Visible

**Branch:** `savestate-02-expanded-ranges-strings-visible`  
**Date:** December 2024  
**Previous State:** `savestate-01-physics-maxed-springs-visible`

## What Works ✅

- Physics control panel with expanded ranges:
  - Friction: 0-2 (was 0-1)
  - Air Friction: 0-0.5 (was 0-0.2)
  - Density: 0.001-0.02 (was 0.001-0.01)
  - Stiffness: 0-1 (was 0.1-1)
- Strings render as thin lines (type: 'line')
- Prayer-to-bead mapping correct
- Highlighting follows navigation
- All 85 prayers accessible

## What Doesn't Work ❌

1. **Infinite bouncing** - Beads never settle
2. **Physics controls don't work** - Sliders don't update rosary
3. **Cross still dances** unless manually adjusted

## Current Physics Values

### Beads:
- restitution: 0.8
- friction: 0.1
- frictionAir: 0.01
- density: 0.001

### Strings:
- stiffness: 0.8 (default)
- damping: 0.5
- render: type: 'line'

### Cross:
- friction: 0.1
- frictionAir: 0.01
- restitution: 0.8
- density: 0.001

## Analysis

Compared to working `react-matter.js-draggable-rosary`:
- ❌ friction too low (0.1 vs 0.5)
- ❌ frictionAir too low (0.01 vs 0.05)
- ❌ stiffness may be too high (0.8 vs 0.08) OR too low (testing 2.0 next)

## Next Steps

Test user's hypothesis:
1. Increase stiffness to 2.0 (ultra-rigid)
2. Keep type: 'line' rendering
3. Update physics panel defaults
4. See if rigidity stops bouncing

