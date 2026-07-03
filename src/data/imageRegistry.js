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

import crux from './assets/img/crux.jpg';
import lamb from './assets/img/lamb.jpg';
import vitreauxCruz from './assets/img/vitreaux-cruz.jpg';
import theotokos from './assets/img/Theotokos.jpg';
import earlyChristian from './assets/img/Early-Christian-Art-768x549.jpg';
import byzantineArt from './assets/img/Religious-Byzantine-Art-825x1024.jpg';
import stainedGlass from './assets/img/Stained glass_..jpg';
import cover from './assets/img/cover.jpg';
import avemariaLat from './assets/img/avemarialat.png';
import latinAveMaria from './assets/img/latin-ave-maria.jpg';
import latinGloria from './assets/img/latin-gloria.jpg';
import latinPaterNoster from './assets/img/latin-pater-noster.jpg';
import latinAngelus from './assets/img/latin-angelus.jpg';
import latinSanBenito from './assets/img/latin-san-benito.jpg';
import sanctusBenedictus from './assets/img/sanctus-benedictus.jpg';
import reginaCaeli from './assets/img/regina caeli.jpg';
import stAnthony from './assets/img/st-anthony-of-padua-icon-402.jpg';
import franciscoDeAsis from './assets/img/francisco_de_asis_2.jpg';
import allMary17th from './assets/img/AllMary17thLith.jpeg';
import encountersCathedral from './assets/img/Encounters in the cathedral of Raleigh.jpg';
import earlyChristianAlt from './assets/img/edbd5609aa30b5237d89812de8025c9f--early-christian-christian-art.jpg';
import sain from './assets/img/sain.jpg';
import jpgMisc from './assets/img/jpg.jpg';
import misc96PsRGiE from './assets/img/96PsRGiE.jpg';
import miscUgQlLjwl from './assets/img/uGQlLjwl.jpg';
import faustinaDivinoCorazon from './assets/img/santafaustinadivinocorazon.jpg';
import faustinaStainedGlass from './assets/img/santafaustinastainedglass.jpg';
import { touchLocalArtConfig } from '../utils/artConfigSync';

// Public gallery images (referenced by URL, not imported).
const PUBLIC = (path) => ({ path, source: 'public' });

const REGISTRY = {
  // ── Cross / Passion / Precious Blood themes ──
  crux: { path: crux, name: 'Cruz — relieve', tags: ['cross', 'passion', 'precious-blood', 'lent'], source: 'asset' },
  vitreauxCruz: { path: vitreauxCruz, name: 'Vitral de la Cruz', tags: ['cross', 'stained-glass', 'passion'], source: 'asset' },
  lamb: { path: lamb, name: 'Cordero de Dios', tags: ['lamb', 'agnus-dei', 'eucharist', 'precious-blood'], source: 'asset' },

  // ── Mary / Theotokos ──
  theotokos: { path: theotokos, name: 'Theotokos — Madre de Dios', tags: ['mary', 'theotokos', 'byzantine'], source: 'asset' },
  allMary17th: { path: allMary17th, name: 'Virgen — litografía s. XVII', tags: ['mary', 'lithograph'], source: 'asset' },
  reginaCaeli: { path: reginaCaeli, name: 'Regina Caeli', tags: ['mary', 'regina-caeli', 'prayer'], source: 'asset' },

  // ── Latin prayer texts ──
  latinPaterNoster: { path: latinPaterNoster, name: 'Pater Noster (latín)', tags: ['latin', 'pater-noster', 'prayer'], source: 'asset' },
  latinAveMaria: { path: latinAveMaria, name: 'Ave María (latín)', tags: ['latin', 'ave-maria', 'prayer'], source: 'asset' },
  avemariaLat: { path: avemariaLat, name: 'Ave María — manuscrito', tags: ['latin', 'ave-maria', 'manuscript'], source: 'asset' },
  latinGloria: { path: latinGloria, name: 'Gloria (latín)', tags: ['latin', 'gloria', 'prayer'], source: 'asset' },
  latinAngelus: { path: latinAngelus, name: 'Angelus (latín)', tags: ['latin', 'angelus', 'prayer'], source: 'asset' },

  // ── Saints ──
  sanctusBenedictus: { path: sanctusBenedictus, name: 'San Benito', tags: ['saint', 'benedict', 'latin'], source: 'asset' },
  latinSanBenito: { path: latinSanBenito, name: 'San Benito (latín)', tags: ['saint', 'benedict', 'latin'], source: 'asset' },
  stAnthony: { path: stAnthony, name: 'San Antonio de Padua', tags: ['saint', 'anthony', 'icon'], source: 'asset' },
  franciscoDeAsis: { path: franciscoDeAsis, name: 'San Francisco de Asís', tags: ['saint', 'francis', 'assisi'], source: 'asset' },

  // ── Divine Mercy / Faustina ──
  faustinaDivinoCorazon: { path: faustinaDivinoCorazon, name: 'Santa Faustina — Corazón Divino', tags: ['faustina', 'divine-mercy', 'sacred-heart'], source: 'asset' },
  faustinaStainedGlass: { path: faustinaStainedGlass, name: 'Faustina — vitral', tags: ['faustina', 'divine-mercy', 'stained-glass'], source: 'asset' },

  // ─<arg_value> Early Christian / Byzantine / general sacred art ──
  earlyChristian: { path: earlyChristian, name: 'Arte cristiano primitivo', tags: ['early-christian', 'catacombs', 'art'], source: 'asset' },
  earlyChristianAlt: { path: earlyChristianAlt, name: 'Arte cristiano primitivo (alt.)', tags: ['early-christian', 'art'], source: 'asset' },
  byzantineArt: { path: byzantineArt, name: 'Arte bizantino', tags: ['byzantine', 'icon', 'art'], source: 'asset' },
  stainedGlass: { path: stainedGlass, name: 'Vitral genérico', tags: ['stained-glass', 'generic'], source: 'asset' },
  encountersCathedral: { path: encountersCathedral, name: 'Catedral — encuentro', tags: ['cathedral', 'interior'], source: 'asset' },
  cover: { path: cover, name: 'Portada', tags: ['cover', 'generic'], source: 'asset' },
  sain: { path: sain, name: 'Imagen sagrada (sain)', tags: ['sacred', 'generic'], source: 'asset' },

  // ── Public gallery-images (not bundled) ──
  galleryCathedralPraying: { ...PUBLIC('/gallery-images/cathedral praing.jpg'), name: 'Catedral — orando', tags: ['cathedral', 'prayer'] },
  galleryLatinCredo: { ...PUBLIC('/gallery-images/latin-credo.jpeg'), name: 'Credo (latín)', tags: ['latin', 'creed', 'prayer'] },
  galleryLicensedImage: { ...PUBLIC('/gallery-images/licensed-image.jpg'), name: 'Imagen con licencia', tags: ['generic', 'unknown'] },

  // ── Unidentified / to be named via Asset Studio ──
  misc96PsRGiE: { path: misc96PsRGiE, name: 'Por nombrar (96PsRGiE)', tags: ['unidentified'], source: 'asset' },
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

/** Merge runtime overrides over the base registry. */
function withOverrides() {
  const overrides = loadOverrides();
  const merged = {};
  for (const id of Object.keys(REGISTRY)) {
    merged[id] = { ...REGISTRY[id], ...(overrides[id] || {}), id };
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
