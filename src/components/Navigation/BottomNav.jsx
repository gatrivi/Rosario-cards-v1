import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ICONS } from './NavIcons';
import { getViewIdFromPath, getPathForView } from '../../navigation/routes';
import './BottomNav.css';

function NavButton({
  iconId,
  texto,
  activo,
  onClick,
  disabled,
  simpleMode,
  hideLabel,
  dataAttrs,
  ariaExpanded,
}) {
  const Icon = NAV_ICONS[iconId];
  const iconSize = simpleMode ? 28 : 22;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      className={`bottom-nav__btn${activo ? ' bottom-nav__btn--active' : ''}${hideLabel ? ' bottom-nav__btn--icon-only' : ''}`}
      {...dataAttrs}
    >
      <span className="bottom-nav__icon">
        {Icon ? <Icon size={iconSize} /> : null}
      </span>
      {!hideLabel && (
        <span
          className={`bottom-nav__label${
            simpleMode ? ' bottom-nav__label--large' : ''
          }${disabled ? ' bottom-nav__label--disabled' : ''}`}
        >
          {texto}
        </span>
      )}
    </button>
  );
}

function emitBookletStep(dir) {
  window.dispatchEvent(new CustomEvent('rosario-booklet-step', { detail: { dir } }));
}

function emitDevotionsToggle() {
  window.dispatchEvent(new CustomEvent('rosario-devotions-toggle'));
}

export default function BottomNav({ isLeftHanded, simpleMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const vistaActiva = getViewIdFromPath(location.pathname);
  const bookletMode = vistaActiva === 'booklet';
  const [devotionsOpen, setDevotionsOpen] = useState(false);
  const [devotionsActive, setDevotionsActive] = useState(false);

  useEffect(() => {
    if (!bookletMode) {
      setDevotionsOpen(false);
      setDevotionsActive(false);
      return undefined;
    }
    const onState = (e) => {
      setDevotionsOpen(Boolean(e?.detail?.open));
      setDevotionsActive(Boolean(e?.detail?.active));
    };
    window.addEventListener('rosario-devotions-state', onState);
    return () => window.removeEventListener('rosario-devotions-state', onState);
  }, [bookletMode]);

  const navItems = [
    { id: 'tracker', texto: 'Plan' },
    { id: 'camino', texto: 'Camino' },
    { id: 'booklet', texto: 'Libro' },
    { id: 'rose', texto: 'Rosa' },
    { id: 'rosary', texto: 'Rosario' },
    { id: 'voz', texto: 'Voz' },
  ];

  const orderedItems = isLeftHanded ? [...navItems].reverse() : navItems;
  // Libro: step icons + Devociones tooltip + core destinations.
  const visibleItems = bookletMode
    ? orderedItems.filter((i) => ['booklet', 'rose', 'voz'].includes(i.id))
    : orderedItems;

  const stepPrev = (
    <NavButton
      key="step-prev"
      iconId="stepPrev"
      texto="Anterior"
      hideLabel
      onClick={() => emitBookletStep(-1)}
      simpleMode={simpleMode}
    />
  );
  const stepNext = (
    <NavButton
      key="step-next"
      iconId="stepNext"
      texto="Siguiente"
      hideLabel
      onClick={() => emitBookletStep(1)}
      simpleMode={simpleMode}
    />
  );
  const devotionsBtn = bookletMode ? (
    <NavButton
      key="devociones"
      iconId="devociones"
      texto="Devoc."
      activo={devotionsOpen || devotionsActive}
      ariaExpanded={devotionsOpen}
      onClick={emitDevotionsToggle}
      simpleMode={simpleMode}
      dataAttrs={{
        'data-devotions-toggle': 'true',
        'aria-label': 'Devociones y oraciones breves',
        title: 'Devociones',
      }}
    />
  ) : null;

  return (
    <nav className="bottom-nav glass-footer" aria-label="Navegación principal">
      {bookletMode && (isLeftHanded ? stepNext : stepPrev)}
      {visibleItems.map((item) => (
        <NavButton
          key={item.id}
          iconId={item.id}
          texto={item.texto}
          activo={vistaActiva === item.id}
          onClick={() => navigate(getPathForView(item.id))}
          simpleMode={simpleMode}
        />
      ))}
      {devotionsBtn}
      {bookletMode && (isLeftHanded ? stepPrev : stepNext)}
    </nav>
  );
}
