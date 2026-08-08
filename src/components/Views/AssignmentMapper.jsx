import React, { useMemo, useState } from 'react';
import { litanyLauretanaVerses } from '../../data/litanyLauretana';
import {
  PADRE_NUESTRO_VERSES,
  AVE_MARIA_VERSES,
  getPrayerVerseCatalog,
} from '../../data/prayerVerseCatalog';
import { listImages } from '../../data/imageRegistry';
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

export default function AssignmentMapper() {
  const [assignments, setAssignments] = useState(() => loadAssignments());
  const [target, setTarget] = useState('LL');
  const [filter, setFilter] = useState('');
  const [pickerFor, setPickerFor] = useState(null);
  const [pickerFilter, setPickerFilter] = useState('');
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

  const bump = () => setAssignments(loadAssignments());

  const handleAssign = (row, imageId) => {
    const targets = selectedKeys.size > 1 && selectedKeys.has(row.key)
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

  const clearSelected = () => {
    rows.filter((row) => selectedKeys.has(row.key)).forEach(handleClear);
    setSelectedKeys(new Set());
    bump();
  };

  const exportSnippet = () => {
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
    navigator.clipboard?.writeText?.(snippet)?.catch(() => {
      window.prompt('Copia:', snippet);
    });
  };

  const openPicker = (row) => {
    setPickerFilter('');
    setPickerFor(row);
  };

  const pickerImages = useMemo(() => {
    const query = pickerFilter.trim().toLowerCase();
    if (!query) return images;
    return images.filter((img) =>
      (img.id + ' ' + (img.name || '') + ' ' + (img.tags || []).join(' '))
        .toLowerCase()
        .includes(query)
    );
  }, [images, pickerFilter]);

  return (
    <div>
      <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 14px' }}>
        Elegi un rezo o verso, asigna una imagen y queda guardado en localStorage.
        El JSON exportado sirve para que el dev lo hardcodee despues.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <select value={target} onChange={(e) => setTarget(e.target.value)} style={inputStyle}>
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
        <button type="button" onClick={clearSelected} disabled={!selectedKeys.size} style={btnStyle}>
          Usar predeterminadas ({selectedKeys.size})
        </button>
        <button type="button" onClick={exportSnippet} style={btnStyle}>
          Exportar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((row) => (
          <div
            key={row.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 72px 1fr auto',
              gap: '10px',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid #2a2a2a',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <input
              type="checkbox"
              checked={selectedKeys.has(row.key)}
              onChange={() => toggleSelected(row.key)}
              aria-label={`Seleccionar ${row.label}`}
            />
            <div style={{
              width: '72px', height: '54px', background: '#111', borderRadius: '6px',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {row.preview && (
                <img src={row.preview} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
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
        ))}
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
            <h2 style={{ color: '#D4AF37', fontSize: '1.1rem' }}>
              {selectedKeys.size > 1 && selectedKeys.has(pickerFor.key)
                ? `Arte para ${selectedKeys.size} seleccionados`
                : `Arte para ${pickerFor.base ? pickerFor.prayerId : pickerFor.prayerId + ':' + pickerFor.index}`}
            </h2>
            <input
              autoFocus
              value={pickerFilter}
              onChange={(e) => setPickerFilter(e.target.value)}
              placeholder="Buscar por nombre, id o tag..."
              style={{ ...inputStyle, width: '100%', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={() => { handleClear(pickerFor); setPickerFor(null); }} style={btnStyle}>
                Usar predeterminada
              </button>
              <span style={{ color: '#666', fontSize: '0.75rem', alignSelf: 'center' }}>
                {pickerImages.length} imagenes
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px',
            }}>
              {pickerImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleAssign(pickerFor, img.id)}
                  style={{
                    border: '1px solid #333', borderRadius: '8px', padding: '6px',
                    background: '#111', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={img.path} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <code style={{ fontSize: '0.65rem', color: '#D4AF37' }}>{img.id}</code>
                  <div style={{ color: '#777', fontSize: '0.65rem' }}>{img.name}</div>
                </button>
              ))}
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