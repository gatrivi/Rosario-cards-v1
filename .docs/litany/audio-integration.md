# Litany Audio Integration (Sound Engine Handoff)

For a **standalone sound engine** in another repo that will later hook into Rosario Cards.

## Current state in this app

- **No per-verse litany audio**
- Generic chimes: `soundEffects.playChainPrayerChime()`, `playBeadCollision()` (heart locked)
- RoseView: single C3 drone for LL step (`PRAYER_FREQ['LL'] = 130.81`)

## What the engine should own

1. **Leader voice** — `invocation` (+ optional Latin)
2. **Congregation voice** — `response` (+ optional Latin)
3. **Section transitions** — Invocations → Marian → Closing (cadence change at indices 9 and 60)
4. **Agnus Dei triplet** — indices 60–62 (distinct responses)
5. **Closing collect** — index 64 (long `Oremos` response)

## Export shape (recommended)

```js
// One item per verse — generate from litanyLauretanaVerses
{
  verseIndex: 0,           // 0..64
  section: 1,              // 1 | 2 | 3
  rosaryPrayerIndex: 79,   // fixed while in LL
  invocation: 'Señor, ten piedad',
  invocationLatin: 'Kyrie eleison',
  response: 'Señor, ten piedad',
  responseLatin: 'Kyrie eleison',
  responseKind: 'repeat' | 'ten_piedad' | 'ruega' | 'agnus' | 'collect'
}
```

Derive `responseKind` from section + index for mixing presets.

## Suggested event contract (window or postMessage)

**Engine → app (playback position):**

```js
{
  type: 'litany_verse',
  prayerIndex: 79,
  verseIndex: 0..64,
  section: 1..3
}
```

**App → engine (navigation):**

```js
{ type: 'litany_advance', verseIndex }
{ type: 'litany_retreat', verseIndex }
{ type: 'litany_jump', verseIndex }
{ type: 'litany_play', verseIndex }   // optional: trigger from UI
```

## Future hook points in this repo

| Location | Hook |
|----------|------|
| `BookletView` `goNext` / `goPrev` on LL step | dispatch `litany_advance` / `litany_retreat` |
| `RosarioVirtualView` `beadRepeatTouch` handler | same |
| `BookletView` on entering LL | dispatch `litany_play` with verse 0 |
| New listener in BookletView / RosarioVirtualView | subscribe to `litany_verse` from engine → set `litanyVerseIndex` |

Keep audio context resume (`audioManager.getContext().resume()`) in app shell — engine should not fight browser autoplay policy.

## Section boundaries (for cues)

| Event | verseIndex |
|-------|------------|
| Start Invocations | 0 |
| Start Marian titles | 9 |
| Start Closing (Agnus Dei) | 60 |
| End | 64 |

## Marian block

Indices 9–59: invocation varies; response is always **"Ruega por nosotros"** — ideal for a single congregation sample with dynamic leader clips.
