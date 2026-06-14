# Rosario Cards Docs (v0.3.35 baseline)

## Tree
```text
.docs/
  index.md
  product/
    overview.md
  architecture/
    architecture-overview.md
  virtual-rosary/
    interaction-rules.md
    physics-blueprint-v4.md
  visual/
    visual-modes.md
  sacred-cosmic/
    cosmic-modulator.md
    sacred-edition-overview.md
  roadmap/
    future-features.md
  dev-notes/
    beads-dom-prototype.md
    rosary-dom-physics-prototype.md
  todos/
    view-prayers-todo.md
```

## What’s inside (by file)

`product/overview.md`  
Product intent + interaction philosophy + user-facing feature set.

`architecture/architecture-overview.md`  
High-level system map: views/modes, core subsystems, key runtime libraries.

`virtual-rosary/interaction-rules.md`  
Interaction invariants for the physics rosary: what each bead/chain selects.

`virtual-rosary/physics-blueprint-v4.md`  
Formal physical/topological blueprint (Rosary “final_v4”): constraints + topology.

`visual/visual-modes.md`  
Art-direction modes (chiaroscuro vs stained glass/vitral) and current fallbacks.

`sacred-cosmic/cosmic-modulator.md`  
“Sacred Cosmic Edition” deterministic modulation model (planetary phases, seeds).

`sacred-cosmic/sacred-edition-overview.md`  
“Sacred Edition” feature spec: mystery iconography, meditation pacing, offline sync.

`roadmap/future-features.md`  
Planned expansions and interaction experiments.

`dev-notes/beads-dom-prototype.md`  
Dev notes for a DOM-based draggable-beads prototype (drag, constraints, collisions, audio).

`dev-notes/rosary-dom-physics-prototype.md`  
Expanded prototype notes for a complete DOM rosary (bead-chain + loop/threads + scaling).

`todos/view-prayers-todo.md`  
Collection of “todo/levels” notes around prayer views and planned capabilities.

## Overarching tech stack (baseline)
- React 19 + Create React App
- Matter.js (physics-based rosary)
- D3 (legacy/other visual utilities)
- react-icons (UI icons)
- Web Audio API (procedural chimes/synthesis)
- Canvas/SVG (procedural drawings + overlays)
- Local persistence + cloud sync (see docs below for “Sacred Edition” sync behavior)

> Root `README.md` is intentionally not modified or deleted (per safety rule). This docs set only extracts/condenses architecture/product notes into `.docs/`.

