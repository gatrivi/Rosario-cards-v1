# Sub-Bar Mystery Selection Buttons - Fix Summary

## Issue Identified
The mystery selection sub-bar buttons (numbered 1-5) were rendering improperly - appearing in the wrong position (middle of screen instead of above the main navigation bar).

## Root Cause
The `.sub-bar` was using `position: absolute` with `bottom: 100%` to position above its parent `.segmented-bar`, but this approach had several issues:

1. **Incorrect positioning context**: The parent `.segmented-bar` has `display: flex`, which can interfere with absolute positioning of children
2. **Wrong transform direction**: The hidden state used `translateY(calc(100% + 8px))` which moved the element DOWN instead of hiding it properly
3. **Relative positioning issues**: Using `position: absolute` with `bottom: 100%` didn't work reliably with the flex parent

## Solution Applied
Changed the `.sub-bar` to use `position: fixed` with proper viewport-based positioning:

### Main Changes (src/components/PrayerButtons/PrayerButtons.css)

1. **Changed positioning strategy**:
   - FROM: `position: absolute; bottom: 100%;`
   - TO: `position: fixed; bottom: calc(10px + 88px + 8px);`

2. **Added proper centering**:
   - Uses `left: 50%; transform: translateX(-50%)` to center horizontally
   - Matches the parent's centering approach

3. **Fixed visibility toggle**:
   - Hidden state: `transform: translateX(-50%) translateY(100px)` + `opacity: 0` + `pointer-events: none`
   - Visible state: `transform: translateX(-50%) translateY(0)` + `opacity: 1` + `pointer-events: auto`

4. **Updated responsive breakpoints**:
   - Desktop (1024px+): `bottom: calc(10px + 94px + 10px)`
   - Tablet (768px-1023px): `bottom: calc(10px + 90px + 9px)`
   - Mobile (480px-767px): `bottom: calc(10px + 88px + 8px)`
   - Small mobile (<480px): `bottom: calc(10px + 88px + 8px)`

5. **Maintained proper z-index layering**:
   - Sub-bar: `z-index: 99`
   - Main bar: `z-index: 100`

## Expected Behavior (After Fix)
- Sub-bar appears directly above the main navigation bar when mysteries button (🔮) is clicked
- Sub-bar is hidden by default (moved down with opacity: 0)
- Sub-bar smoothly animates into view when activated
- Sub-bar is properly centered and matches main bar width
- Sub-bar closes when a mystery is selected or close button (✕) is clicked
- Responsive positioning works across all screen sizes

## Files Modified
- `src/components/PrayerButtons/PrayerButtons.css` - Fixed sub-bar positioning and responsive styles

## Testing
The sub-bar should now:
1. Not appear in the middle of the screen
2. Only show when the mysteries button is clicked
3. Position correctly above the main navigation bar
4. Animate smoothly when opening/closing
5. Work correctly on all screen sizes
