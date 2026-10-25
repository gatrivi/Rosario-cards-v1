/**
 * Voice coverage audit → scripts/audio-coverage.json + .docs/voice-cue-sheet.md
 *
 * Walks every Libro/devotion sequence, aggregates unique clips by how often
 * each is prayed, and emits the recording checklist for the human-voice
 * project (replace the TTS "Fish" pack with gatrivi's mic takes).
 *
 * Run: npx react-scripts test --watchAll=false --testPathPattern=dumpAudioCoverage
 */
import fs from 'fs';
import path from 'path';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../utils/bookletSequence';
import { getSpeakablePrayerText, cleanPrayerDisplayTitle } from '../utils/speakablePrayerText';
import { resolveBundledVoiceUrl } from '../data/bundledVoiceMap';
import { devotionVoiceLabel } from '../utils/voiceCoverage';
import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';

const ROSARY_SETS = ['gozosos', 'dolorosos', 'gloriosos', 'luminosos'];
const SHARED_IDS = new Set(['SC', 'AC', 'C', 'P', 'A', 'G', 'F']);

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

/** Disk key the Fish pack resolves this id to (e.g. MG1 → m1 via alias), or null. */
function bundledFileKey(prayerId, lang) {
  const url = resolveBundledVoiceUrl(prayerId, lang);
  if (!url) return null;
  return String(url).split('/').pop().replace(/\.wav$/i, '');
}

function tierOf(entry) {
  const ids = entry.ids;
  if (ids.some((id) => SHARED_IDS.has(id))) return 1;
  if (ids.some((id) => /^(DMO|EF|MP|HG)$/.test(id) || id === 'S' || id === 'Papa')) return 2;
  if (ids.some((id) => /^(MG|MD|MGl|ML)\d/.test(id))) return 3;
  if (ids.some((id) => /^LL/.test(id))) return 4;
  return 5;
}

const TIER_LABELS = {
  1: 'Tier 1 · Rezos compartidos del rosario',
  2: 'Tier 2 · Divina Misericordia + cierre (Salve, Papa)',
  3: 'Tier 3 · Meditaciones de los misterios',
  4: 'Tier 4 · Letanía',
  5: 'Tier 5 · Devociones (coronas, vía crucis, adoraciones)',
};

function preview(text, max = 80) {
  const t = String(text || '').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** Collapse per-station slot decorations: "Ave María · Est. 3 (7/10)" → "Ave María". */
function baseTitle(title) {
  const t = String(title || '')
    .replace(/\s*·\s*Est\.\s*\d+.*$/, '')
    .replace(/\s*·\s*inicio.*$/, '')
    .replace(/\s*\(\d+\/\d+\)\s*$/, '')
    .trim();
  return t || '—';
}

describe('dumpAudioCoverage', () => {
  test('writes scripts/audio-coverage.json + .docs/voice-cue-sheet.md', () => {
    const perSequence = {};
    const clips = new Map();

    for (const mystery of BOOKLET_MYSTERY_IDS) {
      const seq = buildSequence(mystery, { novenaDay: 1, includeMercyOpening: true });
      perSequence[mystery] = [];
      seq.forEach((step, slotIndex) => {
        if (!step?.id) return;
        const text = getSpeakablePrayerText(step).replace(/\s+/g, ' ').trim();
        const file = bundledFileKey(step.id, 'es') || clipFileId(step.id) || step.id;
        let entry = clips.get(file);
        if (!entry) {
          entry = {
            file,
            ids: new Set(),
            titles: new Set(),
            texts: new Set(),
            plays: 0,
            sets: [],
            bundledEs: false,
            bundledEn: false,
          };
          clips.set(file, entry);
        }
        entry.plays += 1;
        entry.ids.add(step.id);
        entry.titles.add(baseTitle(cleanPrayerDisplayTitle(step.title) || step.id));
        if (text) entry.texts.add(text);
        if (!entry.sets.includes(mystery)) entry.sets.push(mystery);
        entry.bundledEs = entry.bundledEs || !!resolveBundledVoiceUrl(step.id, 'es');
        entry.bundledEn = entry.bundledEn || !!resolveBundledVoiceUrl(step.id, 'en');
        perSequence[mystery].push({
          slot: slotIndex,
          id: step.id,
          title: cleanPrayerDisplayTitle(step.title) || step.id,
          file,
          t3Es: !!resolveBundledVoiceUrl(step.id, 'es'),
          chars: text.length,
        });
      });
    }

    const optional = OPTIONAL_PRAYERS.map((p) => {
      const esVariant =
        (p.variants || []).find((v) => String(v.id || '').toLowerCase().startsWith('es')) ||
        (p.variants || [])[0];
      const text = String(esVariant?.text || '').replace(/\s+/g, ' ').trim();
      return {
        id: p.id,
        title: p.title || p.id,
        chars: text.length,
        text,
        t3Es: !!resolveBundledVoiceUrl(p.id, 'es'),
        file: clipFileId(p.id) || p.id,
      };
    });

    const rows = [...clips.values()]
      .map((e) => ({
        file: e.file,
        ids: [...e.ids],
        titles: [...e.titles],
        texts: [...e.texts],
        plays: e.plays,
        sets: e.sets,
        tier: 0,
        bundledEs: e.bundledEs,
        bundledEn: e.bundledEn,
      }))
      .sort((a, b) => b.plays - a.plays || a.file.localeCompare(b.file, undefined, { numeric: true }));
    rows.forEach((r) => {
      r.tier = tierOf(r);
    });
    const conflicts = rows.filter((r) => r.texts.length > 1);
    const totalChars = rows.reduce((sum, r) => sum + Math.max(...r.texts.map((t) => t.length), 0), 0);
    const estMinutes = Math.round(totalChars / 14 / 60);

    const report = {
      generated: new Date().toISOString(),
      summary: {
        uniqueClips: rows.length,
        sequences: BOOKLET_MYSTERY_IDS.length,
        estimatedMinutes: estMinutes,
        bundledEs: rows.filter((r) => r.bundledEs).length,
        bundledEn: rows.filter((r) => r.bundledEn).length,
        conflicts: conflicts.length,
      },
      clips: rows,
      sequences: perSequence,
      optionalPrayers: optional,
    };
    const jsonPath = path.join(__dirname, '../../scripts/audio-coverage.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

    const lines = [];
    lines.push('# Hoja de grabación — voces humanas (Tier S)');
    lines.push('');
    lines.push(`_Generada ${new Date().toISOString().slice(0, 10)} por \`dumpAudioCoverage.test.js\` · ${rows.length} clips únicos ≈ ${estMinutes} min de audio._`);
    lines.push('');
    lines.push('**Cómo usarla:** graba cada clip (ES primero), nómbralo como la columna «Clip», e impórtalo');
    lines.push('por el Estudio de voz (`/voz`, botón ↑ de cada casilla) para escucharlo al instante en el Liber.');
    lines.push('Para reemplazar el pack T3 de todos, suelta los archivos en `public/voice/es/` y corre');
    lines.push('`node scripts/genBundledVoiceMap.js`. El orden de grabación es el de la tabla: lo que más suena, primero.');
    lines.push('');
    for (const tier of [1, 2, 3, 4, 5]) {
      const tierRows = rows.filter((r) => r.tier === tier);
      if (tierRows.length === 0) continue;
      lines.push(`## ${TIER_LABELS[tier]} (${tierRows.length} clips)`);
      lines.push('');
      lines.push('| # | Clip | Oración | Veces | T3 ES | T3 EN | Inicio del texto |');
      lines.push('|---|------|---------|-------|-------|-------|------------------|');
      tierRows.forEach((r, i) => {
        const titleCell =
          r.titles.length > 3
            ? `${r.titles.slice(0, 3).join(' / ')} (+${r.titles.length - 3} más)`
            : r.titles.join(' / ');
        lines.push(
          `| ${i + 1} | \`${r.file}\` | ${titleCell} | ${r.plays} | ${r.bundledEs ? '✓' : '—'} | ${r.bundledEn ? '✓' : '—'} | ${preview(r.texts[0], 60)} |`
        );
      });
      lines.push('');
    }
    lines.push('## Oraciones opcionales (breve, sin casilla)');
    lines.push('');
    lines.push('| Clip | Oración | T3 ES | Inicio del texto |');
    lines.push('|------|---------|-------|------------------|');
    optional.forEach((p) => {
      lines.push(`| \`${p.file}\` | ${p.title} | ${p.t3Es ? '✓' : '—'} | ${preview(p.text, 60)} |`);
    });
    lines.push('');
    if (conflicts.length > 0) {
      lines.push('## ⚠️ Conflictos detectados (un clip, varios textos)');
      lines.push('');
      conflicts.forEach((r) => {
        lines.push(`- \`${r.file}\` — usado por ${r.ids.join(', ')}: ${r.texts.map((t) => `«${preview(t, 40)}»`).join(' vs ')}`);
      });
      lines.push('');
    }

    lines.push('## Notas del auditor');
    lines.push('');
    lines.push('1. **Gloriosos suena Gozosos hoy.** Los misterios Gloriosos reutilizan los ids `MG1`–`MG5`');
    lines.push('   (mismos que Gozosos) con textos distintos, así que el alias del pack les pone los clips');
    lines.push('   de Gozosos (`m1`–`m5`). Las grabaciones de Gloriosos (`m11`–`m15`) **ya existen en disco**');
    lines.push('   pero son inalcanzables: los alias `MGl1→m11`…`MGl5→m15` están listos en');
    lines.push('   `scripts/genBundledVoiceMap.js` y nunca reciben esos ids. Arreglo: renombrar los ids de');
    lines.push('   `mysteries.gloriosos` a `MGl1`–`MGl5` en `RosarioPrayerBook.js`. Graba tus Gloriosos como');
    lines.push('   `m11`–`m15` desde ya — sonarán en cuanto el id se arregle.');
    lines.push('2. **`Papa.wav` contiene la Salve.** Tanto `S` (Salve Regina) como `Papa` (Oración por el');
    lines.push('   Papa) resuelven al mismo clip, que trae el texto de la Salve. Graba `Salve` y `Papa` por');
    lines.push('   separado y parte los alias (`S→Salve`, `Papa→Papa`) al hornear.');
    lines.push('3. **Letanía.** El T3 la cubre con un único clip `LL`. Si quieres línea por línea, el patrón');
    lines.push('   del pack es `LL_0`–`LL_5` (trozos); 65 versos sueltos serían 65 archivos.');
    lines.push('4. **Padre Nuestro largo.** La Corona de la Sangre Preciosa usa un texto distinto del');
    lines.push('   `P` estándar (ver conflicto arriba). Un `P` humano cubre el rosario; graba el largo');
    lines.push('   después si te importa esa corona.');
    lines.push('');


    const mdPath = path.join(__dirname, '../../.docs/voice-cue-sheet.md');
    fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
    // eslint-disable-next-line no-console
    console.log(
      `Wrote ${rows.length} unique clips (${conflicts.length} conflicts, ~${estMinutes} min) → ${jsonPath} + ${mdPath}`
    );

    expect(rows.length).toBeGreaterThan(100);
    expect(rows[0].file).toBe('A');
    expect(rows[0].plays).toBeGreaterThanOrEqual(40);
    expect(perSequence.gozosos.length).toBeGreaterThan(70);
    expect(fs.existsSync(mdPath)).toBe(true);
  });
});
