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
  seq.forEach((step, i) => {
    expect(step.img).toBeTruthy();
    expect(step.imgCandidates?.length).toBeGreaterThan(0);
    expect(step.title).toBeTruthy();
    expect(step.text).toBeTruthy();
  });
}

describe('devotions shelf flow', () => {
  test.each(SHELF_DEVOTION_IDS)('buildSequence(%s) yields imaged steps', (id) => {
    expectValidSequence(id);
  });

  test('shelf opens and picking Letanía Sangre calls onMysteryChange', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /devociones y oraciones breves/i }));
    fireEvent.click(screen.getByRole('button', { name: /letanía de la preciosísima sangre/i }));

    expect(onMysteryChange).toHaveBeenCalledWith('sangrepreciosa_litany');
  });

  test('shelf opens and picking Ángelus calls onMysteryChange', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /devociones y oraciones breves/i }));
    fireEvent.click(screen.getByRole('button', { name: /^ángelus$/i }));

    expect(onMysteryChange).toHaveBeenCalledWith(ANGELUS_ID);
  });

  test('Faustina sub-menu picks Corona', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /devociones y oraciones breves/i }));
    fireEvent.click(screen.getByRole('button', { name: /divina misericordia — santa faustina/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /^corona$/i }));

    expect(onMysteryChange).toHaveBeenCalledWith(DIVINE_MERCY_ID);
  });

  test('Estaciones sub-menu picks Vía Crucis', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /devociones y oraciones breves/i }));
    fireEvent.click(screen.getByRole('button', { name: /estaciones — vía crucis y vía lucis/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /^vía crucis$/i }));

    expect(onMysteryChange).toHaveBeenCalledWith('viacrucis');
  });
});
