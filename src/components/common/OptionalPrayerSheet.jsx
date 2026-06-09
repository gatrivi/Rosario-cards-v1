import React, { useState } from 'react';
import { OPTIONAL_PRAYERS } from '../../data/optionalPrayers';
import './OptionalPrayerSheet.css';

export default function OptionalPrayerSheet({ onClose }) {
  const [prayerId, setPrayerId] = useState(OPTIONAL_PRAYERS[0].id);
  const [variantId, setVariantId] = useState('es');

  const prayer = OPTIONAL_PRAYERS.find((p) => p.id === prayerId) || OPTIONAL_PRAYERS[0];
  const variant =
    prayer.variants.find((v) => v.id === variantId) || prayer.variants[0];

  const pickPrayer = (id) => {
    setPrayerId(id);
    const p = OPTIONAL_PRAYERS.find((x) => x.id === id);
    if (p && !p.variants.some((v) => v.id === variantId)) {
      setVariantId(p.variants[0].id);
    }
  };

  return (
    <div className="optional-prayer-backdrop" onClick={onClose} role="presentation">
      <div
        className="optional-prayer-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Oración opcional"
      >
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
              onClick={() => setVariantId(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="optional-prayer-sheet__text">
          {variant.text.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <button type="button" className="optional-prayer-sheet__close" onClick={onClose}>
          Seguir con el rosario
        </button>
      </div>
    </div>
  );
}
