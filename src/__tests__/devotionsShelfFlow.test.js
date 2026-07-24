import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookletView from '../components/Views/BookletView';
import { buildSequence } from '../utils/bookletSequence';
import { DIVINE_MERCY_ID, DIVINE_MERCY_NOVENA_ID } from '../data/divineMercyData';
import { ANGELUS_ID, MAGNIFICAT_ID } from '../data/marianDevotionsData';
import { SAGRADO_CORAZON_ADORACION_ID } from '../data/sagradoCorazonAdoracionData';

/** Every devotion reachable from the Libro footer shelf. */
const SHELF_DEVOTION_IDS = [
  'viacrucis',
  'vialucis',
  'sangrepreciosa_litany',
  'sangrepreciosa_chaplet',
  'sangrepreciosa_ofrendas',
  SAGRADO_CORAZON_ADORACION_ID,
  DIVINE_MERCY_ID,
  DIVINE_MERCY_NOVENA_ID,
  ANGELUS_ID,
  MAGNIFICAT_ID,
];

function expectValidSequence(id) {
  const seq = buildSequence(id, { novenaDay: 1 });
  expect(seq.length).toBeGreaterThan(0);
  seq.forEach((step) => {
    expect(step.img).toBeTruthy();
    expect(step.imgCandidates?.length).toBeGreaterThan(0);
    expect(step.title).toBeTruthy();
    expect(step.text).toBeTruthy();
  });
}

function openShelf() {
  fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
}

function beginIntro() {
  fireEvent.click(screen.getByRole('button', { name: /^comenzar$/i }));
}

describe('devotions shelf flow', () => {
  test.each(SHELF_DEVOTION_IDS)('buildSequence(%s) yields imaged steps', (id) => {
    expectValidSequence(id);
  });

  test('shelf opens and picking Letanía Sangre calls onMysteryChange after intro', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    openShelf();
    fireEvent.click(screen.getByRole('button', { name: /letanía de la sangre/i }));
    beginIntro();
    expect(onMysteryChange).toHaveBeenCalledWith('sangrepreciosa_litany');
  });

  test('shelf opens and picking Ángelus calls onMysteryChange after intro', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    openShelf();
    fireEvent.click(screen.getByRole('button', { name: /^ángelus$/i }));
    beginIntro();
    expect(onMysteryChange).toHaveBeenCalledWith(ANGELUS_ID);
  });

  test('Faustina choices pick Corona after intro', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    openShelf();
    fireEvent.click(screen.getByRole('button', { name: /sta\. faustina/i }));
    fireEvent.click(screen.getByRole('button', { name: /^corona$/i }));
    beginIntro();
    expect(onMysteryChange).toHaveBeenCalledWith(DIVINE_MERCY_ID);
  });

  test('shelf Oraciones breves includes San Benito', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
      />
    );

    openShelf();
    expect(screen.getByRole('button', { name: /^san benito$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ángel de la guarda$/i })).toBeInTheDocument();
  });

  test('picking San Benito opens full-bleed sheet without intro or mystery change', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    openShelf();
    fireEvent.click(screen.getByRole('button', { name: /^san benito$/i }));

    expect(screen.queryByRole('button', { name: /^comenzar$/i })).not.toBeInTheDocument();
    expect(onMysteryChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: /oración breve: san benito/i })).toBeInTheDocument();
    expect(document.querySelector('.optional-prayer-sheet__opening')).toBeTruthy();
    expect(document.querySelector('.optional-prayer-sheet__art')).toBeTruthy();
  });
});
