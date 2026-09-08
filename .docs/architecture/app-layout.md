# App layout ownership - 2026-09-05

Local refactor; not deployed. Screenshot reference: Screenshot_20260905_085223.jpg.

> User review: still looks largely the same; readable prayer space remains insufficient.
> Deferred target: top 1-2 rows WITH prayer globes; bottom one row, potentially hideable.
> Layout work paused. See [next-session handoff](../handoff-2026-09-05-next-session.md).

## Structure

AppShell owns routing, settings and feature state. AppFrame owns viewport layout:

    AppFrame (.app-shell)
      header (.app-shell__header): global actions
      aside (.app-shell__notice): optional update notice
      main (#app-main): active view / ViewErrorBoundary
      utilities: floating accessibility controls and version badge
      navigation: BottomNav
      overlays (#app-overlays): global dialogs and AppOverlay portals

Utilities/navigation slots use display: contents to group JSX without creating
new containing blocks. The overlay host has its own layer above app controls;
its empty area does not intercept taps. AppOverlay moves view-owned dialogs
into this host (body fallback for standalone views/tests).

## Rules for changes

- Keep full-bleed artwork inside the active view. Reserve readable content using
  --app-header-height and --app-above-nav, measured by AppFrame from actual header
  and navigation dimensions (ResizeObserver plus resize fallback).
- Never add another guessed header/footer offset to a migrated view. CSS provides
  initial fallbacks; ResizeObserver handles safe-area/size/font changes without
  rerendering or resetting the prayer subtree.
- Put global actions in the header slot, navigation in the navigation slot,
  temporary global notices in notice, dialogs in overlays/AppOverlay.
- Main content stays at z-index 10; header 100; notice 200; overlay host 2000.
  Existing utility z-indices are retained. View layers cannot compete with dialogs.
- Libro: backdrop -> prayer chrome -> header (mysteries, auxiliary actions,
  reading/voice group) -> scrollable prayer article. Title, count and language
  have defined grid positions. The base count stays on one line; detail may wrap.
- Narrow/short screens may scroll the prayer chrome; never collapse its article
  to zero height. Keep the navigation visible and outside that scroller.
- Rosa local controls consume the header clearance; keep gesture handling separate
  from shell controls. No counting, resume, synthesis or physics changes here.

## Scope and verification

Migrated: shared shell, Libro toolbar/content spacing, Rosa control offset;
Libro optional prayer, outline and share-preview dialogs use AppOverlay.
Other view internals/legacy inline styles are not comprehensively migrated.

28 unique focused tests passed: AppFrame (2), Libro (17), Rosa (9).
Browser checked 320x568, 360x660, 800x360, 1280x800: no document horizontal overflow,
visible navigation, header clearance, single-line base count and usable short-screen
scrolling. Larger-text/left-handed/one-hand mode checked at 360x660.
Optional dialog is outside main and intercepts bottom taps; Settings opens/closes.
Rosa sound target is below header and is the actual pointer hit target.
No reported browser runtime errors. Targeted ESLint passed. Not a full app audit.
