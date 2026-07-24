import React from 'react';
import { getUpdateSummaryLine, RELEASE_NOTES } from '../../data/releaseNotes';
import './UpdateNotice.css';

/**
 * Compact floating update note — see .docs/libro/devotions-surfaces-redesign.md §3.
 */
export default function UpdateNotice({
  visible = false,
  onUpdate,
  onOpenNotes,
  version = RELEASE_NOTES.version,
}) {
  if (!visible) return null;
  const summary = getUpdateSummaryLine();
  return (
    <div className="update-notice" role="status" aria-live="polite">
      <div className="update-notice__row">
        <span className="update-notice__seal" aria-hidden="true">
          ✦
        </span>
        <div className="update-notice__copy">
          <p className="update-notice__title">Nueva edición disponible</p>
          <p className="update-notice__summary" title={summary}>
            {summary || `v${version}`}
          </p>
        </div>
        <button type="button" className="update-notice__cta" onClick={onUpdate}>
          Actualizar
        </button>
      </div>
      {onOpenNotes ? (
        <button type="button" className="update-notice__notes" onClick={onOpenNotes}>
          Ver novedades
        </button>
      ) : null}
    </div>
  );
}
