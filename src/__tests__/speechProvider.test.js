import { prayerSpeechLooksComplete, normalizeSpeechText } from '../utils/speechProvider';

describe('speechProvider', () => {
  test('normalizeSpeechText strips accents and punctuation', () => {
    expect(normalizeSpeechText('Amén, Señor.')).toBe('amen senor');
  });

  test('prayerSpeechLooksComplete detects amen', () => {
    expect(
      prayerSpeechLooksComplete('Padre nuestro que estás en el cielo', 'padre nuestro amen')
    ).toBe(true);
  });

  test('prayerSpeechLooksComplete detects tail overlap', () => {
    const prayer = 'Santa María, Madre de Dios, ruega por nosotros pecadores';
    expect(
      prayerSpeechLooksComplete(prayer, 'santa maria madre de dios ruega por nosotros pecadores')
    ).toBe(true);
  });
});
