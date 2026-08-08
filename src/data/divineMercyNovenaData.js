import { imagePath } from './imageRegistry';

/**
 * Novena de la Divina Misericordia — 9 días. Each day now has its own image
 * (previously all nine reused the single Faustina chaplet image). Images are
 * deliberately chosen NOT to reuse `faustinaDivinoCorazon` (the chaplet's
 * primary), so the novena reads as visually distinct.
 */
export const divineMercyNovenaDays = [
  {
    day: 1,
    title: 'Día 1',
    intentionTitle: 'Toda la humanidad, especialmente los pecadores',
    intentionText: '“Hoy, tráeme a toda la humanidad y especialmente a todos los pecadores, y sumérgelos en el mar de Mi misericordia. De esta forma Me consolarás de la amarga tristeza en que Me sumerge la pérdida de las almas.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('faustinaStainedGlass'),
  },
  {
    day: 2,
    title: 'Día 2',
    intentionTitle: 'Las almas de los sacerdotes y religiosos',
    intentionText: '“Hoy, tráeme a las almas de los sacerdotes y los religiosos, y sumérgelas en mi insondable misericordia. Ellas me dieron fuerzas para soportar mi amarga Pasión. A través de ellas, como por canales, mi misericordia fluye sobre la humanidad.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('byzantineArt'),
  },
  {
    day: 3,
    title: 'Día 3',
    intentionTitle: 'Todas las almas devotas y fieles',
    intentionText: '“Hoy, tráeme a todas las almas devotas y fieles, y sumérgelas en el océano de mi misericordia. Estas almas me consolaron en el camino del Calvario; fueron una gota de consuelo en medio de un mar de amargura.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('theotokos'),
  },
  {
    day: 4,
    title: 'Día 4',
    intentionTitle: 'Las almas de los que no conocen a Dios y de los que todavía no me conocen',
    intentionText: '“Hoy, tráeme a aquellos que no creen en Dios y a aquellos que todavía no me conocen. También pensé en ellos durante mi amarga Pasión y su futuro celo consoló mi Corazón. Sumérgelos en el mar de mi misericordia.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('earlyChristian'),
  },
  {
    day: 5,
    title: 'Día 5',
    intentionTitle: 'Las almas de los hermanos separados',
    intentionText: '“Hoy, tráeme a las almas de los hermanos separados y sumérgelas en el mar de mi misericordia. Durante mi amarga Pasión, desgarraron mi Cuerpo y mi Iglesia, es decir, mi Cuerpo Místico. A medida que regresan a la unidad de la Iglesia, mis heridas cicatrizan.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('encountersCathedral'),
  },
  {
    day: 6,
    title: 'Día 6',
    intentionTitle: 'Las almas mansas y humildes, y las de los niños pequeños',
    intentionText: '“Hoy, tráeme a las almas mansas y humildes y a las almas de los niños pequeños, y sumérgelas en mi misericordia. Estas almas son las que más se parecen a mi Corazón. Ellas me confortaron en mi amarga agonía.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('lamb'),
  },
  {
    day: 7,
    title: 'Día 7',
    intentionTitle: 'Las almas que veneran y glorifican especialmente mi misericordia',
    intentionText: '“Hoy, tráeme a las almas que veneran y glorifican mi misericordia de modo especial y sumérgelas en mi misericordia. Estas almas lamentaron más mi Pasión y penetraron más profundamente en mi espíritu.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('stainedGlass'),
  },
  {
    day: 8,
    title: 'Día 8',
    intentionTitle: 'Las almas del Purgatorio',
    intentionText: '“Hoy, tráeme a las almas que están en la cárcel del Purgatorio y sumérgelas en el abismo de mi misericordia. Que los torrentes de mi Sangre refresquen su ardor. Todas estas almas son muy queridas por mí.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('vitreauxCruz'),
  },
  {
    day: 9,
    title: 'Día 9',
    intentionTitle: 'Las almas tibias',
    intentionText: '“Hoy, tráeme a las almas tibias y sumérgelas en el abismo de mi misericordia. Estas almas son las que más dolorosamente hieren mi Corazón. Mi alma sintió la mayor repugnancia en el Huerto de los Olivos a causa de las almas tibias.”',
    closingInstruction: 'Rezar la Corona de la Divina Misericordia',
    img: imagePath('vitreauxCruz'),
  },
];
