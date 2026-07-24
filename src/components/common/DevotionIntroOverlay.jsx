import React from 'react';
import './DevotionIntroOverlay.css';

/**
 * Upper-half intro: art + short blurb before entering a devotion sequence.
 */
export default function DevotionIntroOverlay({ intro, onBegin, onDismiss }) {
  if (!intro) return null;
  return (
    <div
      className="devotion-intro"
      role="dialog"
      aria-modal="true"
      aria-label={`Introducción: ${intro.title}`}
    >
      <button type="button" className="devotion-intro__backdrop" aria-label="Cerrar" onClick={onDismiss} />
      <div className="devotion-intro__card">
        {intro.img ? (
          <div className="devotion-intro__art" style={{ backgroundImage: `url(${intro.img})` }} />
        ) : null}
        <div className="devotion-intro__copy">
          <h2 className="devotion-intro__title">{intro.title}</h2>
          {intro.subtitle ? <p className="devotion-intro__subtitle">{intro.subtitle}</p> : null}
          <p className="devotion-intro__blurb">{intro.blurb}</p>
          <button type="button" className="devotion-intro__begin" onClick={onBegin}>
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
