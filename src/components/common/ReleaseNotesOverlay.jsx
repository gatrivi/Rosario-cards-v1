import React from 'react';
import { getReleaseNotes } from '../../data/releaseNotes';

/**
 * Novedades — shipped vs upcoming. Open from version badge or Ajustes.
 * Easy “check later” entry for release notes.
 */
export default function ReleaseNotesOverlay({ onClose, onOpenAssetStudio }) {
  const notes = getReleaseNotes();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px black',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="release-notes-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 id="release-notes-title" style={{ color: '#D4AF37', margin: 0, fontSize: '1.2rem' }}>
            Novedades
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 16px' }}>
          v{notes.version}
          {notes.name ? ` — ${notes.name}` : ''}
        </p>

        <section style={{ marginBottom: '18px' }}>
          <h3 style={{ color: '#ccc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
            En esta versión
          </h3>
          <ul style={{ margin: 0, paddingLeft: '18px', color: '#ddd', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {(notes.CURRENT || []).map((line) => (
              <li key={line} style={{ marginBottom: '6px' }}>{line}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '18px' }}>
          <h3 style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
            Próximo
          </h3>
          <ul style={{ margin: 0, paddingLeft: '18px', color: '#888', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {(notes.UPCOMING || []).map((line) => (
              <li key={line} style={{ marginBottom: '6px' }}>{line}</li>
            ))}
          </ul>
        </section>

        {onOpenAssetStudio && (
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenAssetStudio();
            }}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              background: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '12px',
              color: '#D4AF37',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
          >
            🖼️ Estudio de imágenes
          </button>
        )}

        <p style={{ color: '#444', fontSize: '0.65rem', margin: 0, lineHeight: 1.4 }}>
          Ajustes = botón circular arriba a la derecha (no es un engranaje).
          Si hay parche PWA, verás un aviso “Actualizar” arriba.
        </p>
      </div>
    </div>
  );
}
