import React from 'react';
import './PrayerSharePreviewModal.css';

export default function PrayerSharePreviewModal({
  imageUrl,
  onClose,
  onDownload,
}) {
  if (!imageUrl) return null;

  return (
    <div className="prayer-share-preview-backdrop" onClick={onClose} role="presentation">
      <div
        className="prayer-share-preview-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Vista previa para compartir"
      >
        <header className="prayer-share-preview-sheet__header">
          <h2 className="prayer-share-preview-sheet__title">Compartir oración</h2>
          <button type="button" className="prayer-share-preview-sheet__close" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <p className="prayer-share-preview-sheet__hint">
          Mantén pulsada la imagen para guardarla, o usa el botón de descarga.
        </p>

        <div className="prayer-share-preview-sheet__image-wrap">
          <img
            src={imageUrl}
            alt="Tarjeta de oración para compartir"
            className="prayer-share-preview-sheet__image"
          />
        </div>

        <div className="prayer-share-preview-sheet__actions">
          <button type="button" className="prayer-share-preview-sheet__btn" onClick={onDownload}>
            Descargar PNG
          </button>
        </div>
      </div>
    </div>
  );
}
