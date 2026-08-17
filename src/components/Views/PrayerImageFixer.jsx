import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../../utils/bookletSequence';
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
import { upsertLibraryEntry } from '../../utils/imageLibraryStore';
import {
  pushImageLibraryToFirestore,
  uploadImageFile,
} from '../../services/firebaseImageLibrary';
import { isFirebaseConfigured } from '../../config/firebase';

const CORE_ORDER = ['SC', 'AC', 'C', 'P', 'A', 'G', 'F', 'LL', 'S'];
const CORE_SET = new Set(CORE_ORDER);

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildPrayerCatalog() {
  const byId = new Map();

  BOOKLET_MYSTERY_IDS.forEach((mysteryId) => {
    let sequence = [];
    try {
      sequence = buildSequence(mysteryId, {
        novenaDay: 1,
        includeMercyOpening: true,
      }) || [];
    } catch (_) {
      sequence = [];
    }

    sequence.forEach((step) => {
      if (!step?.id) return;
      const existing = byId.get(step.id);
      const candidates = [
        ...(Array.isArray(step.imgCandidates) ? step.imgCandidates : []),
        ...getPrayerImageCandidates(step, mysteryId),
        step.img,
      ].filter(Boolean);

      if (!existing) {
        byId.set(step.id, {
          id: step.id,
          title: step.title || step.id,
          text: step.text || '',
          mysteries: [mysteryId],
          candidates: Array.from(new Set(candidates)),
        });
        return;
      }

      existing.mysteries.push(mysteryId);
      existing.candidates = Array.from(new Set([...existing.candidates, ...candidates]));
      if ((!existing.title || existing.title === existing.id) && step.title) {
        existing.title = step.title;
      }
      if (!existing.text && step.text) existing.text = step.text;
    });
  });

  return Array.from(byId.values()).sort((a, b) => {
    const aCore = CORE_ORDER.indexOf(a.id);
    const bCore = CORE_ORDER.indexOf(b.id);
    if (aCore >= 0 || bCore >= 0) {
      if (aCore < 0) return 1;
      if (bCore < 0) return -1;
      return aCore - bCore;
    }
    return a.title.localeCompare(b.title, 'es');
  });
}

export default function PrayerImageFixer({ onOpenLibrary }) {
  const [scope, setScope] = useState('core');
  const [query, setQuery] = useState('');
  const [pickerFor, setPickerFor] = useState(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [showTextHeavy, setShowTextHeavy] = useState(false);
  const [version, setVersion] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [undo, setUndo] = useState(null);
  const uploadRef = useRef(null);
  const searchRef = useRef(null);
  const statusTimerRef = useRef(null);

  const catalog = useMemo(buildPrayerCatalog, []);
  const images = useMemo(() => {
    void version;
    return listImages();
  }, [version]);

  useEffect(() => () => clearTimeout(statusTimerRef.current), []);

  useEffect(() => {
    if (!pickerFor) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [pickerFor]);

  const showStatus = (message) => {
    clearTimeout(statusTimerRef.current);
    setStatus(message);
    statusTimerRef.current = setTimeout(() => setStatus(''), 3200);
  };

  const rows = useMemo(() => catalog.map((item) => {
    const assignedId = getPrayerAssignmentValue(item.id);
    const assignedPath = resolveAssignmentValue(assignedId);
    return {
      ...item,
      assignedId,
      defaultPreview: item.candidates[0] || null,
      preview: assignedPath || item.candidates[0] || null,
      isCore: CORE_SET.has(item.id),
      isMissing: !assignedPath && !item.candidates[0],
    };
  }), [catalog, version]);

  const visibleRows = rows.filter((row) => {
    if (scope === 'core' && !row.isCore) return false;
    if (scope === 'custom' && !row.assignedId) return false;
    if (scope === 'missing' && !row.isMissing) return false;
    if (!query.trim()) return true;
    const haystack = normalizeText(`${row.id} ${row.title} ${row.text}`);
    return haystack.includes(normalizeText(query.trim()));
  });

  const coreCount = rows.filter((row) => row.isCore).length;
  const customCount = rows.filter((row) => row.assignedId).length;
  const missingCount = rows.filter((row) => row.isMissing).length;

  const beginPick = (row) => {
    setPickerFor(row);
    setPickerQuery('');
    setShowTextHeavy(false);
  };

  const rememberUndo = (row, previous) => {
    setUndo({ prayerId: row.id, title: row.title, previous });
  };

  const assignImage = (row, imageId) => {
    const previous = getPrayerAssignmentValue(row.id);
    savePrayerAssignment(row.id, imageId);
    rememberUndo(row, previous);
    setVersion((value) => value + 1);
    setPickerFor(null);
    showStatus(`Imagen guardada para ${row.title}`);
  };

  const useDefault = (row) => {
    const previous = getPrayerAssignmentValue(row.id);
    if (!previous) return;
    clearPrayerAssignment(row.id);
    rememberUndo(row, previous);
    setVersion((value) => value + 1);
    showStatus(`${row.title}: restaurada la imagen predeterminada`);
  };

  const undoLast = () => {
    if (!undo) return;
    if (undo.previous) savePrayerAssignment(undo.prayerId, undo.previous);
    else clearPrayerAssignment(undo.prayerId);
    setVersion((value) => value + 1);
    showStatus(`Cambio deshecho: ${undo.title}`);
    setUndo(null);
  };

  const uploadAndAssign = async (file) => {
    if (!file || !pickerFor) return;
    if (!isFirebaseConfigured()) {
      showStatus('Firebase no está configurado para subir imágenes');
      return;
    }

    setUploading(true);
    try {
      const previous = getPrayerAssignmentValue(pickerFor.id);
      const entry = await uploadImageFile(file);
      upsertLibraryEntry(entry);
      savePrayerAssignment(pickerFor.id, entry.id);
      rememberUndo(pickerFor, previous);
      await pushImageLibraryToFirestore().catch(() => {});
      setVersion((value) => value + 1);
      showStatus(`Subida y asignada a ${pickerFor.title}`);
      setPickerFor(null);
    } catch (error) {
      showStatus(error?.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const pickerData = useMemo(() => {
    if (!pickerFor) return { suggestedIds: new Set(), entries: [] };

    const pathToId = new Map(images.map((entry) => [String(entry.path), entry.id]));
    const suggestedIds = new Set(
      pickerFor.candidates
        .map((path) => pathToId.get(String(path)))
        .filter(Boolean)
    );
    const q = normalizeText(pickerQuery.trim());

    const entries = images
      .filter((entry) => showTextHeavy || !isTextHeavyImageEntry(entry))
      .filter((entry) => {
        if (!q) return true;
        const haystack = normalizeText(
          `${entry.id} ${entry.name || ''} ${(entry.tags || []).join(' ')}`
        );
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const aSuggested = suggestedIds.has(a.id) ? 1 : 0;
        const bSuggested = suggestedIds.has(b.id) ? 1 : 0;
        if (aSuggested !== bSuggested) return bSuggested - aSuggested;
        return (a.name || a.id).localeCompare(b.name || b.id, 'es');
      });

    return { suggestedIds, entries };
  }, [images, pickerFor, pickerQuery, showTextHeavy]);

  return (
    <div>
      <div style={introStyle}>
        <div>
          <div style={{ color: '#E9D78E', fontWeight: 700, fontSize: '0.95rem' }}>
            Arreglar imágenes de rezos
          </div>
          <div style={{ color: '#8d8d8d', fontSize: '0.76rem', lineHeight: 1.45, marginTop: '3px' }}>
            Elegí un rezo → Cambiar → tocá una imagen. Se guarda al instante.
          </div>
        </div>
        <button type="button" onClick={onOpenLibrary} style={secondaryButtonStyle}>
          + Subir / ordenar arte
        </button>
      </div>

      {(status || undo) && (
        <div style={statusBarStyle} role="status" aria-live="polite">
          <span>{status || `Último cambio: ${undo?.title || ''}`}</span>
          {undo && (
            <button type="button" onClick={undoLast} style={undoButtonStyle}>
              Deshacer
            </button>
          )}
        </div>
      )}

      <div style={toolbarStyle}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar rezo…"
          aria-label="Buscar rezo"
          style={searchStyle}
        />
        <div style={chipsStyle}>
          <FilterChip active={scope === 'core'} onClick={() => setScope('core')}>
            Principales {coreCount}
          </FilterChip>
          <FilterChip active={scope === 'all'} onClick={() => setScope('all')}>
            Todos {rows.length}
          </FilterChip>
          <FilterChip active={scope === 'custom'} onClick={() => setScope('custom')}>
            Cambiados {customCount}
          </FilterChip>
          {missingCount > 0 && (
            <FilterChip active={scope === 'missing'} onClick={() => setScope('missing')}>
              Sin imagen {missingCount}
            </FilterChip>
          )}
        </div>
      </div>

      <div style={cardsStyle}>
        {visibleRows.map((row) => (
          <article key={row.id} style={cardStyle}>
            <button
              type="button"
              onClick={() => beginPick(row)}
              aria-label={`Cambiar imagen de ${row.title}`}
              style={imageButtonStyle}
            >
              {row.preview ? (
                <img src={row.preview} alt="" style={cardImageStyle} />
              ) : (
                <span style={{ color: '#777', fontSize: '0.8rem' }}>Sin imagen</span>
              )}
              <span style={changeBadgeStyle}>Cambiar</span>
            </button>
            <div style={{ padding: '10px 11px 11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#e8e1c7', fontSize: '0.88rem', lineHeight: 1.25, fontWeight: 650 }}>
                    {row.title}
                  </div>
                  <div style={{ color: '#626262', fontSize: '0.65rem', marginTop: '3px' }}>
                    {row.id}
                  </div>
                </div>
                <span style={row.assignedId ? customBadgeStyle : defaultBadgeStyle}>
                  {row.assignedId ? 'elegida' : 'base'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '9px' }}>
                <button type="button" onClick={() => beginPick(row)} style={primaryButtonStyle}>
                  Cambiar imagen
                </button>
                {row.assignedId && (
                  <button type="button" onClick={() => useDefault(row)} style={secondaryButtonStyle}>
                    Base
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!visibleRows.length && (
        <div style={emptyStyle}>
          No encontré rezos con ese filtro.
        </div>
      )}

      {pickerFor && (
        <div style={backdropStyle} role="presentation" onClick={() => setPickerFor(null)}>
          <div
            style={dialogStyle}
            role="dialog"
            aria-modal="true"
            aria-label={`Elegir imagen para ${pickerFor.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={dialogHeaderStyle}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#D4AF37', fontSize: '0.72rem' }}>Imagen para</div>
                <div style={{ color: '#f1ead2', fontSize: '1rem', fontWeight: 700, lineHeight: 1.25 }}>
                  {pickerFor.title}
                </div>
              </div>
              <button type="button" onClick={() => setPickerFor(null)} style={closeButtonStyle} aria-label="Cerrar">
                ×
              </button>
            </div>

            <div style={pickerControlsStyle}>
              <input
                ref={searchRef}
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
                placeholder="Buscar: Fátima, cruz, María, vitral…"
                aria-label="Buscar imagen"
                style={{ ...searchStyle, flex: '1 1 260px' }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => uploadRef.current?.click()}
                style={primaryButtonStyle}
              >
                {uploading ? 'Subiendo…' : 'Subir y usar'}
              </button>
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(event) => uploadAndAssign(event.target.files?.[0])}
              />
            </div>

            <div style={pickerMetaStyle}>
              <span>{pickerData.entries.length} imágenes</span>
              <label style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTextHeavy}
                  onChange={(event) => setShowTextHeavy(event.target.checked)}
                />
                mostrar manuscritos
              </label>
            </div>

            <div style={pickerGridStyle}>
              {pickerData.entries.map((entry) => {
                const suggested = pickerData.suggestedIds.has(entry.id);
                const current = pickerFor.assignedId === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => assignImage(pickerFor, entry.id)}
                    title={`${entry.name || entry.id}${(entry.tags || []).length ? ` · ${(entry.tags || []).join(', ')}` : ''}`}
                    style={pickerCardStyle(current)}
                  >
                    <div style={pickerImageWrapStyle}>
                      <img src={entry.path} alt="" style={pickerImageStyle} />
                      {suggested && <span style={suggestedBadgeStyle}>sugerida</span>}
                      {current && <span style={currentBadgeStyle}>actual</span>}
                    </div>
                    <div style={{ padding: '7px 7px 8px', minWidth: 0 }}>
                      <div style={pickerNameStyle}>{entry.name || entry.id}</div>
                      <div style={pickerTagsStyle}>
                        {(entry.tags || []).slice(0, 3).join(' · ') || entry.id}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {!pickerData.entries.length && (
              <div style={emptyStyle}>
                No hay resultados. Probá otra palabra o subí la obra que querés usar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={filterChipStyle(active)}>
      {children}
    </button>
  );
}

const introStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  padding: '12px',
  border: '1px solid #2c2a22',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, rgba(212,175,55,0.09), rgba(255,255,255,0.02))',
  marginBottom: '12px',
};

const statusBarStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 6,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px',
  padding: '9px 11px',
  border: '1px solid rgba(111,207,151,0.35)',
  borderRadius: '10px',
  background: 'rgba(12,25,18,0.96)',
  color: '#9fdbb8',
  fontSize: '0.76rem',
};

const undoButtonStyle = {
  border: '1px solid rgba(111,207,151,0.45)',
  borderRadius: '8px',
  background: 'transparent',
  color: '#9fdbb8',
  padding: '7px 10px',
  minHeight: '36px',
  cursor: 'pointer',
};

const toolbarStyle = {
  display: 'grid',
  gap: '9px',
  marginBottom: '12px',
};

const searchStyle = {
  width: '100%',
  minHeight: '44px',
  boxSizing: 'border-box',
  border: '1px solid #393939',
  borderRadius: '10px',
  background: '#121212',
  color: '#eee',
  padding: '10px 12px',
  fontSize: '0.88rem',
  outline: 'none',
};

const chipsStyle = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
};

const cardsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
  gap: '12px',
};

const cardStyle = {
  overflow: 'hidden',
  border: '1px solid #292929',
  borderRadius: '13px',
  background: 'rgba(255,255,255,0.025)',
};

const imageButtonStyle = {
  width: '100%',
  height: '160px',
  border: 0,
  padding: 0,
  background: '#0f0f0f',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const changeBadgeStyle = {
  position: 'absolute',
  right: '8px',
  bottom: '8px',
  padding: '5px 8px',
  borderRadius: '999px',
  background: 'rgba(0,0,0,0.76)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: '#fff',
  fontSize: '0.66rem',
};

const customBadgeStyle = {
  flexShrink: 0,
  borderRadius: '999px',
  padding: '3px 6px',
  background: 'rgba(111,207,151,0.12)',
  color: '#79d59e',
  border: '1px solid rgba(111,207,151,0.28)',
  fontSize: '0.6rem',
};

const defaultBadgeStyle = {
  ...customBadgeStyle,
  background: 'transparent',
  color: '#666',
  border: '1px solid #333',
};

const primaryButtonStyle = {
  minHeight: '40px',
  border: '1px solid #9f8530',
  borderRadius: '9px',
  padding: '8px 11px',
  background: 'rgba(212,175,55,0.14)',
  color: '#e6c954',
  cursor: 'pointer',
  fontSize: '0.76rem',
  fontWeight: 650,
};

const secondaryButtonStyle = {
  minHeight: '40px',
  border: '1px solid #383838',
  borderRadius: '9px',
  padding: '8px 11px',
  background: 'rgba(255,255,255,0.025)',
  color: '#aaa',
  cursor: 'pointer',
  fontSize: '0.74rem',
};

const emptyStyle = {
  padding: '22px 12px',
  textAlign: 'center',
  color: '#737373',
  fontSize: '0.82rem',
};

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 20000,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: 'clamp(8px, 2vw, 18px)',
  background: 'rgba(0,0,0,0.84)',
  backdropFilter: 'blur(6px)',
};

const dialogStyle = {
  width: 'min(960px, 100%)',
  maxHeight: '92dvh',
  overflow: 'auto',
  border: '1px solid #3a3423',
  borderRadius: '16px 16px 10px 10px',
  background: '#101010',
  boxShadow: '0 -18px 60px rgba(0,0,0,0.65)',
  padding: 'clamp(10px, 2.5vw, 16px)',
};

const dialogHeaderStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 4,
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  paddingBottom: '10px',
  background: '#101010',
};

const closeButtonStyle = {
  width: '44px',
  height: '44px',
  flexShrink: 0,
  borderRadius: '50%',
  border: '1px solid #383838',
  background: '#171717',
  color: '#bbb',
  cursor: 'pointer',
  fontSize: '1.45rem',
  lineHeight: 1,
};

const pickerControlsStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginBottom: '8px',
};

const pickerMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  color: '#6e6e6e',
  fontSize: '0.68rem',
  padding: '2px 1px 9px',
};

const pickerGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(135px, 45%), 1fr))',
  gap: '8px',
};

const pickerImageWrapStyle = {
  height: '112px',
  position: 'relative',
  overflow: 'hidden',
  background: '#090909',
};

const pickerImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const suggestedBadgeStyle = {
  position: 'absolute',
  left: '5px',
  top: '5px',
  borderRadius: '999px',
  padding: '3px 6px',
  background: 'rgba(212,175,55,0.86)',
  color: '#111',
  fontSize: '0.56rem',
  fontWeight: 700,
};

const currentBadgeStyle = {
  ...suggestedBadgeStyle,
  left: 'auto',
  right: '5px',
  background: 'rgba(111,207,151,0.9)',
};

const pickerNameStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: '#d5d0c0',
  fontSize: '0.7rem',
  textAlign: 'left',
};

const pickerTagsStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: '#5f5f5f',
  fontSize: '0.58rem',
  textAlign: 'left',
  marginTop: '3px',
};

function pickerCardStyle(current) {
  return {
    padding: 0,
    overflow: 'hidden',
    borderRadius: '10px',
    border: current ? '2px solid #6fcf97' : '1px solid #2c2c2c',
    background: 'rgba(255,255,255,0.025)',
    cursor: 'pointer',
  };
}

function filterChipStyle(active) {
  return {
    minHeight: '36px',
    borderRadius: '999px',
    border: `1px solid ${active ? '#9f8530' : '#343434'}`,
    padding: '6px 10px',
    background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
    color: active ? '#e2c14b' : '#858585',
    cursor: 'pointer',
    fontSize: '0.7rem',
  };
}
