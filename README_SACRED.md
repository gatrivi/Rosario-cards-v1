# Rosario Cards — Sacred Edition Documentation

This document outlines the premium features and technical implementation of the **Sacred Edition** upgrade.

## 1. Sacred Mystery Iconography
The application now contains **20 unique, hand-crafted SVG mystery symbols**. 
- **Mapping**: Each decade of the Rosary (Gozosos, Dolorosos, Gloriosos, Luminosos) displays a distinct symbol corresponding to that specific mystery.
- **Progressive Drawing**: Symbols are rendered using a progressive path-drawing algorithm that synchronizes with the user's prayer progress.

## 2. Meditation Pacing (The Three Gifts)
Users can now set their preferred focus rhythm in the **Ajustes** (Settings) menu:
- **Oro (Gold)**: ~45ms/char. Fluid and steady.
- **Incienso (Incense)**: ~85ms/char. The balanced standard.
- **Mirra (Myrrh)**: ~155ms/char. Deep, slow contemplation.

## 3. Deep Visual Variability
To maintain a "living," non-artificial feel, the app implements several procedural variability systems:

### Sacred Text (Hand-Scribed)
- **Character Jitter**: Every letter in the prayer text has a unique, seed-based rotation and vertical offset.
- **Font-Weight Variation**: Subtle shifts in boldness across letters simulate varying pressure from a scribe's quill.
- **Celestial Shift**: The color palette of all drawings shifts based on the local time:
    - **Moonlight**: Cool blue/silver (Night)
    - **Dawn**: Soft gold (Early Morning)
    - **High Noon**: Radiant amber (Day)
    - **Sunset**: Deep copper (Evening)

### Living Strokes
- **Pressure Simulation**: SVG path widths fluctuate procedurally as they are drawn.
- **Organic Fade**: Stroke opacity varies slightly to mimic real ink pooling.

## 4. Offline-First Synchronization
A robust synchronization system ensures prayer progress is never lost:
- **Cloud Sync Pulse**: A visual status indicator (Cloud icon) pulses to show synchronization health.
- **Auto-Recovery**: If a session is started offline, the app automatically pushes pending progress once a network connection is detected.
- **Magic Link Pairing**: Users can sync devices by appending `?sync=YOUR_ID` to the URL.

---
*Created for deep spiritual discipline.*
