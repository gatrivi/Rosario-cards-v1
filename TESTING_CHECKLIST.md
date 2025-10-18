# Testing Checklist - Enhanced Bead Navigation UX

## ✅ Implemented Features to Test

### 1. Multi-Press Chain Prayer Navigation
**How to test:**
- Navigate to the 10th Hail Mary of any decade
- **Press the bead once** → Should show 10th Hail Mary text
- **Press same bead again** → Should show Gloria, hear soft chime ✨
- **Press same bead again** → Should show Fatima, hear soft chime ✨
- **Press same bead again** → Should hear "move to next bead" chime 🔔, next bead blinks silver
- Press the blinking bead to continue

**Expected behavior:**
- Each press advances through: Hail Mary → Gloria → Fatima → Next bead ready
- Different chime sounds for chain prayers vs "move on"
- Next bead pulses/blinks to guide you

### 2. Mystery Bead Chain Prayers
**How to test:**
- Press any mystery bead (lone beads in the loop)
- **Press once** → Shows mystery meditation
- **Press again** → Shows Our Father, hear chime
- Next bead should blink

**Expected behavior:**
- Mystery → Our Father → Next bead blinks
- Chime indicates transition

### 3. Visual Feedback
**How to test:**
- When on a bead with chain prayers, look for:
  - **Rotating dashed ring** around the active bead (indicates "press again")
  - **Silver glow** on connected chains
  - **Pulsing animation** to draw attention

**Expected behavior:**
- Concentric animated outline on beads with chain prayers
- Smooth, non-distracting animations
- Mystery-specific colors (gold for highlights)

### 4. Bidirectional Analog Controller
**How to test:**
- Pick up any bead (hold/drag it)
- **Drag to TOP 45% of screen** → Text should scroll UP ⬆️
- **Hold in middle (45-55%)** → Text stays still (neutral zone)
- **Drag to BOTTOM 45%** → Text scrolls DOWN ⬇️
- **Release bead** → Scroll position persists (doesn't reset to top)

**Expected behavior:**
- Smooth scrolling in both directions
- Scroll amount proportional to bead position
- Scroll position maintained after release
- Subtle sound effect when scrolling

### 5. Heart Bead Litany Navigation
**How to test:**
- Navigate to the Litany of Loreto prayer (LL)
- Look at the heart bead (center medal):
  - Should have **pulsing gold outline** ✨
  - Shows "PRESS" in developer mode
- **Press heart bead repeatedly** → Advances through litany verses
- Hear soft chime on each press

**Expected behavior:**
- Heart bead pulses to indicate it's interactive
- Each press advances one verse
- At end of litany, advances to next prayer
- Heart bead only interactive during litany (decorative otherwise)

### 6. Bead Progress Tracking
**How to test:**
- Look at top progress bar (if enabled)
- Should show: **"Beads: X/60 (Y%)"**
- Press different beads and watch count increase
- Progress bar fills as you go

**Expected behavior:**
- Counts unique beads pressed (not chain prayers)
- Shows 0-60 bead count
- Progress bar fills progressively
- Uses mystery-specific colors
- Also shows long-term tier progress below

### 7. Sound System
**How to test:**
- Enable sounds (if muted)
- Listen for distinct sounds:
  - **Chain prayer chime**: High, soft bell (Gloria/Fatima)
  - **Move-to-next-bead chime**: Lower, descending tone (ready to advance)
  - **Litany chime**: Soft progression sound
  - **Regular navigation**: Standard prayer change sound

**Expected behavior:**
- Mystery-specific sound frequencies
- Different chime for each action type
- Soft, non-intrusive volume
- Sounds provide feedback without being annoying

## 🐛 Known Issues to Watch For

1. **Rosary physics**: Should sit calmly, no vibrating/oscillating
2. **Touch sensitivity**: Should register presses without requiring multiple attempts
3. **Scroll persistence**: Bead drag scrolling should feel natural
4. **Chain prayer counting**: Progress bar shouldn't count chain prayers twice

## 🎮 Developer Mode Features

To enable developer mode:
- Open Settings → Toggle "Developer Mode"

**Additional features shown:**
- Prayer index numbers on beads
- Chain length measurements
- Constraint visualization
- "PRESS" text on heart bead during litany
- Touch count debug logs in console

## 📱 Mobile-Specific Tests

- Touch sensitivity with fingers (not just mouse)
- Bead drag scrolling with touch
- Multi-touch doesn't interfere with navigation
- Heart bead press works on mobile

## 🔧 If Something Doesn't Work

**Chain prayers not advancing?**
- Make sure you're pressing the SAME bead multiple times
- Wait 500ms between presses (not too fast)
- Check console for debug logs

**Scrolling not working?**
- Hold and drag the bead (don't just press)
- Move to top 45% or bottom 45% (not middle)
- Check that rosary is visible (not hidden)

**Progress bar not updating?**
- Make sure progress bar is enabled in settings
- Press actual beads (not empty space)
- Chain prayers don't count toward bead total

**Heart bead not responding?**
- Only works during Litany of Loreto prayer
- Look for pulsing gold outline
- Try enabling developer mode to see "PRESS" indicator

## ✨ Success Criteria

All features working if:
- ✅ Can navigate entire rosary by pressing beads sequentially
- ✅ Chain prayers accessible by re-pressing same bead
- ✅ Sounds provide clear feedback for each action
- ✅ Visual indicators guide user to next action
- ✅ Scroll works in both directions via bead drag
- ✅ Heart bead advances litany verses
- ✅ Progress bar fills as beads are pressed (0-60)
- ✅ Rosary sits calmly (no vibrating)

---

**Happy testing! 🙏**

*If you find any issues, check the console (F12) for debug logs.*

