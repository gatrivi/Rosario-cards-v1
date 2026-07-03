import React from 'react';

/**
 * Stylized nun SVG — intensity scales with devotion level (1 = casual seed → 12 = Padre Pío).
 */
export default function NunSilhouette({ levelId = 1, selected = false, size = 88 }) {
  const t = Math.min(12, Math.max(1, levelId)) / 12;
  const beads = Math.max(1, Math.round(1 + t * 14));
  const kneel = t > 0.72;
  const aura = 0.08 + t * 0.35;
  const habit = selected ? '#D4AF37' : `rgba(212,175,55,${0.55 + t * 0.35})`;
  const veil = selected ? '#F5E6C8' : `rgba(245,230,200,${0.7 + t * 0.2})`;
  const bodyY = kneel ? 8 : 0;

  const beadDots = Array.from({ length: beads }, (_, i) => {
    const angle = (i / beads) * Math.PI * 1.35 - Math.PI * 0.15;
    const r = 14 + t * 6;
    const cx = 40 + Math.cos(angle) * r;
    const cy = 72 + bodyY + Math.sin(angle) * r * 0.55;
    return <circle key={i} cx={cx} cy={cy} r={1.1 + t * 0.5} fill={habit} opacity={0.55 + (i / beads) * 0.45} />;
  });

  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 80 108"
      aria-hidden="true"
      style={{ display: 'block', filter: selected ? 'drop-shadow(0 0 8px rgba(212,175,55,0.55))' : 'none' }}
    >
      <ellipse cx="40" cy="54" rx="28" ry="34" fill={`rgba(212,175,55,${aura})`} />
      {/* Rosary arc */}
      <path
        d={`M 26 ${74 + bodyY} Q 40 ${58 + bodyY} 54 ${74 + bodyY}`}
        fill="none"
        stroke={habit}
        strokeWidth={1 + t * 0.6}
        opacity={0.5}
      />
      {beadDots}
      {/* Habit body */}
      <path
        d={`M 28 ${42 + bodyY} L 22 ${98 + bodyY} L 58 ${98 + bodyY} L 52 ${42 + bodyY} Z`}
        fill={habit}
        opacity={0.85}
      />
      {/* Arms */}
      <path
        d={`M 28 ${48 + bodyY} Q ${18 - t * 4} ${62 + bodyY} 24 ${78 + bodyY}`}
        fill="none"
        stroke={habit}
        strokeWidth={3 + t}
        strokeLinecap="round"
      />
      <path
        d={`M 52 ${48 + bodyY} Q ${62 + t * 4} ${62 + bodyY} 56 ${78 + bodyY}`}
        fill="none"
        stroke={habit}
        strokeWidth={3 + t}
        strokeLinecap="round"
      />
      {/* Head + veil */}
      <circle cx="40" cy={32 + bodyY} r="9" fill={veil} />
      <path
        d={`M 31 ${32 + bodyY} Q 40 ${18 + bodyY - t * 4} 49 ${32 + bodyY} L 52 ${44 + bodyY} Q 40 ${40 + bodyY} 28 ${44 + bodyY} Z`}
        fill={veil}
        opacity={0.92}
      />
      {/* Stigmata glow — Padre Pío tier */}
      {t > 0.9 && (
        <>
          <circle cx="24" cy={76 + bodyY} r="2.5" fill="#DC143C" opacity="0.7" />
          <circle cx="56" cy={76 + bodyY} r="2.5" fill="#DC143C" opacity="0.7" />
        </>
      )}
    </svg>
  );
}
