/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 */
import React from 'react';
import VerseDrawing from './VerseDrawing';
import { SACRED_SYMBOLS } from '../../data/SacredSymbols';
import { getCosmicPhases } from '../../utils/cosmicModulator';

/**
 * SacredDrawing — A generic progressive SVG drawing component.
 * It takes a symbol key and draws it based on the 0->1 progress.
 */

const DASH = 600;

const COLORS = {
  silver:   [185, 185, 195],
  gold:     [212, 175, 55],
  amber:    [210, 140, 10],
  incand:   [245, 215, 160],
};

// --- Celestial Color Shift ---
const getCelestialShift = () => {
  const hour = new Date().getHours();
  if (hour < 5 || hour >= 22) return { shift: [10, 10, 40], name: 'Moonlight' };
  if (hour < 9) return { shift: [0, 10, -20], name: 'Dawn' };
  if (hour >= 18) return { shift: [40, -10, -40], name: 'Sunset' };
  return { shift: [0, 0, 0], name: 'High Noon' };
};

const toRGB = (c, shift = [0,0,0]) => 
  `rgb(${Math.max(0, Math.min(255, c[0] + shift[0]))}, ${Math.max(0, Math.min(255, c[1] + shift[1]))}, ${Math.max(0, Math.min(255, c[2] + shift[2]))})`;

function getDrawingColor(warmth, shift) {
  if (warmth < 0.2) return toRGB(COLORS.silver, shift);
  if (warmth < 0.5) return toRGB(COLORS.gold, shift);
  if (warmth < 0.8) return toRGB(COLORS.amber, shift);
  return toRGB(COLORS.incand, shift);
}

export default function SacredDrawing({
  verseTraits,
  verseCount,
  seed = 0,
  symbolKey = 'cross',
  progress = 0,
  warmthProfile = [],
  wiggleProfile = [],
  enrichment = 0,
  liveWarmth = null,
  baseColor = '#D4AF37',
  style = {},
  size = 100, // Explicit size prop
  decadeIndex = 0, // 0-9 for Ave Maria intra-decade bloom
}) {
  const phases = getCosmicPhases();
  const paths = SACRED_SYMBOLS[symbolKey] || SACRED_SYMBOLS.cross;
  const N = paths.length;

  const pathsRef = React.useRef([]);
  const [pathLengths, setPathLengths] = React.useState(Array(N).fill(DASH));

  React.useEffect(() => {
    if (pathsRef.current) {
      const lengths = pathsRef.current.map((p) => (p ? p.getTotalLength() : DASH));
      setPathLengths(lengths);
    }
  }, [symbolKey]); 

  if (verseTraits && verseCount > 0) {
    return <VerseDrawing paths={paths} verseCount={verseCount} progress={progress}
      traits={verseTraits} seed={seed} size={size} style={style} />;
  }

  // Intra-decade Bloom: Each prayer adds a subtle expansion to the sacred geometry
  const bloomScale = 1 + (decadeIndex * 0.015) + (phases.jupiter * 0.05);

  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={size * 1.4}
      style={{ overflow: 'visible', ...style }}
    >
      <defs>
        {/* Sacred Texture: Simulates hand-drawn ink movement and parchment grit */}
        <filter id="sacred-ink-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={1 + phases.saturn * 2} />
        </filter>
        
        {/* Holy Glow Filter */}
        <filter id="sacred-glow">
          <feGaussianBlur stdDeviation={1.5 + phases.uranus * 2} />
        </filter>
      </defs>

      <g transform={`scale(${bloomScale})`} transformOrigin="50 70">
      {paths.map((d, i) => {
        const start = i / N;
        const end = (i + 1) / N;
        const seg = Math.max(0, Math.min(1, (progress - start) / (end - start)));

        const pathLen = pathLengths[i] || DASH;
        const offset = pathLen * (1 - seg);
        const isActive = progress >= start && progress < end;

        const w = (isActive && liveWarmth !== null)
          ? Math.max(0.1, liveWarmth)
          : (warmthProfile[i] !== undefined ? warmthProfile[i] : 0.2);

        const { shift } = getCelestialShift();
        const strokeColor = getDrawingColor(w, shift);

        // Wiggle
        const wig = wiggleProfile[i] || 0;
        let transform;
        if (wig > 0.3) {
          const seed = i * 13 + 3;
          const rot = ((seed % 7) - 3.5) * wig * 0.5;
          const tx = ((seed % 5) - 2.5) * wig * 0.2;
          const ty = (((seed * 2) % 5) - 2.5) * wig * 0.2;
          transform = `rotate(${rot.toFixed(1)}, 50, 70) translate(${tx.toFixed(1)}, ${ty.toFixed(1)})`;
        }

        // Living Stroke (Procedural Variation)
        const strokeSeed = i * 17 + Math.floor(progress * 100);
        const livingStrokeWidth = (1.5 + (strokeSeed % 7) * 0.1) * (1 + enrichment * 0.3);
        const livingOpacity = 0.85 + (strokeSeed % 5) * 0.03;

        return (
          <g key={i} transform={transform} style={{ 
            opacity: seg <= 0 ? 0 : livingOpacity, 
            transition: 'opacity 0.2s linear' 
          }}>
            {/* Glow */}
            {enrichment > 0.1 && (
              <path
                d={d} fill="none"
                stroke={strokeColor}
                strokeWidth={3 + enrichment * 4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLen}
                strokeDashoffset={offset}
                opacity={enrichment * 0.15}
                filter="url(#sacred-glow)"
              />
            )}
            {/* Main Stroke */}
            <path
              ref={(el) => (pathsRef.current[i] = el)}
              d={d} fill="none"
              stroke={strokeColor}
              strokeWidth={livingStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLen}
              strokeDashoffset={offset}
              filter="url(#sacred-ink-texture)"
              style={{
                transition: 'stroke-dashoffset 0.12s linear, stroke 0.4s ease, stroke-width 0.3s ease',
              }}
            />
          </g>
        );
      })}
      </g>
    </svg>
  );
}
