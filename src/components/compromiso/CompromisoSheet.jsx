import React, { useCallback, useRef, useState } from 'react';
import CompromisoShareCard from './CompromisoShareCard';
import './CompromisoShareCard.css';
import {
  captureShareCardPng,
  deliverSharePng,
  preloadShareImage,
} from '../../utils/bookletShare';
import {
  COMPROMISO_BODY,
  COMPROMISO_HEADLINE,
  getCompromisoAppUrl,
  getCompromisoShareText,
} from '../../utils/compromisoStore';

/**
 * CTA / fulfilled sheet for Rezá por Argentina.
 * Share = PNG + text with real clickable link (URL on card is decorative).
 */
export default function CompromisoSheet({
  mode = 'commit', // 'commit' | 'done'
  onCommit,
  onDismiss,
  onStartPray,
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
      await preloadShareImage(null);
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
      /* user cancelled or canvas failed — silent */
    } finally {
      setIsSharing(false);
    }
  }, [appUrl, fulfilled, isSharing, sharingBusy]);

  return (
    <div className="compromiso-sheet" role="dialog" aria-modal="true" aria-labelledby="compromiso-title">
      <div
        className={`compromiso-sheet__card${fulfilled ? ' compromiso-sheet__card--done' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="compromiso-sheet__eyebrow">
          {fulfilled ? 'Cumplido' : 'Mundial'}
        </p>
        <h2 id="compromiso-title" className="compromiso-sheet__title">
          {fulfilled ? 'Ya recé' : COMPROMISO_HEADLINE}
        </h2>
        <p className="compromiso-sheet__body">
          {fulfilled
            ? 'Rosario completo: cinco misterios. Gracias por rezar por Argentina.'
            : COMPROMISO_BODY}
        </p>
        {!fulfilled ? (
          <p className="compromiso-sheet__hint">
            No cuenta una sola sección: hace falta el Rosario entero (5 décenas).
          </p>
        ) : null}

        <div className="compromiso-sheet__actions">
          {!fulfilled ? (
            <>
              <button
                type="button"
                className="compromiso-sheet__btn compromiso-sheet__btn--primary"
                onClick={onCommit}
                disabled={isSharing}
              >
                Me comprometo · Rezar hoy
              </button>
              <button
                type="button"
                className="compromiso-sheet__btn compromiso-sheet__btn--ghost"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? 'Preparando…' : 'Compartir compromiso'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="compromiso-sheet__btn compromiso-sheet__btn--gold"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? 'Preparando…' : 'Compartir: Ya recé'}
              </button>
              <button
                type="button"
                className="compromiso-sheet__btn compromiso-sheet__btn--ghost"
                onClick={onStartPray || onDismiss}
              >
                Seguir en el Libro
              </button>
            </>
          )}
          <button
            type="button"
            className="compromiso-sheet__btn compromiso-sheet__btn--ghost"
            onClick={onDismiss}
          >
            Cerrar
          </button>
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
