/**
 * The numbers this whole exercise exists to move.
 *
 * The Ave María showed the same two or three pictures on all 53 of its
 * repetitions, and `MP` — "Por su dolorosa Pasión" — on 5 of its 50. These are
 * measured through the real chain, so any regression in the catalog, the tag
 * selection, or the occurrence rotation turns the suite red.
 */
import { buildSequence } from '../utils/bookletSequence';
import {
  getPrayerImageCandidates,
  pickPrayerImage,
  countPrayerPinnedSources,
  occurrenceIndexAt,
  dailyRotationOffset,
  resolveLitanyVerseImage,
  FALLBACK_IMAGE,
} from '../utils/prayerImages';
import { litanyLauretanaVerses, litanyLauretanaMeta } from '../data/litanyLauretana';

function shownImages(sequence, id, misterio) {
  return sequence
    .map((s, i) => (s.id === id ? i : -1))
    .filter((i) => i >= 0)
    .map((i) => {
      const step = sequence[i];
      const cands = getPrayerImageCandidates(step, misterio);
      return pickPrayerImage(cands, occurrenceIndexAt(sequence, i), countPrayerPinnedSources(step));
    });
}

describe('repeated prayers get varied backgrounds', () => {
  const ROSARY = ['gozosos', 'dolorosos', 'gloriosos', 'luminosos'];

  test.each(ROSARY)('%s: the Ave Marías are not all the same picture', (mystery) => {
    const seq = buildSequence(mystery);
    const shown = shownImages(seq, 'A', mystery);
    expect(shown).toHaveLength(53); // 3 + 5 decades × 10
    // Was 3–4 when the pool was three images and rotation had period 4.
    expect(new Set(shown).size).toBe(53);
    // Still fully deterministic.
    expect(shownImages(seq, 'A', mystery)).toEqual(shown);
    shown.forEach((img) => expect(img).not.toBe(FALLBACK_IMAGE));
    // The hand-picked art wins first — `ave-maria.jpg`, the thematic extras and
    // the per-verse `defaultImageId` plates — and the catalog carries the rest.
    expect(shown[0]).toBe('/gallery-images/misterios/modooscuro/ave-maria.jpg');
    expect(shown.filter((i) => i.startsWith('/gallery-images/ave/')).length).toBeGreaterThanOrEqual(30);
  });

  test('MP walks the Passion catalog, never the Mary one', () => {
    const seq = buildSequence('divinamisericordia');
    const shown = shownImages(seq, 'MP', 'divinamisericordia');
    expect(shown).toHaveLength(50);
    // Was 5 (the hand-picked MP_DECADE_IMAGES), then 41 while the coarse
    // `passion` tag sorted ahead of the specific themes.
    expect(new Set(shown).size).toBe(49);
    shown.forEach((img) => {
      // A prayer to Christ's Passion must never get Mary art behind it.
      if (img.startsWith('/gallery-images/ave/')) {
        throw new Error(`Mary image behind a Passion prayer: ${img}`);
      }
    });
  });

  test('the Passion pool is present in every Passion-enabled prayer chain', () => {
    for (const misterio of ['divinamisericordia', 'dolorosos']) {
      const seq = buildSequence(misterio);
      for (const id of ['MP', 'DMO1', 'DMO2', 'MD1', 'MD2', 'MD3', 'MD4', 'MD5']) {
        const step = seq.find((s) => s.id === id);
        if (!step) continue;
        const cands = getPrayerImageCandidates(step, misterio);
        expect({
          id,
          misterio,
          hasPassion: cands.some((c) => c.startsWith('/gallery-images/passion/')),
        }).toEqual({ id, misterio, hasPassion: true });
      }
    }
  });

  test('a tagged pool is never the pinned head of a chain', () => {
    // If the catalog counted as a pin, occurrence rotation would die the moment
    // it was non-empty — the trap both pools had to avoid.
    for (const [misterio, id] of [['gozosos', 'A'], ['divinamisericordia', 'MP']]) {
      const step = buildSequence(misterio).find((s) => s.id === id);
      expect(countPrayerPinnedSources(step)).toBe(0);
      const head = getPrayerImageCandidates(step, misterio)[0];
      expect(head.startsWith('/gallery-images/ave/')).toBe(false);
      expect(head.startsWith('/gallery-images/passion/')).toBe(false);
    }
  });

  test('the fallback is never offered while a real candidate exists', () => {
    const seq = buildSequence('gozosos');
    for (const id of ['P', 'G', 'F', 'C', 'SC', 'AC']) {
      const idx = seq.map((s, i) => (s.id === id ? i : -1)).filter((i) => i >= 0);
      idx.forEach((i) => {
        const step = seq[i];
        const cands = getPrayerImageCandidates(step, 'gozosos');
        const shown = pickPrayerImage(cands, occurrenceIndexAt(seq, i), 0);
        expect({ id, shown }).toEqual({ id, shown: expect.not.stringContaining(FALLBACK_IMAGE) });
      });
    }
  });

  test('one decade\'s ten Ave Marías are consecutive occurrences 0..9', () => {
    const seq = buildSequence('gozosos');
    const firstDecade = seq.map((s, i) => (s.id === 'A' ? i : -1)).filter((i) => i >= 0).slice(0, 10);
    expect(firstDecade.map((i) => occurrenceIndexAt(seq, i))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test('occurrenceIndexAt counts repetitions of the same id only', () => {
    const seq = [{ id: 'A' }, { id: 'P' }, { id: 'A' }, { id: 'A' }, { id: 'G' }];
    expect(occurrenceIndexAt(seq, 0)).toBe(0);
    expect(occurrenceIndexAt(seq, 1)).toBe(0);
    expect(occurrenceIndexAt(seq, 2)).toBe(1);
    expect(occurrenceIndexAt(seq, 3)).toBe(2);
    expect(occurrenceIndexAt(seq, 4)).toBe(0);
    expect(occurrenceIndexAt([], 0)).toBe(0);
    expect(occurrenceIndexAt(undefined, 3)).toBe(0);
  });

  test('consecutive days walk on through the pool instead of replaying it', () => {
    const seq = buildSequence('gozosos');
    const aves = seq.map((s, i) => (s.id === 'A' ? i : -1)).filter((i) => i >= 0);
    const seen = new Set();
    const day = (n) => new Date(2026, 9, 25 + n);
    for (let d = 0; d < 5; d += 1) {
      aves.forEach((i) => {
        const step = seq[i];
        seen.add(pickPrayerImage(
          getPrayerImageCandidates(step, 'gozosos'),
          occurrenceIndexAt(seq, i),
          countPrayerPinnedSources(step),
          dailyRotationOffset(seq, i, day(d))
        ));
      });
    }
    // Five rosaries used to be the same 53 pictures five times.
    expect(seen.size).toBeGreaterThan(200);
    // Same day, same picture: the offset only changes at midnight.
    const i = aves[7];
    expect(dailyRotationOffset(seq, i, new Date(2026, 9, 25, 1))).toBe(dailyRotationOffset(seq, i, new Date(2026, 9, 25, 23)));
    // A prayer said once per session never rotates.
    expect(dailyRotationOffset(seq, seq.findIndex((s) => s.id === 'C'), day(3))).toBe(0);
  });

  test('a pinned head still owns the first occurrence on every day', () => {
    expect(pickPrayerImage(['/pin.jpg', '/a.jpg', '/b.jpg'], 0, 1, 12345)).toBe('/pin.jpg');
  });
});

describe('Letanía de Loreto keeps its hand-picked art', () => {
  test('every verse shows its own picture, not a rotated neighbour', () => {
    const wrong = litanyLauretanaVerses
      .map((v, i) => [i, v, resolveLitanyVerseImage(v, litanyLauretanaMeta, i)])
      .filter(([, v, shown]) => shown !== (v.imgmo || v.img))
      .map(([i, v, shown]) => `${i} ${v.invocation} -> ${shown}`);
    // Was 15 of 65: the verse index doubled as a rotation seed.
    expect(wrong).toEqual([]);
  });
});

describe('Ave María verses follow their scene', () => {
  const { getVerseThemePool, resolvePrayerVerseImage } = require('../utils/prayerVerseImages');

  test('Gabriel\'s greeting draws from Annunciations, Elizabeth\'s from Visitations', () => {
    const greeting = getVerseThemePool('A', 0);
    expect(greeting.length).toBeGreaterThan(10);
    expect(getVerseThemePool('A', 3).length).toBeGreaterThan(2);
    // The greeting, "llena eres de gracia" and "el Señor es contigo" are one scene.
    expect(getVerseThemePool('A', 1)).toEqual(greeting);
    expect(resolvePrayerVerseImage('A', 0, { id: 'A' }, 'gozosos', 3)).toBe(greeting[3]);
  });

  test('each Ave of the rosary greets with a different Annunciation', () => {
    const pool = getVerseThemePool('A', 0);
    const shown = new Set(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((o) => resolvePrayerVerseImage('A', 0, { id: 'A' }, 'gozosos', o))
    );
    expect(shown.size).toBe(Math.min(10, pool.length));
  });

  test('"Madre de Dios" is not a copy of the "fruto de tu vientre" pool', () => {
    expect(getVerseThemePool('A', 5)).not.toEqual(getVerseThemePool('A', 4));
  });
});
