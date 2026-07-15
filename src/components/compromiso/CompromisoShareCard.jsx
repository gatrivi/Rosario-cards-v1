import React, { forwardRef } from 'react';
import '../common/PrayerShareCard.css';
import './CompromisoShareCard.css';

/**
 * Off-screen card for compromiso PNG capture (html2canvas).
 * App URL on the card is decorative only — real link goes in Web Share text.
 */
const CompromisoShareCard = forwardRef(function CompromisoShareCard(
  {
    headline,
    body,
    progressLabel,
    brandLine = 'Rosario Cards',
    urlLine = '',
    fulfilled = false,
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={`prayer-share-card compromiso-share-card${fulfilled ? ' compromiso-share-card--done' : ''}`}
      aria-hidden="true"
    >
      <div className="prayer-share-card__bg">
        <div className="compromiso-share-card__wash" />
        <div className="prayer-share-card__bg-shade" />
      </div>

      <div className="prayer-share-card__frame">
        <div className="prayer-share-card__ornament" aria-hidden="true">✦</div>

        <p className="prayer-share-card__devotion">
          {fulfilled ? 'Ya recé' : 'Compromiso'}
        </p>
        {progressLabel ? (
          <p className="prayer-share-card__devotion-sub">{progressLabel}</p>
        ) : null}

        <h2 className="prayer-share-card__title">{headline}</h2>

        <div className="prayer-share-card__text-wrap">
          <p className="prayer-share-card__text">{body}</p>
        </div>

        {urlLine ? (
          <p className="compromiso-share-card__url">{urlLine}</p>
        ) : null}

        <p className="prayer-share-card__brand">{brandLine}</p>
      </div>
    </div>
  );
});

export default CompromisoShareCard;
