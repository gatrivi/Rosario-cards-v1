# Prayer images — uniqueness & light/dark

## Liber primary uniqueness (v0.3.74)

Distinct **faces within each devotion family** (Ángelus steps, Magníficat steps, breves, SCA steps, each Vía, base rezos) must not share the same primary vitral BG.

Carmen / breves must not reuse Ángelus–Magníficat primaries.

**Not yet global** across all Liber ids (Vía vs misterios still may share gallery art until the light/dark revamp adds more pairings).

Dump: `npm test -- --testPathPattern=dumpPrayerImageUsage` → `scripts/prayer-image-usage.json`.

## Dark / light (`imgmo` / `imglight`) — deferred

Historically: light plate + `imgmo` dark. Liber currently prefers dark (`PREFER_MODOOSCURO` in `prayerImages.js`). Base rosary entries keep `imglight` for a future dual-mode revamp — do not delete light paths; do not spend tokens re-pairing until that UX ships.
