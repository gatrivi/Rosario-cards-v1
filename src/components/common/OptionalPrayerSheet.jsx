import React, { useState } from 'react';
import { OPTIONAL_PRAYERS } from '../../data/optionalPrayers';
import { applyVariantToVoiceLang } from '../../utils/voicePrefs';
import './OptionalPrayerSheet.css';

export default function OptionalPrayerSheet({ onClose, initialPrayerId }) {
  const start =
    OPTIONAL_PRAYERS.find((p) => p.id === initialPrayerId) || OPTIONAL_PRAYERS[0];
  const [prayerId, setPrayerId] = useState(start.id);
  const [variantId, setVariantId] = useState(start.variants[0].id);

  const prayer = OPTIONAL_PRAYERS.find((p) => p.id === prayerId) || OPTIONAL_PRAYERS[0];
  const variant =
    prayer.variants.find((v) => v.id === variantId) || prayer.variants[0];

  const pickLang = (id) => {
    setVariantId(id);
    applyVariantToVoiceLang(id);
  };

  const pickPrayer = (id) => {
    setPrayerId(id);
    const p = OPTIONAL_PRAYERS.find((x) => x.id === id);
    if (p && !p.variants.some((v) => v.id === variantId)) {
      const next = p.variants[0].id;
      setVariantId(next);
      applyVariantToVoiceLang(next);
    }
  };

  const bg = prayer.img || prayer.imgCandidates?.[0];

  return (
    <div className="optional-prayer-backdrop" onClick={onClose} role="presentation">
      <div
        className="optional-prayer-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Oración opcional"
      >
        {bg ? (
          <img
            className="optional-prayer-sheet__art"
            src={bg}
            alt=""
            draggable={false}
          />
        ) : null}
        <p className="optional-prayer-sheet__hint">
          No cambia tu lugar en el rosario. Cierra para seguir.
        </p>
        <div className="optional-prayer-sheet__tabs">
          {OPTIONAL_PRAYERS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`optional-prayer-sheet__tab${p.id === prayerId ? ' active' : ''}`}
              onClick={() => pickPrayer(p.id)}
            >
              {p.title}
            </button>
          ))}
        </div>
        <div className="optional-prayer-sheet__langs">
          {prayer.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`optional-prayer-sheet__lang${v.id === variant.id ? ' active' : ''}`}
              onClick={() => pickLang(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="optional-prayer-sheet__text">
          {variant.text.split('\n').map((line, i) => (
            <p key={i}>{line || '\u00a0'}</p>
          ))}
        </div>
        <button type="button" className="optional-prayer-sheet__close" onClick={onClose}>
          Seguir con el rosario
        </button>
      </div>
    </div>
  );
}
