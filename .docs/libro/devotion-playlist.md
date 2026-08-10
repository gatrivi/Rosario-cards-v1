# Autorezo — devotion playlist

**v0.3.78** · Route: `/cola` · Más → **Autorezo**

**Empezar en Liber ≫** drives Liber AUTO (no second player). Length = sequence step count.

## Flow

```
Autorezo [Empezar] → expand repeats → session run (pendingAuto)
  → /libro + mystery + Liber claims ≫
  → devotion end → next run item (or idle)
```

`pendingAuto` survives the Cola→Liber mount race (AUTO event used to fire before Liber listeners existed).

| Piece | Path |
|-------|------|
| Playlist + stats | `src/utils/devotionPlaylist.js` |
| Session runner | `src/utils/devotionPlaylistRunner.js` |
| UI | `src/components/Views/DevotionPlaylistView.jsx` |
| Liber emit / AUTO | `BookletView.jsx` (`rosario-playlist-devotion-done`, `rosario-playlist-set-auto`) |
| Mystery apply | `AppShell` listens `rosario-playlist-start` |

## Storage

| Key | Where | Shape |
|-----|-------|-------|
| `rosario_devotion_playlist` | localStorage | `{ id, repeats }[]` |
| `rosario_devotion_play_stats` | localStorage | `{ [id]: { count, lastAt } }` |
| `rosario_devotion_playlist_run` | sessionStorage | `{ runs: string[], cursor }` |

Default queue = all `BOOKLET_MYSTERY_IDS` sorted short→long, `repeats: 1`.

## Notes

- Playlist mode skips rosary four-via AUTO chain; each via is one playlist item if queued.
- Stats are Liber-only (not bead `prayerHistory`).
- Out of scope: audio duration minutes, Loreto-only ids, cloud sync.
