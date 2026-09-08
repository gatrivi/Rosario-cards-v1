import { OPTIONAL_PRAYERS, optionalPrayerThumbnail } from '../data/optionalPrayers';

describe('OPTIONAL_PRAYERS - salve & bendito entries', () => {
  it('includes Salve Regina with image, ES/LA/EN variants', () => {
    const salve = OPTIONAL_PRAYERS.find((p) => p.id === 'salve');
    expect(salve).toBeTruthy();
    expect(salve.title).toMatch(/Salve Regina/i);
    expect(optionalPrayerThumbnail('salve')).toBeTruthy();
    expect(salve.imgCandidates.length).toBeGreaterThan(0);
    const ids = salve.variants.map((v) => v.id);
    expect(ids).toEqual(expect.arrayContaining(['es', 'la', 'en']));
    expect(salve.variants.find((v) => v.id === 'es').text).toMatch(/Reina y Madre de misericordia/);
    expect(salve.variants.find((v) => v.id === 'es').text).toMatch(/valle de lágrimas/);
  });

  it('includes Bendito sea Dios with image, ES/EN variants', () => {
    const bendito = OPTIONAL_PRAYERS.find((p) => p.id === 'bendito');
    expect(bendito).toBeTruthy();
    expect(bendito.title).toMatch(/Bendito sea Dios/i);
    expect(optionalPrayerThumbnail('bendito')).toBeTruthy();
    expect(bendito.imgCandidates.length).toBeGreaterThan(0);
    const ids = bendito.variants.map((v) => v.id);
    expect(ids).toEqual(expect.arrayContaining(['es', 'en']));
    expect(bendito.variants.find((v) => v.id === 'es').text).toMatch(
      /verdadero Dios y verdadero hombre/
    );
    expect(bendito.variants.find((v) => v.id === 'es').text).toMatch(
      /Santísimo Sacramento del altar/
    );
  });

  it('every optional prayer has a default image and at least one variant', () => {
    OPTIONAL_PRAYERS.forEach((p) => {
      expect(p.img).toBeTruthy();
      expect(p.variants.length).toBeGreaterThan(0);
    });
  });
});