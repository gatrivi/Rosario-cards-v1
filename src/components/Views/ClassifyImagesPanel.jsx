import React, { useMemo, useState, useCallback, useRef } from 'react';
import { listImages, saveOverride } from '../../data/imageRegistry';
import {
  LITURGICAL_CATEGORIES,
  hasLiturgicalCategory,
} from '../../data/liturgicalCategories';
import { upsertLibraryEntry } from '../../utils/imageLibraryStore';
import {
  uploadImageFile,
  pushImageLibraryToFirestore,
} from '../../services/firebaseImageLibrary';
import { isFirebaseConfigured } from '../../config/firebase';

/**
 * Classify registry + uploaded images into liturgical categories.
 * Drag-drop / folder pick uploads to Firebase Storage when configured.
 */
export default function ClassifyImagesPanel({ onChanged }) {
  const [filter, setFilter] = useState('unclassified');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [tick, setTick] = useState(0);
  const fileRef = useRef(null);
  const folderRef = useRef(null);

  const images = useMemo(() => listImages(), [tick]);

  const rows = useMemo(() => {
    let list = images;
    if (filter === 'unclassified') {
      list = list.filter((i) => !hasLiturgicalCategory(i.tags || []));
    } else if (filter !== 'all') {
      list = list.filter((i) => (i.tags || []).includes(filter));
    }
    return list.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
  }, [images, filter]);

  const bump = () => {
    setTick((t) => t + 1);
    onChanged?.();
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
  };

  const toggleCategory = (entry, categoryId) => {
    const tags = new Set(entry.tags || []);
    if (tags.has(categoryId)) tags.delete(categoryId);
    else tags.add(categoryId);
    const next = Array.from(tags);
    saveOverride(entry.id, { name: entry.name, tags: next });
    if (entry.source === 'upload') {
      upsertLibraryEntry({ ...entry, tags: next });
    }
    bump();
  };

  const ingestFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|jpeg)$/i.test(f.name)
    );
    if (!files.length) {
      showMsg('No hay imágenes en la selección');
      return;
    }
    if (!isFirebaseConfigured()) {
      showMsg('Firebase no configurado — no se pueden subir archivos');
      return;
    }
    setBusy(true);
    let ok = 0;
    let fail = 0;
    try {
      for (const file of files) {
        try {
          const entry = await uploadImageFile(file);
          upsertLibraryEntry(entry);
          ok += 1;
        } catch (_) {
          fail += 1;
        }
      }
      try {
        await pushImageLibraryToFirestore();
      } catch (_) { /* rules may block */ }
      bump();
      showMsg(`Subidas: ${ok}${fail ? ` · fallidas: ${fail}` : ''}`);
    } finally {
      setBusy(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    ingestFiles(e.dataTransfer.files);
  };

  const unclassifiedCount = images.filter((i) => !hasLiturgicalCategory(i.tags || [])).length;

  return (
    <div>
      <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 12px', lineHeight: 1.4 }}>
        Clasificá por categoría litúrgica (podés marcar varias).
        Arrastrá una carpeta o archivos — se suben a Firebase Storage y entran a la biblioteca.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? '#D4AF37' : '#333'}`,
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '14px',
          background: dragOver ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
          color: '#aaa',
          fontSize: '0.85rem',
        }}
      >
        {busy ? 'Subiendo…' : 'Soltá imágenes o una carpeta aquí'}
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            style={btnStyle}
          >
            Elegir archivos
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => folderRef.current?.click()}
            style={btnStyle}
          >
            Elegir carpeta
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            ingestFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={folderRef}
          type="file"
          accept="image/*"
          multiple
          webkitdirectory=""
          directory=""
          style={{ display: 'none' }}
          onChange={(e) => {
            ingestFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {msg && <p style={{ color: '#6fcf97', fontSize: '0.75rem' }}>{msg}</p>}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setFilter('unclassified')}
          style={chipStyle(filter === 'unclassified')}
        >
          Sin clasificar ({unclassifiedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={chipStyle(filter === 'all')}
        >
          Todas ({images.length})
        </button>
        {LITURGICAL_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            style={chipStyle(filter === c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {rows.map((entry) => (
          <div
            key={entry.id}
            style={{
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{
              height: '120px', background: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={entry.path}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#D4AF37', marginBottom: '4px' }}>
                {entry.name || entry.id}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '8px' }}>
                {entry.id}
                {entry.source === 'upload' ? ' · subida' : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {LITURGICAL_CATEGORIES.map((c) => {
                  const on = (entry.tags || []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(entry, c.id)}
                      title={c.label}
                      style={{
                        fontSize: '0.65rem',
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: `1px solid ${on ? '#D4AF37' : '#333'}`,
                        background: on ? 'rgba(212,175,55,0.2)' : 'transparent',
                        color: on ? '#D4AF37' : '#777',
                        cursor: 'pointer',
                      }}
                    >
                      {c.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!rows.length && (
        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '20px' }}>
          No hay imágenes en este filtro.
        </p>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #333',
  background: 'rgba(212,175,55,0.12)',
  color: '#D4AF37',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

function chipStyle(active) {
  return {
    padding: '6px 10px',
    borderRadius: '999px',
    border: `1px solid ${active ? '#D4AF37' : '#333'}`,
    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
    color: active ? '#D4AF37' : '#888',
    cursor: 'pointer',
    fontSize: '0.7rem',
  };
}
