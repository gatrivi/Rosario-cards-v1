import React, { useMemo, useState, useRef, useEffect } from 'react';
import { listImages, saveOverride, clearOverride } from '../../data/imageRegistry';
import AssignmentMapper from './AssignmentMapper';
import ClassifyImagesPanel from './ClassifyImagesPanel';
import {
  pullImageLibraryFromFirestore,
  pushImageLibraryToFirestore,
} from '../../services/firebaseImageLibrary';
import { IMAGE_LIBRARY_CHANGED_EVENT } from '../../utils/imageLibraryStore';
import {
  downloadArtConfigJson,
  exportArtConfig,
  importArtConfig,
} from '../../utils/artConfigPortable';
import { packArtConfigForCloud, applyArtConfigFromCloud } from '../../utils/artConfigSync';
import {
  getFirebaseArtStatus,
  pullArtConfigFromFirestore,
  pushArtConfigToFirestore,
} from '../../services/firebaseArtConfig';
import { isFirebaseConfigured } from '../../config/firebase';

/**
 * AssetStudio — browse the image registry at /assets (also from Ajustes on mobile).
 * rename/tag entries at runtime. Edits are persisted to localStorage and
 * merged over the source registry; they do NOT rewrite files on disk.
 *
 * Use this to figure out which unnamed asset is which, then paste the chosen
 * name/tags back into src/data/imageRegistry.js when convenient.
 */
export default function AssetStudio() {
  const [, setVersion] = useState(0);
  const [tab, setTab] = useState('registry');
  const [filter, setFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [portableMsg, setPortableMsg] = useState('');
  const [fbStatus, setFbStatus] = useState(null);
  const [fbBusy, setFbBusy] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    getFirebaseArtStatus().then(setFbStatus).catch(() => {
      setFbStatus({ configured: false, ok: false, message: 'Error al consultar Firebase' });
    });
    pullImageLibraryFromFirestore()
      .then(() => setVersion((v) => v + 1))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let t;
    const onLib = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        pushImageLibraryToFirestore().catch(() => {});
      }, 2500);
    };
    window.addEventListener(IMAGE_LIBRARY_CHANGED_EVENT, onLib);
    return () => {
      window.removeEventListener(IMAGE_LIBRARY_CHANGED_EVENT, onLib);
      clearTimeout(t);
    };
  }, []);

  // Recomputed each render; setVersion() forces a refresh after edits.
  const images = listImages();

  const allTags = useMemo(() => {
    const s = new Set();
    images.forEach((i) => i.tags.forEach((t) => s.add(t)));
    return ['all', ...Array.from(s).sort()];
  }, [images]);

  const filtered = images.filter((i) => {
    const matchesText = !filter
      || i.id.toLowerCase().includes(filter.toLowerCase())
      || (i.name || '').toLowerCase().includes(filter.toLowerCase());
    const matchesTag = tagFilter === 'all' || i.tags.includes(tagFilter);
    return matchesText && matchesTag;
  });

  const handleSave = (id, { name, tags }) => {
    const tagArr = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : tags;
    saveOverride(id, { name, tags: tagArr });
    setVersion((v) => v + 1);
  };

  const handleReset = (id) => {
    clearOverride(id);
    setVersion((v) => v + 1);
  };

  const copySnippet = async (entry) => {
    const snippet = `  ${entry.id}: { path: ${entry.id}Path, name: '${entry.name}', tags: [${entry.tags.map((t) => `'${t}'`).join(', ')}] },`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch (_) {
      // clipboard may be blocked; fallback to prompt
      window.prompt('Copia este snippet:', snippet);
    }
  };

  const showPortableMsg = (msg) => {
    setPortableMsg(msg);
    setTimeout(() => setPortableMsg(''), 3000);
  };

  const handleExportPortable = async () => {
    const json = JSON.stringify(exportArtConfig(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showPortableMsg('JSON copiado al portapapeles');
    } catch (_) {
      downloadArtConfigJson();
      showPortableMsg('JSON descargado');
    }
  };

  const handleImportPortable = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = importArtConfig(payload, { merge: true });
      setVersion((v) => v + 1);
      showPortableMsg(
        `Importado: ${result.registryCount} nombres, ${result.assignmentCount} asignaciones`
      );
    } catch (e) {
      showPortableMsg('No se pudo importar el archivo');
    }
    if (importRef.current) importRef.current.value = '';
  };

  const handlePushFirebase = async () => {
    if (!isFirebaseConfigured()) {
      showPortableMsg('Falta .env.local con Firebase');
      return;
    }
    setFbBusy(true);
    try {
      const artConfig = packArtConfigForCloud();
      await pushArtConfigToFirestore(null, artConfig);
      const status = await getFirebaseArtStatus();
      setFbStatus(status);
      showPortableMsg('Subido a Firestore (shared/artConfig)');
    } catch (e) {
      showPortableMsg(e?.message || 'Error al subir');
    } finally {
      setFbBusy(false);
    }
  };

  const handlePullFirebase = async () => {
    if (!isFirebaseConfigured()) {
      showPortableMsg('Falta .env.local con Firebase');
      return;
    }
    setFbBusy(true);
    try {
      const remote = await pullArtConfigFromFirestore(null);
      if (!remote) {
        showPortableMsg('Nube vacía — subí primero desde este u otro dispositivo');
        return;
      }
      const result = applyArtConfigFromCloud(remote, { force: true });
      setVersion((v) => v + 1);
      showPortableMsg(result === 'applied' ? 'Bajado desde Firestore' : 'Sin cambios nuevos');
    } catch (e) {
      showPortableMsg(e?.message || 'Error al bajar');
    } finally {
      setFbBusy(false);
    }
  };

  return (
    <div style={{
      height: '100%', overflow: 'auto', backgroundColor: '#0A0A0A',
      color: '#E0E0E0', padding: '20px', fontFamily: 'serif',
    }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <h1 style={{ color: '#D4AF37', fontSize: '1.4rem', margin: '0 0 4px' }}>
          🛠 Asset Studio
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 12px' }}>
          Renombra, etiqueta y asigna imágenes a versos. Local + Firebase (shared/artConfig).
        </p>

        <p style={{
          color: fbStatus?.ok ? '#6fcf97' : '#c9a227',
          fontSize: '0.75rem',
          margin: '0 0 10px',
        }}>
          {fbStatus ? `Firebase: ${fbStatus.message}` : 'Firebase: comprobando…'}
        </p>

        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center',
        }}>
          <button
            type="button"
            onClick={handlePushFirebase}
            disabled={fbBusy}
            style={portableBtnStyle}
          >
            Subir a nube
          </button>
          <button
            type="button"
            onClick={handlePullFirebase}
            disabled={fbBusy}
            style={portableBtnStyle}
          >
            Bajar de nube
          </button>
          <button type="button" onClick={handleExportPortable} style={portableBtnStyle}>
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            style={portableBtnStyle}
          >
            Importar JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => handleImportPortable(e.target.files?.[0])}
          />
          {portableMsg && (
            <span style={{ color: '#6fcf97', fontSize: '0.75rem' }}>{portableMsg}</span>
          )}
        </div>
        <p style={{ color: '#555', fontSize: '0.7rem', margin: '0 0 14px', lineHeight: 1.4 }}>
          Renombres se suben solos ~2.5s después de guardar. También podés Subir/Bajar a mano.
          Si ves “permiso denegado”, publicá las reglas en <code>firestore.rules</code>.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'registry', label: 'Registro' },
            { id: 'classify', label: 'Clasificar' },
            { id: 'assign', label: 'Asignar versos' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid #333',
                background: tab === t.id ? '#D4AF37' : 'transparent',
                color: tab === t.id ? '#000' : '#aaa', cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'assign' ? (
          <AssignmentMapper />
        ) : tab === 'classify' ? (
          <ClassifyImagesPanel onChanged={() => setVersion((v) => v + 1)} />
        ) : (
        <>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            placeholder="Filtrar por id o nombre…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={inputStyle}
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto' }}
          >
            {allTags.map((t) => <option key={t} value={t}>{t === 'all' ? 'todas las etiquetas' : t}</option>)}
          </select>
          <span style={{ alignSelf: 'center', color: '#666', fontSize: '0.75rem' }}>
            {filtered.length} / {images.length}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {filtered.map((entry) => (
            <AssetCard
              key={entry.id}
              entry={entry}
              onSave={handleSave}
              onReset={handleReset}
              onCopy={() => copySnippet(entry)}
              copied={copiedId === entry.id}
            />
          ))}
        </div>
        </>
        )}
      </div>
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
  flex: '1 1 200px',
};

const portableBtnStyle = {
  padding: '8px 14px',
  borderRadius: '8px',
  border: '1px solid #333',
  background: 'rgba(212,175,55,0.12)',
  color: '#D4AF37',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

function AssetCard({ entry, onSave, onReset, onCopy, copied }) {
  const [name, setName] = useState(entry.name || '');
  const [tags, setTags] = useState((entry.tags || []).join(', '));
  const [expanded, setExpanded] = useState(false);

  const dirty = name !== (entry.name || '') || tags !== (entry.tags || []).join(', ');

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid #2a2a2a',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div
        style={{
          height: '140px', background: '#111', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
        onClick={() => setExpanded((e) => !e)}
        title={expanded ? 'Contraer' : 'Expandir'}
      >
        <img
          src={entry.path}
          alt={entry.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <code style={{ color: '#D4AF37', fontSize: '0.75rem' }}>{entry.id}</code>
          <span style={{ color: '#555', fontSize: '0.65rem' }}>{entry.source}</span>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="nombre…"
          style={{ ...inputStyle, flex: 'none', padding: '6px 8px', fontSize: '0.8rem' }}
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags (coma)…"
          style={{ ...inputStyle, flex: 'none', padding: '6px 8px', fontSize: '0.75rem', color: '#bbb' }}
        />
        {expanded && (
          <div style={{ fontSize: '0.65rem', color: '#777', wordBreak: 'break-all' }}>
            {String(entry.path)}
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
          <button
            type="button"
            disabled={!dirty}
            onClick={() => onSave(entry.id, { name, tags })}
            style={btnStyle(dirty ? '#D4AF37' : '#333', dirty ? '#000' : '#666')}
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onReset}
            style={btnStyle('transparent', '#999')}
          >
            Revertir
          </button>
          <button
            type="button"
            onClick={onCopy}
            style={btnStyle('transparent', copied ? '#6fcf97' : '#999')}
          >
            {copied ? '¡Copiado!' : 'Snippet'}
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    flex: 1, padding: '6px 8px', border: '1px solid #333',
    borderRadius: '6px', background: bg, color,
    fontSize: '0.72rem', cursor: 'pointer',
  };
}
