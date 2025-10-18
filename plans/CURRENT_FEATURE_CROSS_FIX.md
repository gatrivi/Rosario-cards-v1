# Current Feature: Cross Chain Attachment Fix

## The Problem

The rosary chain is attaching to the **left side** of the cross instead of the **center top**.

### Visual Issue
- Expected: Chain connects to center-top of cross head
- Actual: Chain connects to left edge of cross

## Root Cause

The cross is **asymmetric** - the vertical arm is offset to the left.

**File:** `src/components/RosarioNube/InteractiveRosary.jsx`
**Lines:** 719-726

```javascript
const crossPositions = [
  { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 }, // Left arm
  { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 }, // Center-left
  { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 }, // Center-right
  { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 }, // Right arm
  { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // Bottom ← LEFT OF CENTER
  { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }, // Top ← LEFT OF CENTER
];
```

Notice squares #5 and #6 use `crossCenterX - cbs * 0.5` (left offset) instead of `crossCenterX` (center).

## The Fix

**Change lines 724-725 from:**
```javascript
{ x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 },
{ x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 },
```

**To:**
```javascript
{ x: crossCenterX, y: crossCenterY + cbs, num: 5 }, // Removed the - 0.5 offset
{ x: crossCenterX, y: crossCenterY - cbs, num: 6 }, // Removed the - 0.5 offset
```

This centers the vertical arm and makes the cross symmetric.

## Expected Result

The chain should connect to the center-top of Square #6, making the cross hang naturally from its head (symbolizing being held up by heaven).

## How to Test

1. Save the file
2. Check the cross in the running app
3. The chain should be centered on the cross's top edge
4. When you drag the cross, it should swing naturally from its top center

## Related Code

The chain attachment calculation (lines 756-760) should work correctly once the cross is symmetric:
```javascript
const crossPoleOffset = {
  x: crossParts[5].position.x - crossBody.position.x, // Will be ~0 (centered)
  y: crossParts[5].position.y - crossBody.position.y - cbs / 2, // Top edge
};
```

