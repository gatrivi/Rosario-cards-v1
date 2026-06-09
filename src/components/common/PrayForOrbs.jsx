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

function labelFromFilename(name) {
  const base = (name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return base || 'Intención';
}

function IntentionOrb({ intention, onRemove, size = 'md', index = 0, offering = false }) {
  return (
    <div
      className={`pray-for-orb pray-for-orb--${size}${offering ? ' pray-for-orb--offering' : ''}`}
      style={{ '--orb-i': index }}
      title={intention.label}
    >
      <span className="pray-for-orb__halo" aria-hidden="true" />
      {intention.image ? (
        <img src={intention.image} alt="" />
      ) : (
        <span className="pray-for-orb__emoji">{intention.emoji || '🕯️'}</span>
      )}
      <span className="pray-for-orb__label">{intention.label}</span>
      {onRemove && (
        <button
          type="button"
          className="pray-for-orb__remove"
          onClick={() => onRemove(intention.id)}
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
  const [customName, setCustomName] = useState('');
  const [customPreview, setCustomPreview] = useState(null);
  const [batchPreviews, setBatchPreviews] = useState([]);
  const [batchNames, setBatchNames] = useState('');
  const fileRef = useRef(null);
  const batchFileRef = useRef(null);

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

  const handleCustomImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCustomPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBatchImages = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                image: reader.result,
                defaultLabel: labelFromFilename(file.name),
              });
            reader.readAsDataURL(file);
          })
      )
    ).then(setBatchPreviews);
  };

  const confirmCustom = () => {
    const label = customName.trim();
    if (!label) return;
    refresh(
      addPrayForIntention({
        label,
        image: customPreview || null,
        emoji: customPreview ? null : '🕊️',
      })
    );
    setCustomName('');
    setCustomPreview(null);
    setPickerOpen(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const confirmBatch = () => {
    if (!batchPreviews.length) return;
    const nameParts = batchNames
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const entries = batchPreviews.map((item, i) => ({
      label: nameParts[i] || nameParts[0] || item.defaultLabel || `Persona ${i + 1}`,
      image: item.image,
    }));
    refresh(addPrayForIntentions(entries));
    setBatchPreviews([]);
    setBatchNames('');
    setPickerOpen(false);
    if (batchFileRef.current) batchFileRef.current.value = '';
  };

  const clearBatch = () => {
    setBatchPreviews([]);
    setBatchNames('');
    if (batchFileRef.current) batchFileRef.current.value = '';
  };

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
              Elige una intención, añade un nombre, o sube varias fotos a la vez.
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

            <div className="pray-for-picker__custom">
              <p className="pray-for-picker__section-label">Una persona</p>
              <input
                type="text"
                placeholder="Nombre (ej. mamá, Juan…)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="pray-for-picker__input"
              />
              <div className="pray-for-picker__custom-row">
                <button
                  type="button"
                  className="pray-for-picker__upload"
                  onClick={() => fileRef.current?.click()}
                >
                  📷 {customPreview ? 'Cambiar foto' : 'Una foto'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleCustomImage}
                />
                {customPreview && (
                  <img src={customPreview} alt="" className="pray-for-picker__preview" />
                )}
              </div>
              <button
                type="button"
                className="pray-for-picker__ok"
                disabled={!customName.trim()}
                onClick={confirmCustom}
              >
                Añadir intención
              </button>
            </div>

            <div className="pray-for-picker__batch">
              <p className="pray-for-picker__section-label">Varias personas a la vez</p>
              <button
                type="button"
                className="pray-for-picker__upload pray-for-picker__upload--wide"
                onClick={() => batchFileRef.current?.click()}
              >
                📷 Elegir varias fotos
              </button>
              <input
                ref={batchFileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleBatchImages}
              />
              {batchPreviews.length > 0 && (
                <>
                  <div className="pray-for-picker__batch-grid">
                    {batchPreviews.map((item, i) => (
                      <div key={`batch-${i}`} className="pray-for-picker__batch-thumb">
                        <img src={item.image} alt="" />
                        <span>{item.defaultLabel}</span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Nombres separados por coma (opcional)"
                    value={batchNames}
                    onChange={(e) => setBatchNames(e.target.value)}
                    className="pray-for-picker__input"
                  />
                  <div className="pray-for-picker__batch-actions">
                    <button type="button" className="pray-for-picker__ghost" onClick={clearBatch}>
                      Limpiar
                    </button>
                    <button type="button" className="pray-for-picker__ok" onClick={confirmBatch}>
                      Añadir {batchPreviews.length} intenciones
                    </button>
                  </div>
                </>
              )}
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
