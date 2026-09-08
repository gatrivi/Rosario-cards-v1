# Next session: return to prayer audio

## Latest user direction (supersedes layout acceptance)

The user tried the layout and says it looks largely the same. Structural cleanup
is useful, but did NOT satisfy the main goal: enough space to actually read prayer.

Deferred layout requirements:
- Top chrome must occupy only ONE or TWO rows total, including view controls.
- KEEP the prayer intention globes.
- Bottom navigation must remain ONE row; consider making it hideable.
- Prioritize the prayer's readable area over visible controls.
- Do not treat passing layout tests as user acceptance of the design.

STOP layout work for now. Preserve the existing local changes. The user asked to
document, start with fresh context, and return to AUDIO EFFECTS.

## Active topic: immersive prayer sound

Original intent: sound builds with use; deeper/continued prayer brings richer,
theme-related sound. Richness should support immersion without becoming intrusive.

Read .docs/handoff-2026-09-05-sound.md for implementation and verification details.
Current implementation is Rosa-only, in:
- src/audio/prayerSoundscape.js
- src/hooks/usePrayerSoundscape.js
- src/components/Views/RoseView.jsx

Quiet root -> fifth -> modal harmony -> upper shimmer over active prayer time.
Four mystery palettes plus Patrick. Pauses fade; mute includes bells. Accumulation
lasts while Rosa stays mounted; it is not persisted across view changes. This is
the current implementation, not a confirmed user preference about persistence.

Next audio work: review/listen to this baseline and tune audible progression,
texture and thematic character around user feedback. Real phone listening quality
and immersion have NOT been accepted merely because Web Audio tests passed.
No new audio requirements or broader view integration were agreed in the layout detour.

## Minimal carry-forward context

- Screenshot: Screenshot_20260905_085223.jpg in project root; preserve it.
- Layout structure: .docs/architecture/app-layout.md. AppFrame owns measured
  header/footer clearances; AppOverlay hosts Libro dialogs above navigation.
- Preserve Rosa gesture/resume/counting contracts: .docs/handoff-2026-09-04-rosa.md.
- Existing unrelated WIP is extensive. Do not reset or stage everything.
- Changes remain local, not committed/pushed/deployed; badge still v0.3.82.
- Preview used port 6660; verify it is running before sharing it.
- No sub-agents unless explicitly requested. Keep communication laconic.
