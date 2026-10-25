import React, { useMemo, useState } from 'react';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../../utils/bookletSequence';
import { getBookletDevotionLabel } from '../../utils/bookletShare';
import {
  listImages,
  isTextHeavyImageEntry,
  saveOverride,
} from '../../data/imageRegistry';
import { LITURGICAL_CATEGORIES, hasLiturgicalCategory } from '../../data/liturgicalCategories';
import {
  clearPrayerAssignment,
  getPrayerAssignmentValue,
  resolveAssignmentValue,
  savePrayerAssignment,
} from '../../utils/imageAssignments';
import { getPrayerImageCandidates } from '../../utils/prayerImages';
import {
  loadRejectedImages,
  rejectImage,
  unrejectImage,
  clearRejectedImages,
} from '../../utils/rejectedImages';

const POOL_QUARANTINE_KEY = 'rosario_image_pool_reviewed';

function loadPoolReviewed() {
  try {
    const raw = localStorage.getItem(POOL_QUARANTINE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function persistPoolReviewed(set) {
  try {
    localStorage.setItem(POOL_QUARANTINE_KEY, JSON.stringify(Array.from(set)));
  } catch (_) { /* quota */ }
}

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
  const [tab, setTab] = useState('steps');
  const [poolReviewed, setPoolReviewed] = useState(loadPoolReviewed);
  const [rejected, setRejected] = useState(loadRejectedImages);
  const [poolFilter, setPoolFilter] = useState('unreviewed');
  const [poolQuery, setPoolQuery] = useState('');
  const [poolKind, setPoolKind] = useState('mary');
  const [poolPage, setPoolPage] = useState(0);
  const [tick, setTick] = useState(0);
  const images = listImages().filter((entry) => !isTextHeavyImageEntry(entry));

  // The catalog ships pre-tagged; this reads it back out of the merged registry,
  // so a rename or re-tag the owner makes in the db shows here immediately.
  const pool = useMemo(() => {
    void tick;
    return listImages().filter((e) => e.pool === poolKind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKind, tick]);
  const rejectedSet = useMemo(() => new Set(rejected), [rejected]);

  const POOL_PAGE = 60;

  const visiblePool = useMemo(() => {
    const needle = poolQuery.trim().toLowerCase();
    return pool.filter((entry) => {
      if (needle) {
        const hay = `${entry.id} ${entry.name || ''} ${entry.theme || ''} ${(entry.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (poolFilter === 'rejected') return rejectedSet.has(entry.id);
      if (poolFilter === 'low') return entry.confidence === 'low';
      if (poolFilter === 'unclassified') return !hasLiturgicalCategory(entry.tags || []);
      if (poolFilter === 'unreviewed') return !poolReviewed.has(entry.id);
      return true;
    });
  }, [pool, poolFilter, poolQuery, poolReviewed, rejectedSet]);

  const pagedPool = visiblePool.slice(poolPage * POOL_PAGE, (poolPage + 1) * POOL_PAGE);
  const poolPages = Math.max(1, Math.ceil(visiblePool.length / POOL_PAGE));

  const togglePoolReviewed = (id) => {
    const next = new Set(poolReviewed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPoolReviewed(next);
    persistPoolReviewed(next);
  };

  const toggleRejected = (id) => {
    if (rejectedSet.has(id)) unrejectImage(id);
    else rejectImage(id);
    setRejected(loadRejectedImages());
  };

  /** Write a tag straight through to the db — this is the owner's edit, not ours. */
  const toggleCategory = (entry, categoryId) => {
    const tags = new Set(entry.tags || []);
    if (tags.has(categoryId)) tags.delete(categoryId);
    else tags.add(categoryId);
    saveOverride(entry.id, { name: entry.name, tags: Array.from(tags) });
    setTick((t) => t + 1);
  };

  const markPoolReviewed = (entries) => {
    const next = new Set(poolReviewed);
    entries.forEach((e) => next.add(e.id));
    setPoolReviewed(next);
    persistPoolReviewed(next);
  };

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
    setTick((value) => value + 1);
  };

  const clear = (row) => {
    clearPrayerAssignment(row.step.id);
    setTick((value) => value + 1);
  };

  const pickerImages = images.filter((entry) => {
    if (!pickerQuery) return true;
    return `${entry.id} ${entry.name || ''} ${(entry.tags || []).join(' ')}`
      .toLowerCase().includes(pickerQuery.toLowerCase());
  });

  return (
    <div>
      <div style={toolbarStyle}>
        <button
          type="button"
          onClick={() => setTab('steps')}
          style={{ ...smallButtonStyle, opacity: tab === 'steps' ? 1 : 0.6 }}
        >
          Pasos ({rows.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('pool')}
          style={{ ...smallButtonStyle, opacity: tab === 'pool' ? 1 : 0.6 }}
        >
          Biblioteca de arte (287)
        </button>
      </div>

      {tab === 'pool' ? (
        <>
          <p style={copyStyle}>
            La biblioteca de arte se clasificó sola por su nombre de archivo, pero las
            categorías y los descartes son tuyos: se guardan en la base y viajan a
            todos tus dispositivos. Una categoría mal puesta o una imagen descartada
            la saca de todos los rezos, para siempre.
          </p>

          <div style={toolbarStyle}>
            <select value={poolKind} onChange={(e) => { setPoolKind(e.target.value); setPoolPage(0); }} style={inputStyle}>
              <option value="mary">María (240)</option>
              <option value="passion">Pasión (47)</option>
            </select>
            <input
              value={poolQuery}
              onChange={(event) => { setPoolQuery(event.target.value); setPoolPage(0); }}
              placeholder="Buscar en la biblioteca..."
              style={inputStyle}
            />
            <select
              value={poolFilter}
              onChange={(event) => { setPoolFilter(event.target.value); setPoolPage(0); }}
              style={inputStyle}
            >
              <option value="unreviewed">Sin revisar</option>
              <option value="unclassified">Sin categoría litúrgica</option>
              <option value="low">Confianza baja</option>
              <option value="rejected">Descartadas ({rejected.length})</option>
              <option value="all">Todas ({pool.length})</option>
            </select>
            <button type="button" onClick={() => markPoolReviewed(visiblePool)} style={smallButtonStyle}>
              Marcar esta página
            </button>
            <button
              type="button"
              onClick={() => { clearRejectedImages(); setRejected(loadRejectedImages()); }}
              style={smallButtonStyle}
            >
              Restaurar descartadas
            </button>
          </div>

          <div style={progressStyle}>
            {poolReviewed.size} revisadas · {rejected.length} descartadas · página{' '}
            {poolPage + 1}/{poolPages} · {visiblePool.length} coinciden
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            {pagedPool.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '6px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  opacity: rejectedSet.has(entry.id) ? 0.4 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={poolReviewed.has(entry.id)}
                  onChange={() => togglePoolReviewed(entry.id)}
                  aria-label={`Marcar revisada ${entry.name}`}
                />
                <img
                  src={entry.path}
                  alt=""
                  style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#eee', fontSize: '0.85rem' }}>{entry.name}</div>
                  <div style={{ color: '#777', fontSize: '0.7rem' }}>
                    {entry.theme}
                    {entry.confidence ? ` · confianza ${entry.confidence === 'high' ? 'alta' : 'baja'}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', maxWidth: 220 }}>
                  {LITURGICAL_CATEGORIES.map((c) => {
                    const on = (entry.tags || []).includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(entry, c.id)}
                        title={c.label}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 5px',
                          borderRadius: '6px',
                          border: `1px solid ${on ? '#D4AF37' : '#333'}`,
                          background: on ? 'rgba(212,175,55,0.2)' : 'transparent',
                          color: on ? '#D4AF37' : '#666',
                          cursor: 'pointer',
                        }}
                      >
                        {c.emoji}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => toggleRejected(entry.id)} style={smallButtonStyle}>
                  {rejectedSet.has(entry.id) ? 'Restaurar' : 'Descartar'}
                </button>
              </div>
            ))}
            {visiblePool.length === 0 ? (
              <p style={copyStyle}>Nada que revisar aquí.</p>
            ) : null}
          </div>

          {poolPages > 1 ? (
            <div style={{ ...toolbarStyle, marginTop: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={poolPage === 0}
                onClick={() => setPoolPage((p) => Math.max(0, p - 1))}
                style={smallButtonStyle}
              >
                ‹ Anterior
              </button>
              <button
                type="button"
                disabled={poolPage >= poolPages - 1}
                onClick={() => setPoolPage((p) => Math.min(poolPages - 1, p + 1))}
                style={smallButtonStyle}
              >
                Siguiente ›
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <>
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
        </>
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
