/**
 * Devociones de la Preciosísima Sangre de Cristo — Julio, Mes de la Sangre.
 *
 * Incluye tres devociones (el usuario pidió "lo mejor que puedas"):
 *   1. Letanía de la Preciosísima Sangre (Juan XXIII, 1960) — verses/sections,
 *      compatible con LitanyDisplay.
 *   2. Corona (Chaplet) de la Preciosísima Sangre — secuencia rezable basada
 *      en los Siete Derramamientos de la Sangre de Cristo.
 *   3. Siete Ofrendas de la Sangre de Cristo — siete oraciones breves.
 *
 * Todas las imágenes provienen del imageRegistry (nada hardcoded aquí).
 */

import { imagePath } from './imageRegistry';

export const PRECIOUS_BLOOD_ID = 'sangrepreciosa';
export const PRECIOUS_BLOOD_MONTH = 6; // 0-indexed: July

const bloodImg = (seed) => {
  const pool = [
    imagePath('crux'),
    imagePath('vitreauxCruz'),
    imagePath('lamb'),
    imagePath('earlyChristian'),
    imagePath('byzantineArt'),
    imagePath('stainedGlass'),
    imagePath('encountersCathedral'),
  ];
  return pool[seed % pool.length];
};

// ─────────────────────────────────────────────────────────────────
// 1. LETANÍA DE LA PRECIOSÍSIMA SANGRE DE CRISTO
// ─────────────────────────────────────────────────────────────────

export const preciousBloodLitanyMeta = {
  id: 'LPB',
  title: 'Letanía de la Preciosísima Sangre de Cristo',
  img: imagePath('vitreauxCruz'),
  imgmo: imagePath('crux'),
};

export const preciousBloodLitanySections = [
  { name: 'Invocaciones iniciales', start: 0, end: 8, total: 9 },
  { name: 'Invocaciones a la Sangre de Cristo', start: 9, end: 32, total: 24 },
  { name: 'Súplicas', start: 33, end: 38, total: 6 },
  { name: 'Cierre', start: 39, end: 41, total: 3 },
];

export const preciousBloodLitanyVerses = [
  // Sección 1 — Invocaciones iniciales (0-8)
  { invocation: 'Señor, ten piedad', response: 'Señor, ten piedad', section: 1, img: bloodImg(0) },
  { invocation: 'Cristo, ten piedad', response: 'Cristo, ten piedad', section: 1, img: bloodImg(1) },
  { invocation: 'Señor, ten piedad', response: 'Señor, ten piedad', section: 1, img: bloodImg(2) },
  { invocation: 'Cristo, óyenos', response: 'Cristo, óyenos', section: 1, img: bloodImg(3) },
  { invocation: 'Cristo, escúchanos', response: 'Cristo, escúchanos', section: 1, img: bloodImg(4) },
  { invocation: 'Dios, Padre celestial', response: 'Ten piedad de nosotros', section: 1, img: bloodImg(5) },
  { invocation: 'Dios Hijo, Redentor del mundo', response: 'Ten piedad de nosotros', section: 1, img: bloodImg(6) },
  { invocation: 'Dios, Espíritu Santo', response: 'Ten piedad de nosotros', section: 1, img: bloodImg(0) },
  { invocation: 'Santísima Trinidad, un solo Dios', response: 'Ten piedad de nosotros', section: 1, img: bloodImg(1) },

  // Sección 2 — Invocaciones a la Sangre de Cristo (9-32) — respuesta: "Sálvanos"
  { invocation: 'Sangre de Cristo, Hijo unigénito del Padre eterno', response: 'Sálvanos', section: 2, img: bloodImg(2) },
  { invocation: 'Sangre de Cristo, Verbo de Dios encarnado', response: 'Sálvanos', section: 2, img: bloodImg(3) },
  { invocation: 'Sangre de Cristo, de la Nueva y Eterna Alianza', response: 'Sálvanos', section: 2, img: bloodImg(4) },
  { invocation: 'Sangre de Cristo, derramada sobre la tierra en la Agonía', response: 'Sálvanos', section: 2, img: bloodImg(5) },
  { invocation: 'Sangre de Cristo, vertida abundantemente en la Flagelación', response: 'Sálvanos', section: 2, img: bloodImg(6) },
  { invocation: 'Sangre de Cristo, brotada en la Coronación de espinas', response: 'Sálvanos', section: 2, img: bloodImg(0) },
  { invocation: 'Sangre de Cristo, derramada en el Camino del Calvario', response: 'Sálvanos', section: 2, img: bloodImg(1) },
  { invocation: 'Sangre de Cristo, preciosísima en el Clavado de las manos y los pies', response: 'Sálvanos', section: 2, img: bloodImg(2) },
  { invocation: 'Sangre de Cristo, manantial de misericordia', response: 'Sálvanos', section: 2, img: bloodImg(3) },
  { invocation: 'Sangre de Cristo, precio de nuestra redención', response: 'Sálvanos', section: 2, img: bloodImg(4) },
  { invocation: 'Sangre de Cristo, sin la cual no hay salvación', response: 'Sálvanos', section: 2, img: bloodImg(5) },
  { invocation: 'Sangre de Cristo, bebida del Cáliz eucarístico y baño de las almas', response: 'Sálvanos', section: 2, img: bloodImg(6) },
  { invocation: 'Sangre de Cristo, torrente que lava los pecados del mundo', response: 'Sálvanos', section: 2, img: bloodImg(0) },
  { invocation: 'Sangre de Cristo, victoriosa sobre los demonios del infierno', response: 'Sálvanos', section: 2, img: bloodImg(1) },
  { invocation: 'Sangre de Cristo, fortaleza de los mártires', response: 'Sálvanos', section: 2, img: bloodImg(2) },
  { invocation: 'Sangre de Cristo, virtud de los confesores', response: 'Sálvanos', section: 2, img: bloodImg(3) },
  { invocation: 'Sangre de Cristo, que engendras vírgenes', response: 'Sálvanos', section: 2, img: bloodImg(4) },
  { invocation: 'Sangre de Cristo, sostén de los que peligran', response: 'Sálvanos', section: 2, img: bloodImg(5) },
  { invocation: 'Sangre de Cristo, alivio de los que sufren', response: 'Sálvanos', section: 2, img: bloodImg(6) },
  { invocation: 'Sangre de Cristo, consuelo de las almas del Purgatorio', response: 'Sálvanos', section: 2, img: bloodImg(0) },
  { invocation: 'Sangre de Cristo, esperanza de los pecadores', response: 'Sálvanos', section: 2, img: bloodImg(1) },
  { invocation: 'Sangre de Cristo, libertad de los oprimidos', response: 'Sálvanos', section: 2, img: bloodImg(2) },
  { invocation: 'Sangre de Cristo, auxilio de los moribundos', response: 'Sálvanos', section: 2, img: bloodImg(3) },
  { invocation: 'Sangre de Cristo, paz y dulzura de los corazones', response: 'Sálvanos', section: 2, img: bloodImg(4) },
  { invocation: 'Sangre de Cristo, prenda de vida eterna', response: 'Sálvanos', section: 2, img: bloodImg(5) },
  { invocation: 'Sangre de Cristo, que libras de las tinieblas y nos llevas a la luz', response: 'Sálvanos', section: 2, img: bloodImg(6) },

  // Sección 3 — Súplicas (33-38) — respuesta: "Líbranos, Señor"
  { invocation: 'De todo mal', response: 'Líbranos, Señor', section: 3, img: bloodImg(0) },
  { invocation: 'De todo pecado', response: 'Líbranos, Señor', section: 3, img: bloodImg(1) },
  { invocation: 'De las tentaciones del demonio', response: 'Líbranos, Señor', section: 3, img: bloodImg(2) },
  { invocation: 'De la perdición eterna', response: 'Líbranos, Señor', section: 3, img: bloodImg(3) },
  { invocation: 'Por tu Sagrada Encarnación', response: 'Líbranos, Señor', section: 3, img: bloodImg(4) },
  { invocation: 'Por tu Pasión y Cruz', response: 'Líbranos, Señor', section: 3, img: bloodImg(5) },

  // Sección 4 — Cierre (39-41)
  { invocation: 'Cordero de Dios, que quitas el pecado del mundo', response: 'Perdónanos, Señor', section: 4, img: imagePath('lamb') },
  { invocation: 'Cordero de Dios, que quitas el pecado del mundo', response: 'Escúchanos, Señor', section: 4, img: imagePath('lamb') },
  { invocation: 'Cordero de Dios, que quitas el pecado del mundo', response: 'Ten piedad de nosotros', section: 4, img: imagePath('lamb') },
];

export const preciousBloodLitanyClosingPrayer =
  'Oh Omnipotente y Eterno Dios, que constituiste a tu Unigénito Hijo Redentor del mundo y quisiste aplacar tu ira con su Sangre: te suplicamos nos concedas venerar el precio de nuestra salvación y, por su virtud, defendernos en la tierra de los males presentes, para gozar eternamente de su fruto en el cielo. Por Cristo nuestro Señor. Amén.';

// ─────────────────────────────────────────────────────────────────
// 2. CORONA (CHAPLET) DE LA PRECIOSÍSIMA SANGRE
//    Basada en los Siete Derramamientos. Estructura rezable:
//    SC → C (contrición) → 7 grupos [P → PB×5 → G] → oración final.
// ─────────────────────────────────────────────────────────────────

export const PRECIOUS_BLOOD_CHAPLET_KEYS = [
  'SC',
  'PBContrition',
  ...Array.from({ length: 7 }, () => ['PB_P', 'PB', 'PB', 'PB', 'PB', 'PB', 'PB_G']).flat(),
  'PBClosing',
];

export const preciousBloodChapletPrayers = [
  {
    id: 'PBContrition',
    title: 'Acto de Contrición',
    img: imagePath('crux'),
    text:
      'Señor mío Jesucristo, Dios y hombre verdadero, Creador, Padre y Redentor mío; por ser Vos quien sois, bondad infinita, y porque os amo sobre todas las cosas, me pesa de haberos ofendido. Propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta. Amén.',
  },
  {
    id: 'PB_P',
    title: 'Padre Nuestro — Misterio de la Sangre',
    img: imagePath('latinPaterNoster'),
    text: 'Padre nuestro, que estás en los cielos, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad así en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
  },
  {
    id: 'PB',
    title: 'Invocación a la Preciosísima Sangre',
    img: imagePath('vitreauxCruz'),
    text: '¡Oh Preciosísima Sangre de Jesucristo! Lava mis manchas, sálvame a mí y al mundo entero. Amén.',
  },
  {
    id: 'PB_G',
    title: 'Gloria',
    img: imagePath('latinGloria'),
    text: 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
  },
  {
    id: 'PBClosing',
    title: 'Oración final',
    img: imagePath('lamb'),
    text:
      'Oh Preciosísima Sangre de mi amado Jesús, os ruego por los méritos de vuestros siete derramamientos que seáis el bálsamo de mi alma, el escudo de mi vida y la prenda de mi salvación eterna. Padre Eterno, acepta el ofrecimiento de la Sangre de vuestro Hijo por mi salvación y la del mundo entero. Amén.',
  },
];

// Nombres de los Siete Derramamientos (para mostrarlos en UI/meditación).
export const preciousBloodSevenSheddings = [
  { num: 1, title: 'La Circuncisión', img: bloodImg(0) },
  { num: 2, title: 'La Agonía en el Huerto de los Olivos', img: bloodImg(1) },
  { num: 3, title: 'La Flagelación', img: bloodImg(2) },
  { num: 4, title: 'La Coronación de Espinas', img: bloodImg(3) },
  { num: 5, title: 'El Camino del Calvario', img: bloodImg(4) },
  { num: 6, title: 'La Crucifixión y las Llagas', img: bloodImg(5) },
  { num: 7, title: 'La Lanza en el Costado', img: bloodImg(6) },
];

// ─────────────────────────────────────────────────────────────────
// 3. SIETE OFRENDAS DE LA SANGRE DE CRISTO
// ─────────────────────────────────────────────────────────────────

export const preciousBloodSevenOfferings = [
  {
    num: 1,
    title: 'Primera Ofrenda — por los pecadores',
    img: bloodImg(0),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, en unión con todas las Misas celebradas hoy en el mundo, por todas las almas, especialmente las de los pecadores más obstinados.',
  },
  {
    num: 2,
    title: 'Segunda Ofrenda — por los sacerdotes',
    img: bloodImg(1),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, en unión con todas las Misas de hoy, por las almas de los sacerdotes y religiosos, para que sean fieles a su vocación.',
  },
  {
    num: 3,
    title: 'Tercera Ofrenda — reparación',
    img: bloodImg(2),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, en reparación por mis pecados y los del mundo entero, y por las ofensas contra los Corazones de Jesús y María.',
  },
  {
    num: 4,
    title: 'Cuarta Ofrenda — por los moribundos',
    img: bloodImg(3),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, por los moribundos de hoy, para que sean asistidos por la gracia de la conversión y la perseverancia final.',
  },
  {
    num: 5,
    title: 'Quinta Ofrenda — por las almas del Purgatorio',
    img: bloodImg(4),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, por las almas del Purgatorio, especialmente las más abandonadas, para que entren pronto en la gloria eterna.',
  },
  {
    num: 6,
    title: 'Sexta Ofrenda — por la Iglesia',
    img: bloodImg(5),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, por la Santa Iglesia, el Sumo Pontífice y todos los pastores, para que sean luz del mundo y sal de la tierra.',
  },
  {
    num: 7,
    title: 'Séptima Ofrenda — por la paz del mundo',
    img: bloodImg(6),
    text:
      'Padre Eterno, os ofrezco la Preciosísima Sangre de vuestro Divino Hijo Jesús, por la conversión de los pecadores y la verdadera paz entre las naciones, conforme a las promesas de su Sagrado Corazón.',
  },
];
