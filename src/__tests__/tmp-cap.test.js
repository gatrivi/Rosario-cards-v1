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

import RoseView, { getSequenceData } from '../components/Views/RoseView';

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

import fs from 'fs';
test('cap debug', () => {
  const setPointerCapture = jest.fn();
  HTMLElement.prototype.setPointerCapture = setPointerCapture;
  const { surface } = renderAveMaria();
  act(() => {
    fireEvent.pointerDown(surface, { pointerId: 7, pointerType: 'touch', clientX: 90, clientY: 165 });
  });
  fs.writeFileSync('scripts/tmp-cap.txt', 'DBG=' + ((typeof window !== 'undefined' && window.__roseDbg) || 'NO-HANDLER') + ' CALLS=' + setPointerCapture.mock.calls.length);
  expect(true).toBe(true);
});
