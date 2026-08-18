import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../../utils/bookletSequence';
import { listImages, isTextHeavyImageEntry } from '../../data/imageRegistry';
import {
  clearPrayerAssignment,
  getPrayerAssignmentValue,
  resolveAssignmentValue,
  savePrayerAssignment,
} from '../../utils/imageAssignments';
import { prayerArtAssignmentId } from '../../utils/prayerImages';
import { upsertLibraryEntry } from '../../utils/imageLibraryStore';
import {
  pushImageLibraryToFirestore,
  uploadImageFile,
} from '../../services/firebaseImageLibrary';
import { isFirebaseConfigured } from '../../config/firebase';

const CORE_ORDER = ['SC', 'AC', 'C', 'P', 'A', 'G', 'F', 'LL', 'S'];
const CORE_SET = new Set(CORE_ORDER);

const DEVOTION_LABELS = {
  gozosos: 'Gozosos',
  dolorosos: 'Dolorosos',
  gloriosos: 'Gloriosos',
  luminosos: 'Luminosos',
};

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildPrayerCatalog() {
  const byKey = new Map();

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

      const assignmentId = prayerArtAssignmentId(step.id, mysteryId);
      const assignedPath = resolveAssignmentValue(getPrayerAssignmentValue(assignmentId));
      const candidates = [
        ...(Array.isArray(step.imgCandidates) ? step.imgCandidates : []),
        step.img,
      ]
        .filter(Boolean)
        .filter((path) => !assignedPath || String(path) !== String(assignedPath));

      const existing = byKey.get(assignmentId);
      if (existing) {
        existing.mysteries.add(mysteryId);
        existing.candidates = Array.from(new Set([...existing.candidates, ...candidates]));
        return;
      }

      byKey.set(assignmentId, {
        key: assignmentId,
        assignmentId,
        id: step.id,
        title: step.title || step.id,
        text: step.text || '',
        mysteryId,
        mysteries: new Set([mysteryId]),
        candidates: Array.from(new Set(candidates)),
      });
    });
  });

  return Array.from(byKey.values()).sort((a, b) => {
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

  const catalog = useMemo(buildPrayerCatalog, [version]);
  const images = useMemo(() => {
    void version;
    return listImages();
  }, [version]);

  useEffect(() => () => clearTimeout(statusTimerRef.current), []);
  useEffect(() => {
    if (!pickerFor) return undefined;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [pickerFor]);

  const showStatus = (message) => {
    clearTimeout(statusTimerRef.current);
    setStatus(message);
    statusTimerRef.current = setTimeout(() => setStatus(''), 3200);
  };

  const rows = useMemo(() => {
    const base = catalog.map((item) => {
      const assignedId = getPrayerAssignmentValue(item.assignmentId);
      const assignedPath = resolveAssignmentValue(assignedId);
      const defaultPreview = item.candidates[0] || null;
      return {
        ...item,
        assignedId,
        defaultPreview,
        preview: assignedPath || defaultPreview,
        isCore: CORE_SET.has(item.id),
        isMissing: !assignedPath && !defaultPreview,
      };
    });

    const counts = new Map();
    base.forEach((row) => {
      if (!row.preview) return;
      const key = String(row.preview);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return base.map((row) => ({
      ...row,
      duplicateCount: row.preview ? counts.get(String(row.preview)) || 1 : 0,
    }));
  }, [catalog, version]);

  const visibleRows = rows.filter((row) => {
    if (scope === 'core' && !row.isCore) return false;
    if (scope === 'duplicates' && row.duplicateCount < 2) return false;
    if (scope === 'custom' && !row.assignedId) return false;
    if (scope === 'missing' && !row.isMissing) return false;
    if (query.trim()) {
      const haystack = normalizeText(
        `${row.assignmentId} ${row.title} ${row.text} ${Array.from(row.mysteries).join(' ')}`
      );
      if (!haystack.includes(normalizeText(query.trim()))) return false;
    }
    return true;
  });

  const coreCount = rows.filter((row) => row.isCore).length;
  const customCount = rows.filter((row) => row.assignedId).length;
  const missingCount = rows.filter((row) => row.isMissing).length;
  const duplicateCount = rows.filter((row) => row.duplicateCount > 1).length;

  const beginPick = (row) => {
    setPickerFor(row);
    setPickerQuery('');
    setShowTextHeavy(false);
  };

  const rememberUndo = (row, previous) => {
    setUndo({ assignmentId: row.assignmentId, title: row.title, previous });
  };

  const assignImage = (row, imageId) => {
    const previous = getPrayerAssignmentValue(row.assignmentId);
    savePrayerAssignment(row.assignmentId, imageId);
    rememberUndo(row, previous);
    setVersion((value) => value + 1);
    setPickerFor(null);
    showStatus(`Imagen guardada · ${row.title}`);
  };

  const useDefault = (row) => {
    const previous = getPrayerAssignmentValue(row.assignmentId);
    if (!previous) return;
    clearPrayerAssignment(row.assignmentId);
    rememberUndo(row, previous);
    setVersion((value) => value + 1);
    showStatus(`Restaurada · ${row.title}`);
  };

  const undoLast = () => {
    if (!undo) return;
    if (undo.previous) savePrayerAssignment(undo.assignmentId, undo.previous);
    else clearPrayerAssignment(undo.assignmentId);
    setVersion((value) => value + 1);
    showStatus(`Deshecho · ${undo.title}`);
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
      const previous = getPrayerAssignmentValue(pickerFor.assignmentId);
      const entry = await uploadImageFile(file);
      upsertLibraryEntry(entry);
      savePrayerAssignment(pickerFor.assignmentId, entry.id);
      rememberUndo(pickerFor, previous);
      await pushImageLibraryToFirestore().catch(() => {});
      setVersion((value) => value + 1);
      setPickerFor(null);
      showStatus(`Subida y usada · ${pickerFor.title}`);
    } catch (error) {
      showStatus(error?.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const pickerData = useMemo(() => {
    if (!pickerFor) return { entries: [], suggestedIds: new Set(), currentImageId: null };

    const pathToId = new Map(images.map((entry) => [String(entry.path), entry.id]));
    const suggestedIds = new Set(
      pickerFor.candidates.map((path) => pathToId.get(String(path))).filter(Boolean)
    );
    const currentPath = resolveAssignmentValue(pickerFor.assignedId) || pickerFor.defaultPreview;
    const currentImageId = currentPath ? pathToId.get(String(currentPath)) || null : null;
    const q = normalizeText(pickerQuery.trim());

    const entries = images
      .filter((entry) => showTextHeavy || !isTextHeavyImageEntry(entry))
      .filter((entry) => {
        if (!q) return true;
        return normalizeText(
          `${entry.id} ${entry.name || ''} ${(entry.tags || []).join(' ')}`
        ).includes(q);
      })
      .sort((a, b) => {
        const aCurrent = a.id === currentImageId ? 1 : 0;
        const bCurrent = b.id === currentImageId ? 1 : 0;
        if (aCurrent !== bCurrent) return bCurrent - aCurrent;
        const aSuggested = suggestedIds.has(a.id) ? 1 : 0;
        const bSuggested = suggestedIds.has(b.id) ? 1 : 0;
        if (aSuggested !== bSuggested) return bSuggested - aSuggested;
        return (a.name || a.id).localeCompare(b.name || b.id, 'es');
      });

    return { entries, suggestedIds, currentImageId };
  }, [images, pickerFor, pickerQuery, showTextHeavy]);

  return (
    <div>
      <section style={introStyle}>
        <div>
          <strong style={{ color: '#ead58a' }}>Arreglar imágenes de rezos</strong>
          <div style={mutedStyle}>Rezo → Cambiar → tocá una imagen. Se guarda al instante.</div>
        </div>
        <button type="button" onClick={onOpenLibrary} style={secondaryButtonStyle}>
          + Subir / ordenar arte
        </button>
      </section>

      {(status || undo) && (
        <div style={statusStyle} role="status" aria-live="polite">
          <span>{status || `Último cambio · ${undo?.title || ''}`}</span>
          {undo && <button type="button" onClick={undoLast} style={ghostButtonStyle}>Deshacer</button>}
        </div>
      )}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar rezo…"
        aria-label="Buscar rezo"
        style={searchStyle}
      />

      <div style={chipsStyle}>
        <Chip active={scope === 'core'} onClick={() => setScope('core')}>Principales {coreCount}</Chip>
        <Chip active={scope === 'duplicates'} onClick={() => setScope('duplicates')}>Duplicadas {duplicateCount}</Chip>
        <Chip active={scope === 'missing'} onClick={() => setScope('missing')}>Sin imagen {missingCount}</Chip>
        <Chip active={scope === 'custom'} onClick={() => setScope('custom')}>Cambiadas {customCount}</Chip>
        <Chip active={scope === 'all'} onClick={() => setScope('all')}>Todas {rows.length}</Chip>
      </div>

      <div style={cardsStyle}>
        {visibleRows.map((row) => (
          <article key={row.key} style={cardStyle}>
            <button type="button" onClick={() => beginPick(row)} style={imageButtonStyle}>
              {row.preview
                ? <img src={row.preview} alt="" style={cardImageStyle} />
                : <span style={missingStyle}>Sin imagen</span>}
              <span style={changeBadgeStyle}>Cambiar</span>
              {row.duplicateCount > 1 && (
                <span style={duplicateBadgeStyle}>repetida ×{row.duplicateCount}</span>
              )}
            </button>

            <div style={{ padding: '10px' }}>
              <div style={{ color: '#e8e1c7', fontSize: '0.88rem', fontWeight: 650, lineHeight: 1.25 }}>
                {row.title}
              </div>
              <div style={mutedStyle}>
                {DEVOTION_LABELS[row.mysteryId] || row.assignmentId}
                {row.assignedId ? ' · elegida' : ' · base'}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button type="button" onClick={() => beginPick(row)} style={primaryButtonStyle}>Cambiar</button>
                {row.assignedId && (
                  <button type="button" onClick={() => useDefault(row)} style={secondaryButtonStyle}>Base</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!visibleRows.length && <div style={emptyStyle}>Nada pendiente en este filtro.</div>}

      {pickerFor && (
        <div style={backdropStyle} onClick={() => setPickerFor(null)} role="presentation">
          <div style={dialogStyle} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header style={dialogHeaderStyle}>
              <div>
                <div style={mutedStyle}>Imagen para</div>
                <strong style={{ color: '#f0e6c5' }}>{pickerFor.title}</strong>
              </div>
              <button type="button" onClick={() => setPickerFor(null)} style={closeButtonStyle} aria-label="Cerrar">×</button>
            </header>

            <div style={pickerControlsStyle}>
              <input
                ref={searchRef}
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
                placeholder="Buscar: Fátima, cruz, María, vitral…"
                style={{ ...searchStyle, margin: 0, flex: '1 1 260px' }}
              />
              <button type="button" disabled={uploading} onClick={() => uploadRef.current?.click()} style={primaryButtonStyle}>
                {uploading ? 'Subiendo…' : 'Subir y usar'}
              </button>
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => uploadAndAssign(event.target.files?.[0])}
              />
            </div>

            <div style={pickerMetaStyle}>
              <span>{pickerData.entries.length} imágenes</span>
              <label style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={showTextHeavy} onChange={(event) => setShowTextHeavy(event.target.checked)} />
                manuscritos
              </label>
            </div>

            <div style={pickerGridStyle}>
              {pickerData.entries.map((entry) => {
                const current = pickerData.currentImageId === entry.id;
                const suggested = pickerData.suggestedIds.has(entry.id);
                return (
                  <button key={entry.id} type="button" onClick={() => assignImage(pickerFor, entry.id)} style={pickerCardStyle(current)}>
                    <div style={pickerImageWrapStyle}>
                      <img src={entry.path} alt="" style={pickerImageStyle} />
                      {suggested && <span style={suggestedBadgeStyle}>sugerida</span>}
                      {current && <span style={currentBadgeStyle}>actual</span>}
                    </div>
                    <div style={pickerNameStyle}>{entry.name || entry.id}</div>
                  </button>
                );
              })}
            </div>

            {!pickerData.entries.length && <div style={emptyStyle}>Sin resultados. Probá otra palabra o subí arte.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} style={chipStyle(active)}>{children}</button>;
}

const mutedStyle = { color: '#747474', fontSize: '0.68rem', marginTop: '3px', lineHeight: 1.35 };
const introStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px', border: '1px solid #302b1d', borderRadius: '12px', background: 'rgba(212,175,55,.05)', marginBottom: '10px' };
const statusStyle = { position: 'sticky', top: 0, zIndex: 5, display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', padding: '9px 10px', marginBottom: '9px', borderRadius: '9px', border: '1px solid rgba(111,207,151,.35)', background: 'rgba(10,25,17,.96)', color: '#9fdbb8', fontSize: '.74rem' };
const searchStyle = { width: '100%', minHeight: '44px', boxSizing: 'border-box', border: '1px solid #383838', borderRadius: '10px', background: '#121212', color: '#eee', padding: '10px 12px', fontSize: '.86rem', marginBottom: '8px' };
const chipsStyle = { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '11px' };
const cardsStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(215px, 100%), 1fr))', gap: '11px' };
const cardStyle = { overflow: 'hidden', border: '1px solid #292929', borderRadius: '12px', background: 'rgba(255,255,255,.025)' };
const imageButtonStyle = { width: '100%', height: '155px', border: 0, padding: 0, background: '#0e0e0e', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardImageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const missingStyle = { color: '#777', fontSize: '.78rem' };
const changeBadgeStyle = { position: 'absolute', right: 7, bottom: 7, borderRadius: 999, padding: '4px 7px', background: 'rgba(0,0,0,.76)', color: '#fff', fontSize: '.62rem' };
const duplicateBadgeStyle = { position: 'absolute', left: 7, top: 7, borderRadius: 999, padding: '4px 7px', background: 'rgba(173,91,55,.9)', color: '#fff', fontSize: '.6rem' };
const primaryButtonStyle = { minHeight: 40, border: '1px solid #9f8530', borderRadius: 8, padding: '8px 11px', background: 'rgba(212,175,55,.12)', color: '#e2c14b', cursor: 'pointer', fontSize: '.74rem', fontWeight: 650 };
const secondaryButtonStyle = { minHeight: 40, border: '1px solid #383838', borderRadius: 8, padding: '8px 11px', background: 'rgba(255,255,255,.025)', color: '#aaa', cursor: 'pointer', fontSize: '.72rem' };
const ghostButtonStyle = { ...secondaryButtonStyle, minHeight: 34, color: '#9fdbb8', borderColor: 'rgba(111,207,151,.35)' };
const emptyStyle = { padding: '22px 10px', textAlign: 'center', color: '#707070', fontSize: '.8rem' };
const backdropStyle = { position: 'fixed', inset: 0, zIndex: 20000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 10, background: 'rgba(0,0,0,.84)', backdropFilter: 'blur(6px)' };
const dialogStyle = { width: 'min(960px, 100%)', maxHeight: '92dvh', overflow: 'auto', border: '1px solid #3a3423', borderRadius: '16px 16px 9px 9px', background: '#101010', padding: 12 };
const dialogHeaderStyle = { position: 'sticky', top: 0, zIndex: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingBottom: 9, background: '#101010' };
const closeButtonStyle = { width: 44, height: 44, borderRadius: '50%', border: '1px solid #383838', background: '#171717', color: '#bbb', cursor: 'pointer', fontSize: '1.4rem' };
const pickerControlsStyle = { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 7 };
const pickerMetaStyle = { display: 'flex', justifyContent: 'space-between', gap: 10, color: '#6d6d6d', fontSize: '.66rem', padding: '2px 1px 8px' };
const pickerGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(132px, 45%), 1fr))', gap: 8 };
const pickerImageWrapStyle = { height: 108, position: 'relative', overflow: 'hidden', background: '#090909' };
const pickerImageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const pickerNameStyle = { padding: '7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#d4cfbd', fontSize: '.68rem', textAlign: 'left' };
const suggestedBadgeStyle = { position: 'absolute', left: 5, top: 5, borderRadius: 999, padding: '3px 5px', background: 'rgba(212,175,55,.9)', color: '#111', fontSize: '.54rem', fontWeight: 700 };
const currentBadgeStyle = { ...suggestedBadgeStyle, left: 'auto', right: 5, background: 'rgba(111,207,151,.9)' };

function pickerCardStyle(current) {
  return { padding: 0, overflow: 'hidden', borderRadius: 9, border: current ? '2px solid #6fcf97' : '1px solid #2d2d2d', background: 'rgba(255,255,255,.025)', cursor: 'pointer' };
}

function chipStyle(active) {
  return { minHeight: 36, borderRadius: 999, border: `1px solid ${active ? '#9f8530' : '#343434'}`, padding: '6px 10px', background: active ? 'rgba(212,175,55,.12)' : 'transparent', color: active ? '#e2c14b' : '#858585', cursor: 'pointer', fontSize: '.68rem' };
}
