import React, { useMemo, useState } from 'react';
import { litanyLauretanaVerses } from '../../data/litanyLauretana';
import {
  PADRE_NUESTRO_VERSES,
  AVE_MARIA_VERSES,
  getPrayerVerseCatalog,
} from '../../data/prayerVerseCatalog';
import {
  listImages,
  isTextHeavyImageEntry,
  isTextHeavyImageId,
  isTextHeavyImagePath,
} from '../../data/imageRegistry';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../../utils/bookletSequence';
import {
  PRAYER_BASE_ASSIGNMENT,
  assignmentKey,
  clearAssignment,
  clearPrayerAssignment,
  getPrayerAssignmentValue,
  loadAssignments,
  prayerAssignmentKey,
  resolveAssignmentValue,
  saveAssignment,
  savePrayerAssignment,
} from '../../utils/imageAssignments';
import {
  getLitanyVerseImageCandidates,
  getPrayerImageCandidates,
  resolveLitanyVerseImage,
} from '../../utils/prayerImages';
import { getPrayerVerseImageCandidates } from '../../utils/prayerVerseImages';
import { appPrompt } from '../../utils/appDialog';

const BASE_TARGET_ID = '__prayers__';

const TARGETS = [
  { id: 'LL', label: 'Letania de Loreto', count: litanyLauretanaVerses.length },
  { id: 'P', label: 'Padre Nuestro', count: PADRE_NUESTRO_VERSES.length },
  { id: 'A', label: 'Ave Maria', count: AVE_MARIA_VERSES.length },
  { id: BASE_TARGET_ID, label: 'Rezos base', count: null },
];

function verseLabel(prayerId, index) {
  if (prayerId === 'LL') {
    const v = litanyLauretanaVerses[index];
    return v?.invocation || 'Verso ' + (index + 1);
  }
  const catalog = getPrayerVerseCatalog(prayerId);
  return catalog?.[index]?.text?.slice(0, 72) || 'Verso ' + (index + 1);
}

function resolvePreview(prayerId, index) {
  if (prayerId === 'LL') {
    const verse = litanyLauretanaVerses[index];
    const candidates = getLitanyVerseImageCandidates(verse, { id: 'LL' }, index);
    return resolveLitanyVerseImage(verse, { id: 'LL' }, index) || candidates[0];
  }
  const candidates = getPrayerVerseImageCandidates(prayerId, index, { id: prayerId }, 'dolorosos');
  return candidates[0];
}

function rowIsTextHeavy(row) {
  if (row.assignedId && isTextHeavyImageId(row.assignedId)) return true;
  return isTextHeavyImagePath(row.preview);
}

export default function AssignmentMapper() {
  const [assignments, setAssignments] = useState(() => loadAssignments());
  const [target, setTarget] = useState('LL');
  const [filter, setFilter] = useState('');
  const [pickerFor, setPickerFor] = useState(null);
  const [pickerFilter, setPickerFilter] = useState('');
  const [showTextHeavyInPicker, setShowTextHeavyInPicker] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const images = listImages();

  const prayerTargets = useMemo(() => {
    const byId = new Map();
    BOOKLET_MYSTERY_IDS.forEach((mysteryId) => {
      let sequence = [];
      try {
        sequence = buildSequence(mysteryId, { novenaDay: 1 }) || [];
      } catch (_) {
        sequence = [];
      }
      sequence.forEach((step) => {
        if (!step?.id || byId.has(step.id)) return;
        const candidates = getPrayerImageCandidates(step, mysteryId);
        byId.set(step.id, {
          prayerId: step.id,
          title: step.title || step.id,
          preview: candidates[0],
        });
      });
    });
    return Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const targetMeta = TARGETS.find((t) => t.id === target) || TARGETS[0];
  const isBaseTarget = target === BASE_TARGET_ID;

  const rows = useMemo(() => {
    if (isBaseTarget) {
      return prayerTargets
        .filter((item) => {
          if (!filter) return true;
          const hay = (item.prayerId + ' ' + item.title).toLowerCase();
          return hay.includes(filter.toLowerCase());
        })
        .map((item) => {
          const assignedId = getPrayerAssignmentValue(item.prayerId);
          return {
            prayerId: item.prayerId,
            index: null,
            label: item.title,
            assignedId,
            preview: resolveAssignmentValue(assignedId) || item.preview,
            key: prayerAssignmentKey(item.prayerId),
            base: true,
          };
        });
    }

    const items = [];
    for (let i = 0; i < targetMeta.count; i += 1) {
      const label = verseLabel(target, i);
      if (filter && !label.toLowerCase().includes(filter.toLowerCase())) continue;
      const key = assignmentKey(target, i);
      const assignedId = assignments[key] || null;
      items.push({
        prayerId: target,
        index: i,
        label,
        assignedId,
        preview: resolveAssignmentValue(assignedId) || resolvePreview(target, i),
        key,
        base: false,
      });
    }
    return items;
  }, [target, targetMeta.count, filter, assignments, isBaseTarget, prayerTargets]);

  const textHeavyRows = useMemo(() => rows.filter(rowIsTextHeavy), [rows]);
  const selectedCount = selectedKeys.size;

  const bump = () => setAssignments(loadAssignments());

  const handleAssign = (row, imageId) => {
    if (isTextHeavyImageId(imageId)) return;
    // Bulk: if the row is in the selection, apply to every selected row.
    const targets = selectedKeys.size >= 1 && selectedKeys.has(row.key)
      ? rows.filter((item) => selectedKeys.has(item.key))
      : [row];
    targets.forEach((item) => {
      if (item.base) savePrayerAssignment(item.prayerId, imageId);
      else saveAssignment(item.prayerId, item.index, imageId);
    });
    setPickerFor(null);
    setPickerFilter('');
    setSelectedKeys(new Set());
    bump();
  };

  const handleClear = (row) => {
    if (row.base) clearPrayerAssignment(row.prayerId);
    else clearAssignment(row.prayerId, row.index);
    bump();
  };

  const toggleSelected = (key) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectVisible = () => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      const allSelected = rows.length > 0 && rows.every((row) => next.has(row.key));
      rows.forEach((row) => (allSelected ? next.delete(row.key) : next.add(row.key)));
      return next;
    });
  };

  const selectTextHeavy = () => {
    setSelectedKeys(new Set(textHeavyRows.map((row) => row.key)));
  };

  const clearSelected = () => {
    rows.filter((row) => selectedKeys.has(row.key)).forEach(handleClear);
    setSelectedKeys(new Set());
    bump();
  };

  const exportSnippet = async () => {
    const entries = Object.entries(loadAssignments()).filter(([key]) =>
      isBaseTarget
        ? key.endsWith(':' + PRAYER_BASE_ASSIGNMENT)
        : key.startsWith(target + ':')
    );
    const lines = entries.map(([key, value]) => {
      const cleanKey = isBaseTarget
        ? key.slice(0, -(':' + PRAYER_BASE_ASSIGNMENT).length)
        : key;
      return '  ' + JSON.stringify(cleanKey) + ': ' + JSON.stringify(value) + ',';
    });
    const body = lines.length ? lines.join('\n') : '  // sin asignaciones para este objetivo';
    const prefix = isBaseTarget
      ? 'export const PRAYER_IMAGE_ASSIGNMENTS = {\n'
      : '// ' + targetMeta.label + '\n{\n';
    const snippet = prefix + body + '\n};';
    try {
      await navigator.clipboard.writeText(snippet);
    } catch (_) {
      await appPrompt('Copiá estas asignaciones:', snippet, {
        title: 'Exportar asignaciones',
        confirmLabel: 'Listo',
        cancelLabel: 'Cerrar',
      });
    }
  };

  const openPicker = (row) => {
    setPickerFilter('');
    setShowTextHeavyInPicker(false);
    setPickerFor(row);
  };

  const openBulkPicker = () => {
    if (!selectedCount) return;
    const first = rows.find((row) => selectedKeys.has(row.key));
    if (first) openPicker(first);
  };

  const pickerImages = useMemo(() => {
    const query = pickerFilter.trim().toLowerCase();
    return images.filter((img) => {
      if (!showTextHeavyInPicker && isTextHeavyImageEntry(img)) return false;
      if (!query) return true;
      return (img.id + ' ' + (img.name || '') + ' ' + (img.tags || []).join(' '))
        .toLowerCase()
        .includes(query);
    });
  }, [images, pickerFilter, showTextHeavyInPicker]);

  const bulkLabel = selectedCount > 1 && pickerFor && selectedKeys.has(pickerFor.key)
    ? `Arte para ${selectedCount} seleccionados`
    : pickerFor
      ? `Arte para ${pickerFor.base ? pickerFor.prayerId : pickerFor.prayerId + ':' + pickerFor.index}`
      : '';

  return (
    <div>
      <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 14px' }}>
        Seleccioná varios rezos/versos y asigná una sola imagen a todos.
        Los manuscritos con texto no sirven de fondo del Liber (chocan con el rezo).
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <select
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setSelectedKeys(new Set());
          }}
          style={inputStyle}
        >
          {TARGETS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}{item.count ? ' (' + item.count + ')' : ' (' + prayerTargets.length + ')'}
            </option>
          ))}
        </select>
        <input
          placeholder={isBaseTarget ? 'Filtrar rezos...' : 'Filtrar versos...'}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 180px' }}
        />
        <button type="button" onClick={selectVisible} style={btnStyle}>
          {rows.length > 0 && rows.every((row) => selectedKeys.has(row.key))
            ? 'Quitar selección'
            : 'Seleccionar visibles'}
        </button>
        <button
          type="button"
          onClick={selectTextHeavy}
          disabled={!textHeavyRows.length}
          style={btnStyle}
          title="Marca filas cuyo preview es manuscrito / texto-pesado"
        >
          Texto-pesado ({textHeavyRows.length})
        </button>
        <button type="button" onClick={clearSelected} disabled={!selectedCount} style={btnStyle}>
          Usar predeterminadas ({selectedCount})
        </button>
        <button type="button" onClick={exportSnippet} style={btnStyle}>
          Exportar
        </button>
      </div>

      {selectedCount > 0 && (
        <div style={stickyBarStyle}>
          <span style={{ color: '#E0E0E0', fontSize: '0.85rem' }}>
            {selectedCount} seleccionado{selectedCount === 1 ? '' : 's'}
          </span>
          <button type="button" onClick={openBulkPicker} style={{ ...btnStyle, fontWeight: 600 }}>
            Asignar a {selectedCount}…
          </button>
          <button type="button" onClick={() => setSelectedKeys(new Set())} style={{ ...btnStyle, color: '#999' }}>
            Limpiar
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((row) => {
          const heavy = rowIsTextHeavy(row);
          const selected = selectedKeys.has(row.key);
          return (
            <div
              key={row.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 72px 1fr auto',
                gap: '10px',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '10px',
                border: selected
                  ? '1px solid #D4AF37'
                  : heavy
                    ? '1px solid rgba(224, 120, 80, 0.55)'
                    : '1px solid #2a2a2a',
                background: selected
                  ? 'rgba(212,175,55,0.08)'
                  : heavy
                    ? 'rgba(224,120,80,0.06)'
                    : 'rgba(255,255,255,0.02)',
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleSelected(row.key)}
                aria-label={`Seleccionar ${row.label}`}
              />
              <div style={{
                width: '72px', height: '54px', background: '#111', borderRadius: '6px',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {row.preview && (
                  <img src={row.preview} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                )}
                {heavy && (
                  <span style={badgeStyle}>texto</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#D4AF37' }}>
                  {row.base ? row.prayerId : row.prayerId + ':' + row.index}
                  {row.assignedId ? (
                    <code style={{ marginLeft: '8px', color: '#6fcf97' }}>{row.assignedId}</code>
                  ) : (
                    <span style={{ marginLeft: '8px', color: '#666' }}>predeterminada</span>
                  )}
                  {heavy && (
                    <span style={{ marginLeft: '8px', color: '#e07850' }}>manuscrito</span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: 1.35 }}>{row.label}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={() => openPicker(row)} style={btnStyle}>
                  Elegir
                </button>
                {row.assignedId && (
                  <button
                    type="button"
                    title="Usar imagen predeterminada"
                    onClick={() => handleClear(row)}
                    style={{ ...btnStyle, color: '#999' }}
                  >
                    Pred.
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pickerFor !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 20000,
            overflow: 'auto', padding: '20px',
          }}
          onClick={() => setPickerFor(null)}
        >
          <div
            style={{ maxWidth: '900px', margin: '0 auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#D4AF37', fontSize: '1.1rem' }}>{bulkLabel}</h2>
            <input
              autoFocus
              value={pickerFilter}
              onChange={(e) => setPickerFilter(e.target.value)}
              placeholder="Buscar por nombre, id o tag..."
              style={{ ...inputStyle, width: '100%', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => { handleClear(pickerFor); setPickerFor(null); }} style={btnStyle}>
                Usar predeterminada
              </button>
              <label style={{ color: '#999', fontSize: '0.75rem', alignSelf: 'center', display: 'flex', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={showTextHeavyInPicker}
                  onChange={(e) => setShowTextHeavyInPicker(e.target.checked)}
                />
                Mostrar manuscritos (no usar de fondo)
              </label>
              <span style={{ color: '#666', fontSize: '0.75rem', alignSelf: 'center' }}>
                {pickerImages.length} imagenes
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px',
            }}>
              {pickerImages.map((img) => {
                const heavy = isTextHeavyImageEntry(img);
                return (
                  <button
                    key={img.id}
                    type="button"
                    disabled={heavy}
                    onClick={() => handleAssign(pickerFor, img.id)}
                    style={{
                      border: heavy ? '1px solid rgba(224,120,80,0.4)' : '1px solid #333',
                      borderRadius: '8px',
                      padding: '6px',
                      background: '#111',
                      cursor: heavy ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      opacity: heavy ? 0.45 : 1,
                    }}
                  >
                    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img src={img.path} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      {heavy && <span style={badgeStyle}>texto</span>}
                    </div>
                    <code style={{ fontSize: '0.65rem', color: '#D4AF37' }}>{img.id}</code>
                    <div style={{ color: '#777', fontSize: '0.65rem' }}>{img.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid #333',
  borderRadius: '8px',
  padding: '8px 10px',
  color: '#E0E0E0',
  fontSize: '0.85rem',
};

const btnStyle = {
  padding: '6px 10px',
  border: '1px solid #333',
  borderRadius: '6px',
  background: 'rgba(212,175,55,0.12)',
  color: '#D4AF37',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

const stickyBarStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 5,
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: '12px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(212,175,55,0.35)',
  background: 'rgba(20,18,12,0.95)',
  backdropFilter: 'blur(8px)',
};

const badgeStyle = {
  position: 'absolute',
  right: 2,
  bottom: 2,
  fontSize: '0.55rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#1a1008',
  background: '#e07850',
  borderRadius: '3px',
  padding: '1px 4px',
};
