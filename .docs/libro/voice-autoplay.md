# Libro voice autoplay (EN TTS)

**v0.3.60+** · Control: Liber title ▶ beside prayer name (`PrayerRecorder` `placement="title"`).

## Modes

| Tap | Mode | Icon | Behavior |
|-----|------|------|----------|
| 1st | `once` | ▶ / ⏸ | Play current step only (speakable text / Tier S / T3) |
| 2nd | `auto` | ≫ | On end → `goNext` (litany/verse-aware) until devotion end |
| 3rd | `off` | ▶ | Stop TTS/audio |

After `once` ends → `off`; tap again = play current again.

## Voice priority

1. Tier S (user mic, IndexedDB) if enabled  
2. Tier 3 EN WAV (`bundledVoiceMap` / `/voice/en/`) if enabled  
3. Browser `speechSynthesis` **en-US** of `getSpeakablePrayerText` / litany line (never UI titles)

## Wiring

| Concern | Path |
|---------|------|
| Playback + FSM | `src/utils/prayerVoicePlayback.js` |
| Prefs (rate, lang, sources) | `src/utils/voicePrefs.js` — UI on `/voz` |
| Libro owner | `BookletView.jsx` (`voiceMode` lifted) |
| Control chrome | `PrayerRecorder.jsx` |
| Rosary view | always-on autoplay **disabled** until same control |

## Settings

- **Ajustes:** Tier S / T3 toggles + one-line Liber ▶ hint  
- **Estudio `/voz`:** browser TTS on/off, rate slider, legend  

No ES Piper packs (removed v0.3.58).
