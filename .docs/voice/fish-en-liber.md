# Fish EN Liber pack (Rosario Cards)

**Started 2026-08-08.** Completes `public/voice/en/` with Fish (EN lock), matching Liber ids.

## What “Fish has rosary EN” meant

CatTS already had the **rosary-only** Fish EN pack:

| Path | Contents |
|------|----------|
| `E:\zengatrivi-drive-e\catts\static\fish\rosary\en\` | 29 wavs: `am of gb f sc c ac s dec m1–m20` |
| Mirror | `E:\Audiobooks\Rosary_Fish\en` |

That is **not** the same as Rosario Cards Liber paths (`/voice/en/A.wav`, `MG1.wav`, …). Until this bake, `public/voice/en/` was empty (only `.gitkeep`).

**2026-08-08 shipped:** `public/voice/en/` synced from `catts/static/fish/devotions/en` (**117** Liber-id wavs). Resolver is **same-lang only** (no EN→ES Fish). Liber ▶ is Fish-only for the selected pack.

## Mapping (seeded, no re-synth)

| Fish rosary | Liber EN |
|-------------|----------|
| am of gb f sc c ac s | A P G F SC C AC S |
| m1–m5 | MG1–MG5 |
| m6–m10 | MD1–MD5 |
| m11–m15 | MGl1–MGl5 |
| m16–m20 | ML1–ML5 |

## Voice (binding)

| | |
|--|--|
| **Lang** | **EN only** — texts from `enLiberFishTexts.js` / `enGuideText.js` |
| **Lock** | `catts/data/voices/fish_default_lock/lock.wav` |
| **Lock text** | `In the desert of Scete, the abbot Moses spoke of the end of the monk.` |
| **Seed** | `42` |
| **Not** | ES Voz 4 / `fish_es_lock` (that is Spanish Liber only) |

2026-08-08: first bake attempt wrongly used Spanish Liber body text — aborted. Re-dump EN-only; refuse Spanish markers in bake.

Skipped without EN text yet (~41): mostly Vía Crucis / Vía Lucis / Sagrado Corazón SCA_*.
