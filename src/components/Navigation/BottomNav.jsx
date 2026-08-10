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

const MAS_DESTINATIONS = [
  { id: 'tracker', texto: 'Diario', hint: 'Compromiso diario / Rosedal' },
  { id: 'macetones', texto: 'Rosedal', hint: 'Macetones del día' },
  { id: 'camino', texto: 'Camino', hint: 'Peregrinación' },
  { id: 'rose', texto: 'Rosa', hint: 'Meditación (mantener)' },
  { id: 'voz', texto: 'Voz', hint: 'Estudio de grabación' },
  { id: 'playlist', texto: 'Autorezo', hint: 'Cola → Liber con guía ≫' },
];

const MAS_ACTIVE = new Set(['tracker', 'macetones', 'camino', 'rose', 'voz', 'playlist', 'jardin', 'monk']);

export default function BottomNav({ isLeftHanded, simpleMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const vistaActiva = getViewIdFromPath(location.pathname);
  const bookletMode = vistaActiva === 'booklet';
  const [devotionsOpen, setDevotionsOpen] = useState(false);
  const [devotionsActive, setDevotionsActive] = useState(false);
  const [masOpen, setMasOpen] = useState(false);

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

  useEffect(() => {
    setMasOpen(false);
  }, [vistaActiva]);

  const coreItems = [
    { id: 'booklet', texto: 'Libro' },
    { id: 'rosary', texto: 'Rosario' },
  ];
  const orderedCore = isLeftHanded ? [...coreItems].reverse() : coreItems;

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

  const masActivo = MAS_ACTIVE.has(vistaActiva);

  return (
    <>
      {masOpen ? (
        <div
          className="bottom-nav__mas-scrim"
          role="presentation"
          onClick={() => setMasOpen(false)}
        >
          <div
            className="bottom-nav__mas-sheet"
            role="menu"
            aria-label="Más opciones"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="bottom-nav__mas-map">
              Libro = texto · Rosario = cuentas · Rosa = meditación
            </p>
            {MAS_DESTINATIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={`bottom-nav__mas-item${vistaActiva === item.id ? ' bottom-nav__mas-item--active' : ''}`}
                onClick={() => {
                  setMasOpen(false);
                  navigate(getPathForView(item.id));
                }}
              >
                <span className="bottom-nav__mas-item-title">{item.texto}</span>
                <span className="bottom-nav__mas-item-hint">{item.hint}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <nav className="bottom-nav glass-footer" aria-label="Navegación principal">
        {bookletMode && (isLeftHanded ? stepNext : stepPrev)}
        {orderedCore.map((item) => (
          <NavButton
            key={item.id}
            iconId={item.id}
            texto={item.texto}
            activo={vistaActiva === item.id}
            onClick={() => navigate(getPathForView(item.id))}
            simpleMode={simpleMode}
          />
        ))}
        <NavButton
          key="mas"
          iconId="mas"
          texto="Más"
          activo={masActivo || masOpen}
          ariaExpanded={masOpen}
          onClick={() => setMasOpen((o) => !o)}
          simpleMode={simpleMode}
          dataAttrs={{ 'aria-label': 'Más: Diario, Rosedal, Camino, Rosa, Voz, Cola' }}
        />
        {devotionsBtn}
        {bookletMode && (isLeftHanded ? stepPrev : stepNext)}
      </nav>
    </>
  );
}
