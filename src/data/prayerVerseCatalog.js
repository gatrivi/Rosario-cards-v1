/**
 * Structured verses for Padre Nuestro and Ave María — one complete thought per line.
 * `defaultImageId` references imageRegistry; overridable via Asset Studio assignments.
 */

export const PADRE_NUESTRO_VERSES = [
  { text: 'Padre nuestro, que estás en el cielo, santificado sea tu nombre;', defaultImageId: 'encountersCathedral' },
  { text: 'venga a nosotros tu reino;', defaultImageId: 'theotokos' },
  { text: 'hágase tu voluntad en la tierra como en el cielo.', defaultImageId: 'galleryCathedralPraying' },
  { text: 'Danos hoy nuestro pan de cada día;', defaultImageId: 'lamb' },
  { text: 'perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden;', defaultImageId: 'vitreauxCruz' },
  { text: 'no nos dejes caer en la tentación, y líbranos del mal.', defaultImageId: 'stainedGlass' },
  { text: 'Amén.', defaultImageId: 'byzantineArt' },
];

/**
 * `themes` name the scene each phrase speaks of, matched against image tags
 * and reviewed subjects (`resolvePrayerVerseImage` walks that pool day by day):
 * Gabriel's greeting (Lc 1,28), Elizabeth's blessing (Lc 1,42), the Child, the
 * Theotokos, the intercession, the hour of death, and Mary's glory for the Amén.
 * `defaultImageId` stays as the fallback when a theme has no art.
 */
export const AVE_MARIA_VERSES = [
  { text: 'Dios te salve, María,', defaultImageId: 'theotokos', themes: ['annunciation', 'gabriel'] },
  { text: 'llena eres de gracia,', defaultImageId: 'allMary17th', themes: ['annunciation', 'gabriel'] },
  { text: 'el Señor es contigo.', defaultImageId: 'galleryMaterImmaculata', themes: ['annunciation', 'gabriel'] },
  { text: 'Bendita tú eres entre todas las mujeres,', defaultImageId: 'allMary17th', themes: ['visitation', 'elizabeth'] },
  { text: 'y bendito es el fruto de tu vientre, Jesús.', defaultImageId: 'byzantineArt', themes: ['nativity', 'holy-family', 'mother-and-child'] },
  { text: 'Santa María, Madre de Dios,', defaultImageId: 'theotokos', themes: ['theotokos', 'immaculate'] },
  { text: 'ruega por nosotros, pecadores,', defaultImageId: 'stainedGlass', themes: ['immaculate-heart', 'seven-sorrows', 'sorrowful', 'magdalene'] },
  { text: 'ahora y en la hora de nuestra muerte.', defaultImageId: 'vitreauxCruz', themes: ['pieta', 'deathbed', 'dormition', 'crucifixion'] },
  { text: 'Amén.', defaultImageId: 'galleryVirgoImmaculata', themes: ['assumption', 'coronation'] },
];

const CATALOG = {
  P: PADRE_NUESTRO_VERSES,
  A: AVE_MARIA_VERSES,
};

export function getPrayerVerseCatalog(prayerId) {
  return CATALOG[prayerId] || null;
}

export function supportsPerVerseImages(prayerId) {
  return Boolean(CATALOG[prayerId]);
}
