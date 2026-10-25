# Prayer images — uniqueness & light/dark

## Liber primary uniqueness (v0.3.74)

Distinct **faces within each devotion family** (Ángelus steps, Magníficat steps, breves, SCA steps, each Vía, base rezos) must not share the same primary vitral BG.

Carmen / breves must not reuse Ángelus–Magníficat primaries.

**Not yet global** across all Liber ids (Vía vs misterios still may share gallery art until the light/dark revamp adds more pairings).

Dump: `npm test -- --testPathPattern=dumpPrayerImageUsage` → `scripts/prayer-image-usage.json`.

## Dark / light (`imgmo` / `imglight`) — deferred

Historically: light plate + `imgmo` dark. Liber currently prefers dark (`PREFER_MODOOSCURO` in `prayerImages.js`). Base rosary entries keep `imglight` for a future dual-mode revamp — do not delete light paths; do not spend tokens re-pairing until that UX ships.

## Active Catalog & Anti-Repetition Rotation (v0.3.89)

- Canonical Documentation: [`.docs/handoff-2026-10-25-image-catalog-and-slug-renaming.md`](../handoff-2026-10-25-image-catalog-and-slug-renaming.md)
- **Library Depth:** 296 catalog images (`src/data/imageLibraryCatalog.json`) compiled from `scripts/build-image-pools.js`:
  - **Mary Pool (`ave/`):** 233 images (+7,666% expansion over the original 3 static images).
  - **Passion Pool (`passion/`):** 63 images (+1,160% expansion over the original 5 static images).
  - Total active art across app: ~366 unique images (+1,120% total growth).
- **In-Session Repetition Invariants:**
  - **Ave María (`A`):** 53 repetitions per 5-decade Rosary resolve to **53 unique images (0% repeats)** via `occurrenceIndexAt`.
  - **Divine Mercy (`MP`):** 50 repetitions resolve to **49 unique images (2% repeats)**.
  - **Letanía Lauretana:** 60 verses resolve to **60 unique vitrales (0% repeats)**.
  - **Fallback Exclusion:** `FALLBACK_IMAGE` is excluded from candidate spans; it only displays on asset loading error.
- **Naming & NFC Rules:**
  - All images on disk and in code must use descriptive Spanish/Latin devotional titles (slugs and hashes are prohibited).
  - Every path on disk and in JSON manifests must be encoded in **NFC** to prevent production deployment 404s.
