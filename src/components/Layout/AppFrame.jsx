import React, { useLayoutEffect, useRef } from 'react';

/** Viewport ownership lives here. Views keep their full-bleed background and
 * consume the measured clearances for readable content and local controls. */
export default function AppFrame({ className = '', header, notice, children, utilities, navigation, overlays }) {
  const rootRef = useRef(null);
  const headerRef = useRef(null);
  const navigationRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const headerNode = headerRef.current;
    const nav = navigationRef.current.querySelector('nav');
    const measure = () => {
      root.style.setProperty('--app-header-height', headerNode.getBoundingClientRect().height + 'px');
      if (nav) root.style.setProperty('--app-above-nav', nav.getBoundingClientRect().height + 'px');
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(headerNode);
    if (nav) observer?.observe(nav);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  return (
    <div ref={rootRef} data-testid="app-frame" className={'app-shell ' + className}>
      <header ref={headerRef} className="app-shell__header">{header}</header>
      {notice && <aside className="app-shell__notice" aria-label="Actualización disponible">{notice}</aside>}
      <main id="app-main" className="view-enter-active app-view-layer">{children}</main>
      <div className="app-shell__utilities">{utilities}</div>
      <div ref={navigationRef} className="app-shell__navigation">{navigation}</div>
      <div id="app-overlays" data-testid="app-overlays" className="app-shell__overlays">{overlays}</div>
    </div>
  );
}
