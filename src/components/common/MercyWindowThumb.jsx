import React from 'react';
import { faustinaThumb } from '../../data/divineMercyData';
import './MercyWindowThumb.css';

export default function MercyWindowThumb({
  active = false,
  disabled = false,
  onClick,
  title = 'Corona de la Divina Misericordia',
  isNovena = false,
  img,
  badge,
}) {
  return (
    <button
      type="button"
      className={`mercy-window-thumb${active ? ' mercy-window-thumb--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{ position: 'relative' }}
    >
      <img src={img || faustinaThumb} alt="" className="mercy-window-thumb__img" />
      {(isNovena || badge) && (
        <span style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          backgroundColor: '#d4af37',
          color: '#000',
          borderRadius: '50%',
          width: '12px',
          height: '12px',
          fontSize: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          border: '1px solid #000',
          boxShadow: '0 0 4px rgba(212, 175, 55, 0.8)'
        }}>{badge || '9'}</span>
      )}
    </button>
  );
}
