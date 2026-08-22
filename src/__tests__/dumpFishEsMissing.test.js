/**
 * Dump unique Liber steps missing ES Tier-3 clips → scripts/fish-es-missing.json
 * Run: npx react-scripts test --watchAll=false --testPathPattern=dumpFishEsMissing
 */
import fs from 'fs';
import path from 'path';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../utils/bookletSequence';
import { getSpeakablePrayerText } from '../utils/speakablePrayerText';
import { resolveBundledVoiceUrl } from '../data/bundledVoiceMap';

/** Basename to write under public/voice/es/ (strip slot suffixes like PB_3 → PB). */
function clipFileId(prayerId) {
  if (!prayerId || typeof prayerId !== 'string') return null;
  const m = prayerId.match(/^(.*)_\d+$/);
  if (m && !/^(MAG|ANG|LPB|PBO|VC|VL|VCR|LL|SCA|DMO|MG|MD|MGl|ML)_/.test(prayerId)) {
    // chaplet slot ids: PB_12 → PB, PBContrition_1 → PBContrition, SC_0 → SC
    return m[1];
  }
  return prayerId;
}

describe('dumpFishEsMissing', () => {
  test('writes scripts/fish-es-missing.json', () => {
    const byFile = new Map();
    for (const mystery of BOOKLET_MYSTERY_IDS) {
      const seq = buildSequence(mystery, { novenaDay: 1, includeMercyOpening: true });
      seq.forEach((step) => {
        if (!step?.id) return;
        if (resolveBundledVoiceUrl(step.id, 'es')) return;
        const fileId = clipFileId(step.id);
        if (!fileId || byFile.has(fileId)) return;
        if (resolveBundledVoiceUrl(fileId, 'es')) return;
        const text = getSpeakablePrayerText(step).replace(/\s+/g, ' ').trim();
        if (!text || text.length < 3) return;
        byFile.set(fileId, {
          id: fileId,
          prayerId: step.id,
          mystery,
          chars: text.length,
          text,
        });
      });
    }
    const rows = [...byFile.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    const out = path.join(__dirname, '../../scripts/fish-es-missing.json');
    fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), count: rows.length, clips: rows }, null, 2), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Wrote ${rows.length} missing ES clips → ${out}`);
    expect(Array.isArray(rows)).toBe(true);
  });
});
