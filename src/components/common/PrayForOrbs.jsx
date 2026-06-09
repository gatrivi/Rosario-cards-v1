import React, { useCallback, useRef, useState } from 'react';
import { PRAY_FOR_PRESETS } from '../../data/prayForDefaults';
import {
  addPrayForIntention,
  loadPrayForIntentions,
  removePrayForIntention,
  savePrayForIntentions,
} from '../../utils/prayForStore';
import './PrayForOrbs.css';

function IntentionOrb({ intention, onRemove, size = 'md' }) {
  return (
    <div className={`pray-for-orb pray-for-orb--${size}`} title={intention.label}>
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

export default function PrayForOrbs({ simpleMode = false }) {
  const [intentions, setIntentions] = useState(() => loadPrayForIntentions());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPreview, setCustomPreview] = useState(null);
  const fileRef = useRef(null);

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

  const confirmCustom = () => {
    const label = customName.trim();
    if (!label) return;
    refresh(
      addPrayForIntention({
        id: `custom-${Date.now()}`,
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

  return (
    <div className="pray-for-bar">
      <div className="pray-for-bar__orbs">
        {intentions.map((item) => (
          <IntentionOrb
            key={item.id}
            intention={item}
            size={simpleMode ? 'lg' : 'md'}
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
              Elige una intención o añade un nombre y foto.
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
                  📷 {customPreview ? 'Cambiar foto' : 'Añadir foto'}
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
