/**
 * Regenerates bundled voice pack indexes from public/voice/{lang}/*.wav
 * Run: node scripts/genBundledVoiceMap.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const voiceRoot = path.join(root, 'public', 'voice');
const outFile = path.join(root, 'src', 'data', 'bundledVoiceMap.js');

const PACK_META = {
  es: { id: 'es', label: 'Español', tier: 3 },
  en: { id: 'en', label: 'English', tier: 3 },
  la: { id: 'la', label: 'Latín', tier: 3 },
};

/** Shared step → clip aliases (any pack). */
const SHARED_ALIASES = {
  ANG_AVE_1: 'A',
  ANG_AVE_2: 'A',
  ANG_AVE_3: 'A',
  MAG_SC: 'SC',
  MAG_DOX: 'G',
  PB_P: 'P',
  PB_G: 'G',
};

/** ES Piper used m1–m20 + Papa. Angelus/Magnificat use dedicated Fish Voz4 filenames when present. */
const ES_ALIASES = {
  ...SHARED_ALIASES,
  MG1: 'm1',
  MG2: 'm2',
  MG3: 'm3',
  MG4: 'm4',
  MG5: 'm5',
  MD1: 'm6',
  MD2: 'm7',
  MD3: 'm8',
  MD4: 'm9',
  MD5: 'm10',
  MGl1: 'm11',
  MGl2: 'm12',
  MGl3: 'm13',
  MGl4: 'm14',
  MGl5: 'm15',
  ML1: 'm16',
  ML2: 'm17',
  ML3: 'm18',
  ML4: 'm19',
  ML5: 'm20',
  S: 'Papa',
  // fallback only if per-step Fish clips missing
  ANG_SC: 'ANGELUS',
  ANG_ANNUNCIATION: 'ANGELUS',
  ANG_FIAT: 'ANGELUS',
  ANG_INCARNATION: 'ANGELUS',
  ANG_FINAL: 'ANGELUS',
};

const EN_ALIASES = { ...SHARED_ALIASES };

function listWavIds(lang) {
  const dir = path.join(voiceRoot, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.wav'))
    .map((f) => f.replace(/\.wav$/, ''))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

const packs = {};
for (const lang of Object.keys(PACK_META)) {
  const files = listWavIds(lang);
  if (!files.length && lang === 'la') {
    packs[lang] = { files: [], aliases: {} };
    continue;
  }
  packs[lang] = {
    files,
    aliases: lang === 'es' ? ES_ALIASES : EN_ALIASES,
  };
}

const packsLiteral = JSON.stringify(packs, null, 2);
const metaLiteral = JSON.stringify(PACK_META, null, 2);

const source = `/**
 * Bundled guide clips — one pack per prayer language under /public/voice/{lang}/.
 * Langs: es | en | la. Regenerate: node scripts/genBundledVoiceMap.js
 */

/** @typedef {'S'|3} VoiceTier */
/** @typedef {'es'|'en'|'la'} VoiceLang */

export const VOICE_TIER_USER = 'S';
export const VOICE_TIER_BUNDLED = 3;

export const VOICE_LANGS = ['es', 'en', 'la'];

/** Pack folders under /public/voice/ */
export const VOICE_PACKS = ${metaLiteral};

/**
 * Per-pack wav basenames + prayerId→basename aliases.
 * @type {Record<VoiceLang, { files: string[], aliases: Record<string, string> }>}
 */
export const VOICE_PACK_INDEX = ${packsLiteral};

const FILE_SET = Object.fromEntries(
  Object.entries(VOICE_PACK_INDEX).map(([lang, pack]) => [lang, new Set(pack.files)])
);

/** Map UI variant ids → voice pack folder. */
export function normalizeVoiceLang(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const id = raw.toLowerCase();
  if (id === 'es' || id === 'en' || id === 'la') return id;
  if (id === 'latin' || id === 'lat' || id === 'la-va') return 'la';
  if (id === 'español' || id === 'espanol' || id === 'es-es') return 'es';
  if (id === 'english' || id === 'en-us' || id === 'en-gb') return 'en';
  return null;
}

function clipCandidates(prayerId, pack) {
  if (!prayerId || typeof prayerId !== 'string') return [];
  const out = [];
  const push = (id) => {
    if (id && !out.includes(id)) out.push(id);
  };
  push(prayerId);
  const aliased = pack.aliases?.[prayerId];
  if (aliased) push(aliased);
  const m = prayerId.match(/^(.*)_\\d+$/);
  if (m) {
    push(m[1]);
    const baseAlias = pack.aliases?.[m[1]];
    if (baseAlias) push(baseAlias);
  }
  return out;
}

/**
 * Resolve static voice URL for a sequence step id in a language pack.
 * @param {string} prayerId
 * @param {string} [lang='es']
 */
export function resolveBundledVoiceUrl(prayerId, lang = 'es') {
  const packLang = normalizeVoiceLang(lang) || 'es';
  const pack = VOICE_PACK_INDEX[packLang];
  if (!pack) return null;
  const files = FILE_SET[packLang];
  for (const key of clipCandidates(prayerId, pack)) {
    if (files.has(key)) return \`/voice/\${packLang}/\${key}.wav\`;
  }
  return null;
}

/** @returns {{ url: string, tier: 3, pack: string } | null} */
export function resolveBundledVoiceClip(prayerId, lang = 'es') {
  const packLang = normalizeVoiceLang(lang) || 'es';
  const url = resolveBundledVoiceUrl(prayerId, packLang);
  if (!url) return null;
  return { url, tier: VOICE_TIER_BUNDLED, pack: packLang };
}

/** Exact wav keys present in a pack (no aliases). */
export function listBundledVoiceKeys(lang = 'en') {
  const packLang = normalizeVoiceLang(lang) || 'en';
  return [...(VOICE_PACK_INDEX[packLang]?.files || [])];
}

/** @deprecated use listBundledVoiceKeys('en') — kept for older studio checks */
export const BUNDLED_VOICE_BY_ID = Object.fromEntries(
  (VOICE_PACK_INDEX.en?.files || []).map((id) => [id, \`/voice/en/\${id}.wav\`])
);
`;

fs.writeFileSync(outFile, source, 'utf8');
const counts = Object.entries(packs)
  .map(([l, p]) => `${l}:${p.files.length}`)
  .join(' ');
console.log(`Wrote packs ${counts} → ${path.relative(root, outFile)}`);
