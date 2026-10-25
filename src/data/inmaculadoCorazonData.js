/**
 * Inmaculado Corazón de María — the Immaculate Heart, made known at Fátima.
 *
 * Structure follows what Sister Lúcia was told in 1930: the Virgin named five
 * classes of offenses against her Immaculate Heart, and the promise of the
 * reparation devotion. The closing act is the traditional Consecration to the
 * Immaculate Heart of Mary.
 *
 * The Immaculate Heart is the pierced heart on the reverse of the Miraculous
 * Medal (Luke 2:35) — see `medallaMilagrosaData.js`, step `MM_CORAZONES`.
 */
import { imagePath } from './imageRegistry';

export const INMACULADO_CORAZON_ID = 'inmaculado_corazon';

// Immaculate Heart window; Salve Regina keeps Mater immaculata.
export const inmaculadoCorazonThumbnail =
  imagePath('galleryVirgoImmaculata') || imagePath('allMary17th');

const CORAZON_IMMACULATO = [
  imagePath('galleryMaterImmaculata'),
  imagePath('galleryVirgoImmaculata'),
  imagePath('allMary17th'),
].filter(Boolean);

const CORAZON_PASADO = [
  imagePath('gallerySagradoCorazonEm'),
  imagePath('galleryMaterImmaculata'),
  imagePath('allMary17th'),
].filter(Boolean);

const first = (list) => list[0] || imagePath('galleryMaterImmaculata');

/** The five classes of offenses, as Sister Lúcia recorded them in 1930. */
export const CINCO_OFENSAS = [
  {
    n: 1,
    title: 'Blasfemias contra la Inmaculada Concepción',
    text: 'Las blasfemias contra la Inmaculada Concepción.',
  },
  {
    n: 2,
    title: 'Contra su Virginidad',
    text: 'Las blasfemias contra su Virginidad.',
  },
  {
    n: 3,
    title: 'Contra su Maternidad Divina',
    text:
      'Las blasfemias contra su Maternidad Divina, negándose a la vez a reconocerla como Madre de los hombres.',
  },
  {
    n: 4,
    title: 'La indiferencia en el corazón de los niños',
    text:
      'Los que pretenden implantar públicamente, en el corazón de los niños, la indiferencia, ' +
      'la falta de respeto e incluso el odio a esta Madre Inmaculada.',
  },
  {
    n: 5,
    title: 'La ofensa en sus sagradas imágenes',
    text: 'Los que la injurian directamente en sus sagradas imágenes.',
  },
];

/**
 * Step 1 — the five offenses, walked one at a time.
 *
 * Ids deliberately avoid the `PREFIX_N` shape: the voice pack treats `X_3` as
 * a numbered variant of `X` and would play one clip for all five, but each
 * offense has its own words and needs its own guide.
 */
const stepOfensas = (o, i) => ({
  id: `IC_OFENSA${o.n}`,
  title: `${o.n}. ${o.title}`,
  text: o.text,
  img: first(i % 2 === 0 ? CORAZON_IMMACULATO : CORAZON_PASADO),
  imgCandidates: i % 2 === 0 ? CORAZON_IMMACULATO : CORAZON_PASADO,
});

/** Step 2 — the promise that opened the reparation devotion. */
const PROMESA = {
  id: 'IC_PROMESA',
  title: 'La promesa',
  text:
    'Hija, el motivo es simple: hay cinco clases de ofensas y blasfemias pronunciadas contra ' +
    'el Inmaculado Corazón de María.\n\nMira, hija mía, mi Corazón rodeado de espinas con las que ' +
    'los hombres ingratos lo traspasan a cada momento con sus blasfemias e ingratitudes. ' +
    'Procura, al menos, consolarme.\n\n(Hermana Lucía, 10 de diciembre de 1925)',
  img: first(CORAZON_PASADO),
  imgCandidates: CORAZON_PASADO,
};

/** Step 3 — the traditional act of consecration. */
const CONSAGRACION = {
  id: 'IC_CONSAGRACION',
  title: 'Consagración',
  text:
    'Virgen María, Madre de Dios y Madre nuestra, a vuestro Corazón Inmaculado nos consagramos, ' +
    'en acto de entrega total al Señor. Por Vos seremos llevados a Cristo, y por Él y con Él ' +
    'seremos llevados a Dios Padre.\n\nCaminaremos a la luz de la fe, y haremos todo para que el mundo ' +
    'crea que Jesucristo es el Enviado del Padre. Con Él queremos llevar el Amor y la Salvación hasta ' +
    'los confines del mundo.\n\nBajo la maternal protección de vuestro Corazón Inmaculado, seremos un ' +
    'solo pueblo con Cristo. Seremos testimonio de su Resurrección. Por Él seremos llevados al Padre, ' +
    'para gloria de la Santísima Trinidad, a quien adoramos, alabamos y bendecimos. Amén.',
  img: first(CORAZON_IMMACULATO),
  imgCandidates: CORAZON_IMMACULATO,
};

export function isInmaculadoCorazonMode(misterioActual) {
  return misterioActual === INMACULADO_CORAZON_ID;
}

export function getInmaculadoCorazonSequence() {
  return [
    ...CINCO_OFENSAS.map(stepOfensas),
    PROMESA,
    CONSAGRACION,
  ].map((step) => ({
    ...step,
    img: step.img || imagePath('galleryMaterImmaculata'),
    imgCandidates: step.imgCandidates?.length
      ? step.imgCandidates
      : [imagePath('galleryMaterImmaculata')],
  }));
}

export { getImage } from './imageRegistry';
