import { imagePath } from './imageRegistry';

const angelImg = imagePath('angelDeLaGuarda');
const benedictImg = imagePath('sanctusBenedictus');
const benedictLatinImg = imagePath('latinSanBenito');

export const OPTIONAL_PRAYERS = [
  {
    id: 'guardian',
    title: 'Ángel de la Guarda',
    img: angelImg,
    imgCandidates: [angelImg].filter(Boolean),
    variants: [
      {
        // Default: the rhymed Spanish form the user prefers.
        id: 'es_dulce',
        label: 'ES rima',
        text:
          'Ángel de mi guarda,\ndulce compañía,\nno me desampares,\nni de noche ni de día.\n\nHasta que me pongas\nen paz y alegría,\ncon todos los santos,\nJesús, José y María.\n\nAmén.',
      },
      {
        id: 'es',
        label: 'ES',
        text:
          'Ángel de Dios, que eres mi guardián, porque el Señor me ha confiado a tu custodia, ilumíname, guárdame, rígeme y gobiérname. Amén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'Angel of God, my guardian dear, to whom God’s love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.',
      },
      {
        id: 'la',
        label: 'LA',
        text:
          'Angele Dei, qui custos es mei, me tibi commissum pietate superna; illumina, custodi, rege et guberna. Amen.',
      },
    ],
  },
  {
    id: 'benedict',
    title: 'San Benito',
    img: benedictImg,
    imgCandidates: [benedictImg, benedictLatinImg].filter(Boolean),
    variants: [
      {
        id: 'la',
        label: 'LA',
        text:
          'Crux sancti patris Benedicti.\nCrux mihi lux!\nNon draco sit mihi dux!\nVade retro Satana!\nNunquam suade mihi vana!\nSunt mala quae libas.\nIpse venena bibas!\nAmen.',
      },
      {
        id: 'es',
        label: 'ES',
        text:
          'La cruz del Santo Padre Benedicto sea mi luz.\n¡No sea el dragón mi guía!\n¡Retírate, Satanás!\n¡Nunca me sugieras vanidades!\nLo que ofreces es malo.\n¡Bebe tú mismo el veneno!\nAmén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'The cross of Holy Father Benedict be my light.\nLet not the dragon be my guide!\nBegone, Satan!\nNever tempt me with vanities!\nWhat you offer is evil.\nDrink the poison yourself!\nAmen.',
      },
    ],
  },
];

export const optionalPrayerThumbnail = (id) => {
  const p = OPTIONAL_PRAYERS.find((x) => x.id === id);
  return p?.img || p?.imgCandidates?.[0] || null;
};
