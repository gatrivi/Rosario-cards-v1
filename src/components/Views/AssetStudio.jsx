import React, { useEffect, useMemo, useRef, useState } from 'react';
import { listImages, saveOverride, clearOverride } from '../../data/imageRegistry';
import AssignmentMapper from './AssignmentMapper';
import ClassifyImagesPanel from './ClassifyImagesPanel';
import DevotionImageReviewPanel from './DevotionImageReviewPanel';
import PrayerImageFixer from './PrayerImageFixer';
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
 * Asset Studio — the default path is deliberately task-first:
 * prayer → current art → replacement → saved.
 * Registry metadata, bulk mapping and cloud portability stay available,
 * but out of the way of the common correction workflow.
 */
export default function AssetStudio() {
  const [, setVersion] = useState(0);
  const [tab, setTab] = useState('fix');
  const [filter, setFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [portableMsg, setPortableMsg] = useState('');
  const [fbStatus, setFbStatus] = useState(null);
  const [fbBusy, setFbBusy] = useState(false);
  const importRef = useRef(null);
  const messageTimerRef = useRef(null);

  useEffect(() => {
    getFirebaseArtStatus().then(setFbStatus).catch(() => {
      setFbStatus({ configured: false, ok: false, message: 'Error al consultar Firebase' });
    });
    pullImageLibraryFromFirestore()
      .then(() => setVersion((v) => v + 1))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let timer;
    const onLib = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        pushImageLibraryToFirestore().catch(() => {});
      }, 2500);
    };
    window.addEventListener(IMAGE_LIBRARY_CHANGED_EVENT, onLib);
    return () => {
      window.removeEventListener(IMAGE_LIBRARY_CHANGED_EVENT, onLib);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => () => clearTimeout(messageTimerRef.current), []);

  const images = listImages();

  const allTags = useMemo(() => {
    const tags = new Set();
    images.forEach((image) => image.tags.forEach((tag) => tags.add(tag)));
    return ['all', ...Array.from(tags).sort()];
  }, [images]);

  const filtered = images.filter((image) => {
    const query = filter.trim().toLowerCase();
    const matchesText = !query
      || image.id.toLowerCase().includes(query)
      || (image.name || '').toLowerCase().includes(query)
      || (image.tags || []).join(' ').toLowerCase().includes(query);
    const matchesTag = tagFilter === 'all' || image.tags.includes(tagFilter);
    return matchesText && matchesTag;
  });

  const showMessage = (message) => {
    clearTimeout(messageTimerRef.current);
    setPortableMsg(message);
    messageTimerRef.current = setTimeout(() => setPortableMsg(''), 3200);
  };

  const handleSave = (id, { name, tags }) => {
    const tagArr = typeof tags === 'string'
      ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : tags;
    saveOverride(id, { name, tags: tagArr });
    setVersion((v) => v + 1);
    showMessage('Cambios guardados');
  };

  const handleReset = (id) => {
    clearOverride(id);
    setVersion((v) => v + 1);
    showMessage('Metadatos restaurados');
  };

  const copySnippet = async (entry) => {
    const snippet = `  ${entry.id}: { path: ${entry.id}Path, name: '${entry.name}', tags: [${entry.tags.map((tag) => `'${tag}'`).join(', ')}] },`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(entry.id);
      showMessage('Snippet copiado');
      setTimeout(() => setCopiedId(null), 1200);
    } catch (_) {
      showMessage('El navegador bloqueó el portapapeles');
    }
  };

  const handleExportPortable = async () => {
    const json = JSON.stringify(exportArtConfig(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showMessage('JSON copiado al portapapeles');
    } catch (_) {
      downloadArtConfigJson();
      showMessage('JSON descargado');
    }
  };

  const handleImportPortable = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = importArtConfig(payload, { merge: true });
      setVersion((v) => v + 1);
      showMessage(`Importado: ${result.registryCount} nombres · ${result.assignmentCount} asignaciones`);
    } catch (_) {
      showMessage('No se pudo importar el archivo');
    }
    if (importRef.current) importRef.current.value = '';
  };

  const handlePushFirebase = async () => {
    if (!isFirebaseConfigured()) {
      showMessage('Falta configuración de Firebase');
      return;
    }
    setFbBusy(true);
    try {
      await pushArtConfigToFirestore(null, packArtConfigForCloud());
      const status = await getFirebaseArtStatus();
      setFbStatus(status);
      showMessage('Arte subido a la nube');
    } catch (error) {
      showMessage(error?.message || 'Error al subir');
    } finally {
      setFbBusy(false);
    }
  };

  const handlePullFirebase = async () => {
    if (!isFirebaseConfigured()) {
      showMessage('Falta configuración de Firebase');
      return;
    }
    setFbBusy(true);
    try {
      const remote = await pullArtConfigFromFirestore(null);
      if (!remote) {
        showMessage('La nube todavía no tiene configuración de arte');
        return;
      }
      const result = applyArtConfigFromCloud(remote, { force: true });
      setVersion((v) => v + 1);
      showMessage(result === 'applied' ? 'Arte bajado desde la nube' : 'No había cambios nuevos');
    } catch (error) {
      showMessage(error?.message || 'Error al bajar');
    } finally {
      setFbBusy(false);
    }
  };

  return (
    <div style={rootStyle}>
      <div style={containerStyle}>
        <header style={{ marginBottom: '12px' }}>
          <h1 style={titleStyle}>🖼 Estudio de imágenes</h1>
          <p style={subtitleStyle}>
            Corregí primero lo que ve la gente. Biblioteca, versos y sincronización quedan a un toque.
          </p>
        </header>

        <nav style={tabsStyle} aria-label="Secciones del estudio de imágenes">
          <StudioTab active={tab === 'fix'} onClick={() => setTab('fix')}>Rezos</StudioTab>
          <StudioTab active={tab === 'registry'} onClick={() => setTab('registry')}>Biblioteca</StudioTab>
          <StudioTab active={tab === 'assign'} onClick={() => setTab('assign')}>Versos</StudioTab>
        </nav>

        {portableMsg && (
          <div style={messageStyle} role="status" aria-live="polite">
            {portableMsg}
          </div>
        )}

        {tab === 'fix' && (
          <PrayerImageFixer onOpenLibrary={() => setTab('classify')} />
        )}

        {tab === 'assign' && <AssignmentMapper />}

        {tab === 'registry' && (
          <RegistryPanel
            images={images}
            filtered={filtered}
            allTags={allTags}
            filter={filter}
            setFilter={setFilter}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            handleSave={handleSave}
            handleReset={handleReset}
            copySnippet={copySnippet}
            copiedId={copiedId}
          />
        )}

        {tab === 'classify' && (
          <>
            <BackToFix onClick={() => setTab('fix')} />
            <ClassifyImagesPanel onChanged={() => setVersion((v) => v + 1)} />
          </>
        )}

        {tab === 'review' && (
          <>
            <BackToFix onClick={() => setTab('fix')} />
            <DevotionImageReviewPanel />
          </>
        )}

        <details style={advancedStyle}>
          <summary style={summaryStyle}>Herramientas avanzadas</summary>
          <div style={advancedBodyStyle}>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setTab('classify')} style={toolButtonStyle}>
                Subir / clasificar imágenes
              </button>
              <button type="button" onClick={() => setTab('review')} style={toolButtonStyle}>
                Recorrer devociones
              </button>
            </div>

            <div style={cloudBoxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Nube</span>
                <span style={{ color: fbStatus?.ok ? '#6fcf97' : '#c9a227', fontSize: '0.7rem' }}>
                  {fbStatus ? fbStatus.message : 'comprobando…'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '8px' }}>
                <button type="button" onClick={handlePushFirebase} disabled={fbBusy} style={toolButtonStyle}>
                  Subir nube
                </button>
                <button type="button" onClick={handlePullFirebase} disabled={fbBusy} style={toolButtonStyle}>
                  Bajar nube
                </button>
                <button type="button" onClick={handleExportPortable} style={toolButtonStyle}>
                  Exportar JSON
                </button>
                <button type="button" onClick={() => importRef.current?.click()} style={toolButtonStyle}>
                  Importar JSON
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={(event) => handleImportPortable(event.target.files?.[0])}
                />
              </div>
              <p style={{ color: '#565656', fontSize: '0.66rem', lineHeight: 1.4, margin: '8px 0 0' }}>
                Los cambios de biblioteca se sincronizan automáticamente; estos botones son para recuperación o traslado manual.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

function StudioTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={tabStyle(active)}
    >
      {children}
    </button>
  );
}

function BackToFix({ onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ ...toolButtonStyle, marginBottom: '10px' }}>
      ← Volver a rezos
    </button>
  );
}

function RegistryPanel({
  images,
  filtered,
  allTags,
  filter,
  setFilter,
  tagFilter,
  setTagFilter,
  handleSave,
  handleReset,
  copySnippet,
  copiedId,
}) {
  return (
    <div>
      <div style={registryToolbarStyle}>
        <input
          placeholder="Buscar nombre, id o etiqueta…"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={inputStyle}
        />
        <select
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          style={{ ...inputStyle, flex: '0 1 210px' }}
        >
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag === 'all' ? 'Todas las etiquetas' : tag}
            </option>
          ))}
        </select>
        <span style={{ alignSelf: 'center', color: '#666', fontSize: '0.72rem' }}>
          {filtered.length} / {images.length}
        </span>
      </div>

      <div style={registryGridStyle}>
        {filtered.map((entry) => (
          <AssetCard
            key={entry.id}
            entry={entry}
            onSave={handleSave}
            onReset={() => handleReset(entry.id)}
            onCopy={() => copySnippet(entry)}
            copied={copiedId === entry.id}
          />
        ))}
      </div>

      {!filtered.length && (
        <p style={{ color: '#666', textAlign: 'center', fontSize: '0.8rem', padding: '24px 0' }}>
          No hay imágenes con ese filtro.
        </p>
      )}
    </div>
  );
}

function AssetCard({ entry, onSave, onReset, onCopy, copied }) {
  const [name, setName] = useState(entry.name || '');
  const [tags, setTags] = useState((entry.tags || []).join(', '));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setName(entry.name || '');
    setTags((entry.tags || []).join(', '));
  }, [entry.name, entry.tags]);

  const dirty = name !== (entry.name || '') || tags !== (entry.tags || []).join(', ');

  return (
    <article style={assetCardStyle}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        title={expanded ? 'Ocultar ruta' : 'Ver ruta'}
        style={assetImageButtonStyle}
      >
        <img
          src={entry.path}
          alt={entry.name || entry.id}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
        />
      </button>
      <div style={{ padding: '10px', display: 'grid', gap: '7px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <code style={{ color: '#D4AF37', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.id}
          </code>
          <span style={{ color: '#565656', fontSize: '0.62rem', flexShrink: 0 }}>{entry.source}</span>
        </div>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre"
          style={smallInputStyle}
        />
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Etiquetas, separadas por coma"
          style={{ ...smallInputStyle, color: '#aaa', fontSize: '0.73rem' }}
        />
        {expanded && (
          <div style={{ fontSize: '0.62rem', color: '#666', wordBreak: 'break-all', lineHeight: 1.35 }}>
            {String(entry.path)}
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={!dirty}
            onClick={() => onSave(entry.id, { name, tags })}
            style={saveButtonStyle(dirty)}
          >
            Guardar
          </button>
          <button type="button" onClick={onReset} style={cardButtonStyle}>
            Revertir
          </button>
          <button type="button" onClick={onCopy} style={cardButtonStyle}>
            {copied ? 'Copiado' : 'Snippet'}
          </button>
        </div>
      </div>
    </article>
  );
}

const rootStyle = {
  height: '100%',
  overflow: 'auto',
  backgroundColor: '#0A0A0A',
  color: '#E0E0E0',
  padding: 'clamp(12px, 3vw, 20px)',
  paddingBottom: '110px',
  fontFamily: 'serif',
};

const containerStyle = {
  maxWidth: '1040px',
  margin: '0 auto',
};

const titleStyle = {
  color: '#D4AF37',
  fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
  margin: '0 0 4px',
};

const subtitleStyle = {
  color: '#858585',
  fontSize: '0.78rem',
  lineHeight: 1.45,
  margin: 0,
};

const tabsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '7px',
  marginBottom: '12px',
};

const messageStyle = {
  marginBottom: '10px',
  padding: '8px 10px',
  borderRadius: '9px',
  background: 'rgba(111,207,151,0.08)',
  border: '1px solid rgba(111,207,151,0.25)',
  color: '#86d6a6',
  fontSize: '0.72rem',
};

const advancedStyle = {
  marginTop: '18px',
  borderTop: '1px solid #242424',
  paddingTop: '12px',
};

const summaryStyle = {
  color: '#777',
  cursor: 'pointer',
  fontSize: '0.74rem',
  minHeight: '38px',
  display: 'flex',
  alignItems: 'center',
};

const advancedBodyStyle = {
  display: 'grid',
  gap: '10px',
  paddingTop: '8px',
};

const cloudBoxStyle = {
  border: '1px solid #282828',
  borderRadius: '10px',
  padding: '10px',
  background: 'rgba(255,255,255,0.015)',
};

const toolButtonStyle = {
  minHeight: '40px',
  padding: '8px 11px',
  borderRadius: '8px',
  border: '1px solid #373737',
  background: 'rgba(255,255,255,0.025)',
  color: '#aaa',
  cursor: 'pointer',
  fontSize: '0.72rem',
};

const registryToolbarStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
  marginBottom: '12px',
};

const registryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
  gap: '12px',
};

const inputStyle = {
  minHeight: '44px',
  boxSizing: 'border-box',
  background: '#121212',
  border: '1px solid #353535',
  borderRadius: '9px',
  padding: '9px 10px',
  color: '#E0E0E0',
  fontSize: '0.8rem',
  flex: '1 1 220px',
};

const smallInputStyle = {
  ...inputStyle,
  minHeight: '40px',
  flex: 'none',
  width: '100%',
  padding: '7px 8px',
  fontSize: '0.78rem',
};

const assetCardStyle = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid #282828',
  borderRadius: '12px',
  overflow: 'hidden',
};

const assetImageButtonStyle = {
  width: '100%',
  height: '155px',
  border: 0,
  padding: 0,
  background: '#101010',
  cursor: 'pointer',
  overflow: 'hidden',
};

const cardButtonStyle = {
  flex: '1 1 70px',
  minHeight: '38px',
  padding: '7px 8px',
  border: '1px solid #343434',
  borderRadius: '7px',
  background: 'transparent',
  color: '#999',
  fontSize: '0.69rem',
  cursor: 'pointer',
};

function tabStyle(active) {
  return {
    minHeight: '44px',
    padding: '8px 10px',
    borderRadius: '9px',
    border: `1px solid ${active ? '#9f8530' : '#303030'}`,
    background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.015)',
    color: active ? '#e5c84f' : '#888',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: active ? 700 : 500,
  };
}

function saveButtonStyle(enabled) {
  return {
    ...cardButtonStyle,
    background: enabled ? '#D4AF37' : '#202020',
    borderColor: enabled ? '#D4AF37' : '#303030',
    color: enabled ? '#111' : '#555',
    cursor: enabled ? 'pointer' : 'default',
    fontWeight: 700,
  };
}
