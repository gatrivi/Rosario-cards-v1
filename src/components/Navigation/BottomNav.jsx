import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ICONS } from './NavIcons';
import { getViewIdFromPath, getPathForView } from '../../navigation/routes';
import './BottomNav.css';

function NavButton({ iconId, texto, activo, onClick, disabled, simpleMode }) {
  const Icon = NAV_ICONS[iconId];
  const iconSize = simpleMode ? 28 : 22;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`bottom-nav__btn${activo ? ' bottom-nav__btn--active' : ''}`}
    >
      <span className="bottom-nav__icon">
        {Icon ? <Icon size={iconSize} /> : null}
      </span>
      <span
        className={`bottom-nav__label${
          simpleMode ? ' bottom-nav__label--large' : ''
        }${disabled ? ' bottom-nav__label--disabled' : ''}`}
      >
        {texto}
      </span>
    </button>
  );
}

export default function BottomNav({ isLeftHanded, simpleMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const vistaActiva = getViewIdFromPath(location.pathname);

  const navItems = [
    { id: 'stats', texto: 'Stats' },
    { id: 'tracker', texto: 'Plan' },
    { id: 'camino', texto: 'Camino' },
    { id: 'booklet', texto: 'Libro' },
    { id: 'rose', texto: 'Rosa' },
    { id: 'rosary', texto: 'Rosario' },
    { id: 'voz', texto: 'Voz' },
  ];

  const orderedItems = isLeftHanded ? [...navItems].reverse() : navItems;

  return (
    <nav className="bottom-nav glass-footer" aria-label="Navegación principal">
      {orderedItems.map((item) => (
        <NavButton
          key={item.id}
          iconId={item.id}
          texto={item.texto}
          activo={vistaActiva === item.id}
          onClick={() => navigate(getPathForView(item.id))}
          simpleMode={simpleMode}
        />
      ))}
    </nav>
  );
}
