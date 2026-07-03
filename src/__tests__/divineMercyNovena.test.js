import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { buildSequence, isDivineMercyMode } from '../utils/bookletSequence';
import BookletView, { BOOKLET_TIMING } from '../components/Views/BookletView';

jest.mock('../utils/bookletSounds', () => ({
  playBookletTransitionSound: jest.fn(),
  playOfferingChime: jest.fn(),
}));



describe('divineMercyNovena tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const advanceBookletTransition = () => {
    act(() => {
      jest.advanceTimersByTime(
        BOOKLET_TIMING.textOut +
          BOOKLET_TIMING.linger +
          48 +
          BOOKLET_TIMING.imageBeforeText +
          BOOKLET_TIMING.textIn +
          80
      );
    });
  };

  test('day 1 builds correctly', () => {
    const seq = buildSequence('divinamisericordia_novena', { novenaDay: 1, includeMercyOpening: true });
    expect(seq).toHaveLength(65);
    expect(seq[0].id).toBe('SC');
    expect(seq[1].id).toBe('NOVENA_DAY_INTENTION');
    expect(seq[1].title).toBe('Toda la humanidad, especialmente los pecadores');
    expect(seq[2].id).toBe('DMO1');
    expect(seq[3].id).toBe('DMO2');
    expect(seq[4].id).toBe('P');
    expect(seq[5].id).toBe('A');
    expect(seq[6].id).toBe('C');
    expect(seq[7].id).toBe('EF');
    expect(seq[8].id).toBe('MP');
    expect(seq[seq.length - 1].id).toBe('HG');
  });

  test('day 9 builds correctly', () => {
    const seq = buildSequence('divinamisericordia_novena', { novenaDay: 9, includeMercyOpening: true });
    expect(seq).toHaveLength(65);
    expect(seq[1].id).toBe('NOVENA_DAY_INTENTION');
    expect(seq[1].title).toBe('Las almas tibias');
  });

  test('changing optional opening changes count', () => {
    const seqWith = buildSequence('divinamisericordia_novena', { novenaDay: 1, includeMercyOpening: true });
    const seqWithout = buildSequence('divinamisericordia_novena', { novenaDay: 1, includeMercyOpening: false });
    expect(seqWith).toHaveLength(65);
    expect(seqWithout).toHaveLength(63);
    expect(seqWithout.map(p => p.id)).not.toContain('DMO1');
    expect(seqWithout.map(p => p.id)).not.toContain('DMO2');
  });

  test('normal rosary still unchanged', () => {
    const goz = buildSequence('gozosos');
    expect(goz.length).toBeGreaterThan(60);
    expect(goz.some(p => p.id === 'MG1')).toBe(true);
    expect(goz.some(p => p.id === 'MP')).toBe(false);
  });

  test('Divine Mercy Chaplet still unchanged', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: true });
    expect(seq).toHaveLength(64);
    expect(seq[0].id).toBe('SC');
    expect(seq[1].id).toBe('DMO1');
    expect(seq[1].title).toBe('Oración opcional — Expiraste, Jesús');
  });

  test('changing novena day resets index in BookletView', () => {
    const onNovenaDayChange = jest.fn();
    const onUpdateProgreso = jest.fn();
    const { rerender } = render(
      <BookletView
        currentPrayerIndex={10}
        misterioActual="divinamisericordia_novena"
        novenaDay={1}
        onNovenaDayChange={onNovenaDayChange}
        onUpdateProgreso={onUpdateProgreso}
      />
    );

    // Click day 2 selector button
    const day2Btn = screen.getByRole('button', { name: '2' });
    fireEvent.click(day2Btn);
    expect(onNovenaDayChange).toHaveBeenCalledWith(2);

    // Simulating parent state change where index gets reset to 0
    rerender(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="divinamisericordia_novena"
        novenaDay={2}
        onNovenaDayChange={onNovenaDayChange}
        onUpdateProgreso={onUpdateProgreso}
      />
    );
    expect(screen.getByText('Señal de la Cruz')).toBeInTheDocument();
  });

  test('no rosas increment during Novena mode', () => {
    const onAveMariaComplete = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={5} // Ave Maria step in the chaplet sequence
        misterioActual="divinamisericordia_novena"
        novenaDay={1}
        onAveMariaComplete={onAveMariaComplete}
        onUpdateProgreso={jest.fn()}
      />
    );

    // Click forward
    fireEvent.click(screen.getByRole('button', { name: /siguiente oración/i }));
    advanceBookletTransition();

    // In Divine Mercy Novena (isMercy is true), onAveMariaComplete should not be called
    expect(onAveMariaComplete).not.toHaveBeenCalled();
  });
});
