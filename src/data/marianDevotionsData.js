import { imagePath } from './imageRegistry';

export const ANGELUS_ID = 'angelus';
export const MAGNIFICAT_ID = 'magnificat';
export const MARIAN_DEVOTION_IDS = [ANGELUS_ID, MAGNIFICAT_ID];

export const angelusThumbnail = imagePath('angAnnunciationArt') || imagePath('allMary17th');
export const magnificatThumbnail = imagePath('magnificatVisitation');

const SIGN_OF_CROSS_TEXT =
  'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.';

const AVE_MARIA_TEXT =
  'Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús.\n\nSanta María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.';

function step(id, title, text, imageId, extraImageIds = []) {
  const img = imagePath(imageId);
  const imgCandidates = [img, ...extraImageIds.map(imagePath)].filter(Boolean);
  return { id, title, text, img, imgCandidates };
}

/** Each ANG_/MAG_ primary imageId is unique (no shared Liber faces). */
export const angelusSequence = [
  step('ANG_SC', 'Señal de la Cruz', SIGN_OF_CROSS_TEXT, 'allMary17th', ['mary01']),
  step(
    'ANG_ANNUNCIATION',
    'El Ángel del Señor',
    'El Ángel del Señor anunció a María.\nY concibió por obra y gracia del Espíritu Santo.',
    'angAnnunciationArt',
    ['theotokos']
  ),
  step('ANG_AVE_1', 'Ave María', AVE_MARIA_TEXT, 'theotokos', ['mary02']),
  step(
    'ANG_FIAT',
    'He aquí la esclava',
    'He aquí la esclava del Señor.\nHágase en mí según tu palabra.',
    'mary01',
    ['galleryMaterImmaculata']
  ),
  step('ANG_AVE_2', 'Ave María', AVE_MARIA_TEXT, 'galleryMaterImmaculata', ['mary03']),
  step(
    'ANG_INCARNATION',
    'El Verbo se hizo carne',
    'Y el Verbo se hizo carne.\nY habitó entre nosotros.',
    'byzantineArt',
    ['mary04']
  ),
  step('ANG_AVE_3', 'Ave María', AVE_MARIA_TEXT, 'galleryVirgoImmaculata', ['mary05']),
  step(
    'ANG_FINAL',
    'Oración final',
    'Ruega por nosotros, Santa Madre de Dios.\nPara que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo.\n\nOremos: Infunde, Señor, tu gracia en nuestros corazones, para que quienes hemos conocido, por el anuncio del ángel, la encarnación de tu Hijo Jesucristo, por su pasión y cruz seamos llevados a la gloria de su resurrección. Por el mismo Jesucristo, nuestro Señor. Amén.',
    'mary02',
    ['stainedGlass']
  ),
];

export const magnificatSequence = [
  step('MAG_SC', 'Señal de la Cruz', SIGN_OF_CROSS_TEXT, 'nun05', ['magnificatVisitation']),
  step(
    'MAG_1',
    'Magnificat',
    'Proclama mi alma la grandeza del Señor,\nse alegra mi espíritu en Dios, mi salvador;',
    'magnificatVisitation',
    ['mary03']
  ),
  step(
    'MAG_2',
    'Ha mirado a su esclava',
    'porque ha mirado la humildad de su esclava.\nDesde ahora me felicitarán todas las generaciones,',
    'mary03',
    ['nun01']
  ),
  step(
    'MAG_3',
    'El Poderoso hizo obras grandes',
    'porque el Poderoso ha hecho obras grandes por mí:\nsu nombre es santo,',
    'mary04',
    ['earlyChristian']
  ),
  step(
    'MAG_4',
    'Su misericordia llega',
    'y su misericordia llega a sus fieles\nde generación en generación.',
    'mary05',
    ['stainedGlass']
  ),
  step(
    'MAG_5',
    'Derriba y enaltece',
    'Él hace proezas con su brazo:\ndispersa a los soberbios de corazón,\nderriba del trono a los poderosos\ny enaltece a los humildes.',
    'mary06',
    ['lamb']
  ),
  step(
    'MAG_6',
    'Colma de bienes',
    'A los hambrientos los colma de bienes\ny a los ricos los despide vacíos.',
    'nun01',
    ['mary06']
  ),
  step(
    'MAG_7',
    'Auxilia a Israel',
    'Auxilia a Israel, su siervo,\nacordándose de la misericordia,\ncomo lo había prometido a nuestros padres,\nen favor de Abrahán y su descendencia por siempre.',
    'nun02',
    ['earlyChristianAlt']
  ),
  step(
    'MAG_DOX',
    'Gloria al Padre',
    'Gloria al Padre, y al Hijo, y al Espíritu Santo.\nComo era en el principio, ahora y siempre,\npor los siglos de los siglos. Amén.',
    'nun03',
    ['galleryPentecost']
  ),
];

export function isMarianDevotionMode(mysteryType) {
  return MARIAN_DEVOTION_IDS.includes(mysteryType);
}

export function buildMarianDevotionSequence(mysteryType) {
  if (mysteryType === ANGELUS_ID) return angelusSequence;
  if (mysteryType === MAGNIFICAT_ID) return magnificatSequence;
  return [];
}
