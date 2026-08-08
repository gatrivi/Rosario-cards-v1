/**
 * Bundled guide clips — one pack per prayer language under /public/voice/{lang}/.
 * Langs: es | en | la. Regenerate: node scripts/genBundledVoiceMap.js
 */

/** @typedef {'S'|3} VoiceTier */
/** @typedef {'es'|'en'|'la'} VoiceLang */

export const VOICE_TIER_USER = 'S';
export const VOICE_TIER_BUNDLED = 3;

export const VOICE_LANGS = ['es', 'en', 'la'];

/** Pack folders under /public/voice/ */
export const VOICE_PACKS = {
  "es": {
    "id": "es",
    "label": "Español",
    "tier": 3
  },
  "en": {
    "id": "en",
    "label": "English",
    "tier": 3
  },
  "la": {
    "id": "la",
    "label": "Latín",
    "tier": 3
  }
};

/**
 * Per-pack wav basenames + prayerId→basename aliases.
 * @type {Record<VoiceLang, { files: string[], aliases: Record<string, string> }>}
 */
export const VOICE_PACK_INDEX = {
  "es": {
    "files": [
      "A",
      "AC",
      "ANG_ANNUNCIATION",
      "ANG_FIAT",
      "ANG_FINAL",
      "ANG_INCARNATION",
      "ANG_SC",
      "ANGELUS",
      "C",
      "DMO1",
      "DMO2",
      "EF",
      "F",
      "G",
      "HG",
      "LL",
      "LL_0",
      "LL_1",
      "LL_2",
      "LL_3",
      "LL_4",
      "LL_5",
      "LPB_1",
      "LPB_2",
      "LPB_3",
      "LPB_4",
      "LPB_5",
      "LPB_6",
      "LPB_7",
      "LPB_8",
      "LPB_9",
      "LPB_10",
      "LPB_11",
      "LPB_12",
      "LPB_13",
      "LPB_14",
      "LPB_15",
      "LPB_16",
      "LPB_17",
      "LPB_18",
      "LPB_19",
      "LPB_20",
      "LPB_21",
      "LPB_22",
      "LPB_23",
      "LPB_24",
      "LPB_25",
      "LPB_26",
      "LPB_27",
      "LPB_28",
      "LPB_29",
      "LPB_30",
      "LPB_31",
      "LPB_32",
      "LPB_33",
      "LPB_34",
      "LPB_35",
      "LPB_36",
      "LPB_37",
      "LPB_38",
      "LPB_39",
      "LPB_40",
      "LPB_41",
      "LPB_42",
      "LPB_43",
      "LPB_44",
      "LPB_Close",
      "m1",
      "m2",
      "m3",
      "m4",
      "m5",
      "m6",
      "m7",
      "m8",
      "m9",
      "m10",
      "m11",
      "m12",
      "m13",
      "m14",
      "m15",
      "m16",
      "m17",
      "m18",
      "m19",
      "m20",
      "MAG_1",
      "MAG_2",
      "MAG_3",
      "MAG_4",
      "MAG_5",
      "MAG_6",
      "MAG_7",
      "MP",
      "NOVENA_DAY_INTENTION",
      "P",
      "Papa",
      "PB",
      "PBClosing",
      "PBContrition",
      "PBO_1",
      "PBO_2",
      "PBO_3",
      "PBO_4",
      "PBO_5",
      "PBO_6",
      "PBO_7",
      "SC",
      "SCA_ACLAMACIONES",
      "SCA_CONTRICION",
      "SCA_EXPO",
      "SCA_HYMN_CANTEMOS",
      "SCA_HYMN_LAUDATE",
      "SCA_INV_IMITAR",
      "SCA_INV_NOBLE",
      "SCA_LECTURA",
      "SCA_LITANY",
      "SCA_O_BONE_JESU",
      "SCA_ORACION_FINAL",
      "SCA_ORACION_INICIAL",
      "SCA_ORACION_TIEMPO",
      "SCA_PETICIONES",
      "SCA_RESERVA",
      "SCA_TANTUM_ERGO",
      "VC_1",
      "VC_2",
      "VC_3",
      "VC_4",
      "VC_5",
      "VC_6",
      "VC_7",
      "VC_8",
      "VC_9",
      "VC_10",
      "VC_11",
      "VC_12",
      "VC_13",
      "VC_14",
      "VC_OPEN",
      "VL_1",
      "VL_2",
      "VL_3",
      "VL_4",
      "VL_5",
      "VL_6",
      "VL_7",
      "VL_8",
      "VL_9",
      "VL_10",
      "VL_11",
      "VL_12",
      "VL_13",
      "VL_14",
      "VL_OPEN"
    ],
    "aliases": {
      "ANG_AVE_1": "A",
      "ANG_AVE_2": "A",
      "ANG_AVE_3": "A",
      "MAG_SC": "SC",
      "MAG_DOX": "G",
      "PB_P": "P",
      "PB_G": "G",
      "MG1": "m1",
      "MG2": "m2",
      "MG3": "m3",
      "MG4": "m4",
      "MG5": "m5",
      "MD1": "m6",
      "MD2": "m7",
      "MD3": "m8",
      "MD4": "m9",
      "MD5": "m10",
      "MGl1": "m11",
      "MGl2": "m12",
      "MGl3": "m13",
      "MGl4": "m14",
      "MGl5": "m15",
      "ML1": "m16",
      "ML2": "m17",
      "ML3": "m18",
      "ML4": "m19",
      "ML5": "m20",
      "S": "Papa",
      "ANG_SC": "ANGELUS",
      "ANG_ANNUNCIATION": "ANGELUS",
      "ANG_FIAT": "ANGELUS",
      "ANG_INCARNATION": "ANGELUS",
      "ANG_FINAL": "ANGELUS"
    }
  },
  "en": {
    "files": [
      "A",
      "AC",
      "ANG_ANNUNCIATION",
      "ANG_AVE_1",
      "ANG_AVE_2",
      "ANG_AVE_3",
      "ANG_FIAT",
      "ANG_FINAL",
      "ANG_INCARNATION",
      "ANG_SC",
      "C",
      "DMO1",
      "DMO2",
      "EF",
      "F",
      "G",
      "HG",
      "LPB_1",
      "LPB_2",
      "LPB_3",
      "LPB_4",
      "LPB_5",
      "LPB_6",
      "LPB_7",
      "LPB_8",
      "LPB_9",
      "LPB_10",
      "LPB_11",
      "LPB_12",
      "LPB_13",
      "LPB_14",
      "LPB_15",
      "LPB_16",
      "LPB_17",
      "LPB_18",
      "LPB_19",
      "LPB_20",
      "LPB_21",
      "LPB_22",
      "LPB_23",
      "LPB_24",
      "LPB_25",
      "LPB_26",
      "LPB_27",
      "LPB_28",
      "LPB_29",
      "LPB_30",
      "LPB_31",
      "LPB_32",
      "LPB_33",
      "LPB_34",
      "LPB_35",
      "LPB_36",
      "LPB_37",
      "LPB_38",
      "LPB_39",
      "LPB_40",
      "LPB_41",
      "LPB_42",
      "LPB_43",
      "LPB_44",
      "LPB_Close",
      "MAG_1",
      "MAG_2",
      "MAG_3",
      "MAG_4",
      "MAG_5",
      "MAG_6",
      "MAG_7",
      "MAG_DOX",
      "MAG_SC",
      "MD1",
      "MD2",
      "MD3",
      "MD4",
      "MD5",
      "MG1",
      "MG2",
      "MG3",
      "MG4",
      "MG5",
      "MGl1",
      "MGl2",
      "MGl3",
      "MGl4",
      "MGl5",
      "ML1",
      "ML2",
      "ML3",
      "ML4",
      "ML5",
      "MP",
      "NOVENA_DAY_INTENTION",
      "P",
      "PB",
      "PB_G",
      "PB_P",
      "PBClosing",
      "PBContrition",
      "PBO_1",
      "PBO_2",
      "PBO_3",
      "PBO_4",
      "PBO_5",
      "PBO_6",
      "PBO_7",
      "S",
      "SC",
      "SCA_ACLAMACIONES",
      "SCA_HYMN_CANTEMOS",
      "SCA_HYMN_LAUDATE",
      "SCA_TANTUM_ERGO",
      "VC_4",
      "VL_11",
      "VL_12",
      "VL_13",
      "VL_14"
    ],
    "aliases": {
      "ANG_AVE_1": "A",
      "ANG_AVE_2": "A",
      "ANG_AVE_3": "A",
      "MAG_SC": "SC",
      "MAG_DOX": "G",
      "PB_P": "P",
      "PB_G": "G"
    }
  },
  "la": {
    "files": [],
    "aliases": {}
  }
};

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
  const m = prayerId.match(/^(.*)_\d+$/);
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
    if (files.has(key)) return `/voice/${packLang}/${key}.wav`;
  }
  // Never cross-lang (EN→ES Spanish Fish under English UI). Missing = null.
  return null;
}

/** @returns {{ url: string, tier: 3, pack: string } | null} */
export function resolveBundledVoiceClip(prayerId, lang = 'es') {
  const url = resolveBundledVoiceUrl(prayerId, lang);
  if (!url) return null;
  const pack = url.split('/')[2] || normalizeVoiceLang(lang) || 'es';
  return { url, tier: VOICE_TIER_BUNDLED, pack };
}

/** Exact wav keys present in a pack (no aliases). */
export function listBundledVoiceKeys(lang = 'en') {
  const packLang = normalizeVoiceLang(lang) || 'en';
  return [...(VOICE_PACK_INDEX[packLang]?.files || [])];
}

/** @deprecated use listBundledVoiceKeys('en') — kept for older studio checks */
export const BUNDLED_VOICE_BY_ID = Object.fromEntries(
  (VOICE_PACK_INDEX.en?.files || []).map((id) => [id, `/voice/en/${id}.wav`])
);
