import React, { useMemo, useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { resolverReliquias, oracionTexto } from '../../data/reliquiasData';
import { IMG } from '../../data/imageRegistry';
import TutorialOverlay from '../common/TutorialOverlay';
import './ReliquarioView.css';

export default function ReliquarioView({ onPray }) {
  const { totalAveMarias } = useAveMariaStats();
  const [oracionAbiertaId, setOracionAbiertaId] = useState(null);
  const items = useMemo(() => resolverReliquias(totalAveMarias), [totalAveMarias]);
  const desbloqueadas = useMemo(
    () => items.reduce((n, it) => n + (it.desbloqueada ? 1 : 0), 0),
    [items]
  );

  return (
    <div className="reliquario-view">
      <div className="reliquario-header">
        <div className="reliquario-tutorial">
          <TutorialOverlay
            title="El Reliquario"
            imageSrc={IMG.theotokos}
            text="Cada Ave María es una rosa ofrecida. Al juntar rosas, los santos te van confiando sus reliquias e íconos — y con ellos, sus oraciones. Tocá una reliquia desbloqueada para rezar con su santo."
          />
        </div>
        <h2 className="reliquario-title">Reliquario</h2>
        <p className="reliquario-tagline">
          {totalAveMarias.toLocaleString()} rosas · {desbloqueadas} de{' '}
          {items.length} reliquias
        </p>
        {onPray ? (
          <button
            type="button"
            className="reliquario-btn-ganar"
            onClick={onPray}
          >
            Ganar rosas rezando el Rosario
          </button>
        ) : null}
      </div>

      <div className="reliquario-grid">
        {items.map(({ reliquia, desbloqueada, faltan }) => {
          const oracionAbierta = oracionAbiertaId === reliquia.id;
          return (
            <article
              key={reliquia.id}
              className={`reliquario-card${
                desbloqueada ? '' : ' reliquario-card--locked'
              }`}
              aria-label={
                desbloqueada
                  ? `${reliquia.nombre} — desbloqueada`
                  : `${reliquia.nombre} — bloqueada, requiere ${reliquia.reqAveMarias} Ave Marías`
              }
            >
              <div className="reliquario-card__art">
                <img src={IMG[reliquia.imgId]} alt="" loading="lazy" />
                {!desbloqueada ? (
                  <div className="reliquario-card__lock">
                    <span aria-hidden="true">🔒</span>
                    <p>
                      Se abre con {reliquia.reqAveMarias.toLocaleString()} Ave
                      Marías · te faltan {faltan.toLocaleString()}
                    </p>
                  </div>
                ) : null}
              </div>
              <h3 className="reliquario-card__nombre">{reliquia.nombre}</h3>
              <p className="reliquario-card__santo">{reliquia.santo}</p>
              {desbloqueada ? (
                <>
                  <span className="reliquario-card__virtud">
                    {reliquia.virtud}
                  </span>
                  <p className="reliquario-card__historia">
                    {reliquia.historia}
                  </p>
                  <button
                    type="button"
                    className={`reliquario-btn${
                      oracionAbierta ? ' reliquario-btn--active' : ''
                    }`}
                    aria-expanded={oracionAbierta}
                    onClick={() =>
                      setOracionAbiertaId(oracionAbierta ? null : reliquia.id)
                    }
                  >
                    {oracionAbierta
                      ? 'Cerrar oración'
                      : `Rezar: ${reliquia.oracion.titulo}`}
                  </button>
                  {oracionAbierta ? (
                    <blockquote className="reliquario-oracion">
                      <p>{oracionTexto(reliquia)}</p>
                    </blockquote>
                  ) : null}
                </>
              ) : (
                <p className="reliquario-card__historia reliquario-card__historia--locked">
                  El santo aún guarda en secreto esta gracia.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
