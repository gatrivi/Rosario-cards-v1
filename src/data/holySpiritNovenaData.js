/**
 * Novena al Espíritu Santo — 9 days leading to Pentecost.
 *
 * Each day pairs the antiphon of *Veni Creator Spiritus* (attributed to Rabanus
 * Maurus, s. IX) with a single intention. Only the antiphon is quoted — it is
 * the line the novena is traditionally built around, and it is repeated daily by
 * design, so it carries one guide clip.
 *
 * Images deliberately avoid `galleryPentecost` (the header thumb) so the days
 * read as visually distinct.
 */
import { imagePath } from './imageRegistry';

/** The antiphon — the same words all nine days. */
export const VENI_ANTIPHON = {
  id: 'ES_ANTIPHON',
  title: 'Ven, Espíritu Santo',
  text:
    'Ven, Espíritu Santo, llena los corazones de tus fieles, y enciende en ellos la llama de tu amor.',
  variants: [
    {
      id: 'es',
      label: 'Español',
      text:
        'Ven, Espíritu Santo, llena los corazones de tus fieles, y enciende en ellos la llama de tu amor.',
    },
    {
      id: 'en',
      label: 'English',
      text:
        'Come, Holy Spirit, fill the hearts of your faithful, and kindle in them the fire of your love.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text:
        'Veni, Creator Spiritus, mentes fidelium tuorum visita: imple superna gratia, quae tu creasti pectora.',
    },
  ],
};

export const holySpiritNovenaDays = [
  {
    day: 1,
    intentionTitle: 'La Iglesia',
    intentionText:
      'Pedimos que el Espíritu Santo santifique a su Iglesia, la guarde en la verdad y le devuelva ' +
      'el fervor de sus primera caridad.',
    img: imagePath('encountersCathedral'),
  },
  {
    day: 2,
    intentionTitle: 'La misión',
    intentionText:
      'Pedimos el celo de anunciar a Jesucristo: que el Espíritu Santo derrame sobre la Iglesia el ' +
      'ardiente deseo de llegar hasta los confines de la tierra.',
    img: imagePath('byzantineArt'),
  },
  {
    day: 3,
    intentionTitle: 'La verdad',
    intentionText:
      'Pedimos la luz de la verdad: que el Espíritu Santo ilumine a los que buscan, sostenga a los ' +
      'que dudan y confirme en la fe a los que ya creen.',
    img: imagePath('stainedGlass'),
  },
  {
    day: 4,
    intentionTitle: 'La caridad',
    intentionText:
      'Pedimos el don de caridad: que el Espíritu Santo esconda a los creyentes en sí mismos y los ' +
      'vuelva capaces de amar como Cristo los amó.',
    img: imagePath('vitreauxCruz'),
  },
  {
    day: 5,
    intentionTitle: 'Los que sufren',
    intentionText:
      'Pedimos consuelo: que el Espíritu Santo esté cerca de los que sufren, de los enfermos y de ' +
      'los moribundos, y les conceda su paz.',
    img: imagePath('christFace'),
  },
  {
    day: 6,
    intentionTitle: 'Los jóvenes',
    intentionText:
      'Pedimos renovación: que el Espíritu Santo renueve el corazón de los jóvenes y les dé valor ' +
      'para elegir la vida de gracia y no la de la vanidad.',
    img: imagePath('santaTeresita'),
  },
  {
    day: 7,
    intentionTitle: 'Las familias',
    intentionText:
      'Pedimos unidad: que el Espíritu Santo reinstale la concordia en los hogares y convierta cada ' +
      'casa en una morada de paz y de oración.',
    img: imagePath('mary01'),
  },
  {
    day: 8,
    intentionTitle: 'Los que sirven',
    intentionText:
      'Pedimos santidad en el servicio: que el Espíritu Santo consagre la vida de los religiosos y de ' +
      'todos los que se donan al prójimo.',
    img: imagePath('sanctusBenedictus'),
  },
  {
    day: 9,
    intentionTitle: 'Pentecostés',
    intentionText:
      'Hoy es el día del Espíritu Santo. Pedimos que descienda sobre nosotros como descendió sobre los ' +
      'apóstoles, y que de su plenitud recibamos fuerza para toda la misión.',
    img: imagePath('galleryCathedralPraying'),
  },
];

/** The day-intention step, resolved from the selected day. */
export const SPIRIT_DAY_INTENTION = 'ES_DAY_INTENTION';

export function getSpiritNovenaDay(day) {
  return holySpiritNovenaDays.find((d) => d.day === day) || holySpiritNovenaDays[0];
}

export { getImage } from './imageRegistry';
