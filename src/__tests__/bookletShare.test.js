import {
  buildShareCardPayload,
  formatBookletShareProgress,
  getBookletDevotionLabel,
  getBookletShareUrl,
  truncateShareText,
  makeShareFilename,
} from '../utils/bookletShare';

describe('bookletShare', () => {
  test('getBookletDevotionLabel returns Sagrado Corazón context', () => {
    const label = getBookletDevotionLabel('sagrado_corazon_adoracion');
    expect(label.title).toBe('Adoración Eucarística');
    expect(label.subtitle).toBe('Sagrado Corazón de Jesús');
  });

  test('getBookletDevotionLabel returns Divine Mercy novena', () => {
    const label = getBookletDevotionLabel('divinamisericordia_novena');
    expect(label.title).toMatch(/Novena de la Divina Misericordia/);
  });

  test('getBookletDevotionLabel returns San Expedito context', () => {
    const label = getBookletDevotionLabel('sanexpedito');
    expect(label.title).toBe('San Expedito');
    expect(label.subtitle).toMatch(/Balvanera/);
  });

  test('getBookletShareUrl uses the canonical San Expedito path', () => {
    expect(new URL(getBookletShareUrl('sanexpedito')).pathname).toBe('/san-expedito/');
  });

  test('formatBookletShareProgress uses Paso for Sagrado Corazón', () => {
    const label = formatBookletShareProgress({
      displayIndex: 2,
      total: 16,
      isSagradoCorazon: true,
      misterioActual: 'sagrado_corazon_adoracion',
    });
    expect(label).toBe('Paso 3 de 16');
  });

  test('formatBookletShareProgress keeps rosary slash format', () => {
    const label = formatBookletShareProgress({
      displayIndex: 4,
      total: 70,
      isSagradoCorazon: false,
      misterioActual: 'gozosos',
      isAveMaria: true,
      aveRunInfo: { position: 3, total: 10 },
    });
    expect(label).toContain('5 / 70');
    expect(label).toContain('3 de 10');
  });

  test('truncateShareText shortens long strings', () => {
    const long = 'a'.repeat(900);
    const out = truncateShareText(long, 100);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith('…')).toBe(true);
  });

  test('buildShareCardPayload includes devotion and branding', () => {
    const payload = buildShareCardPayload({
      misterioActual: 'gozosos',
      prayerTitle: 'Padre Nuestro',
      prayerText: 'Padre nuestro que estás en el cielo',
      backgroundUrl: '/gallery-images/test.jpg',
      progressLabel: '12 / 70',
    });
    expect(payload.devotionTitle).toBe('Santo Rosario');
    expect(payload.prayerTitle).toBe('Padre Nuestro');
    expect(payload.brandLine).toBe('Rosario Cards');
    expect(payload.progressLabel).toBe('12 / 70');
  });

  test('makeShareFilename slugifies prayer title', () => {
    expect(makeShareFilename('Oración inicial')).toMatch(/^rosario-cards-oracion-inicial\.png$/);
  });
});
