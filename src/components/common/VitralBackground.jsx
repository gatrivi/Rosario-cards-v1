import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VitralBackground.css';

function VitralImage({ candidates, onReady, imgClassName = 'vitral-bg__img' }) {
  const [index, setIndex] = useState(0);
  const imgRef = useRef(null);
  const src = candidates[index] ?? candidates[candidates.length - 1];

  const notifyReady = useCallback(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) notifyReady();
  }, [src, notifyReady]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      className={imgClassName}
      onLoad={notifyReady}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
        else notifyReady();
      }}
    />
  );
}

/**
 * Stained-glass background: image + shade + glare.
 * @param {'ave'|'mystery'|'prayer'} kind
 * @param {'rosary'} [variant] — lighter shade for rosary view
 * @param {boolean} [useBookletClasses] — use booklet-vitral class names (Libro)
 */
export default function VitralBackground({
  candidates,
  kind = 'prayer',
  variant,
  stepGlow = false,
  style,
  onReady,
  useBookletClasses = false,
}) {
  const prefix = useBookletClasses ? 'booklet-vitral' : 'vitral-bg';
  const kindClass = `${prefix}--${kind}`;
  const variantClass = variant ? `${prefix}--${variant}` : '';
  const stepClass = stepGlow ? `${prefix}--step` : '';

  return (
    <div
      className={[prefix, kindClass, variantClass, stepClass].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      <VitralImage
        candidates={candidates}
        onReady={onReady}
        imgClassName={`${prefix}__img`}
      />
      <div className={`${prefix}__shade`} />
      <div className={`${prefix}__glare`} />
    </div>
  );
}

export { VitralImage };
