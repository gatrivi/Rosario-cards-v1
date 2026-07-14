# Future Features (Rosario Cards)

Ranked by **estimated implementation difficulty** (1 = small / low risk, 5 = large / high risk).  
Update this file when priorities change. Agents: prefer Tier ≤2 unless the user asks for bigger work.

---

## Product principles (art & prayer)

- **Right image for the right verse/prayer is paramount.** Random art is not the goal.
- Many prayers repeat often (Ave María, Padre Nuestro) but have **few dedicated images**; Asset Studio exists so curation is not a Windows/VS Code chore.
- Many files still have **unintelligible names** (`96PsRGiE`, hashes, etc.) — rename/tag in Estudio de imágenes (`/assets`).
- **Later:** start with **very little art** and **unlock more as you pray** (progression of beauty, not a slot machine).
- **Batch assist (planned):** user is building a **Baidu OCR API** in another project. When online, use it to batch-examine hundreds of images (text-in-image, labels) so classification is not fully manual. Do **not** start OCR integration until that API is available.

**Current tools:** Ajustes → Estudio de imágenes — Registro / Clasificar / Asignar versos; Firebase `shared/artConfig` + `shared/imageLibrary` when rules are published.

---

## Difficulty legend

| Rank | Meaning |
|------|---------|
| **1** | Data/copy or thin UI; low break risk |
| **2** | Few files, clear hooks, existing patterns |
| **3** | Cross-cutting state or new subsystem, bounded |
| **4** | Large UX + physics/audio/state; dedicated session |
| **5** | Multi-system / long project |

---

## Ranked backlog

### Rank 1 — Easy

| Feature | Notes |
|---------|--------|
| Per-station dedicated images (Vía Crucis/Lucis) | Assign in Estudio; drop files into library |
| Promote Próximas devoutions | See [historic-devotions.md](../libro/historic-devotions.md) — flip `soon`→`have` |
| Confirm before delete voice take | One dialog in `PrayerRecorder` / RecordingStudio |
| Tighten Firestore/Storage rules | Human in Firebase console; not code-heavy |
| Release notes / Novedades bullets | `src/data/releaseNotes.js` on each version bump |

### Rank 2 — Moderate

| Feature | Notes |
|---------|--------|
| **Art unlock progression** | Start sparse; unlock images/tags as Ave Marías / rosarios complete. Needs unlock table + filter in `pickPrayerImage` / verse resolvers. **No random rotation as default.** |
| LitanyDisplay unused `onNextVerse` / `onPrevVerse` | Wire or remove props |
| Image 404 cleanup (legacy `.xcf` / `.jng`) | Sweep paths; low urgency |
| Baidu OCR **client** (when API is live) | Batch suggest names/tags from image text; human confirms in Clasificar |

### Rank 3 — Substantial

| Feature | Notes |
|---------|--------|
| **Rust / patina reveal on paintings** | Praying gradually clears “rust” (desaturation, noise, dark overlay) to reveal full beauty. Shader or CSS/canvas layers driven by prayer progress per image or per mystery. Ties to unlock progression. |
| Social / pilgrimage encounters | See other users on Camino (async); needs backend identity |
| Monastic audio (convolution reverb, idle decay) | Audio graph + progress regression rules |

### Rank 4 — Hard

| Feature | Notes |
|---------|--------|
| **Craft workshop — manufacture your own rosary** | User builds bead topology, materials, colors; validate graph; load into physics rosary. Related to deferred `rosary_blueprint.json` builder. Touches Matter.js + data model. |
| RoseView extraction (928 lines) | Split drawing / cosmic / text before extending |
| Physical verse pagination (“pergamino physics”) | Scroll/drag verses with focus rules |

### Rank 5 — Epic / defer

| Feature | Notes |
|---------|--------|
| Full multiplayer pilgrimage leadership | Mentors, parties, live presence |
| Replace jsonblob entirely with Firebase for all stats + auth | Migration + security model |

---

## Named visions (detail)

### 1) Craft workshop (own rosary) — **Rank 4**

User manufactures a personal rosary: bead types, counts, medal, materials. Workshop UI validates a constraint graph, then feeds `InteractiveRosary` / physics maps. Do **not** start until physics rosary is stable and blueprint format is agreed.

### 2) Rust clearing / concealed beauty — **Rank 3**

Paintings begin aged (rust, soot, low contrast). Prayer progress clears the veil—pixel or layer reveal—so devotion literally restores beauty. Complements **art unlock** (Rank 2): unlock *which* art exists; rust controls *how fully* it is seen.

### 3) Art unlock by prayer — **Rank 2**

- Early journey: few images, high intentionality (fixed verse→image assignments).
- As user prays: unlock more registry entries / library uploads for that prayer or mystery.
- Explicitly **avoid** “random image every time” as the primary experience.

### 4) Baidu OCR batch assist — **Rank 2** (blocked on external API)

When the user’s OCR API is online: batch-scan gallery/uploads, propose filenames and liturgical tags, write suggestions into Asset Studio for human approval. Goal: avoid hand-labeling hundreds of images alone.

---

## Older ideas (kept)

### Social gamification on the pilgrimage — Rank 3–5

- Walk while praying; avatar advances on Camino.
- Async encounters; mentors assemble new users.

### Physical verse pagination — Rank 4

- Pergamino physics; multi-pass focus on mobile lines.

### Monastic audio refinement — Rank 3

- Convolution reverb; idle progress decay.

### Rosary craft / builder (blueprint) — Rank 4

- Bead-by-bead topology debugger using `rosary_blueprint.json` (same family as craft workshop).

---

## Explicitly not now

- Random art as default UX.
- Full OCR pipeline before Baidu API is ready.
- RoseView mega-refactor or App routing rewrite without a dedicated session.
