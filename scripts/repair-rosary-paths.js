/**
 * Repair the image-path drift left by commit d7317ca ("some work", 2026-07-14),
 * which reorganised public/gallery-images into litografia/ modoclaro/ gloria/
 * img-texto-rezos/ subfolders without updating the data that points into them.
 *
 * Every replacement below was verified to exist on disk before being applied.
 * Idempotent.
 */
const fs = require('fs');

const FILE = 'src/data/RosarioPrayerBook.js';

/** [declared, real, why] */
const REPAIRS = [
  // Acto de Contrición light plate
  ['/gallery-images/misterios/contricion.jpg',
    '/gallery-images/misterios/modooscuro/contricion.jpg', 'contricion light -> modooscuro'],

  // Latin plates moved to img-texto-rezos/ (all four are text-heavy and are
  // scrubbed at runtime anyway, but the path should still be honest)
  ['/gallery-images/latin-credo.jpeg',
    '/gallery-images/img-texto-rezos/latin-credo.jpeg', 'latin credo -> img-texto-rezos'],
  ['/gallery-images/latin-pater-noster.jpg',
    '/gallery-images/img-texto-rezos/latin-pater-noster.jpg', 'latin pater noster -> img-texto-rezos'],
  ['/gallery-images/latin-ave-maria.jpg',
    '/gallery-images/img-texto-rezos/latin-ave-maria.jpg', 'latin ave maria -> img-texto-rezos'],
  ['/gallery-images/latin-gloria.jpg',
    '/gallery-images/img-texto-rezos/latin-gloria.jpg', 'latin gloria -> img-texto-rezos'],

  // ezekielv (Oración por el Papa) moved with the litografia batch
  ['/gallery-images/misterios/ezekielv.jpg',
    '/gallery-images/misterios/litografia/ezekielv.jpg', 'ezekielv -> litografia'],
];

/** Fold-pattern repairs: /misterios/misterioXX.jpg -> /misterios/litografia/misterioXX.jpg */
const FOLD = [
  ['misteriogozo', 1, 5],
  ['misteriodolor', 1, 5],
  ['misteriogloria', 1, 5],
  ['misterioLUZ', 1, 5],
];
for (const [stem, lo, hi] of FOLD) {
  for (let n = lo; n <= hi; n += 1) {
    REPAIRS.push([
      `/gallery-images/misterios/${stem}${n}.jpg`,
      `/gallery-images/misterios/litografia/${stem}${n}.jpg`,
      `${stem}${n} -> litografia`,
    ]);
  }
}

// ML1's imgmo was missing the `misterios/` path segment entirely.
REPAIRS.push([
  '/gallery-images/modooscuro/misterioLUZ1.webp',
  '/gallery-images/misterios/modooscuro/misterioLUZ1.webp',
  'ML1 imgmo: missing the misterios/ segment',
]);
// ...and its `img` was the stale flat path, already covered by the FOLD block,
// but the first entry was modooscuro/jpg which does not exist at all.
REPAIRS.push([
  '/gallery-images/misterios/modooscuro/misterioLUZ1.jpg',
  '/gallery-images/misterios/litografia/misterioLUZ1.jpg',
  'ML1 img: no such modooscuro jpg; the litografia plate is the real one',
]);

let src = fs.readFileSync(FILE, 'utf8');
let applied = 0;
for (const [from, to, why] of REPAIRS) {
  if (!src.includes(from)) continue;
  src = src.split(from).join(to);
  applied += 1;
  console.log(`  fixed  ${why}`);
}
fs.writeFileSync(FILE, src, 'utf8');
console.log(`\n[rosary-paths] applied ${applied} of ${REPAIRS.length} candidates`);
