# Libro voice autoplay (EN TTS)

**v0.3.66+** · Control: Liber **thumb FAB** ▶ above bottom nav (not the title row — unreachable on tall phones).

## Modes

| Tap | Mode | Icon | Behavior |
|-----|------|------|----------|
| 1st | `once` | ▶ / ⏸ | Play current step only (speakable text / Tier S / T3) |
| 2nd | `auto` | ≫ | On end → `goNext` (litany/verse-aware) until devotion end |
| 3rd | `off` | ▶ | Stop TTS/audio |

After `once` ends → `off`; tap again = play current again.

FAB sits bottom-right (bottom-left if left-handed), clear of the handedness toggle. Title row keeps 🎙️ only.

Voice does **not** depend on Ajustes → Efectos de Sonido (chimes only).

**Rosary auto (four vias):** with ≫ on a classic mystery, finishing one via advances to the next (`gozosos → dolorosos → gloriosos → luminosos`) and keeps playing until all four complete (stops when the next via would be the one where auto started). Manual mystery pill change still resets to off.

TTS/`synthesis-failed` / no voices still counts as step end so auto does not stall.

## Voice priority

1. Tier S (user mic, IndexedDB) if enabled  
2. Tier 3 EN WAV (`bundledVoiceMap` / `/voice/en/`) if enabled  
3. Browser `speechSynthesis` **en-US** of `getSpeakablePrayerText` / litany line (never UI titles)

## Wiring

| Concern | Path |
|---------|------|
| Playback + FSM | `src/utils/prayerVoicePlayback.js` |
| Next via helper | `getNextRosaryMystery` in `bookletSequence.js` |
| Prefs (rate, lang, sources) | `src/utils/voicePrefs.js` — UI on `/voz` |
| Libro owner + FAB | `BookletView.jsx` / `.booklet-voice-fab` |
| Mic chrome | `PrayerRecorder.jsx` title 🎙️ |
| Rosary view | always-on autoplay **disabled** until same control |

## Settings

- **Ajustes:** Tier S / T3 toggles + Liber ▶ hint  
- **Estudio `/voz`:** browser TTS on/off, rate slider, legend  

No ES Piper packs (removed v0.3.58).
