// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (value) => value;
}

const canvasContextMock = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  canvas: { width: 300, height: 150 },
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: jest.fn(() => canvasContextMock),
});

// Old jsdom (CRA 5) has no PointerEvent, so fireEvent.pointerDown(...) events
// carry no pointerType/pointerId — every pointer-interaction test silently
// tests nothing. Polyfill with a MouseEvent subclass that honors the init dict.
if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  window.PointerEvent = PointerEventPolyfill;
}
