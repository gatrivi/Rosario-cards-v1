/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 */
import React, { forwardRef } from 'react';

/**
 * SacredText — Renders text with procedural hand-scribed variability (jitter, rotation, etc.)
 */
const SacredText = forwardRef(({ 
  words, 
  wordCharOffsets, 
  charProgressIndex, 
  isVersoComplete, 
  isPrayerComplete, 
  charReachedAtRef, 
  charDwellRef, 
  wordSpanRefs, 
  warmthTick,
  totalAveMarias = 0,
  simpleMode = false 
}, ref) => {
  const SILVER = [185, 185, 195];
  const GOLD = [212, 175, 55];
  const DEEP_GOLD = [184, 134, 11];
  const WARM_AMBER = [210, 140, 10];
  const INCANDESCENT = [245, 215, 160];
  const UNREAD = [75, 75, 75]; // Lighter for visibility

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpColor = (from, to, t) => [
    Math.round(lerp(from[0], to[0], t)),
    Math.round(lerp(from[1], to[1], t)),
    Math.round(lerp(from[2], to[2], t)),
  ];
  const toRGB = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

  const colorFromElapsed = (elapsed) => {
    if (elapsed <= 0) return UNREAD;
    if (elapsed < 100) return lerpColor(UNREAD, SILVER, elapsed / 100);
    if (elapsed < 200) return lerpColor(SILVER, GOLD, (elapsed - 100) / 100);
    if (elapsed < 600) return lerpColor(GOLD, DEEP_GOLD, (elapsed - 200) / 400);
    if (elapsed < 1500) return lerpColor(DEEP_GOLD, WARM_AMBER, (elapsed - 600) / 900);
    if (elapsed < 4000) return lerpColor(WARM_AMBER, INCANDESCENT, (elapsed - 1500) / 2500);
    return INCANDESCENT;
  };

  const glowFromElapsed = (elapsed, baseSize) => {
    if (elapsed < 150) return 'none';
    if (elapsed < 600) {
      const t = (elapsed - 150) / 450;
      return `0 0 ${baseSize * t}px rgba(212, 175, 55, ${0.15 + t * 0.3})`;
    }
    if (elapsed < 1500) {
      const t = (elapsed - 600) / 900;
      return `0 0 ${baseSize + t * 8}px rgba(210, 140, 10, ${0.4 + t * 0.25})`;
    }
    const t = Math.min(1, (elapsed - 1500) / 2500);
    return `0 0 ${baseSize + 8 + t * 6}px rgba(245, 215, 160, ${0.5 + t * 0.3}), 0 0 ${baseSize + 16 + t * 10}px rgba(212, 175, 55, ${0.15 + t * 0.15})`;
  };

  const enrichment = Math.min(1, Math.log10(totalAveMarias + 1) / 7.8);
  const glowSize = 6 + enrichment * 10;
  const now = Date.now();
  const notStarted = charProgressIndex < 0 && !isPrayerComplete && !isVersoComplete;

  void warmthTick;

  return (
    <div ref={ref} style={{ textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
      {words.map((word, wordIdx) => {
        const letters = word.split('');
        const baseGlobal = wordCharOffsets[wordIdx];

        const renderedLetters = letters.map((letter, letterIdx) => {
          const gi = baseGlobal + letterIdx; 

          if (notStarted && gi === 0) {
            return (
              <span key={letterIdx} style={{
                animation: 'pulse-first-letter 2s ease-in-out infinite',
                display: 'inline-block'
              }}>{letter}</span>
            );
          }

          if (notStarted) {
            return <span key={letterIdx} style={{ color: toRGB(UNREAD), display: 'inline-block' }}>{letter}</span>;
          }

          const seed = gi * 13 + wordIdx * 7;
          const fontVariation = {
            fontWeight: simpleMode ? 700 : (700 + (seed % 3 === 0 ? 100 : 0)),
            fontSize: simpleMode ? '2rem' : 'inherit',
            letterSpacing: simpleMode ? '0.5px' : `${Math.max(0.2, (seed % 5 - 2) * 0.1)}px`,
            opacity: 1 - (seed % 11) * 0.015,
            display: 'inline-block',
            transform: simpleMode ? 'none' : `rotate(${(seed % 7 - 3.5) * 0.1}deg) translateY(${(seed % 13 - 6.5) * 0.1}px)`
          };

          if (isPrayerComplete || isVersoComplete) {
            const dwells = charDwellRef.current.filter(d => d !== undefined && d !== null);
            const avgDwell = dwells.length > 0
              ? dwells.reduce((s, d) => s + d, 0) / dwells.length
              : 200;
            const flashAnim = avgDwell < 150 ? 'verse-flash-silver' : 'verse-flash-gold';
            return (
              <span key={letterIdx} style={{
                ...fontVariation,
                animation: `${flashAnim} 0.3s ease-out forwards`,
              }}>{letter}</span>
            );
          }

          const dist = gi - charProgressIndex; 

          if (dist < 0) {
            const dwell = Math.max(200, charDwellRef.current[gi] || 0);
            const color = colorFromElapsed(dwell);
            const shadow = glowFromElapsed(dwell, glowSize);
            return (
              <span key={letterIdx} style={{
                ...fontVariation,
                color: toRGB(color),
                textShadow: shadow,
                transition: 'text-shadow 0.15s ease',
              }}>{letter}</span>
            );
          }

          if (dist === 0) {
            const reachedAt = charReachedAtRef.current[gi];
            const liveDwell = Math.max(200, reachedAt ? now - reachedAt : 0);
            const color = colorFromElapsed(liveDwell);
            const shadow = glowFromElapsed(liveDwell, glowSize);
            return (
              <span key={letterIdx} style={{
                ...fontVariation,
                color: toRGB(color),
                textShadow: shadow,
                transition: 'text-shadow 0.10s ease',
              }}>{letter}</span>
            );
          }

          if (dist <= 0) {
            const cursorReachedAt = charReachedAtRef.current[charProgressIndex];
            const cursorDwell = cursorReachedAt ? now - cursorReachedAt : 0;
            const lingerBonus = Math.min(0.35, cursorDwell / 4000); 
            const baseBleed = Math.max(0, 0.45 - (dist - 1) * 0.13);
            const totalHeat = Math.min(0.8, baseBleed + lingerBonus);
            const bleedTarget = cursorDwell > 600 ? GOLD : SILVER; 
            const bleedColor = lerpColor(UNREAD, bleedTarget, totalHeat);
            return (
              <span key={letterIdx} style={{
                ...fontVariation,
                color: toRGB(bleedColor),
                transition: 'color 0.08s linear',
              }}>{letter}</span>
            );
          }

          return <span key={letterIdx} style={{ ...fontVariation, color: toRGB(UNREAD), transition: 'color 0.1s ease' }}>{letter}</span>;
        });

        return (
          <React.Fragment key={`${wordIdx}`}>
            <span 
              ref={el => { if (wordSpanRefs.current) wordSpanRefs.current[wordIdx] = el; }}
              style={{ display: 'inline-block' }}
            >
              {renderedLetters}
            </span>
            {wordIdx < words.length - 1 && <span style={{ display: 'inline-block' }}> </span>}
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default SacredText;

