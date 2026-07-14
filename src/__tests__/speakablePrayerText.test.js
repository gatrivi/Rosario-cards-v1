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
});
