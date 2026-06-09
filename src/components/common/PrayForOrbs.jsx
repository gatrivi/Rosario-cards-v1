import React, { useCallback, useRef, useState } from 'react';
import { PRAY_FOR_PRESETS } from '../../data/prayForDefaults';
import {
  addPrayForIntention,
  addPrayForIntentions,
  loadPrayForIntentions,
  removePrayForIntention,
  savePrayForIntentions,
} from '../../utils/prayForStore';
import './PrayForOrbs.css';

function defaultIntentionLabel(index) {
  return `Intención ${index + 1}`;
}

function IntentionOrb({ intention, onRemove, size = 'md', index = 0, offering = false }) {
  const [revealed, setRevealed] = useState(false);

  const handleOrbActivate = (e) => {
    if (!onRemove || e.target.closest('.pray-for-orb__remove')) return;
    setRevealed((r) => !r);
  };

  return (
    <div
      className={`pray-for-orb pray-for-orb--${size}${offering ? ' pray-for-orb--offering' : ''}${revealed ? ' pray-for-orb--revealed' : ''}`}
      style={{ '--orb-i': index }}
      title={intention.label}
      onClick={handleOrbActivate}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setRevealed(false);
      }}
    >
      <span className="pray-for-orb__halo" aria-hidden="true" />
      {intention.image ? (
        <img src={intention.image} alt="" />
      ) : (
        <span className="pray-for-orb__emoji">{intention.emoji || '🕯️'}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className="pray-for-orb__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(intention.id);
          }}
          aria-label={`Quitar ${intention.label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function PrayForOrbs({ simpleMode = false, offeringPulse = false }) {
  const [intentions, setIntentions] = useState(() => loadPrayForIntentions());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoNames, setPhotoNames] = useState('');
  const photoFileRef = useRef(null);

  const refresh = useCallback((list) => {
    setIntentions(list);
    savePrayForIntentions(list);
  }, []);

  const togglePreset = (preset) => {
    const exists = intentions.some((i) => i.id === preset.id);
    if (exists) {
      refresh(removePrayForIntention(preset.id));
      return;
    }
    refresh(addPrayForIntention({ ...preset }));
  };

  const handlePhotoPick = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ image: reader.result });
            reader.readAsDataURL(file);
          })
      )
    ).then((items) => setPhotoPreviews((prev) => [...prev, ...items]));
  };

  const confirmPhotos = () => {
    const nameParts = photoNames
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!photoPreviews.length) {
      if (!nameParts[0]) return;
      refresh(addPrayForIntention({ label: nameParts[0], emoji: '🕊️' }));
    } else if (photoPreviews.length === 1) {
      refresh(
        addPrayForIntention({
          label: nameParts[0] || defaultIntentionLabel(0),
          image: photoPreviews[0].image,
        })
      );
    } else {
      const entries = photoPreviews.map((item, i) => ({
        label: nameParts[i] || nameParts[0] || defaultIntentionLabel(i),
        image: item.image,
      }));
      refresh(addPrayForIntentions(entries));
    }

    setPhotoPreviews([]);
    setPhotoNames('');
    setPickerOpen(false);
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  const clearPhotos = () => {
    setPhotoPreviews([]);
    setPhotoNames('');
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  const canConfirm = photoPreviews.length > 0 || photoNames.trim().length > 0;

  return (
    <div className="pray-for-bar">
      <div className="pray-for-bar__orbs">
        {intentions.map((item, index) => (
          <IntentionOrb
            key={item.id}
            intention={item}
            index={index}
            size={simpleMode ? 'lg' : 'md'}
            offering={offeringPulse}
            onRemove={() => refresh(removePrayForIntention(item.id))}
          />
        ))}
        <button
          type="button"
          className="pray-for-add-orb"
          onClick={() => setPickerOpen(true)}
          aria-label="Rezar por alguien"
          title="Rezar por…"
        >
          <span className="pray-for-add-orb__shine" />
          <span className="pray-for-add-orb__icon">🕯️</span>
          {!simpleMode && <span className="pray-for-add-orb__text">Rezar por</span>}
        </button>
      </div>

      {pickerOpen && (
        <div
          className="pray-for-picker-backdrop"
          onClick={() => setPickerOpen(false)}
          role="presentation"
        >
          <div
            className="pray-for-picker"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Elegir intención de oración"
          >
            <h3 className="pray-for-picker__title">¿Por quién rezas?</h3>
            <p className="pray-for-picker__sub">
              Elige una intención o sube una o varias fotos.
            </p>

            <div className="pray-for-picker__grid">
              {PRAY_FOR_PRESETS.map((preset) => {
                const active = intentions.some((i) => i.id === preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`pray-for-picker__item${active ? ' active' : ''}`}
                    onClick={() => togglePreset(preset)}
                  >
                    {preset.image ? (
                      <img src={preset.image} alt="" />
                    ) : (
                      <span className="pray-for-picker__emoji">{preset.emoji}</span>
                    )}
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pray-for-picker__photos">
              <p className="pray-for-picker__section-label">Fotos</p>
              <button
                type="button"
                className="pray-for-picker__upload pray-for-picker__upload--wide"
                onClick={() => photoFileRef.current?.click()}
              >
                📷 Elegir una o varias fotos
              </button>
              <input
                ref={photoFileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePhotoPick}
              />
              {photoPreviews.length > 0 && (
                <div className="pray-for-picker__batch-grid">
                  {photoPreviews.map((item, i) => (
                    <div key={`photo-${i}`} className="pray-for-picker__batch-thumb">
                      <img src={item.image} alt="" />
                    </div>
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Nombres separados por coma (opcional)"
                value={photoNames}
                onChange={(e) => setPhotoNames(e.target.value)}
                className="pray-for-picker__input"
              />
              <div className="pray-for-picker__batch-actions">
                {(photoPreviews.length > 0 || photoNames) && (
                  <button type="button" className="pray-for-picker__ghost" onClick={clearPhotos}>
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  className="pray-for-picker__ok"
                  disabled={!canConfirm}
                  onClick={confirmPhotos}
                >
                  {photoPreviews.length > 1
                    ? `Añadir ${photoPreviews.length} intenciones`
                    : 'Añadir intención'}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="pray-for-picker__close"
              onClick={() => setPickerOpen(false)}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
