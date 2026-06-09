import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PRAY_FOR_PRESETS } from '../../data/prayForDefaults';
import {
  addFromDrawer,
  addPrayForIntention,
  addPrayForIntentions,
  loadPrayForDrawer,
  loadPrayForIntentions,
  removePrayForIntention,
  savePrayForIntentions,
  updatePrayForIntention,
} from '../../utils/prayForStore';
import { playOrbTapChime } from '../../utils/bookletSounds';
import OrbPhotoCrop from './OrbPhotoCrop';
import './PrayForOrbs.css';

function defaultIntentionLabel(index) {
  return `Intención ${index + 1}`;
}

function DrawerItem({ item, onAdd, onCrop }) {
  const timerRef = useRef(null);
  const longRef = useRef(false);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <button
      type="button"
      className="pray-for-picker__drawer-item"
      title={item.label}
      onPointerDown={() => {
        longRef.current = false;
        clear();
        if (!item.image) return;
        timerRef.current = setTimeout(() => {
          longRef.current = true;
          onCrop(item);
        }, 600);
      }}
      onPointerUp={() => {
        clear();
        if (!longRef.current) onAdd(item.drawerId);
      }}
      onPointerLeave={clear}
      onPointerCancel={clear}
    >
      {item.image ? (
        <OrbImage intention={item} />
      ) : (
        <span className="pray-for-picker__emoji">{item.emoji || '🕯️'}</span>
      )}
    </button>
  );
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
        style={{ transform: `scale(${zoom}) translate(${ox}%, ${oy}%)` }}
      />
    </div>
  );
}

function IntentionOrb({
  intention,
  onRemove,
  onEdit,
  size = 'md',
  index = 0,
  offering = false,
  soundEnabled = true,
}) {
  const [revealed, setRevealed] = useState(false);
  const pressTimerRef = useRef(null);
  const longPressedRef = useRef(false);
  const hideTimerRef = useRef(null);

  const clearPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setRevealed(false), 2800);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.pray-for-orb__remove, .pray-for-orb__edit')) return;
    longPressedRef.current = false;
    clearPress();
    pressTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      setRevealed(true);
      scheduleHide();
    }, 600);
  };

  const handlePointerUp = () => {
    clearPress();
    if (!longPressedRef.current && !revealed) {
      playOrbTapChime(soundEnabled);
    }
  };

  return (
    <div
      className={`pray-for-orb pray-for-orb--${size}${offering ? ' pray-for-orb--offering' : ''}${revealed ? ' pray-for-orb--revealed' : ''}`}
      style={{ '--orb-i': index }}
      title={intention.label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={clearPress}
      onPointerCancel={clearPress}
    >
      <span className="pray-for-orb__halo" aria-hidden="true" />
      {intention.image ? (
        <OrbImage intention={intention} />
      ) : (
        <span className="pray-for-orb__emoji">{intention.emoji || '🕯️'}</span>
      )}
      {onEdit && intention.image && revealed && (
        <button
          type="button"
          className="pray-for-orb__edit"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(intention);
            setRevealed(false);
          }}
          aria-label={`Ajustar foto de ${intention.label}`}
        >
          ✎
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className="pray-for-orb__remove"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(intention.id);
            setRevealed(false);
          }}
          aria-label={`Quitar ${intention.label}`}
        >
          ×
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

  const refresh = useCallback((list) => {
    setIntentions(list);
    savePrayForIntentions(list);
  }, []);

  const refreshDrawer = useCallback(() => {
    setDrawer(loadPrayForDrawer());
  }, []);

  useEffect(() => {
    if (pickerOpen) refreshDrawer();
  }, [pickerOpen, refreshDrawer]);

  const handleRemove = (id) => {
    refresh(removePrayForIntention(id));
    refreshDrawer();
  };

  const togglePreset = (preset) => {
    const exists = intentions.some((i) => i.id === preset.id);
    if (exists) {
      handleRemove(preset.id);
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
      refresh(addPrayForIntention({ label: nameParts[0], emoji: '🕊️' }));
    } else if (photoPreviews.length === 1) {
      const p = photoPreviews[0];
      refresh(
        addPrayForIntention({
          label: nameParts[0] || defaultIntentionLabel(0),
          image: p.image,
          imageZoom: p.zoom,
          imageOffsetX: p.offsetX,
          imageOffsetY: p.offsetY,
        })
      );
    } else {
      const entries = photoPreviews.map((item, i) => ({
        label: nameParts[i] || nameParts[0] || defaultIntentionLabel(i),
        image: item.image,
        imageZoom: item.zoom,
        imageOffsetX: item.offsetX,
        imageOffsetY: item.offsetY,
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

  const addDrawerItem = (drawerId) => {
    refresh(addFromDrawer(drawerId));
    refreshDrawer();
  };

  const saveCropEdit = () => {
    if (!cropEdit) return;
    if (cropEdit.intentionId) {
      refresh(
        updatePrayForIntention(cropEdit.intentionId, {
          imageZoom: cropEdit.zoom,
          imageOffsetX: cropEdit.offsetX,
          imageOffsetY: cropEdit.offsetY,
        })
      );
    } else if (cropEdit.previewIndex !== undefined) {
      setPhotoPreviews((prev) =>
        prev.map((p, i) =>
          i === cropEdit.previewIndex
            ? { ...p, zoom: cropEdit.zoom, offsetX: cropEdit.offsetX, offsetY: cropEdit.offsetY }
            : p
        )
      );
    } else if (cropEdit.drawerId) {
      const item = loadPrayForDrawer().find((d) => d.drawerId === cropEdit.drawerId);
      if (item) {
        refresh(
          addPrayForIntention({
            label: item.label,
            image: item.image,
            imageZoom: cropEdit.zoom,
            imageOffsetX: cropEdit.offsetX,
            imageOffsetY: cropEdit.offsetY,
          })
        );
        refreshDrawer();
      }
    }
    setCropEdit(null);
  };

  const canConfirm = photoPreviews.length > 0 || photoNames.trim().length > 0;

  const drawerAvailable = drawer.filter((d) => {
    if (d.presetId) return !intentions.some((i) => i.id === d.presetId);
    return !intentions.some(
      (i) => i.image === d.image && i.label === d.label && !d.presetId
    );
  });

  return (
    <div className={`pray-for-bar${variant === 'header' ? ' pray-for-bar--header' : ''}`}>
      <div className="pray-for-bar__orbs">
        <div className="pray-for-bar__scroll">
          {intentions.map((item, index) => (
            <IntentionOrb
              key={item.id}
              intention={item}
              index={index}
              size={simpleMode ? 'lg' : 'md'}
              offering={offeringPulse}
              soundEnabled={soundEnabled}
              onRemove={handleRemove}
              onEdit={(intention) =>
                setCropEdit({
                  image: intention.image,
                  zoom: intention.imageZoom ?? 1,
                  offsetX: intention.imageOffsetX ?? 0,
                  offsetY: intention.imageOffsetY ?? 0,
                  intentionId: intention.id,
                })
              }
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
            <h3 className="pray-for-picker__title">¿Por quién rezas?</h3>
            <p className="pray-for-picker__sub">
              Elige una intención, recupera una guardada, o sube fotos.
            </p>

            {drawerAvailable.length > 0 && (
              <div className="pray-for-picker__drawer">
                <p className="pray-for-picker__section-label">Guardadas</p>
                <div className="pray-for-picker__drawer-row">
                  {drawerAvailable.map((item) => (
                    <DrawerItem
                      key={item.drawerId}
                      item={item}
                      onAdd={addDrawerItem}
                      onCrop={(d) =>
                        setCropEdit({
                          image: d.image,
                          zoom: d.imageZoom ?? 1,
                          offsetX: d.imageOffsetX ?? 0,
                          offsetY: d.imageOffsetY ?? 0,
                          drawerId: d.drawerId,
                        })
                      }
                    />
                  ))}
                </div>
                <p className="pray-for-picker__drawer-hint">
                  Toca para añadir · mantén pulsado una foto para ajustar encuadre
                </p>
              </div>
            )}

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
                  zoom={photoPreviews[0].zoom}
                  offsetX={photoPreviews[0].offsetX}
                  offsetY={photoPreviews[0].offsetY}
                  onChange={(crop) =>
                    setPhotoPreviews([{ ...photoPreviews[0], ...crop }])
                  }
                />
              )}
              {photoPreviews.length > 1 && (
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
