import {
  cleanPrayerDisplayTitle,
  getSpeakablePrayerText,
} from '../utils/speakablePrayerText';
import { litanyLauretanaMeta, litanyLauretanaVerses } from '../data/litanyLauretana';

describe('speakablePrayerText', () => {
  test('strips mystery code prefixes from titles', () => {
    expect(cleanPrayerDisplayTitle('MG1: La Anunciación del Ángel a María')).toBe(
      'La Anunciación del Ángel a María'
    );
    expect(cleanPrayerDisplayTitle('Letanía de Loreto')).toBe('Letanía de Loreto');
  });

  test('TTS text is never the prayer title (litany verse)', () => {
    const v = litanyLauretanaVerses[9]; // Santa María
    const spoken = getSpeakablePrayerText(v);
    expect(spoken).toMatch(/Santa María/i);
    expect(spoken).not.toMatch(/Letanía/i);
    expect(spoken).not.toBe(litanyLauretanaMeta.title);
  });

  test('strips leading title when text duplicated it', () => {
    const spoken = getSpeakablePrayerText({
      title: 'Estación 1 — Jesús es condenado',
      text: 'Estación 1 — Jesús es condenado\n\nSeñor, ten piedad de nosotros.',
    });
    expect(spoken).toBe('Señor, ten piedad de nosotros.');
    expect(spoken).not.toMatch(/^Estación/);
  });

  test('does not truncate a body whose opening words echo the title', () => {
    const step = {
      id: 'ES_ANTIPHON',
      title: 'Ven, Espíritu Santo',
      text: 'Ven, Espíritu Santo, llena los corazones de tus fieles, y enciende en ellos la llama de tu amor.',
    };
    // A bare prefix match would leave ", llena los corazones…" — a broken clip.
    expect(getSpeakablePrayerText(step)).toBe(
      'Ven, Espíritu Santo, llena los corazones de tus fieles, y enciende en ellos la llama de tu amor.'
    );
  });

  test('still drops a genuine heading title', () => {
    expect(
      getSpeakablePrayerText({ id: 'X', title: 'Padre Nuestro', text: 'Padre nuestro\nPadre nuestro' })
    ).toBe('Padre nuestro');
    expect(getSpeakablePrayerText({ id: 'X', title: 'Memorare', text: 'Memorare' })).toBe('');
    expect(getSpeakablePrayerText({ id: 'X', title: 'Memorare', text: 'Memorare — A' })).toBe('A');
  });
});
