import React, { useEffect, useRef, useState } from 'react';
import { OPTIONAL_PRAYERS } from '../../data/optionalPrayers';
import './OptionalPrayerSheet.css';

export default function OptionalPrayerSheet({ onClose, initialPrayerId }) {
  const start =
    OPTIONAL_PRAYERS.find((p) => p.id === initialPrayerId) || OPTIONAL_PRAYERS[0];
  const [prayerId, setPrayerId] = useState(start.id);
  const [variantId, setVariantId] = useState(start.variants[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollRef = useRef(null);

  const prayer = OPTIONAL_PRAYERS.find((p) => p.id === prayerId) || OPTIONAL_PRAYERS[0];
  const variant =
    prayer.variants.find((v) => v.id === variantId) || prayer.variants[0];

  const pickPrayer = (id) => {
    setPrayerId(id);
    const p = OPTIONAL_PRAYERS.find((x) => x.id === id);
    if (p && !p.variants.some((v) => v.id === variantId)) {
      setVariantId(p.variants[0].id);
    }
    setPickerOpen(false);
  };

  // New prayer → snap back to full-bleed opening art.
  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 });
  }, [prayerId]);

  const bg = prayer.img || prayer.imgCandidates?.[0];

  return (
    <div className="optional-prayer-backdrop" onClick={onClose} role="presentation">
      <div
        className="optional-prayer-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Oración breve: ${prayer.title}`}
      >
        <div className="optional-prayer-sheet__scroll" ref={scrollRef}>
          <section className="optional-prayer-sheet__opening">
            {bg ? (
              <img
                className="optional-prayer-sheet__art"
                src={bg}
                alt=""
                draggable={false}
              />
            ) : (
              <div className="optional-prayer-sheet__art optional-prayer-sheet__art--empty" />
            )}
            <header className="optional-prayer-sheet__toolbar">
              <div>
                <p className="optional-prayer-sheet__eyebrow">Oración breve</p>
                <h2 className="optional-prayer-sheet__heading">{prayer.title}</h2>
              </div>
              <button
                type="button"
                className="optional-prayer-sheet__x"
                aria-label="Cerrar"
                onClick={onClose}
              >
                ×
              </button>
            </header>
            <div className="optional-prayer-sheet__opening-fade" aria-hidden="true" />
          </section>

          <div className="optional-prayer-sheet__body">
            <p className="optional-prayer-sheet__hint">
              Pausa breve · tu lugar en el Rosario queda guardado.
            </p>

            <div className="optional-prayer-sheet__title-row">
              <h3 className="optional-prayer-sheet__title">{prayer.title}</h3>
              <button
                type="button"
                className="optional-prayer-sheet__change"
                onClick={() => setPickerOpen((o) => !o)}
                aria-expanded={pickerOpen}
              >
                Cambiar oración
              </button>
            </div>

            {pickerOpen ? (
              <div className="optional-prayer-sheet__picker" role="listbox" aria-label="Elegir oración">
                {OPTIONAL_PRAYERS.map((p) => {
                  const thumb = p.img || p.imgCandidates?.[0];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={p.id === prayerId}
                      className={`optional-prayer-sheet__pick${p.id === prayerId ? ' active' : ''}`}
                      onClick={() => pickPrayer(p.id)}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" className="optional-prayer-sheet__pick-art" />
                      ) : null}
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="optional-prayer-sheet__langs" role="group" aria-label="Versión">
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
                <p key={i}>{line || '\u00a0'}</p>
              ))}
            </div>
          </div>
        </div>

        <footer className="optional-prayer-sheet__footer">
          <button type="button" className="optional-prayer-sheet__close" onClick={onClose}>
            Volver al Rosario
          </button>
        </footer>
      </div>
    </div>
  );
}
