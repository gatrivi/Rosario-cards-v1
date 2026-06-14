# Visual Modes (Chiaroscuro vs Stained Glass)

The app is moving toward two devotional art directions:

## 1) Chiaroscuro (`modooscuro`)
- Dramatic light/shadow paintings (e.g., Caravaggio/de La Tour).
- Today: used via `imgmo` paths under `public/gallery-images/misterios/modooscuro/`.
- Best fit: mysteries + meditative focus on figures.

## 2) Stained glass / Vitral (`vitral`, `latin-*`)
- Bright cathedral glass look + Latin manuscript borders.
- Today: used in Libro mode via vitral background and `latin-*` prayer art.
- Best fit: sequential verse-by-verse prayer.

## Current behavior (theme fallback)
- `localStorage.theme` controls asset choice.
- If theme is anything other than `'light'`, dark/chiaroscuro assets are preferred when available.
- Libro / Booklet: stained-glass panel over vitral image; prefers `imgmo` when theme is dark.
- Dolorosos: fallback chain prefers `modooscuro/misteriodolor*.webp|jpg` when light images fail.

## TODO (later)
- Settings toggle: “Vitral vs Claroscuro” instead of only `theme`.
- Per-mystery art packs: complete sets for each mode.
- User-upload/curation of vitral pack vs painting pack.

