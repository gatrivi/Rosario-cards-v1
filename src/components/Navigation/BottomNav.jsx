import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ICONS } from './NavIcons';
import { getViewIdFromPath, getPathForView } from '../../navigation/routes';
import './BottomNav.css';

function NavButton({ iconId, texto, activo, onClick, disabled, simpleMode, hideLabel }) {
  const Icon = NAV_ICONS[iconId];
  const iconSize = simpleMode ? 28 : 22;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`bottom-nav__btn${activo ? ' bottom-nav__btn--active' : ''}${hideLabel ? ' bottom-nav__btn--icon-only' : ''}`}
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

export default function BottomNav({ isLeftHanded, simpleMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const vistaActiva = getViewIdFromPath(location.pathname);
  const bookletMode = vistaActiva === 'booklet';

  const navItems = [
    { id: 'tracker', texto: 'Plan' },
    { id: 'camino', texto: 'Camino' },
    { id: 'booklet', texto: 'Libro' },
    { id: 'rose', texto: 'Rosa' },
    { id: 'rosary', texto: 'Rosario' },
    { id: 'voz', texto: 'Voz' },
  ];

  const orderedItems = isLeftHanded ? [...navItems].reverse() : navItems;
  // UX: when viewing "Libro", keep core actions + step icons.
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
      {bookletMode && (isLeftHanded ? stepPrev : stepNext)}
    </nav>
  );
}
