import React from 'react';

// ═══════════════════════════════════════════════════════
// RoseDrawing — SVG rose that draws itself progressively
// ═══════════════════════════════════════════════════════
//
// 12 strokes: 9 petals + stem + 2 leaves.
// Reordered so the "Jesús" verse (progress 0.25 - 0.5) draws the grand outer crown!
const ROSE_PATHS = [
  // ── 1. Dios te salve (0.0 - 0.25) -> Inner Bud ──
  'M 50,42 c 2,-3 5,-3 5,0 c 0,3 -3,5 -5,3', // 0. bud
  'M 50,45 c -3,1 -7,-1 -7,-4 c 0,-3 3,-6 7,-5', // 1. inner left

  // ── 2. Jesús verse (0.25 - 0.5) -> Grand Outer Sweeps ──
  'M 35,31 c 1,-10 9,-18 19,-19 c 10,-1 19,5 23,14', // 2. outer crown (huge majestic sweep)
  'M 77,26 c 5,7 5,18 1,25 c -4,7 -13,12 -21,10', // 3. outer right enclosing
  'M 53,56 c -7,3 -16,1 -20,-5 c -4,-6 -3,-15 2,-20', // 4. outer left enclosing

  // ── 3. Santa María (0.5 - 0.75) -> Inner details ──
  'M 50,36 c 4,-1 9,2 9,7 c 0,5 -4,8 -8,8', // 5. inner right
  'M 42,33 c 1,-6 7,-12 14,-11 c 7,1 12,6 14,11', // 6. mid top arc

  // ── 4. Ruega por nosotros (0.75 - 1.0) -> Final fill ──
  'M 51,51 c -5,2 -12,0 -14,-5 c -2,-5 1,-10 5,-13', // 7. mid left
  'M 70,33 c 3,5 2,13 -2,17 c -4,4 -10,6 -15,5', // 8. mid right
  
  // ── Stem & Leaves ──
  // 9. Stem
  'M 50,59 c 0,10 -1,22 0,34 c 1,12 0,24 0,36',
  // 10. Right leaf
  'M 51,80 c 6,-5 15,-4 17,1 c 2,5 -3,8 -10,5',
  // 11. Left leaf
  'M 49,100 c -6,-5 -15,-4 -17,1 c -2,5 3,8 10,5',
];

const PATH_TYPES = [
  'petal','petal','petal','petal','petal','petal','petal','petal','petal',
  'stem','leaf','leaf'
];

const COLORS = {
  coolRed:     'rgb(110, 20, 30)',   // Fast/cool contemplation
  baseRed:     'rgb(170, 15, 25)',   // Normal
  warmRed:     'rgb(220, 10, 30)',   // Warm hover
  brightRed:   'rgb(255, 30, 50)',  // Deep contemplation
  incandescent:'rgb(255, 120, 120)', // Incandescent glowing tip
  stem:        '#2d5a27',
  leaf:        '#3e8e2c',
};

const DASH = 500; // Larger than any path — safe for all strokes

function petalColor(warmth) {
  if (warmth < 0.10) return COLORS.coolRed;
  if (warmth < 0.25) return COLORS.baseRed;
  if (warmth < 0.50) return COLORS.warmRed;
  if (warmth < 0.75) return COLORS.brightRed;
  return COLORS.incandescent;
}

export default function RoseDrawing({
  progress = 0,        // 0–1: overall prayer progress
  warmthProfile = [],  // per-path warmth (0–1)
  wiggleProfile = [],  // per-path variance → organic Bezier variation
  enrichment = 0,      // 0–1: lifetime prayer depth → glow intensity
  liveWarmth = null,   // 0–1: live hover warmth of the cursor right now
  size = 120,
  compact = false,     // true to hide stem/leaves and zoom on flower head
  style = {},
  onClick,
}) {
  // If compact, only render the first 9 paths (petals). Otherwise, 12.
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

  return (
    <svg
      viewBox={compact ? "15 14 70 48" : "0 0 100 140"}
      width={size}
      height={compact ? size * 0.68 : size * 1.4}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
    >
      {ROSE_PATHS.slice(0, N_RENDER).map((d, i) => {
        // Each path occupies a proportional slice of the 0→1 progress range
        const start = i / N_RENDER;
        const end   = (i + 1) / N_RENDER;
        const seg   = Math.max(0, Math.min(1, (progress - start) / (end - start)));

        const pathLen = pathLengths[i];
        const offset = pathLen * (1 - seg);
        const type = PATH_TYPES[i];
        
        const isActive = progress >= start && progress < end;

        // ── Color ──
        const w = (isActive && liveWarmth !== null) 
                    ? Math.max(0.1, liveWarmth) // Use live heat while drawing
                    : (warmthProfile[i] !== undefined ? warmthProfile[i] : 0.2); // Fallback to recorded avg
        const stroke = type === 'stem'  ? COLORS.stem
                     : type === 'leaf'  ? COLORS.leaf
                     : petalColor(w);

        // ── Wiggle transform ──
        const wig = wiggleProfile[i] || 0;
        let transform;
        if (wig > 0.3) {
          const seed = i * 17 + 7;
          const rot = ((seed % 11) - 5.5) * wig * 0.7;
          const tx  = ((seed % 7) - 3.5) * wig * 0.25;
          const ty  = (((seed * 3) % 7) - 3.5) * wig * 0.25;
          transform = `rotate(${rot.toFixed(2)}, 50, 42) translate(${tx.toFixed(2)}, ${ty.toFixed(2)})`;
        }

        const sw = type === 'stem' ? 1.8 : type === 'leaf' ? 1.4 : 1.6;

        return (
          <g key={i} transform={transform} style={{ opacity: seg <= 0 ? 0 : 1, transition: 'opacity 0.1s linear' }}>
            {/* Glow layer — grows with lifetime enrichment */}
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
                style={{ filter: `blur(${2 + enrichment * 4}px)` }}
              />
            )}
            {/* Main drawn stroke */}
            <path
              ref={(el) => (pathsRef.current[i] = el)}
              d={d} fill="none"
              stroke={stroke}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLen}
              strokeDashoffset={offset}
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

// Expose path count so consumers can map verse data to paths
RoseDrawing.PATH_COUNT = ROSE_PATHS.length;
