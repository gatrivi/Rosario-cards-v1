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

export const AVE_MARIA_VERSES = [
  { text: 'Dios te salve, María,', defaultImageId: 'theotokos' },
  { text: 'llena eres de gracia,', defaultImageId: 'allMary17th' },
  { text: 'el Señor es contigo.', defaultImageId: 'galleryMaterImmaculata' },
  { text: 'Bendita tú eres entre todas las mujeres,', defaultImageId: 'allMary17th' },
  { text: 'y bendito es el fruto de tu vientre, Jesús.', defaultImageId: 'byzantineArt' },
  { text: 'Santa María, Madre de Dios,', defaultImageId: 'theotokos' },
  { text: 'ruega por nosotros, pecadores,', defaultImageId: 'stainedGlass' },
  { text: 'ahora y en la hora de nuestra muerte.', defaultImageId: 'vitreauxCruz' },
  { text: 'Amén.', defaultImageId: 'galleryVirgoImmaculata' },
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
