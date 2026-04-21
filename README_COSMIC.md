# SACRED EDITION: Cosmic Alignment & Procedural Depth

The **Sacred Cosmic Edition** transforms the Rosary application from a static tool into a living system synchronized with the cycles of the heavens. It uses deterministic astronomical calculations to ensure the experience is never identical across days, years, or decades.

---

## 🌌 The Cosmic Modulator (`cosmicModulator.js`)

At the heart of the "Sacred Edition" is a stateless engine that derives normalized (0.1) phases for the entire solar system.

### 1. The Mathematical Foundation
*   **Epoch**: J2000 (January 1, 2000, 12:00 UTC).
*   **Method**: We calculate the elapsed time in Earth Years since the epoch and apply a sine-wave oscillation based on the specific orbital period of each planet.
*   **Result**: A stable, multi-decadal pulse that requires no external API or internet connection.

### 2. The Planetary Journeys

#### The Physical Journey (Inner Planets)
These govern the **short-term** variance (Daily/Weekly/Monthly).
*   **Mercury (0.24y)**: Modulates the "Breath" (LFO speed). On some weeks, the organ breathes faster; on others, it is slow and solemn.
*   **Venus (0.61y)**: Modulates the Hue spectrum of the Sacred Drawings.
*   **Mars (1.88y)**: Modulates the "Life" of the lines (Wiggle intensity).

#### The Great Journey (Outer Planets)
These govern the **long-term** spirit (Years/Decades/Lifetimes).
*   **Jupiter (11.8y)**: Modulates the maximum Filter Resonance and "Celestial Harmonics."
*   **Saturn (29.4y)**: Modulates "Ink Grit" (SVG Displacement scale). The drawings feel rougher or smoother across the years.
*   **Uranus (84y)**: Modulates the depth of the "Shimmer" gain.
*   **Neptune (164y)**: Modulates the atmospheric "Wash" (Reverb tail simulation).
*   **Pluto (248y)**: Modulates the Foundational Sub-bass frequency of the Gothic Organ.

---

## 🌹 Procedural Roses (The Unique Fingerprint)

Every Ave María prayed creates a unique **Rose Fingerprint** stored in the "Jardín."

### The "Birth Moment" Seed
When a prayer begins, the exact **timestamp** (ms) is captured as a "Cosmic Seed." This seed is persisted forever in the user's local/cloud data.

### Seed-Driven Variations
-   **Chromatic Shift**: The petal color is perturbed by ±12 hue units from the base scarlet.
-   **Structural Jitter**: Each of the 12 paths is uniquely rotated and scaled by the seed.
-   **Ink Bleed**: The SVG turbulence filter used for the "ink" effect is seeded, meaning the microscopic texture of the rose is unique to that specific prayer.

---

## 🛡️ Sacred Performance License
The core interaction logic—the way text, sound, and cosmic math intertwine to reward focus—is protected under the **Sacred Performance License v1.2**. This documents the specific procedural algorithms as the proprietary intellectual and devotional property of **gatrivi**.

---

## 🎹 Audio Synthesis ("The Resonant Organ")
The audio system (`RezoEnFocoView`) interprets the cosmic data in real-time:
-   **Base Volume**: Kept at a low, non-intrusive level floor (0.012).
-   **Enrichment**: As the session progresses, higher-octave oscillators (The Celestial Voice) fade in.
-   **Warmth**: As the user focuses on a verse, the filter cutoff opens, "washing" the room in golden frequencies.

---

*“As above, so below.”* — The Sacred Cosmic Edition ensures your digital pilgrimage is as deep and varied as the heavens themselves.
