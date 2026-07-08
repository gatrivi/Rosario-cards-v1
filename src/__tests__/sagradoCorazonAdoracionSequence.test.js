import {
  buildSequence,
  isValidBookletMystery,
  isValidRosaryMystery,
  resolveRosaryMystery,
} from '../utils/bookletSequence';
import {
  SAGRADO_CORAZON_ADORACION_ID,
  SAGRADO_CORAZON_ADORACION_STEPS,
} from '../data/sagradoCorazonAdoracionData';

describe('sagradoCorazonAdoracionSequence', () => {
  test('buildSequence returns non-empty sequence', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    expect(seq.length).toBeGreaterThan(0);
    expect(seq).toHaveLength(SAGRADO_CORAZON_ADORACION_STEPS.length);
  });

  test('first step is Exposición or opening step', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    expect(seq[0].title).toMatch(/Exposición/i);
    expect(seq[0].id).toBe('SCA_EXPO');
  });

  test('sequence includes Letanías al Sagrado Corazón', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    const litany = seq.find((s) => s.id === 'SCA_LITANY');
    expect(litany).toBeTruthy();
    expect(litany.title).toMatch(/Letanías al Sagrado Corazón/i);
    expect(litany.verses?.length).toBe(33);
    expect(litany.type).toBe('litany');
  });

  test('sequence includes Mateo 20, 25-28', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    const reading = seq.find((s) => s.id === 'SCA_LECTURA');
    expect(reading).toBeTruthy();
    expect(reading.title).toMatch(/Mateo 20/i);
    expect(reading.text).toMatch(/servir y dar su vida en rescate por muchos/i);
  });

  test('sequence includes Aclamaciones Eucarísticas', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    const acclamations = seq.find((s) => s.id === 'SCA_ACLAMACIONES');
    expect(acclamations).toBeTruthy();
    expect(acclamations.title).toMatch(/Aclamaciones Eucarísticas/i);
    expect(acclamations.text).toMatch(/Bendito sea el Sagrado Corazón/i);
  });

  test('sequence includes Oración final', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    const closing = seq.find((s) => s.id === 'SCA_ORACION_FINAL');
    expect(closing).toBeTruthy();
    expect(closing.title).toMatch(/Oración final/i);
    expect(closing.text).toMatch(/Dios todo poderoso/i);
  });

  test('booklet validation — Libro-only, not a rosary mystery', () => {
    expect(isValidBookletMystery(SAGRADO_CORAZON_ADORACION_ID)).toBe(true);
    expect(isValidRosaryMystery(SAGRADO_CORAZON_ADORACION_ID)).toBe(false);
    expect(resolveRosaryMystery(SAGRADO_CORAZON_ADORACION_ID)).toBe('dolorosos');
  });

  test('every step has vitral images', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    seq.forEach((step) => {
      expect(step.img).toBeTruthy();
      expect(step.imgCandidates?.length).toBeGreaterThan(0);
    });
  });

  test('Exposición step uses altar / eucharistic art', () => {
    const seq = buildSequence(SAGRADO_CORAZON_ADORACION_ID);
    const expo = seq.find((s) => s.id === 'SCA_EXPO');
    expect(expo?.img).toBeTruthy();
    expect(expo?.imgCandidates?.length).toBeGreaterThan(1);
  });

  test('normal rosary sequences unchanged', () => {
    const goz = buildSequence('gozosos');
    expect(goz.length).toBeGreaterThan(60);
    expect(goz.some((p) => p.id === 'MG1')).toBe(true);
    expect(goz.some((p) => p.id === 'MP')).toBe(false);
  });

  test('Divine Mercy Chaplet unchanged', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: true });
    expect(seq).toHaveLength(64);
    expect(seq[0].id).toBe('SC');
    expect(seq[seq.length - 1].id).toBe('HG');
  });

  test('Divine Mercy Novena unchanged', () => {
    const seq = buildSequence('divinamisericordia_novena', { novenaDay: 1 });
    expect(seq.length).toBeGreaterThan(60);
    expect(seq[1].id).toBe('NOVENA_DAY_INTENTION');
  });
});
