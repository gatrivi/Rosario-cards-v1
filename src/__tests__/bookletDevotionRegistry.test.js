import {
  NON_ROSE_DEVOTIONS,
  earnsRoseForDevotion,
  hidesRosaryPills,
  isValidBookletMystery,
  BOOKLET_MYSTERY_IDS,
  ROSARY_MYSTERY_IDS,
  buildSequence,
  NOVENA_DEVOTIONS,
  isNovenaMode,
  getNovenaConfig,
  getNovenaDays,
} from '../utils/bookletSequence';
import { DIVINE_MERCY_NOVENA_ID } from '../data/divineMercyData';
import { devotionVoiceLabel } from '../utils/voiceCoverage';
import { SAGRADO_CORAZON_ADORACION_ID } from '../data/sagradoCorazonAdoracionData';
import { MEMORARE_ID } from '../data/memorareData';

describe('rose eligibility', () => {
  test('every rosary via earns a rose', () => {
    ROSARY_MYSTERY_IDS.forEach((via) => expect(earnsRoseForDevotion(via)).toBe(true));
  });

  test('adorations and novenas do not', () => {
    expect(NON_ROSE_DEVOTIONS.has('divinamisericordia_novena')).toBe(true);
    expect(earnsRoseForDevotion('divinamisericordia_novena')).toBe(false);
    expect(earnsRoseForDevotion(SAGRADO_CORAZON_ADORACION_ID)).toBe(false);
  });

  test('chaplets and novena-free devotions still earn roses', () => {
    ['divinamisericordia', 'sangrepreciosa_chaplet', 'viacrucis', 'memorare'].forEach((id) => {
      expect(earnsRoseForDevotion(id)).toBe(true);
    });
  });

  test('every non-rose devotion is a valid Libro id (no stale guard)', () => {
    NON_ROSE_DEVOTIONS.forEach((id) => expect(isValidBookletMystery(id)).toBe(true));
  });
});

describe('Libro header chrome', () => {  test('only the rosary vias keep the mystery pills', () => {
    ROSARY_MYSTERY_IDS.forEach((via) => expect(hidesRosaryPills(via)).toBe(false));
  });

  test('standalone devotions hide the pills', () => {
    [
      'divinamisericordia',
      'divinamisericordia_novena',
      'viacrucis',
      'viacrucis_rosario',
      'vialucis',
      'angelus',
      'magnificat',
      SAGRADO_CORAZON_ADORACION_ID,
      MEMORARE_ID,
    ].forEach((id) => expect(hidesRosaryPills(id)).toBe(true));
  });

  test('every valid Libro id answers the chrome question', () => {
    BOOKLET_MYSTERY_IDS.forEach((id) => {
      expect(typeof hidesRosaryPills(id)).toBe('boolean');
    });
  });
});

describe('novena registry', () => {
  test('the Divina Misericordia novena is registered with 9 days', () => {
    expect(isNovenaMode(DIVINE_MERCY_NOVENA_ID)).toBe(true);
    expect(getNovenaConfig(DIVINE_MERCY_NOVENA_ID)).toEqual({
      total: 9,
      dayStepId: 'NOVENA_DAY_INTENTION',
    });
    expect(getNovenaDays(DIVINE_MERCY_NOVENA_ID)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test('a non-novena devotion has no day picker', () => {
    ['divinamisericordia', 'memorare', 'medalla_milagrosa', 'inmaculado_corazon'].forEach((id) => {
      expect(isNovenaMode(id)).toBe(false);
      expect(getNovenaConfig(id)).toBeNull();
      expect(getNovenaDays(id)).toEqual([]);
    });
  });

  test('every registered novena is a valid Libro devotion', () => {
    Object.keys(NOVENA_DEVOTIONS).forEach((id) => {
      expect(isValidBookletMystery(id)).toBe(true);
    });
  });

  test('the novena day step actually appears in its sequence', () => {
    Object.entries(NOVENA_DEVOTIONS).forEach(([id, cfg]) => {
      const seq = buildSequence(id, { novenaDay: 1 });
      expect(seq.some((s) => s.id === cfg.dayStepId)).toBe(true);
    });
  });
});

describe('devotion labels', () => {
  test('every Libro devotion has a human label (never a raw id)', () => {
    BOOKLET_MYSTERY_IDS.forEach((id) => {
      const label = devotionVoiceLabel(id);
      expect({
        id,
        isRawId: label === id,
        // ids are snake_case; a label never is
        looksLikeId: label.includes('_'),
        empty: label.trim().length === 0,
      }).toEqual({ id, isRawId: false, looksLikeId: false, empty: false });
    });
  });

  test('curated studio labels still win', () => {
    expect(devotionVoiceLabel('sangrepreciosa_litany')).toBe('Letanía Sangre');
    expect(devotionVoiceLabel('espiritu_santo_novena')).toBe('Novena al Espíritu Santo');
    expect(devotionVoiceLabel('inmaculado_corazon')).toBe('Inmaculado Corazón');
  });

  test('an unknown id degrades to itself rather than a wrong devotion name', () => {
    expect(devotionVoiceLabel('not_a_devotion')).toBe('not_a_devotion');
  });
});

/**
 * `PREFIX_N` ids are treated by the voice pack and the Fish dumper as numbered
 * variants of `PREFIX`, so they all resolve to one clip. That is correct for a
 * repeated litany step and wrong for steps that each have their own words.
 * Any new devotion must therefore either reuse one clip deliberately, or avoid
 * the `_N` shape.
 */
const SHARED_CLIP_PREFIXES =
  /^(MAG|ANG|LPB|PBO|VC|VL|VCR|LL|SCA|DMO|MG|MD|MGl|ML)_/;

describe('voice clip id shape', () => {
  test('no step with unique text uses the collapsible PREFIX_N shape', () => {
    const offenders = [];
    BOOKLET_MYSTERY_IDS.forEach((misterio) => {
      const seq = buildSequence(misterio, { novenaDay: 1 });
      // Group by base id: if a base has >1 step and their texts differ, the
      // steps must not share a clip id.
      const byBase = new Map();
      seq.forEach((step) => {
        const m = String(step.id).match(/^(.*)_\d+$/);
        if (!m || SHARED_CLIP_PREFIXES.test(step.id)) return;
        if (!byBase.has(m[1])) byBase.set(m[1], []);
        byBase.get(m[1]).push(step);
      });
      byBase.forEach((steps, base) => {
        if (steps.length < 2) return;
        if (new Set(steps.map((s) => s.text)).size > 1) {
          offenders.push(`${misterio}: ${steps.map((s) => s.id).join(', ')} (base ${base})`);
        }
      });
    });
    expect(offenders).toEqual([]);
  });
});
