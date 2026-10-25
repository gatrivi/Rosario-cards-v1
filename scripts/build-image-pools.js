/**
 * Builds the bulk image pools served out of `public/`.
 *
 * Both pools exist because a repeated prayer had a 1–4 image candidate list and
 * cycled with that period. The Ave María was the worst ("always the same 2–3"),
 * then `MP` — "Por su dolorosa Pasión", 101 occurrences.
 *
 *   Mary     src/data/assets/img/Arte-Sacro/ave/            -> /gallery-images/ave/
 *   Passion  Arte-Sacro/medieval-renaissance + classic-orthodox -> /gallery-images/passion/
 *
 * Output is ONE file, `src/data/imageLibraryCatalog.json`, merged into
 * `imageRegistry` as the floor layer under the owner's own edits (which live in
 * `rosario_image_registry_overrides` and sync through `shared/artConfig`). It is
 * not a second database: the real image database is Firestore
 * `shared/imageLibrary` via `imageLibraryStore`, and this only ships the static
 * part of it so a first-run or offline device is never blank.
 *
 * The images are COPIED, never moved: other prayers reference those folders, and
 * agents.md forbids the move. They are served, not imported — 287 webpack imports
 * would add tens of MB to the JS bundle.
 *
 * TAGS: every entry carries at least one of the 12 LITURGICAL_CATEGORIES so the
 * existing "Clasificar" UI and `hasLiturgicalCategory` work unchanged, plus the
 * finer `theme` as an EXTRA tag for ordering precision. Two taxonomies would have
 * been the mistake here; extra tags ride alongside the categories.
 *
 * `confidence` is kept for Passion only (the owner approved the Mary folder).
 *
 * Wrong-subject files are EXCLUDED rather than down-ranked: an Alacoque Sacred
 * Heart plate sat behind "Reina de todos los Santos" once already, and a
 * Coronation of the Virgin behind a Passion prayer is the same error.
 *
 * Idempotent; prunes orphans. Wired to prestart/prebuild.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ART = path.join('src', 'data', 'assets', 'img', 'Arte-Sacro');
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const CATALOG_OUT = path.join('src', 'data', 'imageLibraryCatalog.json');

/**
 * VISUAL REVIEW: `scripts/image-visual-review.json` records what each image
 * actually shows (style + subjects), from looking at it — a third of the files
 * are named `CwGUNaQY.jpg` or `HIkBoV_XcAAP1J0.jpg`, so filename rules alone
 * let a selfie, Spartan helmets and a map of al-Andalus into the Mary pool.
 * When a file has a review row it wins over the filename rules; files without
 * one fall back to them unchanged.
 */
const VISUAL_REVIEW = path.join('scripts', 'image-visual-review.json');
const VISUAL = (() => {
  try {
    return JSON.parse(fs.readFileSync(VISUAL_REVIEW, 'utf8')).images || {};
  } catch (_) {
    return {};
  }
})();

/** Repo-relative posix NFC — the key shape of VISUAL. */
function reviewKey(p) {
  return p.split(path.sep).join('/').normalize('NFC');
}

/** Styles worth pulling in from outside a pool's own folders. */
const PREFERRED_STYLES = new Set(['stained-glass', 'chiaroscuro']);

const MARIAN_SUBJECTS = new Set([
  'mary', 'annunciation', 'visitation', 'immaculate', 'assumption', 'coronation',
  'pieta', 'dolorosa', 'seven-sorrows', 'sorrowful', 'fatima', 'lourdes', 'guadalupe',
  'carmen', 'perpetual-help', 'theotokos', 'hodegetria', 'immaculate-heart', 'litany',
  'miraculous-medal', 'loreto', 'anne', 'holy-family', 'nativity', 'rosary',
]);

/** Christ's Passion proper — what `MP` and the sorrowful mysteries ask for. */
const PASSION_SUBJECTS = new Set([
  'crucifixion', 'crucifix', 'ecce-homo', 'thorns', 'crowning-thorns', 'cross-bearing',
  'flagellation', 'gethsemane', 'last-supper', 'entombment', 'descent-cross',
  'raising-cross', 'stations', 'calvary', 'judas', 'stripped', 'condemned', 'pilate',
]);

const hasAny = (subjects, set) => (subjects || []).some((s) => set.has(s));

/** First matching [theme, subjects] wins — same precedence as the filename themes. */
function themeFromSubjects(rules, subjects) {
  const have = new Set(subjects || []);
  for (const [theme, wanted] of rules) {
    if (wanted.some((s) => have.has(s))) return theme;
  }
  return null;
}

/** Must match src/data/liturgicalCategories.js. */
const LITURGICAL_CATEGORIES = new Set([
  'passion', 'resurrection', 'mary', 'divine-mercy', 'eucharist', 'holy-spirit',
  'saints', 'prayer-text', 'stained-glass', 'nativity', 'lent', 'generic',
]);

/** Undetermined, raw hashes, placeholders. */
const JUNK = /^-{1,2}[A-Za-z0-9]{6,}$|^\d{6,}AD$|^_{1,3}$|^\?+$|^jpg$|^png$/i;

/**
 * Wrong subject for the pool — excluded, not merely down-ranked.
 *
 * The Mary pool needs none: its source folder is already entirely Mary art. The
 * Passion pool is the one that has to be careful, because the medieval and
 * orthodox folders interleave Mary and saint material with Passion material. An
 * Alacoque Sacred Heart plate sat behind "Reina de todos los Santos" once
 * already, and a Coronation of the Virgin behind a Passion prayer is the same
 * error.
 */
const WRONG_SUBJECT = {
  // Passion pool only: Mary subjects, other saints, and secular subjects.
  passion:
    /coronation\s+of\s+the\s*virgin|corona[ci][oó]n\s+de\s*la\s*virgen|virgen|maria\b|mary\b|madonna|our\s*lady|nuestra\s*se[ñn]ora|annunciation|anunciaci|loreto|regina|reina\b|cicero|archimedes|aquinas|hymnographer|saint\s+michel|st\s+michael|elijah|cassian|cenobitic|ecclesia|monk|nun\b|founder/i,
};

/**
 * Thematic buckets, first match wins. `iconographic` names the themes whose
 * filenames actually state the subject.
 *
 * `category` is the coarse LITURGICAL_CATEGORY; `theme` is the fine bucket and
 * rides along as an extra tag.
 */
const POOLS = [
  {
    key: 'mary',
    outDir: 'ave',
    category: 'mary',
    keepConfidence: false,
    sources: [path.join(ART, 'ave')],
    // The ave folder also holds Christ, saints and non-devotional files.
    accepts: (subjects) => hasAny(subjects, MARIAN_SUBJECTS),
    extrasAccept: (subjects) => hasAny(subjects, MARIAN_SUBJECTS),
    subjectCategories: () => [],
    subjectThemes: [
      ['annunciation', ['annunciation']],
      ['sorrowful', ['dolorosa', 'seven-sorrows', 'sorrowful', 'pieta', 'tears']],
      ['immaculate', ['immaculate', 'lourdes', 'miraculous-medal', 'immaculate-heart']],
      ['theotokos', ['theotokos', 'hodegetria', 'sign']],
      ['mother-and-child', ['child', 'holy-family', 'nativity', 'perpetual-help']],
      ['visitation', ['visitation']],
      ['rosary', ['rosary']],
      ['assumption', ['assumption']],
      ['coronation', ['coronation', 'crowned']],
      ['litany-title', ['litany']],
    ],
    extraCategory: (name) => (/vitral|stained\s*glass|glass/i.test(name) ? ['stained-glass'] : []),
    themes: [
      ['immaculate', /inmacul|concebid|sin\s*pecado|pur[íi]ssim|sine\s*macula|sem\s*man[c]?illa|pure[zsv]|virginitas/i],
      ['theotokos', /theotokos|madre\s*de\s*dios|mater\s*dei|godmother|panagia/i],
      ['annunciation', /annunc|anuncia|gabriel|angel|angelo/i],
      ['mother-and-child', /child|infant|nino|nativity|nativ|baby|mother\s*and\s*child|child\s*and\s*mother|holy\s*family|sagrada\s*familia/i],
      ['sorrowful', /sorrow|dolor|amargura|piedad|calvario|lagrim|stabat|our\s*lady\s*of\s*bitterness/i],
      ['intercession', /refugio|shelter|pecador|advoc|interces|protector|defensor|helper|auxilio/i],
      ['visitation', /visitac|visita|elisabet|nabucco/i],
      ['rosary', /rosario|rosary|santo\s*rosario/i],
      ['coronation', /corona|coronaci|crown|augsburger/i],
      ['assumption', /asunci|asunt|gloria\s*de\s*mar[ií]a/i],
      ['litany-title', /torre|tower|casa|house|arca|ark|puerta|gate|estrella|star|salud|health|consoladora|consoler|regina|reina|queen|virgo|virgen|mater|seat\s*of\s*wisdom|throne|vas\s|spiritual|spec|judic|defensor|amable|amabilis|divina\s*gracia|divine\s*grace|cristi|creator|boni\s*consilii|good\s*counsel/i],
      ['mary', /maria|mary|virgen|virgin|our\s*lady|nuestra\s*se[ñn]ora|regina|madonna|ave\s*maria|hail\s*mary/i],
    ],
    iconographic: /annunc|anuncia|theotokos|madre\s*de\s*dios|refugio|our\s*lady\s*of\s*sorrows|virgen\s*de\s*los\s*dolores|stabat|visitac|visitation|inmacul|concebid|reina\s*concebida|mater\s|virgo\s|virgen\s|reina\s|torre\s|nuestra\s*se[ñn]ora|our\s*lady|madonna|regina|sedes\s*sapientiae|vas\s|spiritual|spec|judic/i,
  },
  {
    key: 'passion',
    outDir: 'passion',
    category: 'passion',
    keepConfidence: true,
    sources: [path.join(ART, 'medieval-renaissance'), path.join(ART, 'classic-orthodox')],
    // Own folders keep the wider Christological set they always served;
    // art pulled in from elsewhere must be the Passion proper.
    accepts: (subjects) => hasAny(subjects, PASSION_SUBJECTS)
      || hasAny(subjects, new Set(['christ', 'resurrection', 'ascension', 'lamb', 'eucharist', 'sacred-heart'])),
    extrasAccept: (subjects) => hasAny(subjects, PASSION_SUBJECTS),
    subjectCategories: (subjects) => {
      const extra = [];
      if (hasAny(subjects, new Set(['resurrection', 'ascension']))) extra.push('resurrection');
      if (hasAny(subjects, new Set(['last-supper', 'eucharist']))) extra.push('eucharist');
      return extra;
    },
    subjectThemes: [
      ['getsemani', ['gethsemane']],
      ['crown-of-thorns', ['thorns', 'crowning-thorns', 'ecce-homo']],
      ['cross', ['crucifixion', 'crucifix', 'cross-bearing', 'calvary', 'stations', 'raising-cross', 'descent-cross', 'entombment']],
      ['supper', ['last-supper', 'eucharist']],
      ['sacred-heart', ['sacred-heart']],
      ['baptism', ['baptism']],
      ['resurrection', ['resurrection', 'ascension']],
      ['lamb', ['lamb']],
    ],
    extraCategory: (name) => {
      const extra = [];
      if (/ascension|resurrection|resucit|tomb|sepulch/i.test(name)) extra.push('resurrection');
      if (/last[\s_-]?supper|ulti?ma\s*ceena|cena|sacrament|eucharist|disputation/i.test(name)) {
        extra.push('eucharist');
      }
      if (/baptis|bautis|jordan/i.test(name)) extra.push('nativity');
      if (/saint|st\.|elijah|andrew|michel|monk|nun|cassian/i.test(name)) extra.push('saints');
      if (/vitral|stained\s*glass|glass/i.test(name)) extra.push('stained-glass');
      return extra;
    },
    themes: [
      ['getsemani', /getsemani|getsemane|agony|huerto|oloreth|oratorio/i],
      ['cross', /crucifix|cruz|calvary|calvario|abrazando|cross|isenheim/i],
      ['crown-of-thorns', /thorns|corona|espinas|crown/i],
      ['supper', /last[\s_-]?supper|ulti?ma\s*ceena|cena|banquet|disputation|sacrament|eucharist/i],
      ['sacred-heart', /sacred[\s_-]?heart|coraz[oó]n|guido|thoms|caritas/i],
      ['baptism', /baptis|bautis|jordan/i],
      ['temple', /temple|templo|presentation|presenta/i],
      ['resurrection', /resurrection|resucit|ascension|asensi[oó]n|tomb|sepulch/i],
      ['annunciation', /annunciation|anunciaci/i],
      ['lamb', /lamb|cordero|agnus/i],
      ['passion', /christ|jesus|jes[uú]s|evangel|manuscript|miniatuur|christendom/i],
    ],
    iconographic: /crucifix|cruz|calvary|abrazando|isenheim|getsemani|getsemane|thorns|espinas|last[\s_-]?supper|cena|sacrament|thoms|caritas|baptis|jordan|temple|templo|resurrection|resucit|ascension|asensi[oó]n|lamb|cordero|agnus|christface|christ\s/i,
  },
];

function classify(themes, name) {
  const lower = name.toLowerCase();
  for (const [theme, re] of themes) {
    if (re.test(lower)) return theme;
  }
  return themes[themes.length - 1][0];
}

function slug(file, i, prefix) {
  const base = path.basename(file, path.extname(file));
  const s = base
    .normalize('NFD')
    .replace(/[^A-Za-z0-9]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 55);
  return `${prefix}-${String(i).padStart(3, '0')}-${s || 'image'}`;
}

function buildPool(pool) {
  const destRoot = path.join('public', 'gallery-images', pool.outDir);
  fs.mkdirSync(destRoot, { recursive: true });

  const files = [];
  for (const src of pool.sources) {
    if (!fs.existsSync(src)) {
      console.error(`  MISSING SOURCE ${src}`);
      continue;
    }
    for (const f of fs.readdirSync(src)) {
      if (IMAGE_EXT.test(f)) files.push({ name: f, dir: src });
    }
  }
  files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  // Reviewed stained glass / chiaroscuro from any other folder, appended after
  // the pool's own files and copied in like them, so each pool still serves
  // from one folder. Generated pool folders are never a source.
  const ownDirs = pool.sources.map(reviewKey);
  const outDirs = POOLS.map((p) => `public/gallery-images/${p.outDir}/`);
  const extras = Object.entries(VISUAL)
    .filter(([key, v]) => PREFERRED_STYLES.has(v.style) && pool.extrasAccept(v.subjects))
    .filter(([key]) => !ownDirs.includes(key.replace(/\/[^/]*$/, '')))
    .filter(([key]) => !outDirs.some((d) => key.startsWith(d)))
    .map(([key]) => key)
    .sort();
  for (const key of extras) {
    const dir = path.dirname(key);
    const name = fs.existsSync(key)
      ? path.basename(key)
      : (fs.existsSync(dir) ? fs.readdirSync(dir) : []).find((f) => f.normalize('NFC') === path.basename(key));
    if (name) files.push({ name, dir, extra: true });
  }

  const entries = [];
  const seenHash = new Map();
  const seenStem = new Set();
  const skipped = { junk: 0, wrongSubject: 0, identical: 0, sameName: 0, visualExclude: 0 };
  let extrasAdded = 0;

  for (const { name, dir, extra } of files) {
    const plain = path.basename(name, path.extname(name));
    const srcPath = path.join(dir, name);
    const visual = VISUAL[reviewKey(srcPath)];

    if (visual?.style === 'exclude') { skipped.visualExclude += 1; continue; }
    if (!visual && JUNK.test(plain)) { skipped.junk += 1; continue; }

    const stem = plain.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '');
    if (!visual && stem.length < 3) { skipped.junk += 1; continue; }

    const wrongRe = WRONG_SUBJECT[pool.key];
    if (visual ? !pool.accepts(visual.subjects) : (wrongRe && wrongRe.test(plain))) {
      skipped.wrongSubject += 1;
      continue;
    }

    const hash = crypto.createHash('md5').update(fs.readFileSync(srcPath)).digest('hex');
    if (seenHash.has(hash)) { skipped.identical += 1; continue; }
    if (seenStem.has(stem)) { skipped.sameName += 1; continue; }
    seenHash.set(hash, name);
    seenStem.add(stem);

    // NFC so the served URL matches the bytes on disk (imagePathsOnDisk test).
    const target = name.normalize('NFC');
    const dstPath = path.join(destRoot, target);
    if (!fs.existsSync(dstPath)) fs.copyFileSync(srcPath, dstPath);
    if (extra) extrasAdded += 1;

    const theme = (visual && themeFromSubjects(pool.subjectThemes, visual.subjects))
      || classify(pool.themes, plain);
    const tags = [
      pool.category,
      ...(pool.extraCategory(plain) || []),
      ...(visual ? pool.subjectCategories(visual.subjects) : []),
    ];
    if (visual?.style === 'stained-glass') tags.push('stained-glass');
    if (theme !== 'mary' && theme !== 'passion') tags.push(theme);
    tags.splice(0, tags.length, ...new Set(tags));
    tags.forEach((t) => {
      if (!LITURGICAL_CATEGORIES.has(t) && t !== theme) {
        throw new Error(`${pool.key}: tag "${t}" is neither a liturgical category nor the theme`);
      }
    });

    const entry = {
      id: slug(target, entries.length, pool.outDir),
      path: `/gallery-images/${pool.outDir}/${encodeURI(target)}`,
      name: plain,
      source: 'public',
      pool: pool.key,
      tags,
      theme,
    };
    if (visual) {
      entry.style = visual.style;
      entry.subjects = visual.subjects;
    }
    if (pool.keepConfidence) {
      entry.confidence = pool.iconographic.test(plain) ? 'high' : 'low';
    }
    entries.push(entry);
  }

  const byTheme = {};
  entries.forEach((e) => { byTheme[e.theme] = (byTheme[e.theme] || 0) + 1; });

  // Prune orphans. Earlier runs with different dedupe/deny rules left files
  // behind — including 13 Mary images an early Passion run copied in, which
  // were never served but sat confusingly in the Passion folder.
  const keep = new Set(entries.map((e) => decodeURIComponent(e.path.replace(/^\/gallery-images\/[^/]+\//, ''))));
  let pruned = 0;
  for (const f of fs.readdirSync(destRoot)) {
    if (f.toLowerCase().endsWith('.DS_Store')) continue;
    if (keep.has(f.normalize('NFC'))) continue;
    fs.unlinkSync(path.join(destRoot, f));
    pruned += 1;
  }
  if (pruned) console.log(`[${pool.key}-pool] pruned ${pruned} orphan file(s) not in the catalog`);

  const high = entries.filter((e) => e.confidence === 'high').length;
  console.log(
    `[${pool.key}-pool] ${entries.length} images -> public/gallery-images/${pool.outDir}/  `
    + `skipped: ${skipped.junk} junk, ${skipped.wrongSubject} wrong-subject, `
    + `${skipped.identical} identical, ${skipped.sameName} same-name, `
    + `${skipped.visualExclude} excluded on review  (+${extrasAdded} reviewed from other folders)`
  );
  console.log(
    `[${pool.key}-pool] categories: ${pool.category}`
    + `${pool.keepConfidence ? `  confidence: high=${high} low=${entries.length - high}` : ''}`
    + `  themes: ${Object.entries(byTheme).map(([k, v]) => `${k}=${v}`).join(' ')}`
  );
  return { entries, byTheme, skipped, source: pool.sources };
}

const pools = POOLS.map(buildPool);
const allImages = pools.flatMap((p) => p.entries);

/** id -> entry, the shape `imageRegistry` merges as its floor layer. */
const CATALOG = {};
for (const entry of allImages) CATALOG[entry.id] = entry;

const byPool = {};
for (const entry of allImages) byPool[entry.pool] = (byPool[entry.pool] || 0) + 1;

const payload = {
  generatedAt: new Date().toISOString(),
  note:
    'Generated by scripts/build-image-pools.js — do not edit by hand. Merged into '
    + 'imageRegistry as the floor layer; the owner\'s own renames/tags live in '
    + 'rosario_image_registry_overrides and sync through shared/artConfig. COPY of the '
    + 'owner folder — never move the source.',
  count: allImages.length,
  byPool,
  byTheme: Object.assign({}, ...pools.map((p) => p.byTheme)),
  skipped: Object.assign({}, ...pools.map((p) => p.skipped)),
  sources: Object.fromEntries(pools.map((p) => [p.entries[0]?.pool || '?', p.source])),
  catalog: CATALOG,
};

fs.writeFileSync(CATALOG_OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(
  `\n[image-library-catalog] ${allImages.length} entries -> ${CATALOG_OUT}  (${JSON.stringify(byPool)})`
);
