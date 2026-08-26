import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('../utils/audioManager', () => ({
  __esModule: true,
  default: {
    getContext: jest.fn(() => null),
    resume: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../hooks/useAveMariaStats', () => ({
  useAveMariaStats: () => ({
    addRosas: jest.fn(),
    storeRoseData: jest.fn(),
    totalAveMarias: 0,
  }),
}));

jest.mock('../hooks/useCloudSync', () => ({
  useCloudSync: () => ({
    cloudState: null,
    syncToCloud: jest.fn(),
  }),
}));

jest.mock('../components/common/SacredDust', () => () => null);
jest.mock('../components/Views/SacredDrawing', () => () => <div data-testid="sacred-drawing" />);

jest.mock('../components/Views/RoseDrawing', () => {
  const React = require('react');
  const MockRoseDrawing = ({ progress }) => (
    <div data-testid="rose-drawing" data-progress={String(progress)} />
  );
  MockRoseDrawing.PATH_COUNT = 12;
  return { __esModule: true, default: MockRoseDrawing };
});

jest.mock('../components/Views/SacredText', () => {
  const React = require('react');

  const MockSacredText = React.forwardRef(({
    words,
    wordSpanRefs,
    charProgressIndex,
  }, forwardedRef) => {
    const setContainerRef = (node) => {
      if (forwardedRef) {
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else forwardedRef.current = node;
      }
      if (node) {
        node.getBoundingClientRect = () => ({
          top: 120,
          bottom: 220,
          left: 20,
          right: 1000,
          width: 980,
          height: 100,
          x: 20,
          y: 120,
          toJSON: () => {},
        });
      }
    };

    return (
      <div
        ref={setContainerRef}
        data-testid="sacred-text"
        data-char-progress={String(charProgressIndex)}
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            data-testid={`word-${i}`}
            ref={(node) => {
              if (!node) return;
              wordSpanRefs.current[i] = node;
              const left = 40 + i * 220;
              node.getBoundingClientRect = () => ({
                top: 145,
                bottom: 185,
                left,
                right: left + 100,
                width: 100,
                height: 40,
                x: left,
                y: 145,
                toJSON: () => {},
              });
            }}
          >
            {word}
          </span>
        ))}
      </div>
    );
  });

  return { __esModule: true, default: MockSacredText };
});

import RoseView from '../components/Views/RoseView';
import { getSequenceData } from '../components/Views/roseViewHelpers';

const aveMariaIndex = getSequenceData('gozosos').findIndex((prayer) => prayer.id === 'A');

function renderAveMaria() {
  const onUpdateProgreso = jest.fn();
  const result = render(
    <RoseView
      currentPrayerIndex={aveMariaIndex}
      misterioActual="gozosos"
      onUpdateProgreso={onUpdateProgreso}
      soundEnabled={false}
      onToggleSound={() => {}}
      meditationRitmo="oro"
      simpleMode={false}
    />
  );
  return { ...result, onUpdateProgreso, surface: result.container.firstChild };
}

function dragAcrossFirstTwoWords(surface, pointerType) {
  fireEvent.pointerDown(surface, {
    pointerId: 1,
    pointerType,
    clientX: 90,
    clientY: 165,
  });

  // First move activates the verse at word 0.
  fireEvent.pointerMove(surface, {
    pointerId: 1,
    pointerType,
    clientX: 90,
    clientY: 165,
  });

  act(() => {
    jest.setSystemTime(new Date('2026-08-17T20:00:01-03:00'));
  });

  // Second move enters word 1 after the rhythm throttle window.
  fireEvent.pointerMove(surface, {
    pointerId: 1,
    pointerType,
    clientX: 310,
    clientY: 165,
  });
}

describe('RoseView drag-to-pray interaction contract', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-17T20:00:00-03:00'));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete HTMLElement.prototype.setPointerCapture;
    delete HTMLElement.prototype.releasePointerCapture;
    delete HTMLElement.prototype.hasPointerCapture;
  });

  test.each(['mouse', 'touch'])('%s drag reveals prayer text and grows the Ave Maria rose', (pointerType) => {
    const { surface } = renderAveMaria();

    // jsdom (CRA 5) doesn't support the touch-action CSS property; assert only
    // where the environment can represent it (real browsers, newer jsdom).
    if ('touchAction' in document.body.style) {
      expect(surface).toHaveStyle({ touchAction: 'none' });
    }
    expect(Number(screen.getByTestId('rose-drawing').dataset.progress)).toBe(0);
    expect(Number(screen.getByTestId('sacred-text').dataset.charProgress)).toBe(-1);

    dragAcrossFirstTwoWords(surface, pointerType);

    expect(Number(screen.getByTestId('sacred-text').dataset.charProgress)).toBeGreaterThanOrEqual(0);
    expect(Number(screen.getByTestId('rose-drawing').dataset.progress)).toBeGreaterThan(0);
  });

  test('touch pointer is captured and released when the browser supports pointer capture', () => {
    const setPointerCapture = jest.fn();
    const releasePointerCapture = jest.fn();
    const hasPointerCapture = jest.fn(() => true);

    HTMLElement.prototype.setPointerCapture = setPointerCapture;
    HTMLElement.prototype.releasePointerCapture = releasePointerCapture;
    HTMLElement.prototype.hasPointerCapture = hasPointerCapture;

    const { surface } = renderAveMaria();

    fireEvent.pointerDown(surface, {
      pointerId: 7,
      pointerType: 'touch',
      clientX: 90,
      clientY: 165,
    });
    fireEvent.pointerUp(surface, {
      pointerId: 7,
      pointerType: 'touch',
      clientX: 90,
      clientY: 165,
    });

    expect(setPointerCapture).toHaveBeenCalledWith(7);
    expect(hasPointerCapture).toHaveBeenCalledWith(7);
    expect(releasePointerCapture).toHaveBeenCalledWith(7);
  });
});
