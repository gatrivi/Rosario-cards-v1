/**
 * Vía Crucis (14 estaciones) y Vía Lucis (14 estaciones).
 * Imágenes provisionales: misterios dolorosos / luminosos + registry.
 */
import { imagePath } from './imageRegistry';

const DOLOR = [
  '/gallery-images/misterios/misteriodolor1.jpg',
  '/gallery-images/misterios/misteriodolor2.jpg',
  '/gallery-images/misterios/misteriodolor3.jpg',
  '/gallery-images/misterios/misteriodolor4.jpg',
  '/gallery-images/misterios/misteriodolor5.jpg',
];
const LUZ = [
  '/gallery-images/misterios/misterioLUZ1.jpg',
  '/gallery-images/misterios/misterioLUZ2.jpg',
  '/gallery-images/misterios/misterioLUZ3.jpg',
  '/gallery-images/misterios/misterioLUZ4.jpg',
  '/gallery-images/misterios/misterioLUZ5.jpg',
];

function cycle(pool, i) {
  return pool[i % pool.length];
}

export const VIA_CRUCIS_STATIONS = [
  { n: 1, title: 'Jesús es condenado a muerte', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 2, title: 'Jesús carga con la Cruz', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 3, title: 'Jesús cae por primera vez', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 4, title: 'Jesús encuentra a su Madre', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 5, title: 'Simón de Cirene ayuda a Jesús', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 6, title: 'La Verónica enjuga el rostro de Jesús', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 7, title: 'Jesús cae por segunda vez', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 8, title: 'Jesús consuela a las hijas de Jerusalén', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 9, title: 'Jesús cae por tercera vez', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 10, title: 'Jesús es despojado de sus vestiduras', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 11, title: 'Jesús es clavado en la Cruz', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 12, title: 'Jesús muere en la Cruz', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 13, title: 'Jesús es bajado de la Cruz', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
  { n: 14, title: 'Jesús es puesto en el sepulcro', text: 'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.' },
];

export const VIA_LUCIS_STATIONS = [
  { n: 1, title: 'Jesús resucita de entre los muertos', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 2, title: 'Los discípulos encuentran la tumba vacía', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 3, title: 'Jesús se aparece a María Magdalena', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 4, title: 'Jesús se aparece a los discípulos de Emaús', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 5, title: 'Jesús da el Espíritu Santo a los Apóstoles', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 6, title: 'Jesús se aparece a Tomás', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 7, title: 'Jesús se aparece en el lago de Tiberíades', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 8, title: 'Jesús confía a Pedro el cuidado de su rebaño', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 9, title: 'Jesús envía a los discípulos a evangelizar', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 10, title: 'Jesús asciende al cielo', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 11, title: 'María y los Apóstoles esperan al Espíritu Santo', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 12, title: 'El Espíritu Santo desciende en Pentecostés', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 13, title: 'María es asunta al cielo', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
  { n: 14, title: 'María es coronada Reina del cielo', text: 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.' },
];

const SC_CRUCIS = 'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.';
const SC_LUCIS = 'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.';

function buildStationSteps(stations, pool, prefix, opening) {
  const crossImg = imagePath('vitreauxCruz') || imagePath('crux') || cycle(pool, 0);
  const steps = [
    {
      id: `${prefix}_OPEN`,
      title: opening.title,
      text: opening.text,
      img: crossImg,
      imgCandidates: [crossImg],
    },
  ];
  stations.forEach((st, i) => {
    const img = cycle(pool, i);
    steps.push({
      id: `${prefix}_${st.n}`,
      title: `Estación ${st.n} — ${st.title}`,
      text: `${st.title}\n\n${st.text}`,
      img,
      imgCandidates: [img],
    });
  });
  return steps;
}

export function buildViaCrucisSequence() {
  return buildStationSteps(VIA_CRUCIS_STATIONS, DOLOR, 'VC', {
    title: 'Vía Crucis',
    text: SC_CRUCIS,
  });
}

export function buildViaLucisSequence() {
  return buildStationSteps(VIA_LUCIS_STATIONS, LUZ, 'VL', {
    title: 'Vía Lucis',
    text: SC_LUCIS,
  });
}
