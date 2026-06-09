import React from 'react';
import './OfferingLight.css';

export default function OfferingLight({ active, count = 4 }) {
  if (!active) return null;
  const n = Math.min(Math.max(count, 1), 6);
  return (
    <div className="offering-light" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="offering-light__spark" style={{ '--spark-i': i }} />
      ))}
    </div>
  );
}
