/**
 * The shipped image catalog — `src/data/imageLibraryCatalog.json`, produced by
 * `scripts/build-image-pools.js` from the owner's art folders.
 *
 * It is a **floor**, not a second database. `imageRegistry` merges it under the
 * owner's own edits, which live in `rosario_image_registry_overrides` and sync
 * through Firestore `shared/artConfig` via `artConfigSync`. The real image
 * database is `shared/imageLibrary` (`imageLibraryStore`), which holds uploads
 * and anything added at runtime.
 *
 * Why it exists at all: a repeated prayer had a 1–4 image candidate list and
 * cycled with that period — the Ave María showed the same two or three pictures
 * on all 53 of its repetitions, and `MP` on all 50 of its own. 287 served images
 * (not webpack imports — that would add tens of MB to the bundle) give those
 * prayers something to walk through.
 *
 * Every entry carries at least one of the 12 `LITURGICAL_CATEGORIES`, so the
 * Asset Studio "Clasificar" UI and `hasLiturgicalCategory` work unchanged, plus
 * the finer `theme` as an extra tag for ordering precision.
 */
import catalog from './imageLibraryCatalog.json';

export const CATALOG = catalog?.catalog || {};
export const CATALOG_META = catalog || {};

/** @returns {Array} raw catalog entries */
export function listCatalogImages() {
  return Object.values(CATALOG);
}

/** @returns {Array} catalog entries from one pool ('mary' | 'passion') */
export function listCatalogImagesByPool(pool) {
  return listCatalogImages().filter((e) => e.pool === pool);
}
