# Complete Rosary Run - Testing Guide

## Purpose
Verify all features work together in a real rosary prayer session, especially the new mystery tracking and closing prayers unlock system.

## Pre-Test Setup

### 1. Clear Previous State (Optional)
If you want to test from a fresh state:
- Open browser DevTools (F12)
- Go to Application > Local Storage
- Delete keys: `visitedMysteries`, `rosaryState`, `rosaryTracker`
- Or just click the Reset button in settings

### 2. Enable Developer Mode (Recommended for Testing)
- Open Settings (gear icon)
- Enable "Developer Mode"
- This will show prayer indices and status labels on beads

## Complete Rosary Test Sequence

### Part 1: Opening Prayers (Cross & Tail Section)

**Cross Bead** (Index 0):
- [ ] Click cross to start
- [ ] Verify "Sign of the Cross" prayer appears
- [ ] Cross glows golden (current prayer indicator)

**Tail Beads** (Indices 3, 4, 5, 6):
- [ ] Click first tail bead (Our Father)
- [ ] Click second tail bead (Hail Mary)
- [ ] Click third tail bead (Hail Mary)
- [ ] Click fourth tail bead (Hail Mary)
- [ ] Verify each prayer displays correctly
- [ ] **Tail beads should NOT glow yet** (mysteries not complete)

**First Mystery Bead** (Index 9):
- [ ] Click to see first mystery
- [ ] Console should log: "📿 Mystery visited: M1go (1/5 mysteries)"
- [ ] This counts as 1st mystery visited

### Part 2: First Decade

**Our Father** → **10 Hail Marys** → **Gloria** (on chain) → **Fatima** (on chain):
- [ ] Navigate through the decade
- [ ] Test chain prayer navigation (tap bead repeatedly to scroll, then tap chain)
- [ ] Verify Gloria and Fatima appear on chain sections

### Part 3: Complete 5 Mysteries (Full Rosary Loop)

**Repeat for each mystery**:
- [ ] **Mystery 2** (lone bead after 1st decade)
  - Console: "📿 Mystery visited: M2go (2/5 mysteries)"
- [ ] **Mystery 3** (lone bead after 2nd decade)
  - Console: "📿 Mystery visited: M3go (3/5 mysteries)"
- [ ] **Mystery 4** (lone bead after 3rd decade)
  - Console: "📿 Mystery visited: M4go (4/5 mysteries)"
- [ ] **Mystery 5** (lone bead after 4th decade)
  - Console: "🎉 Closing prayers and litany unlocked!"
  - Console: "📿 Mystery visited: M5go (5/5 mysteries)"

### Part 4: Verify Closing Prayers Unlock 🎉

**Visual Verification**:
- [ ] **Tail beads (3rd, 4th, 5th)** now glow golden
- [ ] In developer mode, they show "CLOSE" label
- [ ] **Heart bead** at top of loop glows golden
- [ ] In developer mode, heart shows "LITANY" label

**Functional Testing - Tail Beads**:
- [ ] Click **3rd tail bead** (was 3rd Hail Mary)
  - Console: "🎯 Closing prayers unlocked - redirecting tail bead 5 → 79 (LL)"
  - Should show **Litany of Loreto** entrance
- [ ] Click **4th tail bead** (was 3rd Hail Mary originally)
  - Should redirect to **Salve Regina** (index 80)
- [ ] Click **5th tail bead** (was 1st Mystery originally)
  - Should redirect to **Pope's Prayer** (index 81)

**Functional Testing - Heart Bead**:
- [ ] Click **heart bead** at top of rosary loop
  - Should enter Litany of Loreto
  - Litany entrance animation should play
  - Click heart bead again to advance through litany verses

### Part 5: Litany Navigation

**Litany Progression**:
- [ ] Tap heart bead to advance through litany verses
- [ ] Verify each verse displays correctly
- [ ] Progress through all litany invocations
- [ ] At end of litany, should move to next prayer

### Part 6: Complete Rosary

**Final Prayers**:
- [ ] Complete Salve Regina (index 80)
- [ ] Complete Pope's Prayer (index 81)
- [ ] Reach end of rosary (index 84)
- [ ] Console: "🎉 Rosary completed!"
- [ ] Rosary completion tracked in localStorage

## Expected Console Output Summary

```
// Starting
🎯 handleBeadClick: prayerIndex=0, prayerId=SC

// First mystery
📿 Mystery visited: M1go (1/5 mysteries)

// Second mystery
📿 Mystery visited: M2go (2/5 mysteries)

// Third mystery
📿 Mystery visited: M3go (3/5 mysteries)

// Fourth mystery
📿 Mystery visited: M4go (4/5 mysteries)

// Fifth mystery (UNLOCK EVENT)
📿 Mystery visited: M5go (5/5 mysteries)
🎉 Closing prayers and litany unlocked!

// Clicking unlocked tail bead
🎯 Closing prayers unlocked - redirecting tail bead 5 → 79 (LL)

// Completion
🎉 Rosary completed!
```

## UX Improvements to Verify

### Background Images
- [ ] Background changes slowly (45-second intervals for fallbacks)
- [ ] Prayer images stay fixed (don't rotate randomly)
- [ ] No purple flash when images change
- [ ] Smooth 1.5s crossfade transitions

### St. Teresa Date Logic
- [ ] On October 15: St. Teresa image and prayer text
- [ ] On other dates: Random fallback images, no St. Teresa text

### Visual Feedback
- [ ] Current bead: Strong golden glow with pulse
- [ ] Next bead: Subtle golden hint (35% intensity)
- [ ] Completed beads: Faint silver outline
- [ ] Pressed beads: Subtle silver afterglow (25% opacity)
- [ ] Unlocked tail beads: Golden pulse (when 5 mysteries complete)
- [ ] Unlocked heart bead: Gentle golden pulse (when 5 mysteries complete)

### Audio Feedback
- [ ] Heart bead plays chime when litany is accessible
- [ ] Heart bead plays "not available" sound when locked
- [ ] Chain prayer chimes work correctly
- [ ] Bead collision sounds vary by vitality

## Edge Cases to Test

### Mystery Tracking
- [ ] Reload page mid-rosary - visited mysteries should persist
- [ ] Click Reset button - visited mysteries should clear
- [ ] Switch mystery types - visited mysteries should maintain count

### Litany Access
- [ ] Try clicking heart before 5 mysteries - should block with sound
- [ ] Click heart after 5 mysteries - should allow entry
- [ ] Navigate out of litany - heart should still be accessible

### Closing Prayers
- [ ] Tail beads before 5 mysteries - show opening prayers
- [ ] Tail beads after 5 mysteries - show closing prayers
- [ ] Redirection should be seamless (no flicker)

## Troubleshooting

### Mystery Count Not Incrementing
- Check console for "Mystery visited" messages
- Verify you're clicking the lone beads (not regular decade beads)
- Mystery IDs start with "M" (M1go, M2go, etc.)

### Tail Beads Not Glowing
- Verify 5 mysteries have been visited (check console)
- Check localStorage for `visitedMysteries` - should have 5 entries
- Try clicking different mysteries to ensure variety

### Heart Bead Not Accessible
- Same as above - needs 5 mysteries
- Developer mode should show "LITANY" label when accessible

### Purple Flash Still Visible
- Check that `.page-right` has `background: #0d0a1a` in App.css
- Verify `transition: opacity 1.5s` is applied
- May be browser caching - hard refresh (Ctrl+Shift+R)

## Success Criteria

✅ **All features working** if:
1. Can complete full rosary from cross to final prayer
2. Mystery counter increments correctly (1/5 → 5/5)
3. Closing prayers unlock automatically after 5th mystery
4. Tail beads remap to closing prayers seamlessly
5. Litany becomes accessible via heart bead
6. Visual feedback is clear and helpful
7. No linter errors
8. No console errors (warnings are OK)
9. Background transitions are smooth
10. St. Teresa appears only on October 15

## Post-Test

### Reset for Next Session
- Click Reset button in settings, or
- Clear localStorage manually
- Closing prayers will lock again until next 5 mysteries

### Report Issues
Document any unexpected behavior:
- Which prayer index?
- What was clicked?
- Console output?
- Expected vs actual behavior?

---

**Happy Testing! 🙏📿**

*"The Rosary is the most beautiful and the most rich in graces of all prayers." - Pope Pius IX*

