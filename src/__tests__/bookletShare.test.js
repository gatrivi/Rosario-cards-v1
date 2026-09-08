import {
  buildShareCardPayload,
  buildShareDeepLink,
  formatBookletShareProgress,
  getBookletDevotionLabel,
  getShareUrlLine,
  resolveShareBackgroundUrl,
  resolveShareBackgroundUrlWithFallback,
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

  test('truncateShareText preserves verse line breaks', () => {
    const out = truncateShareText('Padre nuestro\nque estás en el cielo\n\nsantificado sea', 720);
    expect(out).toContain('Padre nuestro\nque estás en el cielo');
    expect(out).toContain('\n\nsantificado sea');
  });

  test('truncateShareText cuts long text at a boundary with ellipsis', () => {
    const out = truncateShareText('palabra '.repeat(200), 100);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith('…')).toBe(true);
  });

  test('resolveShareBackgroundUrl absolutizes relative asset paths', () => {
    expect(resolveShareBackgroundUrl('gallery-images/a.webp')).toMatch(
      /^https?:\/\/.+\/gallery-images\/a\.webp$/
    );
    expect(resolveShareBackgroundUrl('/gallery-images/a.webp')).toMatch(/\/gallery-images\/a\.webp$/);
    expect(resolveShareBackgroundUrl(null)).toBeNull();
  });

  test('buildShareCardPayload falls back to bundled art and prints the link', () => {
    const payload = buildShareCardPayload({
      misterioActual: 'gozosos',
      prayerTitle: 'Ave María',
      prayerText: 'Dios te salve\nMaría',
      backgroundUrl: null,
      progressLabel: '3 / 70',
      shareUrl: 'https://rosario.gatrivi.com/?misterio=gozosos&paso=3',
    });
    expect(payload.backgroundUrl).toMatch(/logo\.png$/);
    expect(payload.urlLine).toBe('rosario.gatrivi.com');
    expect(payload.prayerText).toContain('\n');
  });

  test('buildShareDeepLink keeps misterio and paso', () => {
    const link = buildShareDeepLink({ misterioActual: 'gozosos', displayIndex: 3 });
    expect(link).toContain('misterio=gozosos');
    expect(link).toContain('paso=3');
  });

  test('getShareUrlLine shortens to host', () => {
    expect(getShareUrlLine('https://rosario.gatrivi.com/?misterio=gozosos')).toBe(
      'rosario.gatrivi.com'
    );
  });

  test('resolveShareBackgroundUrlWithFallback uses fallback when empty', () => {
    expect(resolveShareBackgroundUrlWithFallback(null)).toMatch(/logo\.png$/);
    expect(resolveShareBackgroundUrlWithFallback('/gallery-images/x.jpg')).toMatch(/x\.jpg$/);
  });
});
