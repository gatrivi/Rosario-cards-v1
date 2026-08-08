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

function VitralCrossfadeImage({ candidates, onReady, imgClassName = 'vitral-bg__img' }) {
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const targetSrc = candidates[fallbackIndex] ?? candidates[candidates.length - 1] ?? '';
  const [baseSrc, setBaseSrc] = useState(targetSrc);
  const [overlaySrc, setOverlaySrc] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const baseRef = useRef(null);
  const mountedRef = useRef(false);
  const readyNotifiedRef = useRef(false);

  const notifyReady = useCallback(() => {
    if (readyNotifiedRef.current) return;
    readyNotifiedRef.current = true;
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    setFallbackIndex(0);
  }, [candidates]);

  useEffect(() => {
    readyNotifiedRef.current = false;
    if (!targetSrc) {
      notifyReady();
      return;
    }

    if (!mountedRef.current) {
      mountedRef.current = true;
      setBaseSrc(targetSrc);
      setOverlaySrc(null);
      setOverlayVisible(false);
      return;
    }

    if (targetSrc === baseSrc && !overlaySrc) {
      notifyReady();
      return;
    }

    setOverlaySrc(targetSrc);
    setOverlayVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOverlayVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [targetSrc, baseSrc, overlaySrc, notifyReady]);

  useEffect(() => {
    const img = baseRef.current;
    if (!overlaySrc && img?.complete && img.naturalWidth > 0) notifyReady();
  }, [baseSrc, overlaySrc, notifyReady]);

  const handleBaseLoad = useCallback(() => {
    if (!overlaySrc) notifyReady();
  }, [overlaySrc, notifyReady]);

  const handleOverlayLoad = useCallback(() => {
    notifyReady();
  }, [notifyReady]);

  const handleOverlayError = useCallback(() => {
    if (fallbackIndex < candidates.length - 1) {
      setFallbackIndex((i) => i + 1);
      return;
    }
    notifyReady();
  }, [fallbackIndex, candidates.length, notifyReady]);

  const handleOverlayTransitionEnd = useCallback((event) => {
    if (event.propertyName !== 'opacity' || !overlayVisible || !overlaySrc) return;
    setBaseSrc(overlaySrc);
    setOverlaySrc(null);
    setOverlayVisible(false);
  }, [overlayVisible, overlaySrc]);

  return (
    <>
      {baseSrc ? (
        <img
          ref={baseRef}
          src={baseSrc}
          alt=""
          className={imgClassName}
          onLoad={handleBaseLoad}
          aria-hidden="true"
        />
      ) : null}
      {overlaySrc ? (
        <img
          src={overlaySrc}
          alt=""
          className={`${imgClassName} vitral-bg__img--overlay${
            overlayVisible ? ' vitral-bg__img--overlay-visible' : ''
          }`}
          onLoad={handleOverlayLoad}
          onError={handleOverlayError}
          onTransitionEnd={handleOverlayTransitionEnd}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

/**
 * Stained-glass background: image + shade + glare.
 * @param {'ave'|'mystery'|'prayer'} kind
 * @param {'rosary'} [variant] — lighter shade for rosary view
 * @param {boolean} [useBookletClasses] — use booklet-vitral class names (Libro)
 * @param {boolean} [crossfade] — crossfade when candidates change (Libro transitions)
 */
export default function VitralBackground({
  candidates,
  kind = 'prayer',
  variant,
  stepGlow = false,
  crossfade = false,
  style,
  onReady,
  useBookletClasses = false,
}) {
  const prefix = useBookletClasses ? 'booklet-vitral' : 'vitral-bg';
  const kindClass = `${prefix}--${kind}`;
  const variantClass = variant ? `${prefix}--${variant}` : '';
  const stepClass = stepGlow ? `${prefix}--step` : '';
  const ImageComponent = crossfade ? VitralCrossfadeImage : VitralImage;

  return (
    <div
      className={[prefix, kindClass, variantClass, stepClass].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      <ImageComponent
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
