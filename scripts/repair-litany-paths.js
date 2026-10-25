/**
 * One-off repair: repoint the Letanía de Loreto image paths that never matched
 * the files on disk. See scripts/restore-litany-art.js for the story — 44b014a
 * committed the verse map and the verse art under two naming conventions.
 *
 * Every entry is an EXPLICIT, reviewed decision, not a fuzzy match:
 *  - separator/case drift   (code said `mater-amabilis.jpg`, file is `Mater amabilis.jpg`)
 *  - Latin→Spanish title    (code said `Virgo potens.jpg`, the Spanish title is `Virgen poderosa.jpg`)
 *  - dead light-mode slot   (the dark image exists and is what the app renders)
 *
 * Idempotent.
 */
const fs = require('fs');

const FILE = 'src/data/litanyLauretana.js';

/** [declared path, real path on disk, why] */
const REPAIRS = [
  // --- dead light-mode slots: the dark image the app actually renders exists ---
  ['/gallery-images/litany/01-1-0.JPG', '/gallery-images/litany/modooscuro/cristo-escuchanos.jpg',
    'Cristo, escúchanos — light export never made; use the dark-mode image'],
  ['/gallery-images/litany/01-2-0.JPG', '/gallery-images/litany/modooscuro/santisima-trinidad.jpg',
    'Santísima Trinidad — light export never made; use the dark-mode image'],

  // --- separator drift: same file, different convention ---
  ['/gallery-images/litany/modooscuro/mater-divinae-gratiae.jpg', '/gallery-images/litany/modooscuro/mater-divina-gratiae.jpg',
    'Madre de la divina gracia'],
  ['/gallery-images/litany/modooscuro/mater-semper-virgo.jpg', '/gallery-images/litany/modooscuro/Mater semper virgo.jpg',
    'Madre siempre virgen'],
  ['/gallery-images/litany/modooscuro/mater-immaculata.jpg', '/gallery-images/litany/modooscuro/Mater immaculata.jpg',
    'Madre inmaculada'],
  ['/gallery-images/litany/modooscuro/mater-sine-macula.jpg', '/gallery-images/litany/modooscuro/Mater sine macula.jpg',
    'Madre sin mancilla'],
  ['/gallery-images/litany/modooscuro/mater-amabilis.jpg', '/gallery-images/litany/modooscuro/Mater amabilis.jpg',
    'Madre amable'],
  ['/gallery-images/litany/modooscuro/mater-boni-consilii.jpg', '/gallery-images/litany/modooscuro/Mater boni consilii.jpg',
    'Madre del buen consejo'],
  ['/gallery-images/litany/modooscuro/mater-creatoris.jpg', '/gallery-images/litany/modooscuro/Mater Creatoris.jpg',
    'Madre del Creador'],
  ['/gallery-images/litany/modooscuro/Virgo digna de alabanza.jpg', '/gallery-images/litany/modooscuro/digna-de-alabanza.jpg',
    'Virgen digna de alabanza'],
  ['/gallery-images/litany/reina-santos.JPG', '/gallery-images/litany/modooscuro/reina-santos.jpg',
    'Reina de todos los Santos (light slot pointed outside modooscuro)'],
  ['/gallery-images/litany/modooscuro/reina-rosario.jpg', '/gallery-images/litany/modooscuro/virgen-rosario.jpg',
    'Reina del Santísimo Rosario'],
  ['/gallery-images/litany/modooscuro/reina-santo.jpg', '/gallery-images/litany/modooscuro/reina.jpg',
    'Reina de la familia'],

  // --- Latin invocation → its Spanish title in the same folder ---
  ['/gallery-images/litany/modooscuro/Virgo potens.jpg', '/gallery-images/litany/modooscuro/Virgen poderosa.jpg',
    'Virgen poderosa (Virgo potens)'],
  ['/gallery-images/litany/modooscuro/Virgo clemens.jpg', '/gallery-images/litany/modooscuro/Virgen clemente.jpg',
    'Virgen clemente (Virgo clemens)'],
  ['/gallery-images/litany/modooscuro/Virgo fidelis.jpg', '/gallery-images/litany/modooscuro/Virgen fiel.jpg',
    'Virgen fiel (Virgo fidelis)'],

  // --- mis-wired: a Sacred Heart consecration plate on a Marian title ---
  ['/gallery-images/litany/modooscuro/Oración de consagración al Sagrado Corazón de Jesús, de Santa Margarita María de Alacoque_.jpg',
    '/gallery-images/litany/modooscuro/reina-de-todos.jpg',
    'Reina de todos los Santos — was pointing at an Alacoque Sacred Heart plate; '
    + '"reina-de-todos" ("Queen of All") is the matching image'],
];

let src = fs.readFileSync(FILE, 'utf8');
let applied = 0;
const skipped = [];

for (const [from, to, why] of REPAIRS) {
  if (!src.includes(from)) {
    skipped.push(`${from}  (already repaired or not present)`);
    continue;
  }
  src = src.split(from).join(to);
  applied += 1;
  console.log(`  fixed  ${why}`);
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`\n[litany-paths] applied ${applied} of ${REPAIRS.length}`);
if (skipped.length) {
  console.log('[litany-paths] skipped:');
  skipped.forEach((s) => console.log('  -', s));
}
