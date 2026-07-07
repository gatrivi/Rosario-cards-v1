import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LitanyDisplay from '../components/Litany/LitanyDisplay';
import LitanyEntrance from '../components/Litany/LitanyEntrance';

describe('Litany components (core)', () => {
  test('LitanyDisplay renders verse counter and both voices', () => {
    const verse = {
      invocation: 'Señor, ten piedad',
      response: 'Señor, ten piedad',
    };

    const { container } = render(
      <LitanyDisplay
        verse={verse}
        verseIndex={0}
        totalVerses={64}
        currentMystery="gozosos"
        onNextVerse={jest.fn()}
        onPrevVerse={jest.fn()}
      />
    );

    expect(screen.getByText('Verso 1 de 64')).toBeInTheDocument();
    const invocationEl = container.querySelector('.litany-invocation');
    const responseEl = container.querySelector('.litany-response');
    expect(invocationEl).toBeTruthy();
    expect(responseEl).toBeTruthy();
    expect(invocationEl).toHaveTextContent('Señor, ten piedad');
    expect(responseEl).toHaveTextContent('Señor, ten piedad');
  });

  test('LitanyDisplay applies mystery color scheme to invocation/response', () => {
    const verse = { invocation: 'Invoca', response: 'Responde' };
    const { container } = render(
      <LitanyDisplay
        verse={verse}
        verseIndex={1}
        totalVerses={64}
        currentMystery="dolorosos"
        onNextVerse={jest.fn()}
        onPrevVerse={jest.fn()}
      />
    );

    const invocationEl = container.querySelector('.litany-invocation');
    const responseEl = container.querySelector('.litany-response');
    expect(invocationEl).toBeTruthy();
    expect(responseEl).toBeTruthy();

    // JSDOM normalizes hex color strings to rgb(...)
    expect(invocationEl.style.color).toBe('rgb(139, 69, 19)');
    expect(responseEl.style.color).toBe('rgb(47, 79, 79)');
  });

  test('LitanyEntrance calls onComplete after timing window', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();

    render(
      <LitanyEntrance
        onComplete={onComplete}
        currentMystery="gozosos"
        duration={1000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000 + 600);
    });

    expect(onComplete).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

