/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 * 
 * Procedural Rose Interaction Logic
 */
import React from 'react';
import VerseDrawing from './VerseDrawing';

// ═══════════════════════════════════════════════════════
// RoseDrawing — SVG rose that draws itself progressively
// ═══════════════════════════════════════════════════════

// 12 strokes: 9 petals + stem + 2 leaves.
const ROSE_PATHS = [
  'M 50,42 c 2,-3 5,-3 5,0 c 0,3 -3,5 -5,3', 
  'M 50,45 c -3,1 -7,-1 -7,-4 c 0,-3 3,-6 7,-5', 
  'M 35,31 c 1,-10 9,-18 19,-19 c 10,-1 19,5 23,14', 
  'M 77,26 c 5,7 5,18 1,25 c -4,7 -13,12 -21,10', 
  'M 53,56 c -7,3 -16,1 -20,-5 c -4,-6 -3,-15 2,-20', 
  'M 50,36 c 4,-1 9,2 9,7 c 0,5 -4,8 -8,8', 
  'M 42,33 c 1,-6 7,-12 14,-11 c 7,1 12,6 14,11', 
  'M 51,51 c -5,2 -12,0 -14,-5 c -2,-5 1,-10 5,-13', 
  'M 70,33 c 3,5 2,13 -2,17 c -4,4 -10,6 -15,5', 
  'M 50,59 c 0,10 -1,22 0,34 c 1,12 0,24 0,36',
  'M 51,80 c 6,-5 15,-4 17,1 c 2,5 -3,8 -10,5',
  'M 49,100 c -6,-5 -15,-4 -17,1 c -2,5 3,8 10,5',
];

const PATH_TYPES = [
  'petal','petal','petal','petal','petal','petal','petal','petal','petal',
  'stem','leaf','leaf'
];

const COLORS = {
  coolRed:     'rgb(110, 20, 30)',   
  baseRed:     'rgb(170, 15, 25)',   
  warmRed:     'rgb(220, 10, 30)',   
  brightRed:   'rgb(255, 30, 50)',  
  incandescent:'rgb(255, 120, 120)', 
  stem:        '#2d5a27',
  leaf:        '#3e8e2c',
};

const DASH = 500; 

function petalColor(warmth, seed = 0) {
  let base;
  if (warmth < 0.10) base = COLORS.coolRed;
  else if (warmth < 0.25) base = COLORS.baseRed;
  else if (warmth < 0.50) base = COLORS.warmRed;
  else if (warmth < 0.75) base = COLORS.brightRed;
  else base = COLORS.incandescent;

  if (!seed) return base;

  const shift = (seed % 24) - 12; 
  const rgb = base.match(/\d+/g).map(Number);
  return `rgb(${Math.max(0, Math.min(255, rgb[0] + shift))}, ${Math.max(0, Math.min(255, rgb[1] - shift/2))}, ${Math.max(0, Math.min(255, rgb[2] - shift/2))})`;
}

export default function RoseDrawing({
  verseTraits,
  verseCount,
  progress = 0,        
  warmthProfile = [],  
  wiggleProfile = [],  
  enrichment = 0,      
  liveWarmth = null,   
  seed = 0,            
  size = 120,
  compact = false,     
  style = {},
  onClick,
}) {
  const N_TOTAL = ROSE_PATHS.length;
  const N_RENDER = compact ? 9 : N_TOTAL;
  
  const pathsRef = React.useRef([]);
  const [pathLengths, setPathLengths] = React.useState(Array(N_TOTAL).fill(DASH));

  React.useEffect(() => {
    if (pathsRef.current) {
      const lengths = pathsRef.current.map((p) => p ? p.getTotalLength() : DASH);
      setPathLengths(lengths);
    }
  }, []);

  const sVal = seed || 0;
  if (verseTraits && verseCount > 0) {
    return <VerseDrawing paths={ROSE_PATHS} verseCount={verseCount} progress={progress}
      traits={verseTraits} seed={seed} rose size={size} compact={compact} style={style} onClick={onClick} />;
  }

  return (
    <svg
      viewBox={compact ? "15 14 70 48" : "0 0 100 140"}
      width={size}
      height={compact ? size * 0.68 : size * 1.4}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
    >
      <defs>
        <filter id={`rose-texture-${sVal}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={1 + (sVal % 3)} />
        </filter>
        <filter id={`rose-glow-${sVal}`}>
          <feGaussianBlur stdDeviation={1 + (sVal % 2)} />
        </filter>
      </defs>

      {ROSE_PATHS.slice(0, N_RENDER).map((d, i) => {
        const start = i / N_RENDER;
        const end   = (i + 1) / N_RENDER;
        const seg   = Math.max(0, Math.min(1, (progress - start) / (end - start)));

        const pathLen = pathLengths[i];
        const offset = pathLen * (1 - seg);
        const type = PATH_TYPES[i];
        
        const isActive = progress >= start && progress < end;

        const w = (isActive && liveWarmth !== null) 
                    ? Math.max(0.1, liveWarmth) 
                    : (warmthProfile[i] !== undefined ? warmthProfile[i] : 0.2);
        
        const stroke = type === 'stem'  ? COLORS.stem
                     : type === 'leaf'  ? COLORS.leaf
                     : petalColor(w, sVal);

        // Procedural Wiggle: Unique for every rose
        const wig = (wiggleProfile[i] || 0) + (sVal ? (sVal % 5) * 0.05 : 0);
        let transform;
        if (wig > 0.1) {
          const pSeed = i * 17 + (sVal % 100);
          const rot = ((pSeed % 11) - 5.5) * wig * 0.8;
          const tx  = ((pSeed % 7) - 3.5) * wig * 0.3;
          const ty  = (((pSeed * 3) % 7) - 3.5) * wig * 0.3;
          transform = `rotate(${rot.toFixed(2)}, 50, 42) translate(${tx.toFixed(2)}, ${ty.toFixed(2)})`;
        }

        const sw = type === 'stem' ? 1.8 : type === 'leaf' ? 1.4 : 1.6;

        return (
          <g key={i} transform={transform} style={{ opacity: seg <= 0 ? 0 : 1, transition: 'opacity 0.1s linear' }}>
            {enrichment > 0.1 && type === 'petal' && (
              <path
                d={d} fill="none"
                stroke={stroke}
                strokeWidth={sw + 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLen}
                strokeDashoffset={offset}
                opacity={enrichment * 0.2}
                filter={`url(#rose-glow-${sVal})`}
              />
            )}
            <path
              ref={(el) => (pathsRef.current[i] = el)}
              d={d} fill="none"
              stroke={stroke}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLen}
              strokeDashoffset={offset}
              filter={`url(#rose-texture-${sVal})`}
              style={{
                transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
 RoseDrawing.PATH_COUNT = 12;

// Expose path count so consumers can map verse data to paths
RoseDrawing.PATH_COUNT = ROSE_PATHS.length;
