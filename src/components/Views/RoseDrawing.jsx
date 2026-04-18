import React from 'react';

// ═══════════════════════════════════════════════════════
// RoseDrawing — SVG rose that draws itself progressively
// ═══════════════════════════════════════════════════════
//
// 12 strokes: 9 petals + stem + 2 leaves.
// Each stroke reveals via stroke-dasharray/dashoffset as progress advances.
// Warmth colors each petal (silver → gold → deep gold → incandescent).
// Wiggle adds subtle per-petal transform variation (organic uniqueness).

const ROSE_PATHS = [
  // ── Rose head: 9 petal curves ──
  // 1. Center bud spiral
  'M 50,42 c 2,-3 5,-3 5,0 c 0,3 -3,5 -5,3',
  // 2. Inner petal wrapping left
  'M 50,45 c -3,1 -7,-1 -7,-4 c 0,-3 3,-6 7,-5',
  // 3. Inner petal curving right
  'M 50,36 c 4,-1 9,2 9,7 c 0,5 -4,8 -8,8',
  // 4. Mid petal left sweep
  'M 51,51 c -5,2 -12,0 -14,-5 c -2,-5 1,-10 5,-13',
  // 5. Mid petal top arc
  'M 42,33 c 1,-6 7,-12 14,-11 c 7,1 12,6 14,11',
  // 6. Mid petal right descent
  'M 70,33 c 3,5 2,13 -2,17 c -4,4 -10,6 -15,5',
  // 7. Outer petal left enclosing
  'M 53,56 c -7,3 -16,1 -20,-5 c -4,-6 -3,-15 2,-20',
  // 8. Outer petal crown
  'M 35,31 c 1,-10 9,-18 19,-19 c 10,-1 19,5 23,14',
  // 9. Outer petal right enclosing
  'M 77,26 c 5,7 5,18 1,25 c -4,7 -13,12 -21,10',
  // ── Stem & Leaves ──
  // 10. Stem
  'M 50,59 c 0,10 -1,22 0,34 c 1,12 0,24 0,36',
  // 11. Right leaf
  'M 51,80 c 6,-5 15,-4 17,1 c 2,5 -3,8 -10,5',
  // 12. Left leaf
  'M 49,100 c -6,-5 -15,-4 -17,1 c -2,5 3,8 10,5',
];

const PATH_TYPES = [
  'petal','petal','petal','petal','petal','petal','petal','petal','petal',
  'stem','leaf','leaf'
];

const COLORS = {
  silver:      'rgb(185, 185, 195)',
  gold:        'rgb(212, 175, 55)',
  deepGold:    'rgb(184, 134, 11)',
  warmAmber:   'rgb(210, 140, 10)',
  incandescent:'rgb(245, 215, 160)',
  stem:        '#2d5a27',
  leaf:        '#3e8e2c',
};

const DASH = 500; // Larger than any path — safe for all strokes

function petalColor(warmth) {
  if (warmth < 0.10) return COLORS.silver;
  if (warmth < 0.25) return COLORS.gold;
  if (warmth < 0.50) return COLORS.deepGold;
  if (warmth < 0.75) return COLORS.warmAmber;
  return COLORS.incandescent;
}

export default function RoseDrawing({
  progress = 0,        // 0–1: overall prayer progress
  warmthProfile = [],  // per-path warmth (0–1)
  wiggleProfile = [],  // per-path variance → organic Bezier variation
  enrichment = 0,      // 0–1: lifetime prayer depth → glow intensity
  size = 120,
  style = {},
  onClick,
}) {
  const N = ROSE_PATHS.length;

  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={size * 1.4}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
    >
      {ROSE_PATHS.map((d, i) => {
        // Each path occupies a proportional slice of the 0→1 progress range
        const start = i / N;
        const end   = (i + 1) / N;
        const seg   = Math.max(0, Math.min(1, (progress - start) / (end - start)));
        if (seg <= 0) return null;

        const offset = DASH * (1 - seg);
        const type = PATH_TYPES[i];

        // ── Color ──
        const w = warmthProfile[i] !== undefined ? warmthProfile[i] : 0.2;
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
          <g key={i} transform={transform}>
            {/* Glow layer — grows with lifetime enrichment */}
            {enrichment > 0.1 && type === 'petal' && (
              <path
                d={d} fill="none"
                stroke={stroke}
                strokeWidth={sw + 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={DASH}
                strokeDashoffset={offset}
                opacity={enrichment * 0.2}
                style={{ filter: `blur(${2 + enrichment * 4}px)` }}
              />
            )}
            {/* Main drawn stroke */}
            <path
              d={d} fill="none"
              stroke={stroke}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={DASH}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.5s ease',
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
