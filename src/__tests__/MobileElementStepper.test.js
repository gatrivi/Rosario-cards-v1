import { getFocusableElements } from '../components/Layout/MobileElementStepper';

describe('getFocusableElements', () => {
  let viewLayer;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="app-view-layer">
        <button id="visible-btn">A</button>
        <button id="hidden-btn" style="display:none">B</button>
        <button id="disabled-btn" disabled>C</button>
        <a href="#x" id="link">Link</a>
      </div>
      <nav class="bottom-nav"><button id="nav-btn">Nav</button></nav>
      <div class="app-access-stepper"><button id="stepper-btn">S</button></div>
    `;
    viewLayer = document.querySelector('.app-view-layer');
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 40,
      top: 0,
      left: 0,
      right: 100,
      bottom: 40,
    }));
  });

  it('returns visible focusable elements inside view layer', () => {
    const items = getFocusableElements(viewLayer, { current: null });
    const ids = items.map((el) => el.id);
    expect(ids).toContain('visible-btn');
    expect(ids).toContain('link');
    expect(ids).not.toContain('hidden-btn');
    expect(ids).not.toContain('disabled-btn');
    expect(ids).not.toContain('nav-btn');
  });

  it('excludes stepper buttons', () => {
    const stepperRef = { current: document.querySelector('.app-access-stepper') };
    const items = getFocusableElements(viewLayer, stepperRef);
    expect(items.some((el) => el.id === 'stepper-btn')).toBe(false);
  });
});
