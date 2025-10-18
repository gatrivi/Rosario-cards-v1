# Chain Prayer Navigation - Test Guide

## What Was Fixed

The chain prayer detection was too narrow - it only checked for Gloria+Fatima (G+F) and Our Father (P) patterns, but missed many other chain prayers like AC (Apostles' Creed) and C (Credo) at the beginning.

**New logic**: Now detects ALL chain prayers by looking ahead in the sequence until hitting the next bead prayer.

**Chain prayers** (said "on the chain"): AC, C, G, F
**Bead prayers** (have physical beads): SC, P, A, M*, LL, S, Papa

## Test Sequence: Cross to First Our Father

Open browser console (F12) to see debug logs.

### Test 1: Cross (Start of Rosary)

**Expected Sequence**:
```
Index 0: SC (Sign of Cross) - on Cross bead
Index 1: AC (Apostles' Creed) - on chain
Index 2: C (Credo) - on chain
Index 3: P (Our Father) - on first tail bead
```

**Steps**:
1. **Tap Cross (Bead #0)**
   - Should show: Sign of Cross prayer
   - Console should show: `Found 2 chain prayers at indices [1, 2]`
   - Should set chain bead highlight

2. **Tap Cross again (2nd tap)**
   - Should show: Apostles' Creed (AC)
   - Console should show: `Navigating to chain prayer 1/2: AC (index 1)`

3. **Tap Cross again (3rd tap)**
   - Should show: Credo (C)
   - Console should show: `Navigating to chain prayer 2/2: C (index 2)`

4. **After 3rd tap**
   - Should play completion chime
   - Next bead (first tail bead) should blink silver
   - Console should show: `Last chain prayer - ready to move to next bead`

5. **Tap first tail bead (Bead #1)**
   - Should show: Our Father (P)
   - Prayer index 3

### Test 2: Last Hail Mary of First Decade

**Expected Sequence** (after 10 Hail Marys):
```
Index 20: A (10th Hail Mary) - on bead
Index 21: G (Gloria) - on chain
Index 22: F (Fatima) - on chain
Index 23: MGo2 (2nd Mystery) - on bead
```

**Steps**:
1. Navigate to the 10th Hail Mary of the first decade
   - Bead should be around #17 in the main loop
   - Prayer index 20

2. **Tap bead**
   - Should show: Hail Mary
   - Console should show: `Found 2 chain prayers at indices [21, 22]`

3. **Tap again (2nd tap)**
   - Should show: Gloria (G)
   - Console: `Navigating to chain prayer 1/2: G (index 21)`

4. **Tap again (3rd tap)**
   - Should show: Fatima (F)
   - Console: `Navigating to chain prayer 2/2: F (index 22)`

5. **After 3rd tap**
   - Completion chime plays
   - Next bead (Mystery 2) should blink

### Test 3: Mystery to Our Father

**Expected Sequence**:
```
Index 23: MGo2 (2nd Mystery) - on lone bead
Index 24: P (Our Father) - on chain
Index 25: A (1st Hail Mary) - on bead
```

**Steps**:
1. Tap the 2nd Mystery bead (lone bead after first decade)
   - Console should show: `Found 1 chain prayers at indices [24]`

2. **Tap again (2nd tap)**
   - Should show: Our Father (P)
   - Console: `Navigating to chain prayer 1/1: P (index 24)`

3. **After 2nd tap**
   - Completion chime plays
   - Next bead (first Hail Mary of 2nd decade) should blink

## Debug Console Output to Look For

### On First Tap:
```
🎯 Bead touched: #0, Touch 1, Index 0, Prayer SC
🎯 First touch - navigating to prayer
🔍 Chain prayer check for index 0 (SC): Found 2 chain prayers at indices 1,2
⛓️ Bead has chain prayers at indices: [1, 2]
```

### On Second Tap:
```
🎯 Bead touched: #0, Touch 2, Index 0, Prayer SC
🔄 Touch 2 on bead #0 (index 0, SC)
   Chain prayers available: [1, 2]
   Calculating: newCount 2 - 2 = chainIndex 0
   Chain prayers array length: 2
⛓️ Navigating to chain prayer 1/2: AC (index 1)
```

### On Third Tap:
```
🎯 Bead touched: #0, Touch 3, Index 0, Prayer SC
🔄 Touch 3 on bead #0 (index 0, SC)
   Chain prayers available: [1, 2]
   Calculating: newCount 3 - 2 = chainIndex 1
   Chain prayers array length: 2
⛓️ Navigating to chain prayer 2/2: C (index 2)
✅ Last chain prayer - ready to move to next bead
```

## Common Issues to Check

1. **No chain prayers detected**: 
   - Check console for "None found" message
   - Verify rosary sequence is loading correctly
   - Check that `getRosarySequence()` returns proper array

2. **Chain prayers not advancing**:
   - Check if touch count is resetting (should stay active)
   - Verify `chainBeadHighlight` is set
   - Check for errors in `onBeadClickRef.current()` call

3. **Wrong prayers showing**:
   - Verify prayer indices in console match expected sequence
   - Check rosary sequence array structure

4. **Touch count not resetting after chains**:
   - After last chain prayer, should see "ready to move to next bead"
   - Touch count should reset to 0
   - Next bead should blink

## Success Criteria

✅ Cross requires 3 taps: SC → AC → C → (next bead blinks)
✅ Last Hail Mary requires 3 taps: A → G → F → (next bead blinks)
✅ Mystery requires 2 taps: M* → P → (next bead blinks)
✅ Console shows correct chain prayer detection
✅ Completion chime plays after last chain prayer
✅ Next bead blinks silver after chains complete
✅ "Press same bead" cyan indicator appears when entering chains

## Scroll-Based Chain Entry (New Feature)

### What Was Added

When users tap a bead repeatedly to scroll through long prayer text and reach the end with chain prayers ahead, the system now provides clear visual guidance for entering chain navigation.

### Test Sequence: Scroll-Triggered Chain Entry

**Scenario**: Any prayer - even short ones like Sign of Cross

**Steps**:
1. **Tap Cross (Bead #0)**
   - Shows: Sign of Cross prayer ("En el nombre del Padre...")
   - Console: `🔍 Chain prayer check... Found 2 chain prayers at indices [1, 2] - waiting for scroll to end`

2. **Tap Cross again (2nd tap)**
   - If text fits on screen: No scrolling happens, but beadRepeatTouch is still dispatched
   - If text is scrollable: Text scrolls down by half viewport
   - Console: `📜 Dispatching beadRepeatTouch for text scrolling (touch 2)`

3. **Automatically when scroll reaches bottom (or text is not scrollable)**:
   - ViewPrayers detects scroll at bottom OR no scrolling needed
   - Checks for chain prayers ahead (AC, C found)
   - Dispatches enterChainPrayers event
   - Console: `⛓️ Content exhausted, found 2 chain prayers: ['AC', 'C']`

4. **Visual indicators appear immediately**:
   - ✨ Enter chain prayer chime plays (history-modulated)
   - 🔵 Current bead (Cross) shows cyan "press same bead" pulsing ring
   - ⭐ Invisible bead in chain shows golden pulsing glow with "TAP" text
   - Console: `✨ Found invisible bead in chain section at prayer index 1`

5. **User can now choose either option**:
   - **Option A**: Tap the current bead (Cross) again to enter chain mode
   - **Option B**: Tap the highlighted invisible bead in the chain (NEW - more intuitive)

6. **After tapping invisible bead (1st time)**:
   - Cyan indicator clears immediately
   - Shows first chain prayer (AC - Apostles' Creed)
   - Console: `⛓️ Navigating to chain prayer 1/2: AC (index 1)`
   - Console: `⛓️ Bead has chain prayers at indices: [2]`

7. **Tap invisible bead again (2nd time)**:
   - Shows second chain prayer (C - Credo)  
   - Console: `⛓️ Navigating to chain prayer 1/1: C (index 2)`

8. **After last chain prayer**:
   - Completion chime plays
   - Next bead (Our Father) blinks silver
   - Touch count resets

### Expected Console Output

When scroll reaches bottom with chains ahead:
```
⛓️ Content exhausted, found 2 chain prayers: ['AC', 'C']
⛓️ Enter chain prayers at bead 0, indices: [1, 2]
✨ Found invisible bead in chain section at prayer index 1
```

When invisible bead is tapped:
```
🎯 Bead touched: #null, Touch 1, Index 1, Prayer AC
✨ Invisible bead tapped - clearing chain entry indicators
🎯 First touch - navigating to prayer
⛓️ Bead has chain prayers at indices: [2]
```

### Visual Indicators

1. **Current Bead (where scroll ended)**:
   - Cyan pulsing ring (45-55% opacity)
   - Larger radius (8-12px outside bead)
   - Duration: 5 seconds or until interacted

2. **Invisible Chain Bead**:
   - Golden translucent circle (30% opacity)
   - Golden pulsing glow (60-100% opacity)
   - "TAP" text in gold (100% opacity)
   - Size: slightly smaller than regular beads
   - Duration: 5 seconds or until tapped

3. **Developer Mode**:
   - Invisible beads always show as magenta ghosts
   - Highlighted invisible beads show golden instead
   - Prayer indices visible on all invisible beads

### Success Criteria (Scroll Entry)

✅ Scrolling to bottom with chains ahead triggers visual indicators
✅ Enter chain prayer chime plays on scroll end
✅ Invisible bead highlights in golden with "TAP" text
✅ Current bead shows cyan "press same bead" indicator
✅ Tapping invisible bead clears all indicators
✅ Tapping invisible bead starts chain navigation
✅ Chain navigation proceeds normally after invisible bead tap
✅ All indicators auto-clear after 5 seconds if not interacted

