const FALLBACK = '/gallery-images/cathedral-painting.jpg';

const MODOOSCURO_DOLOR = {
  MD1: '/gallery-images/misterios/modooscuro/misteriodolor1.webp',
  MD2: '/gallery-images/misterios/modooscuro/misteriodolor2.jpg',
  MD3: '/gallery-images/misterios/modooscuro/misteriodolor3.webp',
  MD4: '/gallery-images/misterios/modooscuro/misteriodolor4.webp',
  MD5: '/gallery-images/misterios/modooscuro/misteriodolor5.jpg',
};

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

  push(FALLBACK);
  return candidates;
}

export function resolvePrayerImage(prayer, mysteryType) {
  return getPrayerImageCandidates(prayer, mysteryType)[0];
}
