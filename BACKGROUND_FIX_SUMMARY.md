# Background Image Fix Summary

## Problem
- Background images were changing/resetting on every bead click
- This created a jarring, flickering experience
- Too frequent changes made the app feel unstable

## Solution Implemented

### 1. **Rate Limiting Background Changes**
**File:** `src/App.js`

Added a throttle mechanism that only allows background changes every 20 seconds minimum:
- Uses `lastImageChangeRef` to track last change time
- Before calling `setPrayerImg`, checks if 20 seconds have elapsed
- This prevents flickering on rapid bead clicks

```javascript
const now = Date.now();
if (now - lastImageChangeRef.current > 20000) {
  // Only change background if 20 seconds have passed
  setPrayerImg(selectedImage);
  lastImageChangeRef.current = now;
}
```

### 2. **Smooth Crossfade Transitions**
**File:** `src/components/ViewPrayers/ViewPrayers.js`

- **Removed `key={finalImageUrl}` prop**: This was causing React to unmount/remount the image component on every URL change, creating the "reset" effect
- **Enhanced CSS transitions**: 
  - Increased opacity transition to 3s (from 2.5s)
  - Increased transform transition to 8s (from 3s) for slower, smoother pan
  - Removed jarring animation that was resetting each time
  
Now images smoothly crossfade into each other instead of abruptly replacing.

### 3. **Results**

✅ **No more flickering** - Background only changes every 20+ seconds
✅ **Smooth transitions** - Images gracefully fade in/out like viewing different corners of a church
✅ **Better UX** - App feels stable and contemplative, not jumpy
✅ **Build successful** - No breaking changes

## Technical Details

**Before:**
- Every bead click → immediate image change
- `key` prop → full React remount
- Fast animations → jarring reset effect

**After:**
- Bead click → check timer (20s cooldown)
- No `key` prop → same component, smooth src change
- Slow transitions → gentle crossfade (3-8 seconds)

## Note About Prayer-Specific Backgrounds

The user mentioned potentially implementing prayer-specific backgrounds (different images for different prayers). This was **not implemented** because:
- Would require significant UI/UX design work
- Current solution (periodic rotation) already provides variety
- Risk of making backgrounds feel too busy/distracting from prayers
- Can be revisited later if desired with proper design
