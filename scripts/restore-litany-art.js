/**
 * One-off recovery: the Letanía de Loreto verse art and the verse map were
 * committed together in 44b014a but under two different naming conventions, so
 * 28 declared paths never matched the files on disk. Nothing was ever deleted.
 *
 * 19 of them are pure alias/case/separator drift and are fixed by repointing the
 * data. The other 9 were never copied out of the owner's download dump at
 * `src/data/assets/img/Arte-Sacro/ave/`, so we COPY them (never move — other
 * prayers reference that folder) into the litany folder.
 *
 * Idempotent: re-running is a no-op.
 */
const fs = require('fs');
const path = require('path');

const AVE = path.join('src', 'data', 'assets', 'img', 'Arte-Sacro', 'ave');
const DEST = path.join('public', 'gallery-images', 'litany', 'modooscuro');

/** Ave-folder filename → the litany filename the data expects. */
const COPIES = [
  ['torre-de-david.jpg', 'torre-de-david.jpg'],
  ['torre-de-marfil.jpg', 'torre-marfil.jpg'],
  ['Casa de oro.jpg', 'Casa de oro.jpg'],
  ['Arca de la alianza.jpg', 'Arca de la alianza.jpg'],
  ['Puerta del cielo.jpg', 'Puerta del cielo.jpg'],
  ['estrella-manana.jpg', 'estrella-manana.jpg'],
  ['Salud de los enfermos.jpg', 'Salud de los enfermos.jpg'],
  ['Refugio de los pecadores.jpg', 'Refugio de los pecadores.jpg'],
  ['Consoladora de los afligidos.jpg', 'Consoladora de los afligidos.jpg'],
  ['Saint Casimir of Poland (1483).jpg', 'Saint Casimir of Poland (1483).jpg'],
  ['Reina concebida sin pecado original.jpg', 'reina-concebida.jpg'],
];

let copied = 0;
let skipped = 0;
for (const [from, to] of COPIES) {
  const src = path.join(AVE, from);
  const dst = path.join(DEST, to);
  if (!fs.existsSync(src)) {
    console.log(`  MISSING SOURCE  ${from}`);
    continue;
  }
  if (fs.existsSync(dst)) {
    skipped += 1;
    continue;
  }
  fs.copyFileSync(src, dst);
  copied += 1;
  console.log(`  copied  ${from}  ->  litany/modooscuro/${to}`);
}

console.log(`\n[litany-art] copied ${copied}, already present ${skipped}, of ${COPIES.length}`);
