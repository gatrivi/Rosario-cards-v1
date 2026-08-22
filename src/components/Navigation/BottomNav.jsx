import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ICONS } from './NavIcons';
import { getViewIdFromPath, getPathForView } from '../../navigation/routes';
import { getDefaultMystery } from '../utils/getDefaultMystery';
import './BottomNav.css';

function NavButton({
  iconId,
  texto,
  activo,
  onClick,
  disabled,
  simpleMode,
  dataAttrs,
  ariaExpanded,
}) {
  const Icon = NAV_ICONS[iconId];
  const iconSize = simpleMode ? 28 : 24;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      className={`bottom-nav__btn${activo ? ' bottom-nav__btn--active' : ''}`}
      {...dataAttrs}
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

function emitBookletStep(dir) {
  window.dispatchEvent(new CustomEvent('rosario-booklet-step', { detail: { dir } }));
}

function emitDevotionsToggle() {
  window.dispatchEvent(new CustomEvent('rosario-devotions-toggle'));
}

function returnToBookletRosary() {
  const mystery = getDefaultMystery();
  const path = getPathForView('booklet');
  window.location.assign(`${path}?misterio=${encodeURIComponent(mystery)}&paso=0`);
}

const MAS_DESTINATIONS = [
  { id: 'tracker', texto: 'Diario', hint: 'Compromiso diario / Rosedal' },
  { id: 'macetones', texto: 'Rosedal', hint: 'Macetones del día' },
  { id: 'camino', texto: 'Camino', hint: 'Peregrinación' },
  { id: 'reliquias', texto: 'Reliquario', hint: 'Reliquias e íconos de santos' },
  { id: 'rose', texto: 'Rosa', hint: 'Meditación (mantener)' },
  { id: 'voz', texto: 'Voz', hint: 'Estudio de grabación' },
  { id: 'playlist', texto: 'Autorezo', hint: 'Cola → Liber con guía ≫' },
];

const MAS_ACTIVE = new Set(['tracker', 'macetones', 'camino', 'reliquias', 'rose', 'voz', 'playlist', 'jardin', 'monk']);

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
    {
      id: 'booklet',
      texto: bookletMode && devotionsActive ? 'Volver' : 'Libro',
      onClick: bookletMode && devotionsActive
        ? returnToBookletRosary
        : () => navigate(getPathForView('booklet')),
      ariaLabel: bookletMode && devotionsActive ? 'Volver al Rosario' : undefined,
      title: bookletMode && devotionsActive ? 'Volver al Rosario' : undefined,
    },
    {
      id: 'rosary',
      texto: 'Rosario',
      onClick: () => navigate(getPathForView('rosary')),
    },
  ];
  const orderedCore = isLeftHanded ? [...coreItems].reverse() : coreItems;

  const masActivo = MAS_ACTIVE.has(vistaActiva);
  const StepPrevIcon = NAV_ICONS.stepPrev;
  const StepNextIcon = NAV_ICONS.stepNext;
  const DevotionsIcon = NAV_ICONS.devociones;

  const previousButton = (
    <button
      key="step-prev"
      type="button"
      className="booklet-toolbar__btn booklet-toolbar__btn--icon"
      aria-label="Oración anterior"
      title="Anterior"
      onClick={() => emitBookletStep(-1)}
    >
      <StepPrevIcon size={24} />
    </button>
  );

  const nextButton = (
    <button
      key="step-next"
      type="button"
      className="booklet-toolbar__btn booklet-toolbar__btn--icon"
      aria-label="Oración siguiente"
      title="Siguiente"
      onClick={() => emitBookletStep(1)}
    >
      <StepNextIcon size={24} />
    </button>
  );

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

      <nav
        className={`bottom-nav glass-footer${bookletMode ? ' bottom-nav--booklet' : ''}`}
        aria-label="Navegación principal"
      >
        {bookletMode ? (
          <div className="booklet-toolbar" role="toolbar" aria-label="Controles de lectura">
            {isLeftHanded ? nextButton : previousButton}
            <button
              type="button"
              className={`booklet-toolbar__btn booklet-toolbar__btn--devotions${
                devotionsOpen || devotionsActive ? ' booklet-toolbar__btn--active' : ''
              }`}
              aria-label="Devociones y oraciones breves"
              aria-expanded={devotionsOpen}
              title="Devociones"
              onClick={emitDevotionsToggle}
            >
              <DevotionsIcon size={22} />
              <span>Devociones</span>
            </button>
            {isLeftHanded ? previousButton : nextButton}
          </div>
        ) : null}
        <div className="bottom-nav__row">
          {orderedCore.map((item) => (
            <NavButton
              key={item.id}
              iconId={item.id}
              texto={item.texto}
              activo={vistaActiva === item.id}
              onClick={item.onClick}
              simpleMode={simpleMode}
              dataAttrs={{
                ...(item.ariaLabel ? { 'aria-label': item.ariaLabel } : {}),
                ...(item.title ? { title: item.title } : {}),
              }}
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
            dataAttrs={{ 'aria-label': 'Más: Diario, Rosedal, Camino, Reliquario, Rosa, Voz, Autorezo' }}
          />
        </div>
      </nav>
    </>
  );
}
