# UI/UX Principles — Libro & Oraciones Breves

Principles applied when polishing the Libro shelf and the Optional Prayer Sheet.
Follow these for any future Libro / booklet / sheet work.

## 1. Touch targets (Fitts's Law)
- Primary controls (close, play, primary CTA): **≥ 44×44 px** (Apple HIG; Android Material uses 48dp).
- Secondary pills (tabs, language switches): ≥ 36 px tall with generous horizontal padding.
- `touch-action: manipulation` on all tap targets to kill the 300ms delay / double-tap zoom.

## 2. Contrast & readability (WCAG AA)
- Text over stained-glass/vitral imagery always carries a dark `text-shadow` (e.g. `0 1px 4px rgba(0,0,0,.75)`).
- Secondary text: never below ~0.68 opacity on dark glass; verify ≥ 4.5:1 effective contrast.
- Prayer body: serif (Georgia), centered, and capped at a **~46ch measure** so lines stay readable on desktop (long measures kill reading rhythm).

## 3. Feedback & affordance
- Every control has `:hover` (default), `:active` micro-response (`transform: scale(.97)`), and a **`:focus-visible` gold ring** (2px `#d4af37`, offset 2) — never remove focus rings, only `:focus` defaults.
- Scrollable panels show a thin gold scrollbar hint so users know content continues.
- Active state (current tab / playing voice) uses the accent gold, not just color opacity.

## 4. Keyboard & accessibility
- Dialog-like surfaces: `role="dialog"`, `aria-label`, **Esc closes**, close button has `aria-label` (not just ✕).
- Decorative glyphs get `aria-hidden="true"`.
- Voice ▶ button toggles label between "Reproducir guía" / "Detener guía".

## 5. Content structure for prayers
- Break long prayers into **short verse lines separated by blank lines** (`\n\n`) — matches the verse-per-line rendering of the glass panel and the contemplative pace.
- Language variants follow the ES / ES breve / EN / LA label convention; default variant is the Spanish one the user prefers.
- Every prayer entry MUST have `img` + non-empty `imgCandidates` (see `.cursor/rules/prayer-images.mdc`).

## 6. Sheet ergonomics
- Fullscreen sheets use `100dvh` (not `100vh`) plus `env(safe-area-inset-*)` padding for notched phones.
- Sheet chrome is a fixed grid (`auto auto auto minmax(0,1fr) auto`) so the prayer panel scrolls internally while title/CTA stay pinned.
