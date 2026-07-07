import React from 'react';
import { getOutlineStepThumb } from '../../utils/bookletShare';
import './BookletOutlineView.css';

export default function BookletOutlineView({
  steps = [],
  currentIndex = 0,
  devotionTitle,
  devotionSubtitle,
  mysteryType,
  onSelectStep,
  onClose,
}) {
  if (!steps.length) return null;

  return (
    <div className="booklet-outline-backdrop" onClick={onClose} role="presentation">
      <div
        className="booklet-outline-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Recorrido de la devoción"
      >
        <header className="booklet-outline-sheet__header">
          <div>
            <p className="booklet-outline-sheet__eyebrow">Recorrido</p>
            <h2 className="booklet-outline-sheet__title">{devotionTitle}</h2>
            {devotionSubtitle ? (
              <p className="booklet-outline-sheet__subtitle">{devotionSubtitle}</p>
            ) : null}
          </div>
          <button type="button" className="booklet-outline-sheet__close" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <p className="booklet-outline-sheet__hint">
          {steps.length} pasos · toca uno para ir allí
        </p>

        <ol className="booklet-outline-path">
          {steps.map((step, index) => {
            const thumb = getOutlineStepThumb(step, mysteryType, index);
            const state =
              index < currentIndex
                ? 'done'
                : index === currentIndex
                  ? 'current'
                  : 'upcoming';
            const side = index % 2 === 0 ? 'left' : 'right';

            return (
              <li
                key={`${step.id}-${index}`}
                className={`booklet-outline-path__item booklet-outline-path__item--${side} booklet-outline-path__item--${state}`}
              >
                <button
                  type="button"
                  className="booklet-outline-path__btn"
                  onClick={() => onSelectStep?.(index)}
                  aria-current={index === currentIndex ? 'step' : undefined}
                >
                  <span className="booklet-outline-path__node" aria-hidden="true">
                    {index + 1}
                  </span>
                  {thumb ? (
                    <img src={thumb} alt="" className="booklet-outline-path__thumb" />
                  ) : (
                    <span className="booklet-outline-path__thumb booklet-outline-path__thumb--placeholder" aria-hidden>
                      ✦
                    </span>
                  )}
                  <span className="booklet-outline-path__copy">
                    <span className="booklet-outline-path__label">Paso {index + 1}</span>
                    <span className="booklet-outline-path__name">{step.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
