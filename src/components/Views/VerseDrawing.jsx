import React from 'react';

// Split the drawing's path timeline into exactly one segment per verse.
// A verse may finish one contour and begin another without losing any artwork.
export function verseSegments(pathCount, verseCount, verseIndex) {
  const start = verseIndex * pathCount / verseCount;
  const end = (verseIndex + 1) * pathCount / verseCount;
  return Array.from({ length: Math.ceil(end) - Math.floor(start) }, (_, offset) => {
    const pathIndex = Math.floor(start) + offset;
    return { pathIndex, start: Math.max(0, start - pathIndex), end: Math.min(1, end - pathIndex) };
  }).filter(segment => segment.end - segment.start > 1e-8);
}

const clamp = value => Math.max(0, Math.min(1, value));
const noise = (seed, index) => {
  const value = Math.sin((seed % 1000003) * 0.017 + index * 37.17) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
};

export default function VerseDrawing({
  paths, verseCount, progress, traits = {}, seed = 0, rose = false,
  size = 120, compact = false, style, onClick,
}) {
  const count = Math.max(1, Math.floor(verseCount));
  const groups = React.useMemo(
    () => Array.from({ length: count }, (_, i) => verseSegments(paths.length, count, i)),
    [paths.length, count]
  );
  return (
    <svg viewBox={compact ? '15 14 70 48' : '0 0 100 140'}
      width={size} height={compact ? size * 0.68 : size * 1.4}
      style={{ overflow: 'visible', ...style }} onClick={onClick}
      role="img" aria-label={rose ? 'Rosa dibujada con tu oración' : 'Dibujo de la oración'}>
      {groups.map((segments, verse) => {
        const revealed = clamp(progress * count - verse);
        const warmth = clamp(traits.warmth?.[verse] ?? 0.25);
        const movement = Math.min(1, Math.max(0, (traits.wiggle?.[verse] ?? 0) / 5));
        const width = 1.35 + warmth * 1.15 + movement * 0.35;
        // Stable per prayer and verse: later progress never changes finished ink.
        const rotation = noise(seed, verse + 1) * (0.35 + movement * 1.8);
        const expansion = 1 + noise(seed, verse + 71) * (0.012 + movement * 0.028);
        let remaining = revealed * segments.reduce((sum, s) => sum + s.end - s.start, 0);
        return (
          <g key={verse} data-verse-stroke={verse}
            opacity={revealed > 0 ? 1 : 0}
            transform={`translate(50 55) rotate(${rotation}) scale(${expansion}) translate(-50 -55)`}>
            {segments.map(({ pathIndex, start, end }) => {
              const visible = Math.min(end - start, remaining);
              remaining = Math.max(0, remaining - visible);
              if (visible <= 0) return null;
              const hue = rose ? (pathIndex >= 9 ? 112 : 350 + noise(seed, verse + 9) * 12) : 40;
              const color = `hsl(${hue}, ${rose ? 65 + warmth * 20 : 35 + warmth * 40}%, ${38 + warmth * 24}%)`;
              const dash = `${visible} 2`;
              return (
                <g key={pathIndex}>
                  <path d={paths[pathIndex]} pathLength="1" fill="none"
                    stroke={color} strokeWidth={width + 2} opacity={0.12 + warmth * 0.1}
                    strokeDasharray={dash} strokeDashoffset={-start}
                    strokeLinecap="round" strokeLinejoin="round" />
                  <path d={paths[pathIndex]} pathLength="1" fill="none"
                    stroke={color} strokeWidth={width}
                    strokeDasharray={dash} strokeDashoffset={-start}
                    strokeLinecap="round" strokeLinejoin="round" />
                  <path d={paths[pathIndex]} pathLength="1" fill="none"
                    stroke={rose && pathIndex < 9 ? '#ffd1c8' : '#fff0ba'}
                    strokeWidth={0.35 + warmth * 0.25} opacity={0.4}
                    strokeDasharray={dash} strokeDashoffset={-start}
                    strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
