import React, { useMemo, useState } from 'react';
import { litanyLauretanaVerses } from '../../data/litanyLauretana';
import {
  PADRE_NUESTRO_VERSES,
  AVE_MARIA_VERSES,
  getPrayerVerseCatalog,
} from '../../data/prayerVerseCatalog';
import { listImages } from '../../data/imageRegistry';
import {
  assignmentKey,
  clearAssignment,
  loadAssignments,
  resolveAssignmentValue,
  saveAssignment,
} from '../../utils/imageAssignments';
import {
  getLitanyVerseImageCandidates,
  resolveLitanyVerseImage,
} from '../../utils/prayerImages';
import { getPrayerVerseImageCandidates } from '../../utils/prayerVerseImages';

const TARGETS = [
  { id: 'LL', label: 'Letanía de Loreto', count: litanyLauretanaVerses.length },
  { id: 'P', label: 'Padre Nuestro', count: PADRE_NUESTRO_VERSES.length },
  { id: 'A', label: 'Ave María', count: AVE_MARIA_VERSES.length },
];

function verseLabel(prayerId, index) {
  if (prayerId === 'LL') {
    const v = litanyLauretanaVerses[index];
    return v?.invocation || `Verso ${index + 1}`;
  }
  const catalog = getPrayerVerseCatalog(prayerId);
  return catalog?.[index]?.text?.slice(0, 72) || `Verso ${index + 1}`;
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
  const images = listImages();

  const targetMeta = TARGETS.find((t) => t.id === target) || TARGETS[0];
  const rows = useMemo(() => {
    const items = [];
    for (let i = 0; i < targetMeta.count; i += 1) {
      const label = verseLabel(target, i);
      if (filter && !label.toLowerCase().includes(filter.toLowerCase())) continue;
      const key = assignmentKey(target, i);
      const assignedId = assignments[key] || null;
      items.push({
        index: i,
        label,
        assignedId,
        preview: resolveAssignmentValue(assignedId) || resolvePreview(target, i),
        key,
      });
    }
    return items;
  }, [target, targetMeta.count, filter, assignments]);

  const bump = () => setAssignments(loadAssignments());

  const handleAssign = (prayerId, index, imageId) => {
    saveAssignment(prayerId, index, imageId);
    setPickerFor(null);
    bump();
  };

  const exportSnippet = () => {
    const lines = Object.entries(loadAssignments())
      .filter(([k]) => k.startsWith(`${target}:`))
      .map(([k, v]) => `  '${k}': '${v}',`);
    const body = lines.length ? lines.join('\n') : '  // sin asignaciones para este objetivo';
    const snippet = `// ${targetMeta.label}\n{\n${body}\n}`;
    navigator.clipboard?.writeText(snippet).catch(() => {
      window.prompt('Copia:', snippet);
    });
  };

  return (
    <div>
      <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 14px' }}>
        Asigna imágenes del registro a cada verso. Se guardan en localStorage y
        tienen prioridad sobre los paths en los archivos de datos.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <select value={target} onChange={(e) => setTarget(e.target.value)} style={inputStyle}>
          {TARGETS.map((t) => (
            <option key={t.id} value={t.id}>{t.label} ({t.count})</option>
          ))}
        </select>
        <input
          placeholder="Filtrar versos…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 180px' }}
        />
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
              gridTemplateColumns: '72px 1fr auto',
              gap: '10px',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid #2a2a2a',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
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
                {target}:{row.index}
                {row.assignedId && (
                  <code style={{ marginLeft: '8px', color: '#6fcf97' }}>{row.assignedId}</code>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: 1.35 }}>{row.label}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => setPickerFor(row.index)} style={btnStyle}>
                Elegir
              </button>
              {row.assignedId && (
                <button
                  type="button"
                  onClick={() => { clearAssignment(target, row.index); bump(); }}
                  style={{ ...btnStyle, color: '#999' }}
                >
                  ×
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
              Verso {pickerFor + 1} — {targetMeta.label}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px',
            }}>
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleAssign(target, pickerFor, img.id)}
                  style={{
                    border: '1px solid #333', borderRadius: '8px', padding: '6px',
                    background: '#111', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={img.path} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <code style={{ fontSize: '0.65rem', color: '#D4AF37' }}>{img.id}</code>
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
