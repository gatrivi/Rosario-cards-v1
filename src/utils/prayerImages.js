const FALLBACK = '/gallery-images/cathedral-painting.jpg';
const MODO = '/gallery-images/misterios/modooscuro/';

/** Filename-themed extras (matched against prayer id + title). */
const THEMATIC = [
  { re: /contrición|contricion/i, files: ['contricion.jpg', 'contricion2.png'] },
  { re: /credo/i, files: ['credo.webp'] },
  { re: /padre nuestro|^P$/i, files: ['padre-nuestro.jpg'] },
  { re: /ave maría|ave maria|^A$/i, files: ['ave-maria.jpg', 'MetMary-870x489.jpg', 'roseLimaJuarez-870x1250.jpg'] },
  { re: /gloria|^G$/i, files: ['gloria.webp', 'misteriogloria0.jpg'] },
  { re: /fátima|fatima|^F$/i, files: ['francisco_de_asis_2.jpg', 'theresadelisieux.jpg'] },
  { re: /salve|^S$/i, files: ['salve-regina.jpg'] },
  { re: /papa/i, files: ['papa.jpg', 'sanpadrepio.jpg'] },
  { re: /letanía|letania|^LL$/i, files: ['salve-regina.jpg', 'theresadelisieux.jpg'] },
  { re: /ángel|angel|anunciación|anunciacion/i, files: ['festinangelguardia.jpg', 'angeldealaguardia.jpg', 'MetMary-870x489.jpg'] },
  { re: /niño|nino|nacimiento|belén|belen|infant/i, files: ['Georges_de_La_Tour_-_Newlyborn_infant_-_Musée_des_Beaux-Arts_de_Rennes-copy-870x717.jpg'] },
  { re: /cruz|crucifix|crucif/i, files: ['1954.15-The-Crucifixion-864x1536.jpg'] },
  { re: /señal|^SC$/i, files: ['Encounters in the cathedral of Raleigh.jpg'] },
];

const MODOOSCURO_DOLOR = {
  MD1: '/gallery-images/misterios/modooscuro/misteriodolor1.webp',
  MD2: '/gallery-images/misterios/modooscuro/misteriodolor2.jpg',
  MD3: '/gallery-images/misterios/modooscuro/misteriodolor3.webp',
  MD4: '/gallery-images/misterios/modooscuro/misteriodolor4.webp',
  MD5: '/gallery-images/misterios/modooscuro/misteriodolor5.jpg',
};

function thematicExtras(prayer) {
  if (!prayer) return [];
  const hay = `${prayer.id || ''} ${prayer.title || ''}`;
  const out = [];
  for (const { re, files } of THEMATIC) {
    if (!re.test(hay)) continue;
    for (const f of files) {
      const url = MODO + f;
      if (!out.includes(url)) out.push(url);
    }
  }
  return out;
}

export function pickPrayerImage(candidates, seed = 0) {
  if (!candidates?.length) return FALLBACK;
  const n = candidates.length;
  const idx = Math.abs(seed) % n;
  return candidates[idx];
}

/** Build ordered candidate URLs for a prayer vitral image. */
export function getPrayerImageCandidates(prayer, mysteryType) {
  if (!prayer) return [FALLBACK];

  const isDark =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('theme') !== 'light';

  const candidates = [];
  const push = (url) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  if (prayer.id?.startsWith('MD') && MODOOSCURO_DOLOR[prayer.id]) {
    push(MODOOSCURO_DOLOR[prayer.id]);
  }

  if (isDark && prayer.imgmo) push(prayer.imgmo);
  if (prayer.img) {
    if (Array.isArray(prayer.img)) prayer.img.forEach(push);
    else push(prayer.img);
  }
  if (!isDark && prayer.imgmo) push(prayer.imgmo);

  if (prayer.id?.startsWith('MD')) {
    push('/gallery-images/misterios/modooscuro/misteriodolor0.jpg');
  }

  if (mysteryType === 'dolorosos' && prayer.id?.startsWith('MD')) {
    const num = prayer.id.replace('MD', '');
    push(`/gallery-images/misterios/modooscuro/misteriodolor${num}.webp`);
    push(`/gallery-images/misterios/modooscuro/misteriodolor${num}.jpg`);
  }

  thematicExtras(prayer).forEach(push);

  push(FALLBACK);
  return candidates;
}

export function resolvePrayerImage(prayer, mysteryType, seed = 0) {
  return pickPrayerImage(getPrayerImageCandidates(prayer, mysteryType), seed);
}
