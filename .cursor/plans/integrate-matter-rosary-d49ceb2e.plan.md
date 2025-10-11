<!-- d49ceb2e-402e-43f4-8cf0-fa1e437ff9fd 1fc15762-4dde-4865-9ca2-5e0cb751b6f5 -->
# Remove Spring Coils - Show Simple Strings

## Problem

The rosary is showing **zigzag spring coils** between beads instead of simple straight strings. This looks messy and not like a real rosary.

## Goal

Simple straight lines connecting beads - NO zigzag spring patterns.

## Solution

The issue is in the constraint rendering. Matter.js has a default spring visualization that shows coils. We need to disable this and show simple lines.

### Fix: Update String Rendering

Change the `stringOptions` render settings:

```javascript
const stringOptions = (length, stiffness = 0.08) => ({
  stiffness: stiffness,
  damping: 0.9,
  length: length,
  render: {
    strokeStyle: "#94a3b8",
    lineWidth: 1,
    visible: true,
    type: 'line',  // Force simple line, not spring coil
    anchors: false  // No anchor point visualization
  },
});
```

**Location**: `TestMatterScene.jsx` ~line 299

If that doesn't work, we may need to set:

```javascript
render: {
  visible: false  // Hide Matter.js rendering entirely
}
```

And then draw our own strings in the `afterRender` event using canvas lines.

### Alternative: Custom String Rendering

If Matter.js insists on showing spring coils, draw custom strings:

```javascript
Matter.Events.on(render, "afterRender", () => {
  const context = render.context;
  
  // Draw custom strings
  strings.forEach((string) => {
    const bodyA = string.bodyA;
    const bodyB = string.bodyB;
    
    context.strokeStyle = "#94a3b8";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(bodyA.position.x, bodyA.position.y);
    context.lineTo(bodyB.position.x, bodyB.position.y);
    context.stroke();
  });
  
  // ... then draw bead numbers
});
```

## Testing

- [ ] No zigzag spring coils visible
- [ ] Only simple straight lines between beads
- [ ] Lines connect at bead edges (poles)
- [ ] Clean rosary appearance

### To-dos

- [ ] Change spring render options to visible: true with strokeStyle
- [ ] Calculate angles and use pointA/pointB for pole attachments
- [ ] Reverse tail bead numbering to be 1-5 from cross to heart
- [ ] invisible beads do have a number because they are for prayers that should be dipslayed when the chain is active. since we cant select the chain we use invisible beads. so invisible beads have numbers.
- [ ] Test that all strings are visible and attach correctly
- [ ] check there are no visible springs or spring anchor points. bead are connected plainly to string