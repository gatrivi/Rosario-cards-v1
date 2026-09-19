# Handoff 2026-09-09 — Navigation seams: BottomNav ↔ Libro ↔ Reliquario

## What was verified working (no changes needed)

- BottomNav core: Libro ↔ Rosario switch instantly; booklet mode swaps step
  prev/next + Devociones buttons in and out correctly.
- Más sheet: opens over any view, highlights the active destination
  (Reliquario included via `MAS_ACTIVE`), closes on scrim tap and on
  navigation, never navigates on close.
- Reliquario "Ganar rosas rezando el Rosario" → `/rosario`; browser
  back/forward history stays coherent (react-router push).
- Booklet step (`paso`) survives Libro → Reliquario → Rosario → Libro
  round-trips (lifted state in AppShell). Rosary keeps its own separate
  index/mystery by design (`rosario_rosary_index`).

## Bugs found and fixed

1. **Reliquario could not scroll** — `.reliquario-view` had no scroll
   container and `.app-view-layer` is `overflow: hidden` (AppFrame owns the
   viewport). On a 390×844 phone the grid was 6832px tall: cards 2–12 were
   unreachable. Fix: `height: 100%; overflow-y: auto` +
   `padding: 62px 0 calc(var(--app-above-nav) + 16px)` (ReliquarioView.css).
2. **Reliquario header under the floating dock** — the ℹ️ tutorial button sat
   exactly under Ayuda/Ajustes (header z=100 wins the tap). Fix: the new
   62px top padding drops the whole header below the dock; verified
   no-overlap in browser.
3. **Camino and Plan Diario had the same latent clip** —
   `min-height:100%; height:auto` + `overflow-y:auto` never creates a
   scroller (box grows to content, parent clips). Measured 1442px/1160px of
   unreachable content. Fix: `box-sizing: border-box; height: 100%` in
   PeregrinacionView.css and NunPlanView.css. Macetones/Jardin/Cola were
   already fine (inline `height:100%` scrollers; 40px overhang is just
   content-box padding, benign).
4. **No view transition** — `.view-enter-active` on `<main>` had no CSS
   anywhere (dead class). Added a keyed `.view-slot` wrapper in AppShell
   (`key={vistaActiva}`) with a 200ms opacity fade (AppShell.css), disabled
   under `prefers-reduced-motion`. Opacity only on purpose: transforms would
   create a containing block that breaks `position: fixed` overlays inside
   views (TutorialOverlay).
5. **Three disagreeing version sources** — AppShell hardcoded `0.3.79`,
   rosaRuntimeContract patched badges to `0.3.82` at runtime via
   MutationObserver, releaseNotes said `0.3.83` (RosarioVirtualView badge).
   On /rosario you could see v0.3.82 and v0.3.83 simultaneously. Fix:
   `export const APP_VERSION = RELEASE_NOTES.version` in releaseNotes.js;
   AppShell and rosaRuntimeContract import it. Badges, update banner,
   telemetry and SW version now all read 0.3.83.

## Known leftovers (not fixed here)

- `src/App.css` line 1: `* { transition: all 0.2s ease-in-out; }` — global
  transition on every element/state change; makes the app feel mushy and
  trips Playwright actionability checks (locator clicks time out even though
  real taps work). Removing it is a separate pass with visual regression
  review.
- TutorialOverlay ℹ️ on Camino may still sit near the dock (existing design,
  not touched).
- `reconcileVisibleAppVersion` MutationObserver is now a no-op (sources
  agree) but still runs on every DOM mutation — candidate for removal once
  confident.

## Verification

- Full jest suite: 51 suites / 259 tests pass.
- Browser (IAB, 390×844): reliquario scrolls to card 12 (scrollReach 5815),
  header clears dock, camino/plan scroll again, libro/rosary heights
  unchanged (844), full nav loop Libro → Más → Reliquario → Ganar rosas →
  Rosario → Libro with `paso` preserved, both badges v0.3.83.
- Local only, not deployed.
