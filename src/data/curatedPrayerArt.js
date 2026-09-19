const MODO = '/gallery-images/misterios/modooscuro/';

/** Prayer-specific primaries that override duplicated/generic legacy art. */
export const CURATED_PRAYER_ART = {
  SC: [MODO + '1954.15-The-Crucifixion-864x1536.jpg'],
  AC: [MODO + 'contricion.jpg'],
  C: [MODO + 'credo.webp'],
  P: [MODO + 'padre-nuestro.jpg'],
  A: [MODO + 'ave-maria.jpg', MODO + 'MetMary-870x489.jpg'],
  G: [MODO + 'gloria.webp', MODO + 'espiritu-santo-2.jpg'],
  F: [
    // Public domain: commons.wikimedia.org/wiki/File:Our_Lady_of_Fatima_1968.jpg
    'https://upload.wikimedia.org/wikipedia/commons/9/95/Our_Lady_of_Fatima_1968.jpg',
    '/gallery-images/litany/modooscuro/Mater immaculata.jpg',
    MODO + 'sagrado-corazon-esus-maria.jpg',
  ],
  LL: [
    '/gallery-images/litany/modooscuro/Mater immaculata.jpg',
    '/gallery-images/litany/modooscuro/virgo-inmaculata.jpg',
  ],
  S: [MODO + 'salve-regina.jpg'],

  // Known duplicate/misleading legacy assets.
  'gozosos:MG3': [
    MODO + 'Georges_de_La_Tour_-_Newlyborn_infant_-_Musée_des_Beaux-Arts_de_Rennes-copy-870x717.jpg',
    MODO + 'maria-nino-esus4.jpg',
  ],
  'luminosos:ML3': [MODO + 'pastor.jpg'],

  // MG ids are historically reused between Joyful and Glorious mysteries.
  'gloriosos:MG1': [MODO + 'misteriogloria1.webp'],
  'gloriosos:MG2': [MODO + 'misteriogloria2.webp'],
  'gloriosos:MG3': [MODO + 'misteriogloria3.webp', MODO + 'espiritu-santo.jpg'],
  'gloriosos:MG4': [MODO + 'misteriogloria4.webp'],
  'gloriosos:MG5': [MODO + 'misteriogloria5.webp'],
  'gozosos:MG1': [MODO + 'misteriogozo1.webp'],
  'gozosos:MG2': [MODO + 'misteriogozo2.webp'],
  'gozosos:MG4': [MODO + 'misteriogozo4.webp'],
  'gozosos:MG5': [MODO + 'misteriogozo5.webp'],
};

export function curatedPrayerArt(prayerId, mysteryType) {
  if (!prayerId) return [];
  const scopedKey = mysteryType ? `${mysteryType}:${prayerId}` : null;
  return [
    ...(scopedKey ? CURATED_PRAYER_ART[scopedKey] || [] : []),
    ...(CURATED_PRAYER_ART[prayerId] || []),
  ];
}
