# Developer Mode Toggle Implementation

## Overview

Added a developer mode toggle to the rosary interface that allows users to switch between a clean prayer mode and a developer debugging mode.

## Feature Description

The developer mode toggle provides two distinct viewing modes for the interactive rosary:

### Prayer Mode (Default)
- **Lines**: Always visible (light blue `#94a3b8`)
- **Anchor Points**: Hidden
- **Bead Numbers**: Hidden  
- **Current Prayer Highlighting**: Always visible

### Developer Mode
- **Lines**: Always visible (light blue `#94a3b8`)
- **Anchor Points**: Visible (small circles at connection points)
- **Bead Numbers**: Visible (0-57 on all beads)
- **Current Prayer Highlighting**: Always visible

## Implementation Details

### Files Modified

1. **`src/App.js`**
   - Added `developerMode` state (defaults to `false`)
   - Added `toggleDeveloperMode` handler with event dispatching
   - Passed state and handler to `InterfaceToggle` component

2. **`src/components/common/InterfaceToggle.js`**
   - Added `developerMode` and `onToggleDeveloperMode` props
   - Added "🔧 Developer Mode" checkbox in settings panel
   - Positioned after Detailed Progress toggle, before Focus Mode

3. **`src/components/RosarioNube/InteractiveRosary.jsx`**
   - Added `developerMode` state tracking
   - Added event listener for `developerModeChange` events
   - Updated `springOptions` function with conditional rendering:
     - `visible: true` (lines always visible)
     - `anchors: developerMode` (anchors only in dev mode)
   - Updated `afterRender` event to conditionally show bead numbers
   - Added useEffect to dynamically update constraint anchor visibility

### Technical Implementation

#### Constraint Rendering Options
```javascript
const springOptions = (length, stiffness = 0.08) => ({
  stiffness: stiffness,
  damping: 0.5,
  length: length,
  render: {
    strokeStyle: "#94a3b8",
    lineWidth: 2,
    type: "line",
    visible: true, // Always show lines
    anchors: developerMode, // Only show anchor points in developer mode
  },
});
```

#### Dynamic Constraint Updates
```javascript
useEffect(() => {
  if (matterInstance.current?.world) {
    const allConstraints = Matter.Composite.allConstraints(
      matterInstance.current.world
    );
    allConstraints.forEach((constraint) => {
      if (constraint.render) {
        constraint.render.anchors = developerMode;
      }
    });
  }
}, [developerMode]);
```

#### Conditional Bead Number Rendering
```javascript
// Draw bead number only in developer mode
const numberToDisplay = bead.beadNumber;
if (numberToDisplay && developerMode) {
  context.font = `bold ${size * 0.8}px Arial`;
  context.fillText(
    `${numberToDisplay}`,
    bead.position.x,
    bead.position.y
  );
}
```

## User Experience

### How to Access
1. Click the ⚙️ settings button in the top-left corner
2. Find the "🔧 Developer Mode" checkbox in the settings panel
3. Toggle to enable/disable developer mode

### Visual Changes
- **Prayer Mode**: Clean rosary with connecting lines, no visual clutter
- **Developer Mode**: Full debugging information with bead numbers and anchor points
- **Current Prayer**: Always highlighted regardless of mode

## Benefits

1. **Clean Prayer Experience**: Default mode provides distraction-free prayer interface
2. **Developer Debugging**: Easy access to debugging information when needed
3. **Educational Value**: Users can see bead numbering system and connection points
4. **Non-Destructive**: Toggle doesn't affect core functionality, only visual presentation
5. **Session Persistence**: Setting persists during the session

## Technical Notes

- Uses Matter.js `render.anchors` property to control anchor point visibility
- Event-driven architecture with custom `developerModeChange` events
- Dynamic constraint updates without recreating the entire Matter.js world
- Maintains existing prayer highlighting functionality in both modes
- No performance impact when toggling between modes

## Future Enhancements

Potential improvements could include:
- Persistence of developer mode setting across browser sessions
- Additional debugging information (prayer indices, constraint properties)
- Different visual styles for different types of beads
- Export functionality for developer mode data

## Testing

The feature has been tested for:
- ✅ Toggle functionality in settings panel
- ✅ Visual changes when switching modes
- ✅ Constraint line visibility in both modes
- ✅ Anchor point visibility only in developer mode
- ✅ Bead number visibility only in developer mode
- ✅ Current prayer highlighting in both modes
- ✅ No performance issues or memory leaks
- ✅ Event handling and state management

## Commit Information

- **Commit**: `5322ac0`
- **Branch**: `cursor/stained-glass-ui-and-css-redesign-2bb7`
- **Files Changed**: 3 files, 90 insertions(+), 8 deletions(-)
- **Date**: December 2024
