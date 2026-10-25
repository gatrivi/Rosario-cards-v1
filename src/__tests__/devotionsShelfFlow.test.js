import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookletView from '../components/Views/BookletView';
import { buildSequence } from '../utils/bookletSequence';
import { DIVINE_MERCY_ID, DIVINE_MERCY_NOVENA_ID } from '../data/divineMercyData';
import { ANGELUS_ID, MAGNIFICAT_ID } from '../data/marianDevotionsData';
import { SAGRADO_CORAZON_ADORACION_ID } from '../data/sagradoCorazonAdoracionData';
import { MEMORARE_ID } from '../data/memorareData';
import { MILAGROSA_ID } from '../data/medallaMilagrosaData';
import { INMACULADO_CORAZON_ID } from '../data/inmaculadoCorazonData';
import { ESPIRITU_SANTO_ID } from '../data/espirituSantoNovenaData';
import { upcomingDevotions } from '../data/historicDevotionsCatalog';

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
  MEMORARE_ID,
  MILAGROSA_ID,
  INMACULADO_CORAZON_ID,
  ESPIRITU_SANTO_ID,
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

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
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

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    fireEvent.click(screen.getByRole('button', { name: /^ángelus$/i }));

    expect(onMysteryChange).toHaveBeenCalledWith(ANGELUS_ID);
  });

  test('shelf opens and picking Magnificat calls onMysteryChange', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    fireEvent.click(screen.getByRole('button', { name: /^magnificat$/i }));

    expect(onMysteryChange).toHaveBeenCalledWith(MAGNIFICAT_ID);
  });

  test('Ángelus Liber shows devotion chrome after pick', () => {
    const { rerender } = render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
      />
    );
    rerender(
      <BookletView
        currentPrayerIndex={0}
        misterioActual={ANGELUS_ID}
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
      />
    );
    // El nombre de la devoción vive en el aria-label del botón de recorrido;
    // el paso inicial se muestra como título del panel.
    expect(screen.getByLabelText(/Ángelus, paso 1 de/)).toBeInTheDocument();
    expect(screen.getByText(/Señal de la Cruz/i)).toBeInTheDocument();
  });

  test('shelf opens and picking Memorare calls onMysteryChange', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    fireEvent.click(screen.getByRole('button', { name: /memorare — virgen madre/i }));

    expect(onMysteryChange).toHaveBeenCalledWith(MEMORARE_ID);
  });

  test('Memorare Liber shows devotion chrome instead of the mystery pills', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual={MEMORARE_ID}
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/Memorare, paso 1 de/)).toBeInTheDocument();
    // The panel splits the prayer into verse lines.
    expect(screen.getByText('Acuérdate,')).toBeInTheDocument();
    expect(screen.getByText('Virgen Madre,')).toBeInTheDocument();
    expect(screen.getByText(/preséntate a nuestra súplica\./i)).toBeInTheDocument();
    // Devotion mode: no Gozosos/Dolorosos pills.
    expect(screen.queryByRole('button', { name: /^gozosos$/i })).not.toBeInTheDocument();
  });

  test('Memorare carries ES/EN/Latin variants', () => {
    const seq = buildSequence(MEMORARE_ID);
    expect(seq).toHaveLength(1);
    expect(seq[0].variants.map((v) => v.id)).toEqual(['es', 'en', 'latin']);
    expect(seq[0].variants.find((v) => v.id === 'latin').text).toMatch(/Recorda, Virgo Mater/);
  });

  test('Medalla Milagrosa walks the medal engraved in three steps', () => {
    const seq = buildSequence(MILAGROSA_ID);
    expect(seq.map((s) => s.id)).toEqual(['MM_LLAMADA', 'MM_ESTRELLAS', 'MM_CORAZONES']);
    seq.forEach((s) => {
      expect(s.img).toBeTruthy();
      expect(s.imgCandidates.length).toBeGreaterThan(0);
    });
    // The motto is the medal's own, in three languages.
    expect(seq[0].variants.map((v) => v.id)).toEqual(['es', 'en', 'latin']);
    expect(seq[0].text).toMatch(/sin pecado concebida/i);
    expect(seq[1].text).toMatch(/doce estrellas/i);
    expect(seq[2].text).toMatch(/Lucas 2, 35/);
  });

  test('shelf opens and picking Medalla Milagrosa calls onMysteryChange', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    fireEvent.click(screen.getByRole('button', { name: /medalla milagrosa — inmaculada/i }));

    expect(onMysteryChange).toHaveBeenCalledWith(MILAGROSA_ID);
  });

  test('Inmaculado Corazón walks the five offenses, then the promise and consecration', () => {
    const seq = buildSequence(INMACULADO_CORAZON_ID);
    expect(seq.map((s) => s.id)).toEqual([
      'IC_OFENSA1',
      'IC_OFENSA2',
      'IC_OFENSA3',
      'IC_OFENSA4',
      'IC_OFENSA5',
      'IC_PROMESA',
      'IC_CONSAGRACION',
    ]);
    seq.forEach((s) => {
      expect(s.img).toBeTruthy();
      expect(s.imgCandidates.length).toBeGreaterThan(0);
      expect(s.title).toBeTruthy();
    });
    // The five offenses are Sister Lúcia's list, not an invented one.
    expect(seq[0].text).toMatch(/Inmaculada Concepción/i);
    expect(seq[3].text).toMatch(/indiferencia/i);
    expect(seq[4].text).toMatch(/sagradas imágenes/i);
    expect(seq[5].text).toMatch(/Hermana Lucía/);
    expect(seq[6].text).toMatch(/nos consagramos/);
  });

  test('Espíritu Santo novena: the day selector drives the intention step', () => {
    const day1 = buildSequence(ESPIRITU_SANTO_ID, { novenaDay: 1 });
    const day5 = buildSequence(ESPIRITU_SANTO_ID, { novenaDay: 5 });

    expect(day1.map((s) => s.id)).toEqual([
      'ES_DAY_INTENTION',
      'ES_ANTIPHON',
      'EF',
      'MP',
      'HG',
    ]);
    // Only the intention changes between days; the antiphon repeats by design.
    expect(day1[0].text).not.toBe(day5[0].text);
    expect(day1[1].text).toBe(day5[1].text);
    expect(day5[0].text).toMatch(/sufren/i);

    [...day1, ...day5].forEach((s) => {
      expect(s.img).toBeTruthy();
      expect(s.imgCandidates.length).toBeGreaterThan(0);
    });
  });

  test('Espíritu Santo novena shows a 1..9 day picker, like the Mercy novena', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual={ESPIRITU_SANTO_ID}
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
        novenaDay={3}
      />
    );

    const selector = document.querySelector('.booklet-novena-selector');
    expect(selector).toBeInTheDocument();
    const days = [...selector.querySelectorAll('.booklet-novena-day-btn')];
    expect(days.map((b) => b.textContent)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    expect(days[2]).toHaveClass('booklet-novena-day-btn--active');
  });

  test('a non-novena devotion has no day picker', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual={MEMORARE_ID}
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
      />
    );
    expect(document.querySelector('.booklet-novena-selector')).not.toBeInTheDocument();
  });

  test('picking a day reports it to the parent, which owns the index reset', () => {
    const onNovenaDayChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={2}
        misterioActual={ESPIRITU_SANTO_ID}
        onUpdateProgreso={jest.fn()}
        onMysteryChange={jest.fn()}
        novenaDay={3}
        onNovenaDayChange={onNovenaDayChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '6' }));
    expect(onNovenaDayChange).toHaveBeenCalledWith(6);
  });

  test('Faustina Corona and Novena each have their own shelf thumb', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    const corona = screen.getByRole('button', { name: /^corona de la divina misericordia — santa faustina$/i });
    const novena = screen.getByRole('button', { name: /^novena de la divina misericordia — santa faustina$/i });
    expect(corona.querySelector('img').getAttribute('src')).not.toBe(
      novena.querySelector('img').getAttribute('src')
    );

    fireEvent.click(corona);
    expect(onMysteryChange).toHaveBeenLastCalledWith(DIVINE_MERCY_ID);
    fireEvent.click(novena);
    expect(onMysteryChange).toHaveBeenLastCalledWith(DIVINE_MERCY_NOVENA_ID);
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

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    expect(screen.getByRole('button', { name: /^san benito$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ángel de la guarda$/i })).toBeInTheDocument();
  });

  test('Escápulario is a breve that opens the sheet, not a recorrido', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    fireEvent.click(screen.getByRole('button', { name: /escápulario del carmen/i }));

    expect(onMysteryChange).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: /oración opcional/i });
    expect(dialog.querySelector('.optional-prayer-sheet__tab.active')).toHaveTextContent(
      'Escápulario del Carmen'
    );
  });

  test('picking San Benito opens optional sheet without changing mystery', () => {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    fireEvent.click(screen.getByRole('button', { name: /^san benito$/i }));

    expect(onMysteryChange).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: /oración opcional/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /reproducir guía/i })).toBeInTheDocument();
    expect(dialog.querySelector('.optional-prayer-sheet__tab.active')).toHaveTextContent('San Benito');
  });
});

describe('Próximas — devotions with no Libro surface yet', () => {
  function openShelf() {
    const onMysteryChange = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={jest.fn()}
        onMysteryChange={onMysteryChange}
      />
    );
    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    return onMysteryChange;
  }

  test('shelf lists every soon devotion, disabled and labelled', () => {
    openShelf();
    const soon = upcomingDevotions();
    expect(soon.length).toBeGreaterThanOrEqual(1);

    // One "(próximamente)" button per soon devotion, none enabled.
    const labels = screen
      .getAllByRole('button')
      .filter((b) => /próximamente/i.test(b.getAttribute('aria-label') || ''));
    expect(labels).toHaveLength(soon.length);
    labels.forEach((b) => expect(b).toBeDisabled());

    // Each catalog entry shows up by name, with its note as context.
    soon.forEach((d) => {
      expect(
        labels.some((b) =>
          (b.getAttribute('aria-label') || '').includes(`${d.label} — ${d.note}`)
        )
      ).toBe(true);
      expect(screen.getByText(d.label)).toBeInTheDocument();
    });
  });

  test('clicking a soon devotion never changes the mystery', () => {
    const onMysteryChange = openShelf();
    const soonThumbs = screen
      .getAllByRole('button')
      .filter((b) => /próximamente/i.test(b.getAttribute('aria-label') || ''));
    soonThumbs.forEach((b) => fireEvent.click(b));
    expect(onMysteryChange).not.toHaveBeenCalled();
  });
});
