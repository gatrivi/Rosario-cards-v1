import React, { forwardRef } from 'react';
import './PrayerShareCard.css';

/**
 * Off-screen portrait card rendered for html2canvas capture.
 * 540×720 logical px → 1080×1440 at scale 2.
 */
const PrayerShareCard = forwardRef(function PrayerShareCard(
  {
    devotionTitle,
    devotionSubtitle,
    prayerTitle,
    prayerText,
    backgroundUrl,
    progressLabel,
    brandLine = 'Rosario Cards',
    urlLine = 'rosario.gatrivi.com',
  },
  ref
) {
  return (
    <div ref={ref} className="prayer-share-card" aria-hidden="true">
      <div className="prayer-share-card__bg">
        {backgroundUrl ? (
          <img
            src={backgroundUrl}
            alt=""
            className="prayer-share-card__bg-img"
            crossOrigin="anonymous"
          />
        ) : null}
        <div className="prayer-share-card__bg-shade" />
      </div>

      <div className="prayer-share-card__frame">
        <div className="prayer-share-card__ornament" aria-hidden="true">✦</div>

        <p className="prayer-share-card__devotion">{devotionTitle}</p>
        {devotionSubtitle ? (
          <p className="prayer-share-card__devotion-sub">{devotionSubtitle}</p>
        ) : null}

        <h2 className="prayer-share-card__title">{prayerTitle}</h2>

        <div className="prayer-share-card__text-wrap">
          <p className="prayer-share-card__text">{prayerText}</p>
        </div>

        {progressLabel ? (
          <p className="prayer-share-card__progress">{progressLabel}</p>
        ) : null}

        <p className="prayer-share-card__brand">{brandLine} ✦ {urlLine}</p>
      </div>
    </div>
  );
});

export default PrayerShareCard;
