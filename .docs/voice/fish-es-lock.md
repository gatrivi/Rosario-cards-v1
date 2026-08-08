# Fish ES voice lock (Rosario Cards)

**Picked 2026-08-07 — Voz 4 only. Do not re-audition Fausto/Gaston/no-ref.**

| Field | Value |
|-------|--------|
| Id | `v4` (fes.html “Voz 4”) |
| Seed | `77` |
| Sample | `E:\zengatrivi-drive-e\catts\static\fish\es\v4.wav` |
| Lock copy | `E:\zengatrivi-drive-e\catts\data\voices\fish_es_lock\lock.wav` |
| Meta | `…\fish_es_lock\lock.json` |
| Ref text | Padre nuestro que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. |

## Rules

1. Every Fish ES synth call must pass **this** `ref_audio` + **seed 77** (+ same ref text).
2. Never call Fish with empty `references` (new speaker each request).
3. Never use CatTS clone voices Fausto / Gaston for this pack.
4. Bake script: `catts/scripts/bake_rosary_fish.py` → `ES_LOCK` / `ES_SEED=77`.
5. App dest: `public/voice/es/` then `node scripts/genBundledVoiceMap.js`.

## App pack status

**2026-08-08:** Liber ES Fish Voz 4 complete (`public/voice/es` ~155 wavs; dump = 0 missing). Bake: `python scripts/bake_fish_es_missing.py`.
