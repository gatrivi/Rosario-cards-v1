# Visual Modes (planned)

The app is moving toward two devotional art directions:

## 1. Chiaroscuro (modo oscuro)

- Paintings with dramatic light and shadow — Caravaggio, de La Tour, etc.
- Used today via `imgmo` paths under `public/gallery-images/misterios/modooscuro/`.
- Best for mysteries and meditative focus on figures.

## 2. Stained glass (vitral)

- Bright cathedral glass, Latin manuscript borders, luminous colour.
- Used today in Libro mode vitral background and `latin-*` prayer art.
- Best for sequential reading and verse-by-verse prayer.

## Current behaviour

- **Libro / Booklet:** stained-glass panel over vitral image; prefers `imgmo` when theme is dark.
- **Dolorosos mysteries:** fallback chain prefers `modooscuro/misteriodolor*.webp|jpg` when light images fail.
- **Theme key:** `localStorage.theme` — anything other than `'light'` uses dark/chiaroscuro assets where available.

## TODO (later)

- [ ] Settings toggle: *Vitral* vs *Claroscuro* instead of only `theme`.
- [ ] Per-mystery set art packs (complete 5+5+5+5 sets for each mode).
- [ ] Upload / curate user vitral pack vs painting pack.
