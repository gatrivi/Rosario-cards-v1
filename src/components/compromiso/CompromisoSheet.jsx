import React, { useCallback, useRef, useState } from 'react';
import CompromisoShareCard from './CompromisoShareCard';
import './CompromisoShareCard.css';
import {
  captureShareCardPng,
  deliverSharePng,
  waitForShareReady,
} from '../../utils/bookletShare';
import {
  COMPROMISO_BODY,
  COMPROMISO_HEADLINE,
  getCompromisoAppUrl,
  getCompromisoShareText,
} from '../../utils/compromisoStore';

/**
 * Compromiso CTA — same gold/dark modal chrome as TutorialOverlay / intro.
 * Share = PNG + text with real clickable link.
 */
export default function CompromisoSheet({
  mode = 'commit', // 'commit' | 'done'
  onCommit,
  onDismiss,
  onStartPray,
  onOpenCamino,
  sharingBusy = false,
}) {
  const cardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const fulfilled = mode === 'done';
  const appUrl = getCompromisoAppUrl();

  const handleShare = useCallback(async () => {
    if (isSharing || sharingBusy) return;
    setIsSharing(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await waitForShareReady(cardRef.current, null);
      const blob = await captureShareCardPng(cardRef.current);
      const filename = fulfilled
        ? 'rosario-cards-ya-rece-argentina.png'
        : 'rosario-cards-compromiso-argentina.png';
      await deliverSharePng(blob, {
        filename,
        title: COMPROMISO_HEADLINE,
        text: getCompromisoShareText({ fulfilled }),
        url: appUrl,
      });
    } catch (_) {
      /* cancelled / canvas fail */
    } finally {
      setIsSharing(false);
    }
  }, [appUrl, fulfilled, isSharing, sharingBusy]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compromiso-title"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 9998,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
      onClick={onDismiss}
    >
      <div
        className="modal-content"
        style={{
          background: 'linear-gradient(145deg, #111, #1a1a1a)',
          border: '1px solid #D4AF37',
          borderRadius: '20px',
          maxWidth: '400px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(15px)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '30px 26px 24px' }}>
          <p
            style={{
              color: 'rgba(212,175,55,0.75)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: '0 0 10px',
            }}
          >
            {fulfilled ? 'Cumplido' : 'Compromiso'}
          </p>
          <h2
            id="compromiso-title"
            style={{
              color: '#D4AF37',
              margin: '0 0 14px',
              fontSize: '1.45rem',
              fontWeight: 'bold',
            }}
          >
            {fulfilled ? 'Ya recé' : COMPROMISO_HEADLINE}
          </h2>
          <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 12px' }}>
            {fulfilled
              ? 'Rosario completo: cinco misterios. Gracias por rezar por Argentina.'
              : COMPROMISO_BODY}
          </p>
          {!fulfilled ? (
            <p style={{ color: '#888', fontSize: '0.8rem', fontStyle: 'italic', margin: '0 0 22px', lineHeight: 1.4 }}>
              No cuenta una sola sección: hace falta el Rosario entero (5 décenas).
              Tu progreso vive en el Camino con el resto de la peregrinación.
            </p>
          ) : (
            <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 22px' }}>
              Cada Ave María también avanza tu Camino.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!fulfilled ? (
              <>
                <button
                  type="button"
                  onClick={onCommit}
                  disabled={isSharing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(90deg, #D4AF37, #C5A028)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Me comprometo · Rezar hoy
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isSharing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(90deg, #2a0a0a, #3d0f0f)',
                    border: '1px solid #D4AF37',
                    borderRadius: '12px',
                    color: '#D4AF37',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  {isSharing ? 'Preparando…' : 'Compartir compromiso'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isSharing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(90deg, #D4AF37, #C5A028)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  {isSharing ? 'Preparando…' : 'Compartir: Ya recé'}
                </button>
                <button
                  type="button"
                  onClick={onStartPray || onDismiss}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(90deg, #2a0a0a, #3d0f0f)',
                    border: '1px solid #D4AF37',
                    borderRadius: '12px',
                    color: '#D4AF37',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  Seguir en el Libro
                </button>
              </>
            )}
            {onOpenCamino ? (
              <button
                type="button"
                onClick={onOpenCamino}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  color: '#aaa',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Ver el Camino
              </button>
            ) : null}
            <button
              type="button"
              onClick={onDismiss}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <div className="compromiso-offscreen">
        <CompromisoShareCard
          ref={cardRef}
          fulfilled={fulfilled}
          headline={fulfilled ? 'Ya recé' : COMPROMISO_HEADLINE}
          body={
            fulfilled
              ? 'Rosario completo por Argentina — cinco misterios.'
              : COMPROMISO_BODY
          }
          progressLabel={fulfilled ? 'Cinco décenas' : 'Un Rosario = 5 décenas'}
          urlLine={appUrl}
        />
      </div>
    </div>
  );
}
