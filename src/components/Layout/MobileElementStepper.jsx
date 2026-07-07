import React, { useCallback, useEffect, useState } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isElementVisible(el) {
  if (!el || !el.isConnected) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function getFocusableElements(viewLayer, stepperRef) {
  if (!viewLayer) return [];
  const candidates = viewLayer.querySelectorAll(FOCUSABLE_SELECTOR);
  const stepperRoot = stepperRef?.current;
  return Array.from(candidates).filter((el) => {
    if (!isElementVisible(el)) return false;
    if (el.closest('.bottom-nav')) return false;
    if (el.closest('.app-access-stepper')) return false;
    if (el.closest('.app-one-hand-toggle')) return false;
    if (stepperRoot?.contains(el)) return false;
    return true;
  });
}

function useMobileStepperVisible(enabled) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return undefined;
    }
    if (typeof window.matchMedia !== 'function') {
      setVisible(false);
      return undefined;
    }
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const mqNarrow = window.matchMedia('(max-width: 768px)');

    const update = () => {
      setVisible(mqCoarse.matches || mqNarrow.matches);
    };
    update();
    mqCoarse.addEventListener('change', update);
    mqNarrow.addEventListener('change', update);
    return () => {
      mqCoarse.removeEventListener('change', update);
      mqNarrow.removeEventListener('change', update);
    };
  }, [enabled]);

  return visible;
}

export default function MobileElementStepper({ enabled, isLeftHanded }) {
  const stepperRef = React.useRef(null);
  const show = useMobileStepperVisible(enabled !== false);

  const step = useCallback((direction) => {
    const viewLayer = document.querySelector('.app-view-layer');
    const items = getFocusableElements(viewLayer, stepperRef);
    if (!items.length) return;

    const active = document.activeElement;
    let idx = items.indexOf(active);
    if (idx === -1) {
      idx = direction > 0 ? -1 : items.length;
    }
    const nextIdx = (idx + direction + items.length) % items.length;
    const target = items[nextIdx];
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  if (!show) return null;

  const sideClass = isLeftHanded
    ? 'app-access-stepper--left'
    : 'app-access-stepper--right';

  return (
    <div
      ref={stepperRef}
      className={`app-access-stepper ${sideClass}`}
      aria-hidden={false}
    >
      <button
        type="button"
        className="app-access-stepper__btn"
        aria-label="Elemento anterior"
        onClick={() => step(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="app-access-stepper__btn"
        aria-label="Elemento siguiente"
        onClick={() => step(1)}
      >
        ›
      </button>
    </div>
  );
}
