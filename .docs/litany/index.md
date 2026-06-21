# Litany of Loretto (Letanía Lauretana)

**Start here** for litany data, UI integration, assets, and sound-engine handoff.

## Roadmap

| Phase | Status | Doc |
|-------|--------|-----|
| Structured data (65 verses, 3 sections) | Done | [data-model.md](./data-model.md) |
| Per-verse modooscuro vitrals | Done (some broken paths) | [assets-and-images.md](./assets-and-images.md) |
| BookletView full UX | Done | [views-integration.md](./views-integration.md) |
| RosarioVirtualView litany branch | Partial | [views-integration.md](./views-integration.md) |
| Physics rosary unlock (heart → LL) | Stubbed | [known-issues.md](./known-issues.md) |
| Per-verse audio / leader–response voices | Not started | [audio-integration.md](./audio-integration.md) |
| Standalone sound engine hook-up | Planned (external project) | [audio-integration.md](./audio-integration.md) |

## Quick facts

| Field | Value |
|-------|-------|
| Prayer ID | `LL` |
| Title | Letanía Lauretana |
| Rosary sequence index | **79** (all four mysteries) |
| Nested verse indices | **0–64** (65 verses) |
| Next prayer | `S` (Salve Regina) at index 80 |
| Canonical data | `src/data/litanyLauretana.js` |
| Primary UI | `BookletView` (Libro tab) |

## Integration status

| Feature | BookletView | RosarioVirtualView | RoseView | InteractiveRosary |
|---------|-------------|-------------------|----------|-------------------|
| Per-verse display | Yes | Yes | Flat teleprompter | — |
| Per-verse background | Yes | Yes | Images only | — |
| Section progress bar | Yes | Yes | No | — |
| Entrance animation | Yes | No | No | — |
| Verse navigation | Tap / keys | Bead repeat | Generic | — |
| Heart medal → LL | — | Listener (unlock gated) | — | Stubbed |
| Litany-specific audio | No | No | Generic Hz | Generic chime |

## Subdocs

- [data-model.md](./data-model.md) — schema, sections, indexing
- [assets-and-images.md](./assets-and-images.md) — vitral paths, resolver
- [views-integration.md](./views-integration.md) — how each view consumes LL
- [audio-integration.md](./audio-integration.md) — **sound engine contract**
- [known-issues.md](./known-issues.md) — bugs and deferred work
