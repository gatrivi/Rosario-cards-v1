# Product Overview

Rosario Cards is an interactive devotional app that guides the Rosary through:
- Generative, procedural visuals
- Tactile/interactive meditation flow
- Layered navigation across “views” (commitment, history/path, daily/roses, hour/rosary physics, moment/verse focus)

## Design philosophy: Visual First
- The interface minimizes explanatory text.
- The primary narrative is carried by tactile interactions, animations, and map progression.
- Instructional text appears in popovers/modals; the main “dominant text” is the actual sacred verses.

## Core user-facing features (condensed)
- **Libro** (`/libro`): vitral booklet — classic rosary mysteries, Faustina, Vía Crucis/Lucis, letanías, per-verse art.
- **Rosario** (`/rosario`): Matter.js physics rosary + prayer layer; voice autoplay when recordings exist.
- **Rosa** (`/rosa`): hold-to-charge / Jardín — procedural roses; each Ave María contributes a visual fingerprint.
- **Plan** (`/plan`): daily commitment (macetones objective).
- **Camino** (`/camino`): pilgrimage map from accumulated progress.
- **Voz** (`/voz`): record and replay prayer takes.
- **Estudio de imágenes** (`/assets`, via Ajustes): rename, classify, assign verses; sync via jsonblob ± Firebase.

Details: [current-stack-jun-2026.md](../architecture/current-stack-jun-2026.md)

## Development direction called out in repo docs
- Review/iterate multiyear variability and physical “parchment” verse mechanics (drag/scroll interaction).

