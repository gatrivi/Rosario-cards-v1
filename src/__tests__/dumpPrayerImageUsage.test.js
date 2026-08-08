/**
 * Dump prayer primary-img usage: collisions + unused registry ids.
 * Run: npm test -- --watchAll=false --testPathPattern=dumpPrayerImageUsage
 * Writes scripts/prayer-image-usage.json (gitignored-ish; also console summary).
 */
import fs from 'fs';
import path from 'path';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../utils/bookletSequence';
import { getPrayerImageCandidates } from '../utils/prayerImages';
import {
  listImages,
  isTextHeavyImageEntry,
  isTextHeavyImagePath,
} from '../data/imageRegistry';
import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';

function pathToRegistryId(url) {
  if (!url) return null;
  const hit = listImages().find((e) => e.path === url);
  return hit?.id || null;
}

describe('dumpPrayerImageUsage', () => {
  beforeEach(() => localStorage.clear());

  test('write usage + collisions report', () => {
    /** @type {Map<string, { prayerId: string, title: string, mystery: string, img: string, registryId: string|null }>} */
    const byPrayerId = new Map();

    for (const mystery of BOOKLET_MYSTERY_IDS) {
      let seq = [];
      try {
        seq = buildSequence(mystery, { novenaDay: 1, includeMercyOpening: true }) || [];
      } catch {
        seq = [];
      }
      for (const step of seq) {
        if (!step?.id || byPrayerId.has(step.id)) continue;
        const candidates = getPrayerImageCandidates(step, mystery).filter(
          (u) => u && !isTextHeavyImagePath(u)
        );
        const img = candidates[0] || step.img || null;
        byPrayerId.set(step.id, {
          prayerId: step.id,
          title: step.title || step.id,
          mystery,
          img,
          registryId: pathToRegistryId(img),
        });
      }
    }

    for (const p of OPTIONAL_PRAYERS) {
      const key = `opt:${p.id}`;
      if (byPrayerId.has(key)) continue;
      const img = (p.imgCandidates || [p.img]).find((u) => u && !isTextHeavyImagePath(u)) || p.img;
      byPrayerId.set(key, {
        prayerId: key,
        title: p.title,
        mystery: 'optional',
        img,
        registryId: pathToRegistryId(img),
      });
    }

    const rows = [...byPrayerId.values()];
    /** @type {Record<string, string[]>} */
    const byImg = {};
    for (const row of rows) {
      if (!row.img) continue;
      if (!byImg[row.img]) byImg[row.img] = [];
      byImg[row.img].push(row.prayerId);
    }
    const collisions = Object.entries(byImg)
      .filter(([, ids]) => ids.length > 1)
      .map(([img, ids]) => ({
        img,
        registryId: pathToRegistryId(img),
        prayerIds: ids,
      }))
      .sort((a, b) => b.prayerIds.length - a.prayerIds.length);

    const usedPaths = new Set(rows.map((r) => r.img).filter(Boolean));
    const unused = listImages()
      .filter((e) => !isTextHeavyImageEntry(e) && !usedPaths.has(e.path))
      .map((e) => ({ id: e.id, name: e.name, tags: e.tags }));

    const report = {
      generatedAt: new Date().toISOString(),
      prayerCount: rows.length,
      collisionCount: collisions.length,
      unusedCount: unused.length,
      collisions,
      unused,
      prayers: rows,
      note: 'imgmo/light-dark revamp deferred — uniqueness is primary resolved Liber BG per prayer id',
    };

    const out = path.join(__dirname, '..', '..', 'scripts', 'prayer-image-usage.json');
    fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');

    // eslint-disable-next-line no-console
    console.log(
      `[prayer-image-usage] prayers=${rows.length} collisions=${collisions.length} unused=${unused.length} → ${out}`
    );
    collisions.slice(0, 15).forEach((c) => {
      // eslint-disable-next-line no-console
      console.log(`  collide x${c.prayerIds.length} ${c.registryId || c.img.slice(-40)} ← ${c.prayerIds.join(', ')}`);
    });
    unused.slice(0, 20).forEach((u) => {
      // eslint-disable-next-line no-console
      console.log(`  unused ${u.id} (${u.name})`);
    });

    expect(rows.length).toBeGreaterThan(20);
  });
});
