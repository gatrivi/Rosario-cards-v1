# Matter.js Physics Rosary Feature

## Overview
Implementation of an interactive, physics-based rosary using Matter.js engine. This feature creates a visually dynamic and tactile rosary experience where beads have realistic physics properties and can be dragged, clicked, and interact with each other.

## Status
**Tier 2 - Future Enhancement**

Currently preserved in `InteractiveRosaryMatter` branch. The core physics rosary (`InteractiveRosary.jsx`) has been integrated into master with touch support, but the full Matter.js implementation with draggable beads remains in development branch for future refinement.

## Key Commits
- `9569592` - Added first draggable bead
- `d17993b` - Added second bead
- `03ade8a` - Implemented Matter rosary v2 with images and testing
- `7aefee2` - Fixed Hail Mary counter integration
- `340e24a` (on cursor/make-beads-draggable branch) - Refactored Hail Mary count and added comprehensive touch support

## Technical Implementation

### Core Components
- **Engine**: Matter.js physics engine with zero gravity for floating effect
- **Beads**: Circular physics bodies with low density (0.001) and minimal air friction (0.01)
- **Constraints**: Spring-based connections between beads creating chain-like behavior
- **Cross Structure**: 6 squares arranged in traditional cross pattern
- **Decades**: 5 sets of 10 beads arranged in circular pattern around center

### Physics Properties
```javascript
{
  isStatic: false,        // Allow physics interaction
  density: 0.001,         // Light weight for floating effect
  frictionAir: 0.01,      // Minimal air resistance
  stiffness: 0.2,         // Soft constraint for smooth dragging
}
```

### Mystery-Specific Colors
Each mystery type (gozosos, dolorosos, gloriosos, luminosos) has unique color schemes:
- **Gozosos** (Joyful): Gold/yellow palette (#FFD700)
- **Dolorosos** (Sorrowful): Purple/violet palette (#8B4789)
- **Gloriosos** (Glorious): White/silver palette (#E8E8E8)
- **Luminosos** (Luminous): Blue/cyan palette (#4169E1)

### Touch Support
Touch events properly integrated for mobile devices:
- Converts touch coordinates to Matter.js mouse coordinates
- Simulates mouse button states for drag interactions
- Prevents default touch behavior for smooth experience
- Clean event listener removal in cleanup

## File Structure
```
src/components/RosarioNube/
├── InteractiveRosary.jsx     - Main physics rosary component
├── InteractiveRosary.css     - Styling for rosary container
├── Bead.jsx                  - Individual bead component (legacy)
├── RosarioNube.jsx          - Container wrapper
└── useRosaryState.js        - State management hook
```

## Integration Points
- Integrates with `useRosaryState` hook for prayer sequence management
- Receives `onBeadClick` callback for prayer navigation
- Syncs with `currentPrayerIndex` to highlight active prayer
- Supports all four mystery types dynamically

## Future Enhancements

### Tier 2 Improvements
1. **Enhanced Drag Physics**
   - Improve spring constraints for more realistic chain behavior
   - Add subtle rotation to beads based on momentum
   - Implement collision response between beads

2. **Visual Polish**
   - Add glow effects to highlighted beads
   - Implement smooth color transitions between mysteries
   - Add particle effects when prayers are completed

3. **Performance Optimization**
   - Implement object pooling for better performance
   - Add LOD (Level of Detail) for mobile devices
   - Optimize constraint calculations

4. **Accessibility**
   - Add keyboard navigation for rosary beads
   - Implement haptic feedback on mobile
   - Screen reader support for prayer progression

## Known Limitations
- Canvas size currently fixed (800x600), needs responsive sizing
- Debug console logs should be removed for production
- Prayer index mapping needs refinement for cross beads
- Mouse constraint visibility could be improved

## Testing Recommendations
1. Test on various mobile devices (iOS/Android)
2. Verify touch interactions don't interfere with scroll
3. Test performance with all 59 beads rendered
4. Validate prayer sequence alignment with bead clicks
5. Check memory cleanup on component unmount

## Branch Information
- **Development Branch**: `InteractiveRosaryMatter`
- **Keep Branch**: Yes (for future Tier 2 development)
- **Remote Branches**: `cursor/make-beads-draggable-and-fix-hail-mary-counter-cd4b` (can be deleted after documentation)

## Resources
- [Matter.js Documentation](https://brm.io/matter-js/)
- [Matter.js Examples](https://brm.io/matter-js/demo/)
- Original implementation inspired by physical rosary tactile experience

