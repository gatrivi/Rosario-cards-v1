import React from 'react';
import { faustinaThumbnail } from '../../data/divineMercyData';
import './MercyWindowThumb.css';

export default function MercyWindowThumb({
  active = false,
  disabled = false,
  onClick,
  title = 'Corona de la Divina Misericordia',
}) {
  return (
    <button
      type="button"
      className={`mercy-window-thumb${active ? ' mercy-window-thumb--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      <img src={faustinaThumbnail} alt="" className="mercy-window-thumb__img" />
    </button>
  );
}
