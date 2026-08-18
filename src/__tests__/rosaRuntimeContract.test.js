import { installRosaPointerContract, reconcileVisibleAppVersion } from '../utils/rosaRuntimeContract';

function pointerEvent(type, { pointerId = 1, pointerType = 'mouse' } = {}) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  return event;
}

describe('Rosa runtime interaction contract', () => {
  let cleanup;

  beforeEach(() => {
    window.history.pushState({}, '', '/rosa');
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
    document.body.innerHTML = '';
    window.history.pushState({}, '', '/');
  });

  test.each(['mouse', 'touch'])('%s hover/move does not pray until pointer is down', (pointerType) => {
    cleanup = installRosaPointerContract(document, window);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const moves = jest.fn();
    target.addEventListener('pointermove', moves);

    target.dispatchEvent(pointerEvent('pointermove', { pointerType }));
    expect(moves).not.toHaveBeenCalled();

    target.dispatchEvent(pointerEvent('pointerdown', { pointerType }));
    target.dispatchEvent(pointerEvent('pointermove', { pointerType }));
    expect(moves).toHaveBeenCalledTimes(1);

    target.dispatchEvent(pointerEvent('pointerup', { pointerType }));
    target.dispatchEvent(pointerEvent('pointermove', { pointerType }));
    expect(moves).toHaveBeenCalledTimes(1);
  });

  test('captures desktop pointer when supported', () => {
    cleanup = installRosaPointerContract(document, window);
    const target = document.createElement('div');
    target.setPointerCapture = jest.fn();
    document.body.appendChild(target);

    target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 7, pointerType: 'mouse' }));
    expect(target.setPointerCapture).toHaveBeenCalledWith(7);
  });

  test('visible version badge is reconciled with the runtime bundle version', () => {
    document.body.innerHTML = '<button class="app-version-badge" aria-label="Versión 0.3.79. Ver novedades">v0.3.79</button>';
    cleanup = reconcileVisibleAppVersion('0.3.81', document);

    const badge = document.querySelector('.app-version-badge');
    expect(badge).toHaveTextContent('v0.3.81');
    expect(badge).toHaveAttribute('aria-label', 'Versión 0.3.81. Ver novedades');
    expect(document.documentElement.dataset.appVersion).toBe('0.3.81');
  });
});
