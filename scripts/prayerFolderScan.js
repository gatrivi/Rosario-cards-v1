/**
 * Shared scanner for the drop-in prayer image folders: public/prayers/<PRAYER_ID>/.
 * Used by scripts/build-prayer-image-manifest.js (plain node) and by Jest tests.
 *
 * Folder conventions:
 *   public/prayers/A/rosa.jpg         → base image for prayer "A" (alphabetically
 *                                       first base file is the pinned pick)
 *   public/prayers/A/03-dolorosa.jpg  → pins verse 3 (1-based) of per-verse prayer "A"
 *
 * Copy images in from anywhere (Explorer, downloads); do NOT move files out of
 * src/data/assets or public/gallery-images — existing prayers reference them.
 */
const fs = require('fs');
const path = require('path');

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
const VERSE_PREFIX = /^(\d{1,2})[-_. ]+/;
const IGNORED_FILES = /^(thumbs\.db|desktop\.ini)$/i;

function toUrl(...parts) {
  const raw = `/${parts.join('/')}`;
  return encodeURI(raw).replace(/#/g, '%23').replace(/\?/g, '%3F');
}

/**
 * Scan rootDir for <PRAYER_ID>/ folders.
 * Returns { [prayerId]: { base: [url, ...], verses: { [n]: url } } } —
 * verses keyed by 1-based verse number. Empty object when the folder is absent.
 */
function scanPrayerFolders(rootDir) {
  const out = {};
  let dirs = [];
  try {
    dirs = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch (_) {
    return out;
  }
  for (const dir of dirs) {
    if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
    let files = [];
    try {
      files = fs.readdirSync(path.join(rootDir, dir.name));
    } catch (_) {
      continue;
    }
    const entry = { base: [], verses: {} };
    for (const file of files.sort()) {
      if (file.startsWith('.') || IGNORED_FILES.test(file) || !IMAGE_EXT.test(file)) continue;
      const url = toUrl('prayers', dir.name, file);
      const verseMatch = file.match(VERSE_PREFIX);
      const verseNum = verseMatch ? parseInt(verseMatch[1], 10) : 0;
      if (verseNum >= 1 && entry.verses[verseNum] === undefined) {
        entry.verses[verseNum] = url;
      } else if (!entry.base.includes(url)) {
        entry.base.push(url);
      }
    }
    if (entry.base.length > 0 || Object.keys(entry.verses).length > 0) {
      out[dir.name] = entry;
    }
  }
  return out;
}

module.exports = { scanPrayerFolders, IMAGE_EXT, VERSE_PREFIX };
