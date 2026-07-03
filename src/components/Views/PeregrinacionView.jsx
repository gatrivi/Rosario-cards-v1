import React, { useMemo, useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { PEREGRINACIONES, getPeregrinacionActual } from '../../data/LevelConfig';
import TutorialOverlay from '../common/TutorialOverlay';
import santaMariaImg from '../../data/assets/img/Theotokos.jpg';
import './PeregrinacionView.css';

function CaminoChurchIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 3L2 10h2v11h7v-7h0.5c0.28 0 0.5 0.22 0.5 0.5V21h7V10h2L12 3zm0 4.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"
      />
    </svg>
  );
}

export default function PeregrinacionView({ onSelectLevel, onPray, onRosedal }) {
  const { totalAveMarias } = useAveMariaStats();
  const { actual, next } = getPeregrinacionActual(totalAveMarias);
  const [selectedPin, setSelectedPin] = useState(null);

  const journeyProgressPct = useMemo(() => {
    if (!next) return 100;
    const denom = next.reqAveMarias - actual.reqAveMarias;
    if (denom <= 0) return 0;
    const raw = ((totalAveMarias - actual.reqAveMarias) / denom) * 100;
    return Math.min(100, Math.max(0, raw));
  }, [actual.reqAveMarias, next, totalAveMarias]);

  const remainingForNext = next ? Math.max(0, next.reqAveMarias - totalAveMarias) : 0;

  const selectedStatus = useMemo(() => {
    if (!selectedPin) return null;
    const isCompleted = totalAveMarias >= selectedPin.reqAveMarias;
    const isCurrent = Boolean(next && next.id === selectedPin.id);
    const isLocked = !isCompleted && !isCurrent;
    return {
      isLocked,
      statusLabel: isLocked ? 'Bloqueada' : isCurrent ? 'Actual' : 'Completada',
    };
  }, [next, selectedPin, totalAveMarias]);

  return (
    <div className="camino-view camino-view--v2">
      <div className="camino-heading">
        <div className="camino-tutorial">
          <TutorialOverlay
            title="El Camino"
            imageSrc={santaMariaImg}
            text="Cada Ave María es un paso. Las metas son peregrinaciones reales — de tu parroquia al Camino de Santiago y más allá. Elige tu ritmo diario en Plan, reza, y mira avanzar el camino."
          />
        </div>

        <h2 className="camino-title">El Camino</h2>
        <p className="camino-tagline">{totalAveMarias.toLocaleString()} rosas · destino: {next?.name || actual.name}</p>

        <div className="camino-journey-card">
          <div className="camino-journey-row">
            <div>
              <div className="camino-journey-label">{next ? 'Próximo destino' : 'Meta alcanzada'}</div>
              <div className="camino-journey-destination">{next?.name || actual.name}</div>
            </div>
            <div className="camino-journey-req">
              {next ? `${remainingForNext} rosas restantes` : '✓'}
            </div>
          </div>
          <div className="camino-progress-track" aria-label="Progreso de peregrinación">
            <div className="camino-progress-fill" style={{ width: `${journeyProgressPct}%` }} />
          </div>
        </div>

        <div className="camino-quick-actions">
          <button type="button" className="camino-btn camino-btn--primary" onClick={onPray}>
            Rezar ahora
          </button>
          <button type="button" className="camino-btn" onClick={onSelectLevel}>
            Plan · elegir nivel
          </button>
          <button type="button" className="camino-btn" onClick={onRosedal}>
            Rosedal
          </button>
        </div>
      </div>

      <ol className="camino-trail">
        {PEREGRINACIONES.map((p) => {
          const isCompleted = totalAveMarias >= p.reqAveMarias;
          const isCurrent = Boolean(next && next.id === p.id);
          const isLocked = !isCompleted && !isCurrent;
          const state = isLocked ? 'locked' : isCurrent ? 'current' : 'done';

          return (
            <li key={p.id} className={`camino-trail__item camino-trail__item--${state}`}>
              <button
                type="button"
                className="camino-trail__btn"
                onClick={() => setSelectedPin(p)}
              >
                <span className="camino-trail__icon" aria-hidden="true">
                  <CaminoChurchIcon className="camino-icon" />
                </span>
                <span className="camino-trail__body">
                  <span className="camino-trail__name">{p.name}</span>
                  <span className="camino-trail__meta">{p.reqAveMarias.toLocaleString()} rosas · ~{p.hrs}h</span>
                </span>
                <span className="camino-trail__badge">
                  {isLocked ? '🔒' : isCurrent ? '→' : '✓'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {selectedPin && (
        <div className="modal-overlay camino-modal-overlay" onClick={() => setSelectedPin(null)} role="dialog" aria-modal="true">
          <div className="modal-content camino-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="camino-modal-title">{selectedPin.name}</h3>
            <p className="camino-modal-description">{selectedPin.description}</p>
            <div className="camino-modal-meta">
              <span>Meta: {selectedPin.reqAveMarias.toLocaleString()} rosas</span>
              <span className="camino-status-chip">{selectedStatus?.statusLabel}</span>
            </div>
            <div className="camino-modal-actions">
              {!selectedStatus?.isLocked && onPray && (
                <button type="button" className="camino-btn camino-btn--primary" onClick={() => { setSelectedPin(null); onPray(); }}>
                  Rezar
                </button>
              )}
              <button type="button" className="camino-btn" onClick={() => setSelectedPin(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
