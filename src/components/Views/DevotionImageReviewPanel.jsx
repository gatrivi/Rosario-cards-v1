import React, { useMemo, useState } from 'react';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../../utils/bookletSequence';
import { getBookletDevotionLabel } from '../../utils/bookletShare';
import {
  listImages,
  isTextHeavyImageEntry,
} from '../../data/imageRegistry';
import {
  clearPrayerAssignment,
  getPrayerAssignmentValue,
  resolveAssignmentValue,
  savePrayerAssignment,
} from '../../utils/imageAssignments';
import { getPrayerImageCandidates } from '../../utils/prayerImages';

const REVIEW_KEY = 'rosario_image_reviewed_steps';

function loadReviewed() {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function persistReviewed(reviewed) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(Array.from(reviewed)));
  } catch (_) { /* quota */ }
}

function devotionLabel(id) {
  const meta = getBookletDevotionLabel(id);
  return meta?.title || id;
}

export default function DevotionImageReviewPanel() {
  const [devotion, setDevotion] = useState(BOOKLET_MYSTERY_IDS[0]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [pickerFor, setPickerFor] = useState(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [reviewed, setReviewed] = useState(loadReviewed);
  const [, refresh] = useState(0);
  const images = listImages().filter((entry) => !isTextHeavyImageEntry(entry));

  const sequence = useMemo(() => {
    try {
      return buildSequence(devotion, { novenaDay: 1, includeMercyOpening: true }) || [];
    } catch (_) {
      return [];
    }
  }, [devotion]);

  const rows = useMemo(() => sequence.map((step, index) => {
    const key = `${devotion}:${index}`;
    const assignedId = getPrayerAssignmentValue(step.id);
    const candidates = getPrayerImageCandidates(step, devotion).filter(Boolean);
    return {
      key,
      index,
      step,
      assignedId,
      assignedPath: resolveAssignmentValue(assignedId),
      candidates,
      preview: resolveAssignmentValue(assignedId) || candidates[0] || step.img,
      isReviewed: reviewed.has(key),
    };
  }), [sequence, devotion, reviewed]);

  const visibleRows = rows.filter((row) => {
    const haystack = `${row.step.id} ${row.step.title || ''}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (filter === 'unreviewed') return !row.isReviewed;
    if (filter === 'assigned') return Boolean(row.assignedId);
    if (filter === 'missing') return !row.preview;
    return true;
  });

  const reviewedCount = rows.filter((row) => row.isReviewed).length;
  const toggleReviewed = (key) => {
    setReviewed((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      persistReviewed(next);
      return next;
    });
  };

  const assign = (row, imageId) => {
    savePrayerAssignment(row.step.id, imageId);
    setPickerFor(null);
    refresh((value) => value + 1);
  };

  const clear = (row) => {
    clearPrayerAssignment(row.step.id);
    refresh((value) => value + 1);
  };

  const pickerImages = images.filter((entry) => {
    if (!pickerQuery) return true;
    return `${entry.id} ${entry.name || ''} ${(entry.tags || []).join(' ')}`
      .toLowerCase().includes(pickerQuery.toLowerCase());
  });

  return (
    <div>
      <p style={copyStyle}>
        Recorre cada devocion en orden. Guarda las asignaciones y el estado revisado en este dispositivo.
      </p>

      <div style={toolbarStyle}>
        <select value={devotion} onChange={(event) => setDevotion(event.target.value)} style={inputStyle}>
          {BOOKLET_MYSTERY_IDS.map((id) => (
            <option key={id} value={id}>{devotionLabel(id)}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar paso..."
          style={inputStyle}
        />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} style={inputStyle}>
          <option value="all">Todos ({rows.length})</option>
          <option value="unreviewed">Sin revisar ({rows.length - reviewedCount})</option>
          <option value="assigned">Asignados</option>
          <option value="missing">Sin imagen</option>
        </select>
      </div>

      <div style={progressStyle}>
        {reviewedCount} / {rows.length} revisados
        <button type="button" onClick={() => { setReviewed(new Set()); persistReviewed(new Set()); }} style={smallButtonStyle}>
          Reiniciar progreso
        </button>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {visibleRows.map((row) => (
          <div key={row.key} style={rowStyle(row.isReviewed)}>
            <input
              type="checkbox"
              checked={row.isReviewed}
              onChange={() => toggleReviewed(row.key)}
              aria-label={`Marcar revisado ${row.step.title || row.step.id}`}
            />
            <div style={thumbStyle}>
              {row.preview ? <img src={row.preview} alt="" style={imageStyle} /> : <span style={{ color: '#777' }}>sin imagen</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#D4AF37', fontSize: '0.8rem' }}>{row.index + 1}. {row.step.title || row.step.id}</div>
              <div style={{ color: '#666', fontSize: '0.68rem' }}>{row.step.id} · {row.assignedId ? `asignada: ${row.assignedId}` : `${row.candidates.length} predeterminada(s)`}</div>
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setPickerFor(row); setPickerQuery(''); }} style={smallButtonStyle}>Cambiar</button>
              {row.assignedId && <button type="button" onClick={() => clear(row)} style={smallButtonStyle}>Predeterminada</button>}
            </div>
          </div>
        ))}
      </div>

      {!visibleRows.length && <p style={copyStyle}>No hay pasos con este filtro.</p>}

      {pickerFor && (
        <div style={modalBackdrop} role="presentation" onClick={() => setPickerFor(null)}>
          <div style={modalStyle} role="dialog" aria-label="Elegir imagen" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
              <strong style={{ color: '#D4AF37' }}>Imagen para {pickerFor.step.title || pickerFor.step.id}</strong>
              <button type="button" onClick={() => setPickerFor(null)} style={smallButtonStyle}>Cerrar</button>
            </div>
            <input value={pickerQuery} onChange={(event) => setPickerQuery(event.target.value)} placeholder="Buscar imagen..." style={{ ...inputStyle, width: '100%', margin: '12px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', maxHeight: '55vh', overflow: 'auto' }}>
              {pickerImages.map((entry) => (
                <button key={entry.id} type="button" onClick={() => assign(pickerFor, entry.id)} style={pickerButtonStyle} title={entry.name || entry.id}>
                  <img src={entry.path} alt={entry.name || entry.id} style={{ width: '100%', height: '75px', objectFit: 'cover', borderRadius: '5px' }} />
                  <span>{entry.name || entry.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const copyStyle = { color: '#888', fontSize: '0.8rem', margin: '0 0 12px', lineHeight: 1.4 };
const toolbarStyle = { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' };
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '8px 10px', color: '#E0E0E0', fontSize: '0.8rem', flex: '1 1 180px' };
const progressStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#aaa', fontSize: '0.75rem', marginBottom: '10px' };
const smallButtonStyle = { padding: '6px 8px', border: '1px solid #444', borderRadius: '6px', background: 'transparent', color: '#D4AF37', cursor: 'pointer', fontSize: '0.7rem' };
const rowStyle = (reviewed) => ({ display: 'grid', gridTemplateColumns: '22px 72px minmax(0, 1fr) auto', gap: '9px', alignItems: 'center', padding: '8px', borderRadius: '9px', border: `1px solid ${reviewed ? 'rgba(111,207,151,0.45)' : '#2a2a2a'}`, background: reviewed ? 'rgba(111,207,151,0.05)' : 'rgba(255,255,255,0.02)' });
const thumbStyle = { width: '72px', height: '54px', background: '#111', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', textAlign: 'center' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const modalBackdrop = { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' };
const modalStyle = { width: 'min(760px, 100%)', maxHeight: '90vh', overflow: 'auto', background: '#121212', border: '1px solid #444', borderRadius: '14px', padding: '14px' };
const pickerButtonStyle = { border: '1px solid #333', borderRadius: '7px', padding: '5px', background: 'rgba(255,255,255,0.04)', color: '#bbb', cursor: 'pointer', textAlign: 'left', fontSize: '0.65rem', overflow: 'hidden' };
