import React, { useEffect } from 'react';
import LitanyDisplay from '../Litany/LitanyDisplay';
import LitanyProgressBars from '../Litany/LitanyProgressBars';
import { stepContextToVitralVars } from '../../utils/bookletProgress';
import { renderVerseLines } from '../../utils/prayerText';

export default function BookletPrayerPanel({
  displayText,
  simpleMode = false,
  isAveMaria = false,
  isLitany = false,
  litanyVerse,
  litanyVerseIndex = 0,
  litanyVerseTotal = 0,
  litanySections,
  misterioActual,
  stepContext,
  variant = 'booklet',
  onTapNav,
  isTransitioning = false,
}) {
  const vitralStyle = stepContext ? stepContextToVitralVars(stepContext) : {};
  const panelClass =
    variant === 'rosary'
      ? 'booklet-glass-panel booklet-prayer-panel--rosary glass-scroll-panel'
      : 'booklet-glass-panel glass-scroll-panel';

  const handleClick = (e) => {
    if (!onTapNav || isTransitioning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.62) onTapNav('next');
    else if (x < rect.width * 0.38) onTapNav('prev');
  };

  useEffect(() => {
    const preview = displayText ? `${displayText.slice(0, 40)}…` : '(empty)';
    console.log(`📜 BookletPrayerPanel [${variant}]`, {
      prayerId: stepContext?.prayerId,
      displayTextLen: displayText?.length ?? 0,
      preview,
      isLitany,
      isAveMaria,
      litanyVerseIndex,
    });
  }, [variant, displayText, stepContext?.prayerId, isLitany, isAveMaria, litanyVerseIndex]);

  return (
    <article
      className={panelClass}
      style={{ fontSize: simpleMode ? '1.35rem' : '1.08rem' }}
      onClick={onTapNav ? handleClick : undefined}
    >
      {isLitany && litanySections && (
        <LitanyProgressBars
          currentVerseIndex={litanyVerseIndex}
          sections={litanySections}
          currentMystery={misterioActual}
        />
      )}
      <div
        className={`glass-inner booklet-glass-inner stained-glass-overlay booklet-glass-inner--progress${isAveMaria ? ' booklet-glass-inner--ave' : ''}${isLitany ? ' booklet-glass-inner--litany' : ''}`}
        style={{
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.22), inset 0 0 ${24 + (stepContext?.localStep || 0) * 5}px rgba(212, 175, 55, ${0.04 + (parseFloat(vitralStyle['--ave-glare']) || 0.06) * 0.35})`,
        }}
      >
        {isLitany && litanyVerse ? (
          <LitanyDisplay
            verse={litanyVerse}
            verseIndex={litanyVerseIndex}
            totalVerses={litanyVerseTotal}
            currentMystery={misterioActual}
          />
        ) : (
          renderVerseLines(displayText)
        )}
      </div>
    </article>
  );
}
