import React, { useMemo, useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { PEREGRINACIONES, getPeregrinacionActual } from '../../data/LevelConfig';
import TutorialOverlay from '../common/TutorialOverlay';
import santaMariaImg from '../../data/assets/img/Theotokos.jpg';
import './PeregrinacionView.css';

function CaminoChurchIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {/* Simple church / shrine glyph (no emoji UI) */}
      <path
        fill="currentColor"
        d="M12 3L2 10h2v11h7v-7h0.5c0.28 0 0.5 0.22 0.5 0.5V21h7V10h2L12 3zm0 4.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"
      />
    </svg>
  );
}

export default function PeregrinacionView({ onSelectLevel }) {
  const { totalAveMarias } = useAveMariaStats();
  const { actual, next } = getPeregrinacionActual(totalAveMarias);
  const [selectedPin, setSelectedPin] = useState(null);

  // Determine global progress across all peregrinaciones
  const currentStepIndex = useMemo(() => {
    const totalSteps = PEREGRINACIONES.length;
    if (!next) return totalSteps;
    const idx = PEREGRINACIONES.findIndex((p) => p.id === next.id);
    return Math.max(0, idx);
  }, [next]);

  const journeyProgressPct = useMemo(() => {
    if (!next) return 100;
    const denom = next.reqAveMarias - actual.reqAveMarias;
    if (denom <= 0) return 0;
    const raw = ((totalAveMarias - actual.reqAveMarias) / denom) * 100;
    return Math.min(100, Math.max(0, raw));
  }, [actual.reqAveMarias, next, totalAveMarias]);

  const getPinGridPlacement = (i) => {
    const row = Math.floor(i / 3);
    const colInRow = i % 3;
    const col = row % 2 === 0 ? colInRow : 2 - colInRow;
    return { gridRow: 4 - row, gridColumn: col + 1 };
  };

  const serpentinePointForIndex = (i) => {
    const row = Math.floor(i / 3);
    const colInRow = i % 3;
    const col = row % 2 === 0 ? colInRow : 2 - colInRow;
    const px = (col * 33.33) + 16.66;
    const py = ((3 - row) * 25) + 12.5;
    return `${px},${py}`;
  };

  const snakePathAll = useMemo(() => {
    const points = PEREGRINACIONES.map((_, i) => serpentinePointForIndex(i));
    return `M ${points.join(' L ')}`;
  }, []);

  const snakePathProgress = useMemo(() => {
    const end = Math.min(PEREGRINACIONES.length, currentStepIndex + 1);
    const points = PEREGRINACIONES.slice(0, end).map((_, i) => serpentinePointForIndex(i));
    return `M ${points.join(' L ')}`;
  }, [currentStepIndex]);

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
    <div className="camino-view">
      <div className="camino-heading">
        <div className="camino-tutorial">
          <TutorialOverlay
            title="El Camino"
            imageSrc={santaMariaImg}
            text="«Quien reza se salva, quien no reza se condena.» — San Alfonso María de Ligorio&#10;&#10;Sigue tu progreso histórico. Cada nodo representa una meta de oración. Toca las iglesias para ver los detalles de tu destino."
          />
        </div>

        <h2 className="camino-title">El Camino</h2>
        <div className="camino-rosas-count">{totalAveMarias} rosas cultivadas</div>

        {/* CURRENT / NEXT journey */}
        <div className="camino-journey-card">
          {next ? (
            <>
              <div className="camino-journey-row">
                <div style={{ textAlign: 'left' }}>
                  <div className="camino-journey-label">Próxima peregrinación</div>
                  <div className="camino-journey-destination">{next.name}</div>
                </div>
                <div className="camino-journey-req">
                  {next.reqAveMarias} rosas
                  <div style={{ fontSize: '0.75rem', marginTop: 3, color: 'rgba(212,175,55,0.7)' }}>
                    {remainingForNext} rosas restantes
                  </div>
                </div>
              </div>
              <div className="camino-progress-track" aria-label="Progreso de peregrinación">
                <div className="camino-progress-fill" style={{ width: `${journeyProgressPct}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="camino-journey-row">
                <div style={{ textAlign: 'left' }}>
                  <div className="camino-journey-label">Peregrinación completada</div>
                  <div className="camino-journey-destination">{actual.name}</div>
                </div>
                <div className="camino-journey-req">{actual.reqAveMarias} rosas</div>
              </div>
              <div className="camino-progress-track">
                <div className="camino-progress-fill" style={{ width: '100%' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SNAKE MAP */}
      <div className="camino-map-panel">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="camino-snake-svg">
          <path
            d={snakePathAll}
            fill="none"
            stroke="rgba(248,244,230,0.18)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={snakePathProgress}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3,2"
          />
        </svg>

        <div className="camino-pin-grid">
          {PEREGRINACIONES.map((p, i) => {
            const isCompleted = totalAveMarias >= p.reqAveMarias;
            const isCurrent = Boolean(next && next.id === p.id);
            const isLocked = !isCompleted && !isCurrent;

            const placement = getPinGridPlacement(i);
            const pinStateClass = isLocked
              ? 'camino-pin--locked'
              : isCurrent
                ? 'camino-pin--current'
                : 'camino-pin--completed';

            const badgeLabel = isLocked ? 'Bloqueada' : isCurrent ? 'Actual' : 'Completada';

            return (
              <button
                key={p.id}
                type="button"
                className={`camino-pin ${pinStateClass}`}
                style={{ ...placement, zIndex: isCurrent ? 10 : 1 }}
                onClick={() => setSelectedPin(p)}
                aria-label={`${p.name} (${badgeLabel})`}
              >
                <div className="camino-medallion" aria-hidden="true">
                  <CaminoChurchIcon className="camino-icon" />
                </div>
                <div className="camino-pin-name">{p.name}</div>
                <div className="camino-pin-badge">{badgeLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="camino-bottom-spacer" aria-hidden="true" />

      {/* DETAIL MODAL */}
      {selectedPin && (
        <div
          className="modal-overlay camino-modal-overlay"
          onClick={() => setSelectedPin(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content camino-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="camino-modal-head">
              <div className="camino-modal-icon">
                <CaminoChurchIcon className="camino-icon" />
              </div>
            </div>

            <h3 className="camino-modal-title">{selectedPin.name}</h3>
            <p className="camino-modal-description">{selectedPin.description}</p>

            <div className="camino-modal-meta">
              <div>
                <div style={{ color: 'rgba(200,200,200,1)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Meta: {selectedPin.reqAveMarias} rosas
                </div>
              </div>
              <div className="camino-status-chip">{selectedStatus?.statusLabel ?? '—'}</div>
            </div>

            <div className="camino-modal-actions">
              {!selectedStatus?.isLocked && (
                <button
                  type="button"
                  className="camino-btn camino-btn--primary"
                  onClick={() => {
                    setSelectedPin(null);
                    if (onSelectLevel) onSelectLevel(selectedPin);
                  }}
                >
                  Ir al jardín
                </button>
              )}
              <button
                type="button"
                className="camino-btn"
                onClick={() => setSelectedPin(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
