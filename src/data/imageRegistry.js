/**
 * Image Registry — single source of truth for every image the app uses.
 *
 * Why this exists: image paths used to be hardcoded as string literals
 * scattered across RosarioPrayerBook, divineMercyData, divineMercyNovenaData,
 * and prayerImages utilities. That made it impossible to know what we had,
 * and adding new art meant hand-editing many files.
 *
 * Convention:
 *   - `source: 'asset'`  → imported from src/data/assets/img (bundled, hashed).
 *   - `source: 'public'` → served from public/gallery-images (static path).
 *   - `name`  → human-readable label (editable from the Asset Studio).
 *   - `tags`  → free-form categories used to filter & suggest assignments.
 *
 * To add new art: drop the file in src/data/assets/img (or public/gallery-images),
 * add one entry below, and reference it anywhere by `getImage(id)` or `IMG.<id>`.
 *
 * The Asset Studio view (/assets, dev-only) lets you rename/tag entries at
 * runtime; those edits are persisted to localStorage and merged over this table.
 */

import crux from './assets/img/Prayer-text-handwritten/crux.jpg';
import lamb from './assets/img/lamb.jpg';
import vitreauxCruz from './assets/img/vitreaux-cruz.jpg';
import theotokos from './assets/img/Theotokos.jpg';
import earlyChristian from './assets/img/Early-Christian-Art-768x549.jpg';
import byzantineArt from './assets/img/Religious-Byzantine-Art-825x1024.jpg';
import stainedGlass from './assets/img/Stained glass_..jpg';
import cover from './assets/img/cover.jpg';
import avemariaLat from './assets/img/Prayer-text-handwritten/avemarialat.png';
import latinAveMaria from './assets/img/Prayer-text-handwritten/latin-ave-maria.jpg';
import latinGloria from './assets/img/Prayer-text-handwritten/latin-gloria.jpg';
import latinPaterNoster from './assets/img/Prayer-text-handwritten/latin-pater-noster.jpg';
import latinAngelus from './assets/img/Prayer-text-handwritten/latin-angelus.jpg';
import latinSanBenito from './assets/img/latin-san-benito.jpg';
import sanctusBenedictus from './assets/img/sanctus-benedictus.jpg';
import reginaCaeli from './assets/img/Prayer-text-handwritten/regina caeli.jpg';
import stAnthony from './assets/img/st-anthony-of-padua-icon-402.jpg';
import franciscoDeAsis from './assets/img/francisco_de_asis_2.jpg';
import christFace from './assets/img/Arte-Sacro/classic-orthodox/christface.jpg';
import santaTeresita from './assets/img/Arte-Sacro/santa teresa de lisieux.jpeg';
import saintPeterRelic from './assets/img/Arte-Sacro/SaintPeterRelic.jpg';
import virgenDeLujan from './assets/img/Arte-Sacro/virgendelujan.jpg';
import sanLuisMontfort from './assets/img/Arte-Sacro/louis montfort.jpg';
import eliasProfeta from './assets/img/Arte-Sacro/classic-orthodox/elijah.jpg';
import coronaDeEspinas from './assets/img/Arte-Sacro/DarkMode/crown.jpg';
import allMary17th from './assets/img/AllMary17thLith.jpeg';
import encountersCathedral from './assets/img/Encounters in the cathedral of Raleigh.jpg';
import earlyChristianAlt from './assets/img/edbd5609aa30b5237d89812de8025c9f--early-christian-christian-art.jpg';
import sain from './assets/img/sain.jpg';
import jpgMisc from './assets/img/jpg.jpg';
import misc96PsRGiE from './assets/img/96PsRGiE.jpg';
import miscUgQlLjwl from './assets/img/uGQlLjwl.jpg';
import faustinaDivinoCorazon from './assets/img/santafaustinadivinocorazon.jpg';
import faustinaStainedGlass from './assets/img/santafaustinastainedglass.jpg';
import maryCarmen from './assets/img/mary/lady-of-sorrows.jpg';
import mary01 from './assets/img/mary/HOPm6k_XgAA01Zq.jpg';
import mary02 from './assets/img/mary/HOQsiV3XkAANF6a.jpg';
import mary03 from './assets/img/mary/HOUCofpbsAA1Y7v.jpg';
import mary04 from './assets/img/mary/HOUVqYlXUAA5DZa.jpg';
import mary05 from './assets/img/mary/HOV4it8WAAAi39L.jpg';
import mary06 from './assets/img/mary/HOVIuwUXYAA-esH.jpg';
import angAnnunciation from './assets/img/ANG/HOSdpgPXgAAnxPi.jpg';
import monk01 from './assets/img/monk/HOUQXFjXwAAW7yL.jpg';
import monkDark from './assets/img/monk/modooscuro/HOVTvK2WYAAQgCD.jpg';
import nun01 from './assets/img/nuns/HOT5zDBXoAAjA9-.jpg';
import nun02 from './assets/img/nuns/HOUi_5EXEAAWo6H.jpg';
import nun03 from './assets/img/nuns/HOWNTjcWIAIWqpV.png';
import nun04 from './assets/img/nuns/HOWNqmdXMAAeHH7.png';
import nun05 from './assets/img/nuns/HOWQmUpXoAAhQVg.jpg';
import rosaryBeads from './assets/img/rosary/HOWtZOEXAAA3UhZ.jpg';
import artSacredHot from './assets/img/HOTthgTWEAAHsZG.jpg';
import { touchLocalArtConfig } from '../utils/artConfigSync';
import { loadImageLibrary } from '../utils/imageLibraryStore';

// Public gallery images (referenced by URL, not imported).
const PUBLIC = (path) => ({ path, source: 'public' });

const REGISTRY = {
  // ── Cross / Passion / Precious Blood themes ──
  // crux lives under Prayer-text-handwritten — tag text-heavy (not Liber vitral BG).
  crux: { path: crux, name: 'Cruz — relieve / manuscrito', tags: ['cross', 'passion', 'precious-blood', 'lent', 'text-heavy'], source: 'asset' },
  vitreauxCruz: { path: vitreauxCruz, name: 'Vitral de la Cruz', tags: ['cross', 'stained-glass', 'passion'], source: 'asset' },
  lamb: { path: lamb, name: 'Cordero de Dios', tags: ['lamb', 'agnus-dei', 'eucharist', 'precious-blood'], source: 'asset' },

  // ── Mary / Theotokos ──
  theotokos: { path: theotokos, name: 'Theotokos — Madre de Dios', tags: ['mary', 'theotokos', 'byzantine'], source: 'asset' },
  allMary17th: { path: allMary17th, name: 'Virgen — litografía s. XVII', tags: ['mary', 'lithograph'], source: 'asset' },
  reginaCaeli: { path: reginaCaeli, name: 'Regina Caeli (manuscrito)', tags: ['mary', 'regina-caeli', 'prayer', 'text-heavy', 'manuscript'], source: 'asset' },
  magnificatVisitation: { ...PUBLIC('/gallery-images/misterios/modooscuro/misteriogozo2.webp'), name: 'La Visitación — Magnificat', tags: ['mary', 'visitation', 'magnificat', 'prayer'] },

  // ── Latin prayer texts (handwritten — NEVER Liber vitral backgrounds) ──
  latinPaterNoster: { path: latinPaterNoster, name: 'Pater Noster (latín)', tags: ['latin', 'pater-noster', 'prayer', 'text-heavy', 'manuscript'], source: 'asset' },
  latinAveMaria: { path: latinAveMaria, name: 'Ave María (latín)', tags: ['latin', 'ave-maria', 'prayer', 'text-heavy', 'manuscript'], source: 'asset' },
  avemariaLat: { path: avemariaLat, name: 'Ave María — manuscrito', tags: ['latin', 'ave-maria', 'manuscript', 'text-heavy'], source: 'asset' },
  latinGloria: { path: latinGloria, name: 'Gloria (latín)', tags: ['latin', 'gloria', 'prayer', 'text-heavy', 'manuscript'], source: 'asset' },
  latinAngelus: { path: latinAngelus, name: 'Angelus (latín)', tags: ['latin', 'angelus', 'prayer', 'text-heavy', 'manuscript'], source: 'asset' },

  // ── Saints ──
  sanctusBenedictus: { path: sanctusBenedictus, name: 'San Benito', tags: ['saint', 'benedict', 'latin'], source: 'asset' },
  latinSanBenito: { path: latinSanBenito, name: 'San Benito (latín)', tags: ['saint', 'benedict', 'latin'], source: 'asset' },
  stAnthony: { path: stAnthony, name: 'San Antonio de Padua', tags: ['saint', 'anthony', 'icon'], source: 'asset' },
  franciscoDeAsis: { path: franciscoDeAsis, name: 'San Francisco de Asís', tags: ['saint', 'francis', 'assisi'], source: 'asset' },
  christFace: { path: christFace, name: 'Mandylion — Rostro Santo', tags: ['christ', 'icon', 'orthodox', 'relic'], source: 'asset' },
  santaTeresita: { path: santaTeresita, name: 'Santa Teresita de Lisieux', tags: ['saint', 'carmel', 'teresa'], source: 'asset' },
  saintPeterRelic: { path: saintPeterRelic, name: 'Reliquia de San Pedro', tags: ['relic', 'peter', 'apostle'], source: 'asset' },
  virgenDeLujan: { path: virgenDeLujan, name: 'Virgen de Luján', tags: ['mary', 'lujan', 'argentina'], source: 'asset' },
  sanLuisMontfort: { path: sanLuisMontfort, name: 'San Luis María de Montfort', tags: ['saint', 'montfort', 'rosary'], source: 'asset' },
  eliasProfeta: { path: eliasProfeta, name: 'San Elías profeta', tags: ['elijah', 'prophet', 'carmel', 'orthodox'], source: 'asset' },
  coronaDeEspinas: { path: coronaDeEspinas, name: 'Corona de espinas', tags: ['passion', 'crown', 'relic'], source: 'asset' },

  // ── Divine Mercy / Faustina ──
  faustinaDivinoCorazon: { path: faustinaDivinoCorazon, name: 'Santa Faustina — Corazón Divino', tags: ['faustina', 'divine-mercy', 'sacred-heart'], source: 'asset' },
  faustinaStainedGlass: { path: faustinaStainedGlass, name: 'Faustina — vitral', tags: ['faustina', 'divine-mercy', 'stained-glass'], source: 'asset' },

  // ─<arg_value> Early Christian / Byzantine / general sacred art ──
  earlyChristian: { path: earlyChristian, name: 'Arte cristiano primitivo', tags: ['early-christian', 'catacombs', 'art'], source: 'asset' },
  earlyChristianAlt: { path: earlyChristianAlt, name: 'Arte cristiano primitivo (alt.)', tags: ['early-christian', 'art'], source: 'asset' },
  angelDeLaGuarda: { ...PUBLIC('/gallery-images/misterios/gloria/angel-de-la-guarda.jpg'), name: 'Ángel de la Guarda', tags: ['angel', 'guardian', 'optional'] },
  byzantineArt: { path: byzantineArt, name: 'Arte bizantino', tags: ['byzantine', 'icon', 'art'], source: 'asset' },
  stainedGlass: { path: stainedGlass, name: 'Vitral genérico', tags: ['stained-glass', 'generic'], source: 'asset' },
  encountersCathedral: { path: encountersCathedral, name: 'Catedral — encuentro', tags: ['cathedral', 'interior'], source: 'asset' },
  cover: { path: cover, name: 'Portada', tags: ['cover', 'generic'], source: 'asset' },
  sain: { path: sain, name: 'Imagen sagrada (sain)', tags: ['sacred', 'generic'], source: 'asset' },

  // ── Public gallery-images (not bundled) ──
  galleryCathedralPraying: { ...PUBLIC('/gallery-images/cathedral praing.jpg'), name: 'Catedral — orando', tags: ['cathedral', 'prayer'] },
  galleryLatinCredo: { ...PUBLIC('/gallery-images/latin-credo.jpeg'), name: 'Credo (latín)', tags: ['latin', 'creed', 'prayer', 'text-heavy', 'manuscript'] },
  galleryLicensedImage: { ...PUBLIC('/gallery-images/licensed-image.jpg'), name: 'Imagen con licencia', tags: ['generic', 'unknown'] },
  gallerySagradoCorazon: { ...PUBLIC('/gallery-images/misterios/modooscuro/sagrado-corazon.jpg'), name: 'Sagrado Corazón de Jesús', tags: ['sacred-heart', 'eucharist', 'adoracion'] },
  gallerySagradoCorazon2: { ...PUBLIC('/gallery-images/misterios/modooscuro/sagrado-corazon-2.jpg'), name: 'Sagrado Corazón (alt.)', tags: ['sacred-heart', 'adoracion'] },
  gallerySagradoCorazonEm: { ...PUBLIC('/gallery-images/misterios/modooscuro/sagrado-corazon-esus-maria.jpg'), name: 'Sagrado Corazón — Jesús y María', tags: ['sacred-heart', 'mary'] },
  galleryAdoracion6051780745909814: { ...PUBLIC('/gallery-images/adoracion/6051780745909814.jpg'), name: 'Adoración — 6051780745909814', tags: ['adoracion', 'eucharist'] },
  galleryAdoracionAnteTuPresencia: { ...PUBLIC('/gallery-images/adoracion/Ante tu presencia.jpg'), name: 'Adoración — Ante tu presencia', tags: ['adoracion', 'eucharist'] },
  galleryAdoracionCandlelightSilence: { ...PUBLIC('/gallery-images/adoracion/Candlelight and Silence_ A Story from Adoration.jpg'), name: 'Adoración — Candlelight and Silence', tags: ['adoracion', 'eucharist'] },
  galleryPastor: { ...PUBLIC('/gallery-images/misterios/modooscuro/pastor.jpg'), name: 'Cristo Buen Pastor', tags: ['good-shepherd', 'christ'] },
  galleryMargaritaSacredHeart: { ...PUBLIC('/gallery-images/litany/modooscuro/SANTA MARGARITA MARIA DE ALACOQUE FRENTE AL SAGRADO CORAZON DE JESUS !!!.jpg'), name: 'Santa Margarita María — Sagrado Corazón', tags: ['sacred-heart', 'margarita-maria'] },
  galleryStMichael: { ...PUBLIC('/gallery-images/litany/modooscuro/Stained glass of St_ Michael the Archangel.jpg'), name: 'San Miguel Arcángel — vitral', tags: ['michael', 'archangel', 'stained-glass'] },
  gallerySanExpedito: { ...PUBLIC('/gallery-images/litany/modooscuro/san-expedito.jpg'), name: 'San Expedito — HODIE (Wellcome)', tags: ['expeditus', 'saint', 'hodie', 'martyr'] },
  galleryCruzVsRoma: { ...PUBLIC('/gallery-images/misterios/modooscuro/cruz-vs-roma.jpg'), name: 'Triunfo de la Cruz sobre Roma', tags: ['cross', 'rome', 'expeditus', 'bg'] },
  galleryMaterImmaculata: { ...PUBLIC('/gallery-images/litany/modooscuro/Mater immaculata.jpg'), name: 'Mater Immaculata', tags: ['mary', 'immaculate', 'stained-glass'] },
  galleryVirgoImmaculata: { ...PUBLIC('/gallery-images/litany/modooscuro/virgo-inmaculata.jpg'), name: 'Virgo Immaculata', tags: ['mary', 'immaculate'] },
  galleryPentecost: { ...PUBLIC('/gallery-images/misterios/modooscuro/misteriogloria3.webp'), name: 'Pentecostés — Espíritu Santo', tags: ['holy-spirit', 'pentecost'] },

  // ── Fresh batch (Mary / angel / contemplative) — Liber uniqueness ──
  maryCarmen: { path: maryCarmen, name: 'Virgen — dolores / Carmen', tags: ['mary', 'carmen', 'sorrows', 'optional'], source: 'asset' },
  mary01: { path: mary01, name: 'María — 01', tags: ['mary'], source: 'asset' },
  mary02: { path: mary02, name: 'María — 02', tags: ['mary'], source: 'asset' },
  mary03: { path: mary03, name: 'María — 03', tags: ['mary'], source: 'asset' },
  mary04: { path: mary04, name: 'María — 04', tags: ['mary'], source: 'asset' },
  mary05: { path: mary05, name: 'María — 05', tags: ['mary'], source: 'asset' },
  mary06: { path: mary06, name: 'María — 06', tags: ['mary'], source: 'asset' },
  angAnnunciationArt: { path: angAnnunciation, name: 'Anunciación — arte', tags: ['mary', 'angel', 'annunciation', 'angelus'], source: 'asset' },
  monk01: { path: monk01, name: 'Monje contemplativo', tags: ['monk', 'contemplative'], source: 'asset' },
  monkDark: { path: monkDark, name: 'Monje — modo oscuro', tags: ['monk', 'contemplative', 'dark'], source: 'asset' },
  nun01: { path: nun01, name: 'Monja — 01', tags: ['nun', 'contemplative'], source: 'asset' },
  nun02: { path: nun02, name: 'Monja — 02', tags: ['nun', 'contemplative'], source: 'asset' },
  nun03: { path: nun03, name: 'Monja — 03', tags: ['nun', 'contemplative'], source: 'asset' },
  nun04: { path: nun04, name: 'Monja — 04', tags: ['nun', 'contemplative'], source: 'asset' },
  nun05: { path: nun05, name: 'Monja — 05', tags: ['nun', 'contemplative'], source: 'asset' },
  rosaryBeads: { path: rosaryBeads, name: 'Rosario — cuentas', tags: ['rosary', 'beads'], source: 'asset' },
  artSacredHot: { path: artSacredHot, name: 'Arte sacro', tags: ['sacred', 'art'], source: 'asset' },

  // ── Unidentified / to be named via Asset Studio ──
  misc96PsRGiE: { path: misc96PsRGiE, name: 'Altar — tabernáculo y adoración', tags: ['eucharist', 'adoration', 'altar', 'tabernacle', 'custodia', 'exposition'], source: 'asset' },
  miscUgQlLjwl: { path: miscUgQlLjwl, name: 'Por nombrar (uGQlLjwl)', tags: ['unidentified'], source: 'asset' },
  miscJpg: { path: jpgMisc, name: 'Por nombrar (jpg.jpg)', tags: ['unidentified'], source: 'asset' },
};

const STORAGE_KEY = 'rosario_image_registry_overrides';

/** Load user overrides (name/tag edits made in the Asset Studio). */
function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/** Merge runtime overrides + uploaded library over the base registry. */
function withOverrides() {
  const overrides = loadOverrides();
  const library = loadImageLibrary();
  const merged = {};
  for (const id of Object.keys(REGISTRY)) {
    merged[id] = { ...REGISTRY[id], ...(overrides[id] || {}), id };
  }
  for (const id of Object.keys(library)) {
    const base = library[id];
    if (!base?.path) continue;
    merged[id] = {
      ...base,
      ...(overrides[id] || {}),
      id,
      path: (overrides[id] && overrides[id].path) || base.path,
      source: base.source || 'upload',
      tags: (overrides[id] && overrides[id].tags) || base.tags || [],
      name: (overrides[id] && overrides[id].name) || base.name || id,
    };
  }
  return merged;
}

/** Get a single image entry by id (with overrides applied). */
export function getImage(id) {
  const entry = withOverrides()[id];
  return entry ? entry : null;
}

/** Get just the resolved path (safe to use directly in <img src> / CSS). */
export function imagePath(id) {
  return getImage(id)?.path || null;
}

/** List all entries (with overrides). */
export function listImages() {
  return Object.values(withOverrides());
}

/** Filter by tag. */
export function imagesByTag(tag) {
  return listImages().filter((e) => e.tags.includes(tag));
}

const TEXT_HEAVY_PATH_RE =
  /Prayer-text-handwritten|latin-(ave-maria|gloria|pater-noster|angelus|credo)|avemarialat|regina[\s_-]?caeli/i;

/** Handwritten / text-plate art — must not sit under Liber prayer text. */
export function isTextHeavyImageEntry(entry) {
  if (!entry) return false;
  const tags = entry.tags || [];
  if (tags.includes('text-heavy') || tags.includes('manuscript')) return true;
  return TEXT_HEAVY_PATH_RE.test(String(entry.path || ''));
}

export function isTextHeavyImageId(id) {
  return isTextHeavyImageEntry(getImage(id));
}

export function isTextHeavyImagePath(path) {
  if (!path || typeof path !== 'string') return false;
  if (TEXT_HEAVY_PATH_RE.test(path)) return true;
  return listImages().some((e) => e.path === path && isTextHeavyImageEntry(e));
}

/** Persist a name/tags edit for an id (Asset Studio uses this). */
export function saveOverride(id, { name, tags }) {
  const overrides = loadOverrides();
  overrides[id] = { ...(overrides[id] || {}) };
  if (name !== undefined) overrides[id].name = name;
  if (tags !== undefined) overrides[id].tags = tags;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    touchLocalArtConfig();
  } catch (_) { /* ignore quota errors */ }
}

/** Clear a single override (revert to source-of-truth name/tags). */
export function clearOverride(id) {
  const overrides = loadOverrides();
  delete overrides[id];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    touchLocalArtConfig();
  } catch (_) { /* ignore */ }
}

/**
 * Pick an image for a given tag, rotating by a seed so a sequence (e.g. the
 * 9 novena days) gets distinct images instead of repeating the same one.
 * Falls back gracefully if the tag pool is smaller than the index.
 */
export function pickByTag(tag, seedIndex = 0) {
  const pool = imagesByTag(tag);
  if (pool.length === 0) return null;
  return pool[seedIndex % pool.length];
}

// Convenience namespace for direct imports: import { IMG } from '../data/imageRegistry';
export const IMG = Object.fromEntries(
  Object.keys(REGISTRY).map((id) => [id, REGISTRY[id].path])
);
