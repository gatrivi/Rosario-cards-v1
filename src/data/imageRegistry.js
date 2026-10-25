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
import earlyChristianAlt from './assets/img/cristo-alfa-omega-catacumbas.jpg';
import sain from './assets/img/santa-gemma-galgani.jpg';
import jpgMisc from './assets/img/resurreccion-anastasis-evangelistas.jpg';
import misc96PsRGiE from './assets/img/altar-mayor-barroco-crucifijo.jpg';
import miscUgQlLjwl from './assets/img/veni-creator-spiritus.jpg';
import faustinaDivinoCorazon from './assets/img/santafaustinadivinocorazon.jpg';
import faustinaStainedGlass from './assets/img/santafaustinastainedglass.jpg';
import maryCarmen from './assets/img/mary/lady-of-sorrows.jpg';
import mary01 from './assets/img/mary/virgen-de-lourdes-bernadette.jpg';
import mary02 from './assets/img/mary/virgen-de-las-rosas-nino-jesus.jpg';
import mary03 from './assets/img/mary/bouguereau-reina-de-los-angeles.jpg';
import mary04 from './assets/img/mary/presentacion-virgen-maria-templo.jpg';
import mary05 from './assets/img/mary/virgen-con-nino-y-angeles-flores.jpg';
import mary06 from './assets/img/mary/oracion-rosario-virgen-guadalupe.jpg';
import angAnnunciation from './assets/img/ANG/angel-de-la-guarda-protector.jpg';
import angelusMillet from './assets/img/Arte-Sacro/angelus-millet-oracion.jpg';
import carmenStatue from './assets/img/Arte-Sacro/ave/virgen-del-carmen-escapulario-estatua.jpg';
import monk01 from './assets/img/monk/caballeros-templarios-cruzados.jpg';
import monkDark from './assets/img/monk/modooscuro/monje-franciscano-meditacion.jpg';
import nun01 from './assets/img/nuns/escultura-dama-orante-velo-encaje.jpg';
import nun02 from './assets/img/nuns/santa-teresa-de-avila-doctora.jpg';
import nun03 from './assets/img/nuns/santa-teresita-lecho-crucifijo.png';
import nun04 from './assets/img/nuns/dama-oracion-altar-iglesia.png';
import nun05 from './assets/img/nuns/mujeres-rezando-santo-rosario.jpg';
import rosaryBeads from './assets/img/rosary/sagrado-corazon-ten-piedad-de-mi.jpg';
import artSacredHot from './assets/img/capilla-gotica-vitrales-crucifijo.jpg';
import { touchLocalArtConfig } from '../utils/artConfigSync';
import { loadImageLibrary, IMAGE_LIBRARY_CHANGED_EVENT } from '../utils/imageLibraryStore';
import { ART_CONFIG_CHANGED_EVENT } from '../utils/artConfigSync';
import { CATALOG as IMAGE_CATALOG_ENTRIES } from './imageLibraryCatalog';

const CATALOG = IMAGE_CATALOG_ENTRIES || {};

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
  earlyChristianAlt: { path: earlyChristianAlt, name: 'Cristo Pantocrátor — Alfa y Omega (Catacumbas)', tags: ['early-christian', 'christ', 'pantocrator', 'art'], source: 'asset' },
  angelDeLaGuarda: { ...PUBLIC('/gallery-images/misterios/gloria/angel-de-la-guarda.jpg'), name: 'Ángel de la Guarda', tags: ['angel', 'guardian', 'optional'] },
  byzantineArt: { path: byzantineArt, name: 'Arte bizantino', tags: ['byzantine', 'icon', 'art'], source: 'asset' },
  stainedGlass: { path: stainedGlass, name: 'Vitral genérico', tags: ['stained-glass', 'generic'], source: 'asset' },
  encountersCathedral: { path: encountersCathedral, name: 'Catedral — encuentro', tags: ['cathedral', 'interior'], source: 'asset' },
  cover: { path: cover, name: 'Portada', tags: ['cover', 'generic'], source: 'asset' },
  sain: { path: sain, name: 'Imagen sagrada (sain)', tags: ['sacred', 'generic'], source: 'asset' },

  // ── Public gallery-images (not bundled) ──
  galleryCathedralPraying: { ...PUBLIC('/gallery-images/cathedral praing.jpg'), name: 'Catedral — orando', tags: ['cathedral', 'prayer'] },
  galleryLatinCredo: { ...PUBLIC('/gallery-images/img-texto-rezos/latin-credo.jpeg'), name: 'Credo (latín)', tags: ['latin', 'creed', 'prayer', 'text-heavy', 'manuscript'] },
  galleryLicensedImage: { ...PUBLIC('/gallery-images/licensed-image.jpg'), name: 'Imagen con licencia', tags: ['generic', 'unknown'] },
  gallerySagradoCorazon: { ...PUBLIC('/gallery-images/misterios/modooscuro/sagrado-corazon.jpg'), name: 'Sagrado Corazón de Jesús', tags: ['sacred-heart', 'eucharist', 'adoracion'] },
  gallerySagradoCorazon2: { ...PUBLIC('/gallery-images/misterios/modooscuro/sagrado-corazon-2.jpg'), name: 'Sagrado Corazón (alt.)', tags: ['sacred-heart', 'adoracion'] },
  gallerySagradoCorazonEm: { ...PUBLIC('/gallery-images/misterios/modooscuro/sagrado-corazon-esus-maria.jpg'), name: 'Sagrado Corazón — Jesús y María', tags: ['sacred-heart', 'mary'] },
  galleryAdoracion6051780745909814: { ...PUBLIC('/gallery-images/adoracion/elevacion-santismo-sacramento-misa.jpg'), name: 'Elevación del Santísimo Sacramento — Santa Misa', tags: ['adoracion', 'eucharist', 'mass', 'angels'] },
  galleryAdoracionAnteTuPresencia: { ...PUBLIC('/gallery-images/adoracion/Ante tu presencia.jpg'), name: 'Adoración — Ante tu presencia', tags: ['adoracion', 'eucharist'] },
  galleryAdoracionCandlelightSilence: { ...PUBLIC('/gallery-images/adoracion/Candlelight and Silence_ A Story from Adoration.jpg'), name: 'Adoración — Candlelight and Silence', tags: ['adoracion', 'eucharist'] },
  galleryPastor: { ...PUBLIC('/gallery-images/misterios/modooscuro/pastor.jpg'), name: 'Cristo Buen Pastor', tags: ['good-shepherd', 'christ'] },
  galleryMargaritaSacredHeart: { ...PUBLIC('/gallery-images/litany/modooscuro/SANTA MARGARITA MARÍA DE ALACOQUE FRENTE AL SAGRADO CORAZÓN DE JESÚS !!!.jpg'), name: 'Santa Margarita María — Sagrado Corazón', tags: ['sacred-heart', 'margarita-maria'] },
  galleryStMichael: { ...PUBLIC('/gallery-images/litany/modooscuro/Stained glass of St_ Michael the Archangel.jpg'), name: 'San Miguel Arcángel — vitral', tags: ['michael', 'archangel', 'stained-glass'] },
  gallerySanExpedito: { ...PUBLIC('/gallery-images/litany/modooscuro/san-expedito.jpg'), name: 'San Expedito — HODIE (Wellcome)', tags: ['expeditus', 'saint', 'hodie', 'martyr'] },
  galleryCruzVsRoma: { ...PUBLIC('/gallery-images/misterios/modooscuro/cruz-vs-roma.jpg'), name: 'Triunfo de la Cruz sobre Roma', tags: ['cross', 'rome', 'expeditus', 'bg'] },
  galleryMaterImmaculata: { ...PUBLIC('/gallery-images/litany/modooscuro/Mater immaculata.jpg'), name: 'Mater Immaculata', tags: ['mary', 'immaculate', 'stained-glass'] },
  galleryVirgoImmaculata: { ...PUBLIC('/gallery-images/litany/modooscuro/virgo-inmaculata.jpg'), name: 'Virgo Immaculata', tags: ['mary', 'immaculate'] },
  galleryPentecost: { ...PUBLIC('/gallery-images/misterios/modooscuro/misteriogloria3.webp'), name: 'Pentecostés — Espíritu Santo', tags: ['holy-spirit', 'pentecost'] },

  // ── Fresh batch (Mary / angel / contemplative) — Liber uniqueness ──
  maryCarmen: { path: maryCarmen, name: 'Virgen — dolores / Carmen', tags: ['mary', 'carmen', 'sorrows', 'optional'], source: 'asset' },
  mary01: { path: mary01, name: 'Virgen de Lourdes y Santa Bernardita', tags: ['mary', 'lourdes', 'rosary', 'grotto'], source: 'asset' },
  mary02: { path: mary02, name: 'Virgen de las Rosas con el Niño Jesús', tags: ['mary', 'rosary', 'child', 'roses'], source: 'asset' },
  mary03: { path: mary03, name: 'Reina de los Ángeles — Bouguereau', tags: ['mary', 'angels', 'coronation', 'bouguereau'], source: 'asset' },
  mary04: { path: mary04, name: 'Presentación de la Virgen Niña en el Templo', tags: ['mary', 'temple', 'presentation'], source: 'asset' },
  mary05: { path: mary05, name: 'Virgen con el Niño y Ángeles de las Flores', tags: ['mary', 'child', 'angels', 'flowers'], source: 'asset' },
  mary06: { path: mary06, name: 'Oración del Santo Rosario ante la Virgen de Guadalupe', tags: ['mary', 'guadalupe', 'rosary', 'prayer'], source: 'asset' },
  // Id kept for saved overrides; the file is an "Ange Gardien" holy card, not an Annunciation.
  angAnnunciationArt: { path: angAnnunciation, name: 'Ángel de la Guarda — estampa', tags: ['angel', 'guardian-angel'], source: 'asset' },

  // ── Devotion shelf faces — stained glass / chiaroscuro, one per devotion ──
  angelusMillet: { path: angelusMillet, name: 'El Ángelus — Millet', tags: ['angelus', 'prayer', 'chiaroscuro'], source: 'asset' },
  carmenStatue: { path: carmenStatue, name: 'Virgen del Carmen — imagen', tags: ['mary', 'carmen', 'chiaroscuro'], source: 'asset' },
  vitralAgnusDei: { ...PUBLIC('/gallery-images/litany/modooscuro/agnus-dei-miserere-nobis.jpg'), name: 'Ecce Agnus Dei — vitral', tags: ['lamb', 'agnus-dei', 'precious-blood', 'stained-glass'] },
  vitralCaliz: { ...PUBLIC('/gallery-images/litany/modooscuro/vaso.jpg'), name: 'Cáliz, trigo y uvas — vitral', tags: ['eucharist', 'chalice', 'precious-blood', 'stained-glass'] },
  vitralSagradoCorazon: { ...PUBLIC('/gallery-images/litany/modooscuro/sagrado-corazon.jpg'), name: 'Sagrado Corazón — vitral', tags: ['sacred-heart', 'christ', 'stained-glass'] },
  vitralMilagrosa: { ...PUBLIC("/gallery-images/litany/modooscuro/St Mary the Virgin Henley 1 St John's vision of an….jpg"), name: 'Inmaculada sobre la serpiente — vitral (Henley)', tags: ['mary', 'immaculate', 'miraculous-medal', 'stained-glass'] },
  vitralEspirituSanto: { ...PUBLIC('/gallery-images/litany/modooscuro/espiritu santo.jpg'), name: 'Espíritu Santo — vitral (Bernini)', tags: ['holy-spirit', 'dove', 'stained-glass'] },
  vitralVisitacion: { ...PUBLIC('/gallery-images/litany/modooscuro/Mater boni consilii.jpg'), name: 'La Visitación — vitral', tags: ['mary', 'visitation', 'magnificat', 'stained-glass'] },
  maryPrayingSassoferrato: { ...PUBLIC('/gallery-images/misterios/modooscuro/ave-maria.jpg'), name: 'Virgen orante — Sassoferrato', tags: ['mary', 'praying', 'chiaroscuro'] },
  monk01: { path: monk01, name: 'Caballeros Templarios — Cruzados', tags: ['cross', 'knights', 'templar'], source: 'asset' },
  monkDark: { path: monkDark, name: 'Monje franciscano en meditación', tags: ['monk', 'contemplative', 'franciscan', 'dark'], source: 'asset' },
  nun01: { path: nun01, name: 'Dama orante con velo de encaje (escultura)', tags: ['prayer', 'contemplative', 'sculpture'], source: 'asset' },
  nun02: { path: nun02, name: 'Santa Teresa de Ávila — Doctora de la Iglesia', tags: ['saint', 'teresa-avila', 'doctor', 'holy-spirit'], source: 'asset' },
  nun03: { path: nun03, name: 'Santa Teresita de Lisieux en el lecho con crucifijo', tags: ['saint', 'carmel', 'teresa', 'crucifix'], source: 'asset' },
  nun04: { path: nun04, name: 'Dama en oración ante el altar', tags: ['prayer', 'altar', 'church', 'contemplative'], source: 'asset' },
  nun05: { path: nun05, name: 'Devotas rezando el Santo Rosario en la iglesia', tags: ['prayer', 'rosary', 'church', 'mantilla'], source: 'asset' },
  rosaryBeads: { path: rosaryBeads, name: 'Sagrado Corazón de Jesús — Ten piedad de mí', tags: ['sacred-heart', 'rosary', 'mercy', 'piedad'], source: 'asset' },
  artSacredHot: { path: artSacredHot, name: 'Capilla gótica con vitrales y crucifijo', tags: ['chapel', 'stained-glass', 'crucifix'], source: 'asset' },

  // ── Unidentified / to be named via Asset Studio ──
  misc96PsRGiE: { path: misc96PsRGiE, name: 'Altar mayor barroco con crucifijo y sagrario', tags: ['eucharist', 'altar', 'crucifix', 'tabernacle'], source: 'asset' },
  miscUgQlLjwl: { path: miscUgQlLjwl, name: 'Veni Creator Spiritus — Espíritu Santo', tags: ['holy-spirit', 'dove', 'pentecost', 'prayer', 'manuscript'], source: 'asset' },
  miscJpg: { path: jpgMisc, name: 'Resurrección de Cristo (Anastasis) con los Evangelistas', tags: ['resurrection', 'christ', 'evangelists', 'orthodox', 'glorious-mystery'], source: 'asset' },
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

/** Merge runtime overrides + uploaded library over the base registry + catalog. */
function computeMerged() {
  const overrides = loadOverrides();
  const library = loadImageLibrary();
  const merged = {};
  for (const id of Object.keys(REGISTRY)) {
    merged[id] = { ...REGISTRY[id], ...(overrides[id] || {}), id };
  }
  // Shipped bulk catalog — the floor every device starts from. Owner edits sit
  // on top via `overrides`, so a rename or re-tag is never clobbered by a
  // rebuild of the catalog.
  for (const id of Object.keys(CATALOG)) {
    const base = CATALOG[id];
    const over = overrides[id];
    merged[id] = {
      ...base,
      ...(over || {}),
      id,
      path: (over && over.path) || base.path,
      source: base.source || 'public',
      tags: (over && over.tags) || base.tags || [],
      name: (over && over.name) || base.name || id,
    };
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

/**
 * `withOverrides()` used to run on every `getImage()` and every
 * `listImages()`, and `isTextHeavyImagePath` — called once per candidate push by
 * `getPrayerImageCandidates` — goes through it. That meant two
 * `JSON.parse(localStorage)` calls plus a full object rebuild per candidate, so
 * the ~217-candidate Ave María chain paid that on every step change. With the
 * bulk catalog in the merge it would be several times worse.
 *
 * So the merge is cached and invalidated by the two events that can change it.
 */
let mergedCache = null;
let textHeavyCache = null;

function invalidateCaches() {
  mergedCache = null;
  textHeavyCache = null;
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener(ART_CONFIG_CHANGED_EVENT, invalidateCaches);
  window.addEventListener(IMAGE_LIBRARY_CHANGED_EVENT, invalidateCaches);
}

function withOverrides() {
  if (!mergedCache) mergedCache = computeMerged();
  return mergedCache;
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
  return listImages().filter((e) => (e.tags || []).includes(tag));
}

/** Filter by several tags, keeping the given order (a preference, not a union). */
export function imagesByTags(tags) {
  if (!tags?.length) return listImages();
  const wanted = new Set(tags);
  return listImages().filter((e) => (e.tags || []).some((t) => wanted.has(t)));
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
  // Set lookup, not a scan — this runs once per candidate push.
  if (!textHeavyCache) {
    textHeavyCache = new Set(
      listImages().filter(isTextHeavyImageEntry).map((e) => e.path)
    );
  }
  return textHeavyCache.has(path);
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

/**
 * Ordered candidate paths for a set of tags, best-match first, with the owner's
 * rejects removed. This is the selection primitive a repeated prayer needs: the
 * Ave María gets 217 Mary images to walk, `MP` gets 41 Passion ones.
 *
 * `tags` is a *preference order* — 'mary' before 'immaculate' puts an Annunciation
 * ahead of a Madonna — and extra themes ride alongside the liturgical categories,
 * so callers can ask for the coarse set or a precise one.
 *
 * Cached on the reject list because `getPrayerImageCandidates` runs on every step
 * change and this is O(n) over the merged registry.
 */
let poolCache = { key: null, byTags: new Map() };

/**
 * Within one tag rank, stained glass and chiaroscuro come first — the owner's
 * preferred look. `style` comes from the visual review baked into the catalog;
 * entries without one rank after them, never dropped.
 */
const PREFERRED_STYLE_RANK = { 'stained-glass': 0, chiaroscuro: 0 };
const styleRank = (e) => PREFERRED_STYLE_RANK[e.style] ?? 1;

export function imagePathsByTags(tags, { excludeIds = [] } = {}) {
  const key = `${(excludeIds || []).join(' ')} ${(tags || []).join(' ')}`;
  const hit = poolCache.byTags.get(key);
  if (hit) return hit;

  const skip = new Set(excludeIds || []);
  const order = new Map((tags || []).map((t, i) => [t, i]));
  const pool = listImages()
    .filter((e) => e.path && !skip.has(e.id) && !isTextHeavyImageEntry(e))
    .filter((e) => (e.tags || []).some((t) => order.has(t)))
    .sort((a, b) => {
      const at = Math.min(...(a.tags || []).map((t) => (order.has(t) ? order.get(t) : 99)));
      const bt = Math.min(...(b.tags || []).map((t) => (order.has(t) ? order.get(t) : 99)));
      return at - bt || styleRank(a) - styleRank(b);
    })
    .map((e) => e.path);

  if (poolCache.key !== excludeIds.join(' ')) {
    poolCache = { key: excludeIds.join(' '), byTags: new Map() };
  }
  poolCache.byTags.set(key, pool);
  return pool;
}

// Convenience namespace for direct imports: import { IMG } from '../data/imageRegistry';
export const IMG = Object.fromEntries(
  Object.keys(REGISTRY).map((id) => [id, REGISTRY[id].path])
);
