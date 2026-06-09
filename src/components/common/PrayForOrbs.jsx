import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PRAY_FOR_PRESETS } from '../../data/prayForDefaults';
import {
  addPrayForIntention,
  addPrayForIntentions,
  loadPrayForDrawer,
  loadPrayForIntentions,
  toggleDrawerActive,
  updateDrawerItem,
  upsertDrawerEntry,
} from '../../utils/prayForStore';
import { playOrbTapChime } from '../../utils/bookletSounds';
import OrbPhotoCrop, { orbPhotoTransform } from './OrbPhotoCrop';
import './OrbPhotoCrop.css';
import './PrayForOrbs.css';

function defaultIntentionLabel(index) {
  return `Intención ${index + 1}`;
}

function OrbImage({ intention }) {
  const zoom = intention.imageZoom ?? 1;
  const ox = intention.imageOffsetX ?? 0;
  const oy = intention.imageOffsetY ?? 0;
  return (
    <div className="pray-for-orb__photo-wrap">
      <img
        src={intention.image}
        alt=""
        draggable={false}
        className="orb-crop__img"
        style={{ transform: orbPhotoTransform(zoom, ox, oy) }}
      />
    </div>
  );
}

function IntentionOrb({ intention, index = 0, offering = false, soundEnabled = true }) {
  return (
    <div
      className={`pray-for-orb pray-for-orb--md${offering ? ' pray-for-orb--offering' : ''}`}
      style={{ '--orb-i': index }}
      title={intention.label}
      onClick={() => playOrbTapChime(soundEnabled)}
      role="img"
      aria-label={intention.label}
    >
      <span className="pray-for-orb__halo" aria-hidden="true" />
      {intention.image ? (
        <OrbImage intention={intention} />
      ) : (
        <span className="pray-for-orb__emoji">{intention.emoji || '🕯️'}</span>
      )}
    </div>
  );
}

function DrawerItem({ item, onToggle, onCrop }) {
  return (
    <div
      className={`pray-for-picker__drawer-item${item.active ? ' pray-for-picker__drawer-item--active' : ''}`}
    >
      <button
        type="button"
        className="pray-for-picker__drawer-toggle"
        onClick={() => onToggle(item.drawerId)}
        title={item.active ? `Quitar ${item.label} de hoy` : `Rezar por ${item.label}`}
        aria-pressed={item.active}
      >
        {item.image ? (
          <OrbImage intention={item} />
        ) : (
          <span className="pray-for-picker__emoji">{item.emoji || '🕯️'}</span>
        )}
        {item.active && <span className="pray-for-picker__tick" aria-hidden="true">✓</span>}
      </button>
      {item.image && (
        <button
          type="button"
          className="pray-for-picker__drawer-edit"
          onClick={(e) => {
            e.stopPropagation();
            onCrop(item);
          }}
          aria-label={`Ajustar foto de ${item.label}`}
          title="Ajustar encuadre"
        >
          ✎
        </button>
      )}
    </div>
  );
}

export default function PrayForOrbs({
  simpleMode = false,
  offeringPulse = false,
  variant = 'bar',
  soundEnabled = true,
}) {
  const [intentions, setIntentions] = useState(() => loadPrayForIntentions());
  const [drawer, setDrawer] = useState(() => loadPrayForDrawer());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoNames, setPhotoNames] = useState('');
  const [cropEdit, setCropEdit] = useState(null);
  const photoFileRef = useRef(null);

  const sync = useCallback(() => {
    setDrawer(loadPrayForDrawer());
    setIntentions(loadPrayForIntentions());
  }, []);

  useEffect(() => {
    if (pickerOpen) sync();
  }, [pickerOpen, sync]);

  const handleToggleDrawer = (drawerId) => {
    setIntentions(toggleDrawerActive(drawerId));
    setDrawer(loadPrayForDrawer());
  };

  const togglePreset = (preset) => {
    const existing = loadPrayForDrawer().find((d) => d.presetId === preset.id);
    if (existing) {
      handleToggleDrawer(existing.drawerId);
      return;
    }
    setIntentions(
      upsertDrawerEntry(
        {
          label: preset.label,
          image: preset.image || null,
          emoji: preset.emoji || null,
          presetId: preset.id,
        },
        true
      )
    );
    sync();
  };

  const handlePhotoPick = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ image: reader.result, zoom: 1, offsetX: 0, offsetY: 0 });
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
      setIntentions(addPrayForIntention({ label: nameParts[0], emoji: '🕊️' }));
    } else if (photoPreviews.length === 1) {
      const p = photoPreviews[0];
      setIntentions(
        addPrayForIntention({
          label: nameParts[0] || defaultIntentionLabel(0),
          image: p.image,
          imageZoom: p.zoom,
          imageOffsetX: p.offsetX,
          imageOffsetY: p.offsetY,
        })
      );
    } else {
      setIntentions(
        addPrayForIntentions(
          photoPreviews.map((item, i) => ({
            label: nameParts[i] || nameParts[0] || defaultIntentionLabel(i),
            image: item.image,
            imageZoom: item.zoom,
            imageOffsetX: item.offsetX,
            imageOffsetY: item.offsetY,
          }))
        )
      );
    }

    sync();
    setPhotoPreviews([]);
    setPhotoNames('');
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  const clearPhotos = () => {
    setPhotoPreviews([]);
    setPhotoNames('');
    if (photoFileRef.current) photoFileRef.current.value = '';
  };

  const openPreviewCrop = (index) => {
    const p = photoPreviews[index];
    if (!p) return;
    setCropEdit({
      previewIndex: index,
      image: p.image,
      zoom: p.zoom ?? 1,
      offsetX: p.offsetX ?? 0,
      offsetY: p.offsetY ?? 0,
    });
  };

  const saveCropEdit = () => {
    if (!cropEdit) return;
    if (cropEdit.previewIndex !== undefined) {
      setPhotoPreviews((prev) =>
        prev.map((p, i) =>
          i === cropEdit.previewIndex
            ? {
                ...p,
                zoom: cropEdit.zoom,
                offsetX: cropEdit.offsetX,
                offsetY: cropEdit.offsetY,
              }
            : p
        )
      );
      setCropEdit(null);
      return;
    }
    if (!cropEdit.drawerId) return;
    setIntentions(
      updateDrawerItem(cropEdit.drawerId, {
        imageZoom: cropEdit.zoom,
        imageOffsetX: cropEdit.offsetX,
        imageOffsetY: cropEdit.offsetY,
      })
    );
    sync();
    setCropEdit(null);
  };

  const canConfirm = photoPreviews.length > 0 || photoNames.trim().length > 0;

  const sortedDrawer = [...drawer].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return (b.archivedAt || 0) - (a.archivedAt || 0);
  });

  return (
    <div className={`pray-for-bar${variant === 'header' ? ' pray-for-bar--header' : ''}`}>
      <div className="pray-for-bar__orbs">
        <div className="pray-for-bar__scroll">
          {intentions.map((item, index) => (
            <IntentionOrb
              key={item.drawerId || item.id}
              intention={item}
              index={index}
              offering={offeringPulse}
              soundEnabled={soundEnabled}
            />
          ))}
        </div>
        <button
          type="button"
          className="pray-for-add-orb"
          onClick={() => setPickerOpen(true)}
          aria-label="Rezar por alguien"
          title="Rezar por…"
        >
          <span className="pray-for-add-orb__shine" />
          <span className="pray-for-add-orb__icon">🕯️</span>
          {!simpleMode && variant !== 'header' && (
            <span className="pray-for-add-orb__text">Rezar por</span>
          )}
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
            <h3 className="pray-for-picker__title">¿Por quién rezas hoy?</h3>
            <p className="pray-for-picker__sub">
              Toca para activar o desactivar. Las ✓ aparecen en la barra superior.
            </p>

            {sortedDrawer.length > 0 && (
              <div className="pray-for-picker__drawer">
                <p className="pray-for-picker__section-label">Mis intenciones</p>
                <div className="pray-for-picker__drawer-row">
                  {sortedDrawer.map((item) => (
                    <DrawerItem
                      key={item.drawerId}
                      item={item}
                      onToggle={handleToggleDrawer}
                      onCrop={(d) =>
                        setCropEdit({
                          drawerId: d.drawerId,
                          image: d.image,
                          zoom: d.imageZoom ?? 1,
                          offsetX: d.imageOffsetX ?? 0,
                          offsetY: d.imageOffsetY ?? 0,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pray-for-picker__grid">
              {PRAY_FOR_PRESETS.map((preset) => {
                const inDrawer = drawer.find((d) => d.presetId === preset.id);
                const active = inDrawer?.active;
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
                    {active && <span className="pray-for-picker__item-tick">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="pray-for-picker__photos">
              <p className="pray-for-picker__section-label">Fotos nuevas</p>
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
              {photoPreviews.length === 1 && (
                <OrbPhotoCrop
                  image={photoPreviews[0].image}
                  zoom={photoPreviews[0].zoom ?? 1}
                  offsetX={photoPreviews[0].offsetX ?? 0}
                  offsetY={photoPreviews[0].offsetY ?? 0}
                  onChange={(crop) =>
                    setPhotoPreviews([{ ...photoPreviews[0], ...crop }])
                  }
                />
              )}
              {photoPreviews.length > 1 && (
                <>
                  <p className="pray-for-picker__batch-hint">
                    Toca cada foto para ajustar el encuadre antes de añadir.
                  </p>
                  <div className="pray-for-picker__batch-grid">
                    {photoPreviews.map((item, i) => (
                      <button
                        key={`photo-${i}`}
                        type="button"
                        className="pray-for-picker__batch-thumb"
                        onClick={() => openPreviewCrop(i)}
                        title={`Ajustar foto ${i + 1}`}
                      >
                        <OrbImage intention={item} />
                        <span className="pray-for-picker__batch-edit" aria-hidden="true">✎</span>
                      </button>
                    ))}
                  </div>
                </>
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

      {cropEdit && (
        <div
          className="pray-for-picker-backdrop"
          onClick={() => setCropEdit(null)}
          role="presentation"
        >
          <div
            className="pray-for-picker pray-for-picker--crop"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Ajustar foto"
          >
            <h3 className="pray-for-picker__title">Encuadre</h3>
            <OrbPhotoCrop
              image={cropEdit.image}
              zoom={cropEdit.zoom}
              offsetX={cropEdit.offsetX}
              offsetY={cropEdit.offsetY}
              onChange={(crop) => setCropEdit((prev) => ({ ...prev, ...crop }))}
            />
            <button type="button" className="pray-for-picker__ok" onClick={saveCropEdit}>
              Guardar
            </button>
            <button
              type="button"
              className="pray-for-picker__close"
              onClick={() => setCropEdit(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
