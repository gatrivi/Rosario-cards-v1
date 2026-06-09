import React, { useRef } from 'react';
import './OrbPhotoCrop.css';

export default function OrbPhotoCrop({ image, zoom = 1, offsetX = 0, offsetY = 0, onChange }) {
  const dragRef = useRef(null);

  const emit = (patch) => onChange?.({ zoom, offsetX, offsetY, ...patch });

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, offsetX, offsetY };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    const nextX = Math.max(-40, Math.min(40, dragRef.current.offsetX + dx * 0.35));
    const nextY = Math.max(-40, Math.min(40, dragRef.current.offsetY + dy * 0.35));
    emit({ offsetX: nextX, offsetY: nextY });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="orb-crop">
      <div
        className="orb-crop__frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={image}
          alt=""
          draggable={false}
          style={{
            transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%)`,
          }}
        />
      </div>
      <label className="orb-crop__slider">
        <span>Acercar</span>
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.05"
          value={zoom}
          onChange={(e) => emit({ zoom: parseFloat(e.target.value) })}
        />
      </label>
      <p className="orb-crop__hint">Arrastra para centrar el rostro en el círculo</p>
    </div>
  );
}
