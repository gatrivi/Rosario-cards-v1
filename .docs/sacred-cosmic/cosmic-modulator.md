# Sacred Cosmic Edition: Cosmic Modulator

Deterministic, no-internet modulation for procedural variability across days/years/decades.

## Engine goal
Produce normalized phases (0..1 range; doc says “normalized (0.1) phases”) for the solar system using elapsed Earth time since a fixed epoch.

## Mathematical foundation
- Epoch: J2000 (Jan 1, 2000, 12:00 UTC).
- Time: elapsed “Earth years” since epoch.
- Method: for each planet, apply a sine-wave oscillation driven by that planet’s orbital period.
- Property: stable, multi-decadal pulse; no external API required.

## Planetary journeys (what each cluster modulates)
### Inner planets (short-term variance)
- Mercury (~0.24y): modulates “Breath” / LFO speed (organ breathes faster/slower by week).
- Venus (~0.61y): modulates hue spectrum of sacred drawings.
- Mars (~1.88y): modulates “Life” of lines (wiggle intensity).

### Outer planets (long-term spirit variance)
- Jupiter (~11.8y): modulates max filter resonance + “Celestial Harmonics”.
- Saturn (~29.4y): modulates “Ink Grit” (SVG displacement scale; rougher/smoother across years).
- Uranus (~84y): modulates shimmer depth gain.
- Neptune (~164y): modulates atmospheric “Wash” (reverb tail simulation).
- Pluto (~248y): modulates foundational sub-bass frequency of the Gothic Organ.

## Procedural roses: “Rose Fingerprint”
Every Ave María prayed generates a unique rose fingerprint stored in the Jardín.

### Birth moment seed
- Capture the prayer start timestamp in ms.
- Persist the seed in local/cloud data.

### Seed-driven variation dimensions
- Chromatic shift: ±12 hue units from base scarlet.
- Structural jitter: 12 internal paths rotated/scaled uniquely per seed.
- Ink bleed: SVG turbulence filter is seeded; rose microscopic texture becomes unique per prayer.

