/**
 * Dump the per-prayer drop-in folder coverage checklist.
 * Run: npm test -- --watchAll=false --testPathPattern=dumpPrayerFolderCoverage
 * Writes scripts/prayer-folder-coverage.json — the hand-fill list: every prayer
 * step, its ID, the folder to create, and whether it already has folder images.
 */
import fs from 'fs';
import path from 'path';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../utils/bookletSequence';
import { getPrayerImageCandidates } from '../utils/prayerImages';
import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';
import { scanPrayerFolders } from '../../scripts/prayerFolderScan';

describe('dumpPrayerFolderCoverage', () => {
  beforeEach(() => localStorage.clear());

  test('write per-prayer folder checklist', () => {
    const root = path.join(__dirname, '..', '..');
    const filled = scanPrayerFolders(path.join(root, 'public', 'prayers'));

    /** @type {Map<string, object>} */
    const byId = new Map();
    const addPrayer = (id, title, source) => {
      if (!id || byId.has(id)) return;
      const entry = filled[id];
      const versesFilled = Object.keys(entry?.verses || {})
        .map(Number)
        .sort((a, b) => a - b);
      const baseFilled = entry?.base?.length || 0;
      // Pool image excluding folder picks — shows what the auto-pool would
      // still provide as fallback once the folder is filled.
      const poolImageNow = getPrayerImageCandidates({ id, title }, source).find(
        (u) => u && !u.startsWith('/prayers/')
      );
      byId.set(id, {
        id,
        title: title || id,
        source,
        folder: `public/prayers/${id}`,
        baseFilled,
        versesFilled,
        filledCount: baseFilled + versesFilled.length,
        status: baseFilled + versesFilled.length > 0 ? 'done' : 'todo',
        poolImageNow: poolImageNow || null,
      });
    };

    for (const mystery of BOOKLET_MYSTERY_IDS) {
      let seq = [];
      try {
        seq = buildSequence(mystery, { novenaDay: 1, includeMercyOpening: true }) || [];
      } catch (_) {
        seq = [];
      }
      for (const step of seq) addPrayer(step?.id, step?.title, mystery);
    }
    for (const p of OPTIONAL_PRAYERS) addPrayer(p.id, p.title, 'optional');

    const rows = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
    const doneCount = rows.filter((r) => r.status === 'done').length;
    const report = {
      generatedAt: new Date().toISOString(),
      note:
        'Copy images into the listed folder (never move repo files). npm start/build rescans; regenerate this via npm test.',
      prayerCount: rows.length,
      doneCount,
      todoCount: rows.length - doneCount,
      prayers: rows,
    };

    const out = path.join(__dirname, '..', '..', 'scripts', 'prayer-folder-coverage.json');
    fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');

    // eslint-disable-next-line no-console
    console.log(
      `[prayer-folder-coverage] prayers=${rows.length} done=${doneCount} todo=${rows.length - doneCount} → ${out}`
    );

    expect(rows.length).toBeGreaterThan(20);
  });
});
