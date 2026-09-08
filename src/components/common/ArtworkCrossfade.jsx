import React, { useEffect, useRef, useState } from 'react';

const FADE_MS = 1400;

/** Keep decoded artwork on screen while loading; finish a dissolve before queuing another. */
export default function ArtworkCrossfade({ candidates, imgClassName, onReady }) {
  const requestKey = JSON.stringify(candidates);
  const [base, setBase] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [resolvedKey, setResolvedKey] = useState(null);
  const readyRef = useRef(onReady);
  const framesRef = useRef(new Set());
  const mountedRef = useRef(true);
  readyRef.current = onReady;

  useEffect(() => {
    mountedRef.current = true;
    const frames = framesRef.current;
    return () => {
      mountedRef.current = false;
      frames.forEach(cancelAnimationFrame);
    };
  }, []);

  useEffect(() => {
    if (incoming || resolvedKey === requestKey) return;
    const sources = JSON.parse(requestKey).filter(Boolean);
    if (!sources.length || sources[0] === base) {
      setResolvedKey(requestKey);
      readyRef.current?.(requestKey);
      return;
    }
    setIncoming({ key: requestKey, sources, index: 0, visible: false });
  }, [requestKey, base, incoming, resolvedKey]);

  useEffect(() => {
    if (!incoming) return undefined;
    const finish = () => {
      if (incoming.visible) setBase(incoming.sources[incoming.index]);
      setResolvedKey(incoming.key);
      readyRef.current?.(incoming.key);
      setIncoming(null);
    };
    // A failed/stalled request must not hide the prayer forever.
    const timer = setTimeout(finish, incoming.visible ? FADE_MS : 6000);
    return () => clearTimeout(timer);
  }, [incoming]);

  const loaded = (event) => {
    const image = event.currentTarget;
    const request = incoming;
    const show = () => {
      if (!mountedRef.current) return;
      const first = requestAnimationFrame(() => {
        framesRef.current.delete(first);
        const second = requestAnimationFrame(() => {
          framesRef.current.delete(second);
          setIncoming((current) => current === request ? { ...current, visible: true } : current);
        });
        framesRef.current.add(second);
      });
      framesRef.current.add(first);
    };
    // decode() avoids dissolving toward a loaded-but-not-yet-decoded bitmap.
    if (image.decode) image.decode().then(show, show);
    else show();
  };

  return <>
    {base && <img src={base} alt="" aria-hidden="true" className={imgClassName} />}
    {incoming && <img
      key={`${incoming.key}-${incoming.index}`}
      src={incoming.sources[incoming.index]}
      alt=""
      aria-hidden="true"
      className={`${imgClassName} rosary-artwork-incoming${incoming.visible ? ' rosary-artwork-incoming--visible' : ''}`}
      onLoad={loaded}
      onError={() => {
        if (incoming.index + 1 < incoming.sources.length) {
          setIncoming({ ...incoming, index: incoming.index + 1 });
        } else {
          setResolvedKey(incoming.key);
          readyRef.current?.(incoming.key);
          setIncoming(null);
        }
      }}
    />}
  </>;
}
