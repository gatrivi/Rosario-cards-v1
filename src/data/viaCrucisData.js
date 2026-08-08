/**
 * Vía Crucis (14 estaciones) y Vía Lucis (14 estaciones).
 * Unique primary per station when possible (pool ≥ stations).
 * Dark/light (modooscuro) dual pairing deferred — see .docs/libro/prayer-images.md.
 */
import { imagePath } from './imageRegistry';

const DOLOR = [
  imagePath('monkDark'),
  imagePath('artSacredHot'),
  imagePath('lamb'),
  imagePath('earlyChristian'),
  imagePath('byzantineArt'),
  imagePath('encountersCathedral'),
  imagePath('stainedGlass'),
  imagePath('rosaryBeads'),
  imagePath('galleryCruzVsRoma'),
  imagePath('franciscoDeAsis'),
  imagePath('stAnthony'),
  imagePath('sain'),
  imagePath('cover'),
  imagePath('miscJpg'),
  imagePath('miscUgQlLjwl'),
].filter(Boolean);

const LUZ = [
  imagePath('galleryPentecost'),
  imagePath('faustinaStainedGlass'),
  imagePath('galleryPastor'),
  imagePath('gallerySagradoCorazon2'),
  imagePath('gallerySagradoCorazonEm'),
  imagePath('galleryAdoracion6051780745909814'),
  imagePath('galleryAdoracionAnteTuPresencia'),
  imagePath('galleryAdoracionCandlelightSilence'),
  imagePath('misc96PsRGiE'),
  imagePath('nun04'),
  imagePath('monk01'),
  imagePath('earlyChristianAlt'),
  imagePath('galleryLicensedImage'),
  imagePath('angelDeLaGuarda'),
  imagePath('rosaryBeads'),
].filter(Boolean);

function cycle(pool, i) {
  return pool[i % pool.length];
}

const CRUCIS_REFRAIN =
  'Te adoramos, Cristo, y te bendecimos, porque por tu Santa Cruz redimiste al mundo.';

const LUCIS_REFRAIN =
  'Alabado seas, Cristo resucitado, que nos conduces a la vida eterna. Aleluya.';

export const VIA_CRUCIS_STATIONS = [
  {
    n: 1,
    title: 'Jesús es condenado a muerte',
    text: `Pilato entrega a Jesús a la muerte, aunque sabe que es inocente. El inocente calla por amor a nosotros.\n\nSeñor, cuando el mundo nos juzgue injustamente, danos la paz de quien confía en el Padre.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 2,
    title: 'Jesús carga con la Cruz',
    text: `Jesús abraza la cruz como el leño de nuestra salvación. Cada paso es un sí al Padre.\n\nSeñor, ayúdanos a cargar con paciencia las cruces de cada día, sin amargura.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 3,
    title: 'Jesús cae por primera vez',
    text: `El peso del pecado del mundo hace caer al Señor. Se levanta y sigue adelante.\n\nSeñor, cuando caigamos, no nos dejes en el suelo: danos fuerza para levantarnos y continuar.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 4,
    title: 'Jesús encuentra a su Madre',
    text: `María encuentra a su Hijo en el camino del dolor. Sus miradas se unen en un mismo amor y una misma ofrenda.\n\nSanta María, enséñanos a permanecer junto a los que sufren, sin huir del dolor.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 5,
    title: 'Simón de Cirene ayuda a Jesús',
    text: `Simón es obligado a ayudar, y termina compartiendo la cruz del Señor. Dios se sirve también de lo que no elegimos.\n\nSeñor, haznos dóciles para ayudar al prójimo, aunque al principio nos cueste.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 6,
    title: 'La Verónica enjuga el rostro de Jesús',
    text: `Una mujer se acerca con valentía y enjuga el rostro ensangrentado de Jesús. Queda impresa la imagen del amor.\n\nSeñor, que tu rostro quede grabado en nuestro corazón y en nuestras obras de misericordia.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 7,
    title: 'Jesús cae por segunda vez',
    text: `De nuevo el Señor cae. El cansancio es grande, pero el amor es más fuerte.\n\nSeñor, cuando la tentación se repita, no nos abandones: renueva nuestra esperanza.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 8,
    title: 'Jesús consuela a las hijas de Jerusalén',
    text: `Jesús, en medio de su dolor, consuela a las mujeres que lloran. Piensa en nosotros hasta el final.\n\nSeñor, enséñanos a mirar el sufrimiento de los demás aunque nosotros también estemos heridos.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 9,
    title: 'Jesús cae por tercera vez',
    text: `La tercera caída parece definitiva, pero Jesús se levanta una vez más hacia el Calvario.\n\nSeñor, cuando todo parezca perdido, recuérdanos que tu gracia es suficiente.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 10,
    title: 'Jesús es despojado de sus vestiduras',
    text: `Le quitan hasta la última dignidad humana. Queda desnudo ante el mundo, pobre por nosotros.\n\nSeñor, despoja nuestro corazón de vanidad y orgullo; vístelos de humildad.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 11,
    title: 'Jesús es clavado en la Cruz',
    text: `Clavos atraviesan las manos y los pies del Salvador. Él perdona mientras lo hieren.\n\nSeñor, clava en nosotros tu amor, para que sepamos perdonar como Tú perdonas.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 12,
    title: 'Jesús muere en la Cruz',
    text: `«Todo está cumplido.» Jesús entrega su espíritu al Padre. La cruz se convierte en árbol de vida.\n\nSeñor, que tu muerte nos dé vida; que nunca olvidemos el precio de nuestra redención.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 13,
    title: 'Jesús es bajado de la Cruz',
    text: `El cuerpo de Jesús es entregado a María. La Madre acoge el silencio del Hijo muerto.\n\nSanta María, Madre de los dolores, acoge también nuestras penas y entrégalas a Dios.\n\n${CRUCIS_REFRAIN}`,
  },
  {
    n: 14,
    title: 'Jesús es puesto en el sepulcro',
    text: `Lo colocan en el sepulcro nuevo. Parece el final, pero es la espera de la resurrección.\n\nSeñor, en nuestras noches oscuras, enséñanos a esperar tu luz con fe.\n\n${CRUCIS_REFRAIN}`,
  },
];

export const VIA_LUCIS_STATIONS = [
  {
    n: 1,
    title: 'Jesús resucita de entre los muertos',
    text: `Al tercer día, Jesús vence a la muerte. La piedra es removida y la vida irrumpe en el sepulcro.\n\nSeñor resucitado, renueva en nosotros la esperanza que no muere.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 2,
    title: 'Los discípulos encuentran la tumba vacía',
    text: `Las mujeres y los discípulos hallan el sepulcro vacío. El vacío se vuelve anuncio de victoria.\n\nSeñor, cuando no entendamos tus caminos, danos fe para creer sin ver del todo.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 3,
    title: 'Jesús se aparece a María Magdalena',
    text: `Jesús llama a María por su nombre. El llanto se transforma en misión: «Ve y anuncia».\n\nSeñor, llámanos por nuestro nombre y envíanos a anunciar tu alegría.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 4,
    title: 'Jesús se aparece a los discípulos de Emaús',
    text: `En el camino, Jesús explica las Escrituras; al partir el pan, lo reconocen.\n\nSeñor, quédate con nosotros; ábrenos los ojos en la Palabra y en la Eucaristía.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 5,
    title: 'Jesús da el Espíritu Santo a los Apóstoles',
    text: `«Recibid el Espíritu Santo.» Jesús entrega la paz y el poder de perdonar.\n\nSeñor, envía tu Espíritu sobre nosotros para ser instrumentos de reconciliación.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 6,
    title: 'Jesús se aparece a Tomás',
    text: `Tomás duda, y el Señor se deja tocar. «Dichosos los que creen sin haber visto.»\n\nSeñor mío y Dios mío: fortalece nuestra fe débil y nuestra confianza herida.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 7,
    title: 'Jesús se aparece en el lago de Tiberíades',
    text: `En la orilla, Jesús prepara el fuego y el pan. La pesca abundante renueva la vocación de los suyos.\n\nSeñor, vuelve a llamarnos en lo ordinario de cada día.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 8,
    title: 'Jesús confía a Pedro el cuidado de su rebaño',
    text: `«¿Me amas?» Tres veces pregunta el Señor, y confía a Pedro sus ovejas.\n\nSeñor, que nuestro amor herido se convierta en servicio humilde a tu Iglesia.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 9,
    title: 'Jesús envía a los discípulos a evangelizar',
    text: `«Id y haced discípulos.» La misión nace de la resurrección y llega hasta los confines.\n\nSeñor, envíanos como testigos de tu Evangelio en nuestra casa y en el mundo.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 10,
    title: 'Jesús asciende al cielo',
    text: `Jesús sube al cielo y no nos deja huérfanos: promete estar con nosotros hasta el fin.\n\nSeñor, eleva nuestro corazón hacia las cosas de arriba, sin abandonar la tierra.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 11,
    title: 'María y los Apóstoles esperan al Espíritu Santo',
    text: `En el Cenáculo, unidos en oración con María, esperan el don prometido.\n\nSanta María, enséñanos a esperar al Espíritu con fe perseverante.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 12,
    title: 'El Espíritu Santo desciende en Pentecostés',
    text: `Lenguas de fuego y un viento impetuoso: la Iglesia nace misionera y valiente.\n\nEspíritu Santo, enciende en nosotros el fuego de tu amor.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 13,
    title: 'María es asunta al cielo',
    text: `María es llevada en cuerpo y alma a la gloria. Donde está la Madre, esperamos llegar.\n\nSanta María, asunta al cielo, intercede para que vivamos en esperanza de la vida eterna.\n\n${LUCIS_REFRAIN}`,
  },
  {
    n: 14,
    title: 'María es coronada Reina del cielo',
    text: `María es coronada Reina. Su reinado es servicio, ternura y cercanía a los hijos de Dios.\n\nReina del cielo, ruega por nosotros ahora y en la hora de nuestra muerte.\n\n${LUCIS_REFRAIN}`,
  },
];

const SC_CRUCIS =
  'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.\n\nComenzamos el camino de la cruz con Jesús. Que cada estación nos una más a su amor redentor.';
const SC_LUCIS =
  'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.\n\nCaminamos en la luz del Resucitado. Que cada estación renueve nuestra fe y nuestra alegría. Aleluya.';

function buildStationSteps(stations, pool, prefix, opening, openPreferred = null) {
  const claimed = new Set();
  const take = (preferred) => {
    const pick = preferred && !claimed.has(preferred)
      ? preferred
      : pool.find((u) => u && !claimed.has(u)) || preferred || pool[0];
    if (pick) claimed.add(pick);
    return pick;
  };
  const crossImg = take(openPreferred || pool[0]);
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
    const img = take(cycle(pool, i));
    steps.push({
      id: `${prefix}_${st.n}`,
      title: `Estación ${st.n} — ${st.title}`,
      // ponytail: title is UI-only; keep text speakable for TTS without re-reading the station name
      text: st.text,
      img,
      imgCandidates: [img],
    });
  });
  return steps;
}

export function buildViaCrucisSequence() {
  return buildStationSteps(
    VIA_CRUCIS_STATIONS,
    DOLOR,
    'VC',
    { title: 'Vía Crucis', text: SC_CRUCIS },
    imagePath('vitreauxCruz')
  );
}

export function buildViaLucisSequence() {
  return buildStationSteps(
    VIA_LUCIS_STATIONS,
    LUZ,
    'VL',
    { title: 'Vía Lucis', text: SC_LUCIS },
    imagePath('galleryPentecost')
  );
}
