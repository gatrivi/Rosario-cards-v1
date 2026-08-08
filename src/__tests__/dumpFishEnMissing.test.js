/**
 * Dump Liber EN Fish texts → scripts/fish-en-missing.json
 * Uses English-only sources (enLiberFishTexts / enGuideText). Never Spanish body text.
 *
 * Run: npx react-scripts test --watchAll=false --testPathPattern=dumpFishEnMissing
 */
import fs from 'fs';
import path from 'path';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../utils/bookletSequence';
import { resolveEnLiberFishText, isEnglishLiberText } from '../data/enLiberFishTexts';
import { VOICE_PACK_INDEX } from '../data/bundledVoiceMap';

function clipFileId(prayerId) {
  if (!prayerId || typeof prayerId !== 'string') return null;
  const m = prayerId.match(/^(.*)_\d+$/);
  if (m && !/^(MAG|ANG|LPB|PBO|VC|VL|LL|SCA|DMO|MG|MD|MGl|ML)_/.test(prayerId)) {
    return m[1];
  }
  return prayerId;
}

describe('dumpFishEnMissing', () => {
  test('writes scripts/fish-en-missing.json (English only)', () => {
    const byFile = new Map();
    const skippedEs = [];
    const declared = new Set(VOICE_PACK_INDEX.en?.files || []);

    for (const mystery of BOOKLET_MYSTERY_IDS) {
      const seq = buildSequence(mystery, { novenaDay: 1, includeMercyOpening: true });
      seq.forEach((step) => {
        if (!step?.id) return;
        const fileId = clipFileId(step.id);
        if (!fileId || byFile.has(fileId)) return;
        const text = resolveEnLiberFishText(fileId, mystery, step.text || step.title);
        if (!text || !isEnglishLiberText(text)) {
          skippedEs.push({ id: fileId, mystery });
          return;
        }
        byFile.set(fileId, {
          id: fileId,
          prayerId: step.id,
          mystery,
          chars: text.length,
          text: text.replace(/\s+/g, ' ').trim(),
          lang: 'en',
          voice: 'fish_default_lock',
          seed: 42,
          inVoiceMap: declared.has(fileId),
        });
      });
    }

    const rows = [...byFile.values()].sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    );
    const out = path.join(__dirname, '../../scripts/fish-en-missing.json');
    fs.writeFileSync(
      out,
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          count: rows.length,
          skipped_no_en_text: skippedEs.length,
          skipped_sample: skippedEs.slice(0, 30),
          voice: {
            lock: 'catts/data/voices/fish_default_lock/lock.wav',
            lock_text: 'In the desert of Scete, the abbot Moses spoke of the end of the monk.',
            seed: 42,
            lang: 'en',
            note: 'Same EN Fish lock as static/fish/rosary/en (not ES Voz 4)',
          },
          clips: rows,
        },
        null,
        2
      ),
      'utf8'
    );
    // eslint-disable-next-line no-console
    console.log(
      `Wrote ${rows.length} EN clips (skipped ${skippedEs.length} without EN text) → ${out}`
    );
    expect(rows.length).toBeGreaterThan(40);
    expect(rows.every((r) => r.lang === 'en')).toBe(true);
    expect(rows.some((r) => /Dios te salve|Proclama mi alma|Sangre de Cristo/.test(r.text))).toBe(
      false
    );
  });
});
