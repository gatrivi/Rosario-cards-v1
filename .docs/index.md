# Rosario Cards — Documentation Index

**Start here.** Canonical context for agents and humans. Model-efficient: tables, paths, invariants.

**Live (prod):** [https://rosario.gatrivi.com](https://rosario.gatrivi.com) — not `*.vercel.app` for share / deep links  
**Live stack:** [architecture/current-stack-jun-2026.md](./architecture/current-stack-jun-2026.md) · version in `releaseNotes.js` / `AppShell` `APP_VERSION`  
**Shipped / next bullets:** `releaseNotes.js` → Ajustes → Novedades · version badge tap

## Tree

```text
.docs/
  index.md                          ← you are here
  architecture/
    current-stack-jun-2026.md       ← production views, data, audio, inventory
    architecture-overview.md          ← high-level map (baseline)
    live-system-snapshot.md           ← pre-recovery monolith detail (partially stale)
    resonator-and-physics-blueprint.md
  libro/
    historic-devotions.md             ← popular devoutions catalog + San Miguel / Próximas
    voice-autoplay.md                 ← Liber ▶ once / auto ≫ EN TTS
  virtual-rosary/
    rosary-ux-recovery-jun-2026.md    ← Jun 2026 session: 3 bugs fixed, stack
    interaction-rules.md              ← bead/chain selection MUSTS
    topology-current.md               ← production vs v4 canonical
    physics-stable-archive.md         ← archived Matter module
    physics-blueprint-v4.md           ← formal v4 JSON topology
  visual/
    visual-modes.md                   ← chiaroscuro vs vitral
  sacred-cosmic/
    cosmic-modulator.md
    sacred-edition-overview.md
  roadmap/
    future-features.md
  litany/
    index.md                          ← Letanía Lauretana roadmap + sound-engine handoff
    data-model.md
    assets-and-images.md
    views-integration.md
    audio-integration.md
    known-issues.md
  dev-notes/
    session-report-2026-07-03-night.md  ← art sync, Firebase scaffold, Vía Crucis/Lucis
    beads-dom-prototype.md
    rosary-dom-physics-prototype.md
    legacy-agent-prompts/             ← historical root agent files
  todos/
    view-prayers-todo.md
  product/
    overview.md
```

## Quick links by topic

| Topic | Doc |
|-------|-----|
| **What runs today** | [current-stack-jun-2026.md](./architecture/current-stack-jun-2026.md) |
| **Libro devoutions / Próximas** | [historic-devotions.md](./libro/historic-devotions.md) |
| **Liber voice autoplay** | [voice-autoplay.md](./libro/voice-autoplay.md) |
| **Rosary recovery status** | [rosary-ux-recovery-jun-2026.md](./virtual-rosary/rosary-ux-recovery-jun-2026.md) |
| **Bead click rules** | [interaction-rules.md](./virtual-rosary/interaction-rules.md) |
| **Topology / merge plan** | [topology-current.md](./virtual-rosary/topology-current.md) |
| **Archived physics module** | [physics-stable-archive.md](./virtual-rosary/physics-stable-archive.md) |
| **Litany images** | [litany/index.md](./litany/index.md), `src/data/litanyLauretana.js` |
| **Litany sound engine** | [litany/audio-integration.md](./litany/audio-integration.md) |
| **Visual assets policy** | [visual-modes.md](./visual/visual-modes.md) |
| **Cosmic / Sacred Edition** | [sacred-cosmic/](./sacred-cosmic/) |
| **Future work** | [future-features.md](./roadmap/future-features.md) |
| **Open issues (verify source)** | [known-issues.md](./litany/known-issues.md) |
| **Jul 2026 session (art/Firebase/Vía)** | [session-report-2026-07-03-night.md](./dev-notes/session-report-2026-07-03-night.md) |

## Stack (one line)

React 19 · CRA · Matter.js · D3 · Web Audio · localStorage + jsonblob (+ optional Firebase art library)

**Root markdown:** only `README.md` + `agents.md`. All other context lives here in `.docs/`.

Research scratch: `notes/` (not migrated).

> Root `README.md` unchanged (project entry).
