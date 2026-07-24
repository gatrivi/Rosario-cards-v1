import React from 'react';
import { faustinaThumb } from '../../data/divineMercyData';
import './MercyWindowThumb.css';

export default function MercyWindowThumb({
  active = false,
  disabled = false,
  soon = false,
  onClick,
  title = 'Corona de la Divina Misericordia',
  isNovena = false,
  img,
  badge,
  /** photo = square tile (breves); default = gothic window */
  variant = 'window',
}) {
  const isDisabled = disabled || soon;
  return (
    <button
      type="button"
      className={`mercy-window-thumb${active ? ' mercy-window-thumb--active' : ''}${
        soon ? ' mercy-window-thumb--soon' : ''
      }${variant === 'photo' ? ' mercy-window-thumb--photo' : ''}`}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={soon ? `${title} (próximamente)` : title}
      aria-label={soon ? `${title} (próximamente)` : title}
    >
      <img src={img || faustinaThumb} alt="" className="mercy-window-thumb__img" />
      {(isNovena || badge) && (
        <span className="mercy-window-thumb__badge" aria-hidden="true">
          {badge || '9'}
        </span>
      )}
    </button>
  );
}
