/**
 * Face uniqueness within each devotion family.
 * Global cross-devotion uniqueness needs a larger gallery (deferred with light/dark).
 */
import { buildSequence } from '../utils/bookletSequence';
import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';
import {
  angelusSequence,
  magnificatSequence,
} from '../data/marianDevotionsData';
import { isTextHeavyImagePath } from '../data/imageRegistry';

function primary(step) {
  const list = (step.imgCandidates || [step.img]).filter(
    (u) => u && !isTextHeavyImagePath(u)
  );
  return list[0] || step.img;
}

function assertUnique(label, steps) {
  const byImg = new Map();
  for (const step of steps) {
    const img = primary(step);
    expect(img).toBeTruthy();
    if (!byImg.has(img)) byImg.set(img, []);
    byImg.get(img).push(step.id);
  }
  const collisions = [...byImg.entries()].filter(([, ids]) => ids.length > 1);
  if (collisions.length) {
    throw new Error(
      `${label} shared images:\n` +
        collisions.map(([img, ids]) => `${ids.join(' + ')} → ${String(img).slice(-50)}`).join('\n')
    );
  }
}

describe('prayer face image uniqueness (per family)', () => {
  beforeEach(() => localStorage.clear());

  test('Ángelus steps unique', () => {
    assertUnique('angelus', angelusSequence);
  });

  test('Magnificat steps unique', () => {
    assertUnique('magnificat', magnificatSequence);
  });

  test('optional breves unique vs each other', () => {
    assertUnique(
      'optional',
      OPTIONAL_PRAYERS.map((p) => ({ id: p.id, img: p.img, imgCandidates: p.imgCandidates }))
    );
  });

  test('Carmen does not reuse Ángelus/Magnificat primaries', () => {
    const carmen = OPTIONAL_PRAYERS.find((p) => p.id === 'carmen');
    const marian = [...angelusSequence, ...magnificatSequence].map(primary);
    expect(marian).not.toContain(carmen.img);
  });

  test('SCA sequence unique primaries', () => {
    const seq = buildSequence('sagrado_corazon_adoracion');
    assertUnique('sca', seq);
  });

  test('Vía Crucis / Lucis stations unique within each via', () => {
    assertUnique('viacrucis', buildSequence('viacrucis'));
    assertUnique('vialucis', buildSequence('vialucis'));
  });

  test('Vía Crucis Rosario station faces unique (decades may share A/P/G/F art)', () => {
    const seq = buildSequence('viacrucis_rosario');
    const stations = seq.filter((s) => /^VCR_\d+$/.test(s.id));
    expect(stations).toHaveLength(14);
    assertUnique('viacrucis_rosario_stations', stations);
    expect(seq.filter((s) => s.id === 'A').length).toBe(3 + 14 * 10);
  });

  test('base rosary faces unique among themselves', () => {
    const seq = buildSequence('gozosos');
    const base = seq.filter((s) => ['SC', 'AC', 'C', 'P', 'A', 'G', 'F', 'LL', 'S', 'Papa'].includes(s.id));
    // first occurrence of each id
    const seen = new Set();
    const faces = [];
    for (const s of base) {
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      faces.push(s);
    }
    assertUnique('base', faces);
  });
});
