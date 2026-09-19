import { imagePath } from './imageRegistry';

const lujanImg = imagePath('theotokos');
const lujanAlt = imagePath('allMary17th');
const immaculateHeartImg = imagePath('galleryMaterImmaculata');
const immaculateHeartAlt = imagePath('galleryVirgoImmaculata');
const josephImg = imagePath('earlyChristian');
const josephAlt = imagePath('byzantineArt');
const holySpiritImg = imagePath('galleryPentecost');
const holySpiritAlt = imagePath('stainedGlass');
const holySoulsImg = imagePath('galleryCathedralPraying');
const holySoulsAlt = imagePath('vitreauxCruz');

export const CORE_OPTIONAL_PRAYERS = [
  {
    id: 'lujan',
    title: 'Nuestra Señora de Luján',
    shelfLabel: 'Virgen de Luján',
    shelfTitle: 'Nuestra Señora de Luján — Patrona de la Argentina',
    badge: 'L',
    img: lujanImg,
    imgCandidates: [lujanImg, lujanAlt].filter(Boolean),
    variants: [
      {
        id: 'es',
        label: 'ES',
        text:
          'Nuestra Señora de Luján, Madre de Dios y Madre nuestra, Patrona de la Argentina: acompáñanos en el camino hacia tu Hijo.\n\nRecibe nuestras alegrías, cansancios e intenciones. Enséñanos a caminar como hermanos, a permanecer firmes en la fe y a servir con caridad.\n\nVirgen de Luján, ruega por nosotros y por nuestra patria. Amén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'Our Lady of Luján, Mother of God and our Mother, Patroness of Argentina: accompany us on the way to your Son.\n\nReceive our joys, weariness, and intentions. Teach us to walk as brothers and sisters, to remain firm in faith, and to serve with charity.\n\nOur Lady of Luján, pray for us and for our country. Amen.',
      },
    ],
  },
  {
    id: 'immaculate_heart',
    title: 'Inmaculado Corazón de María',
    shelfLabel: 'Inmaculado Corazón',
    shelfTitle: 'Inmaculado Corazón de María — Fátima',
    badge: 'CI',
    img: immaculateHeartImg,
    imgCandidates: [immaculateHeartImg, immaculateHeartAlt].filter(Boolean),
    variants: [
      {
        id: 'es',
        label: 'ES',
        text:
          'Inmaculado Corazón de María, lleno de amor a Dios y a nosotros: te confiamos nuestra oración, nuestras familias y nuestras intenciones.\n\nEnséñanos a guardar la Palabra, a reparar el pecado con amor y a permanecer junto a Jesús.\n\nCorazón Inmaculado de María, sé nuestro refugio y condúcenos a Dios. Amén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'Immaculate Heart of Mary, filled with love for God and for us: we entrust to you our prayer, our families, and our intentions.\n\nTeach us to treasure the Word, to make reparation for sin through love, and to remain close to Jesus.\n\nImmaculate Heart of Mary, be our refuge and lead us to God. Amen.',
      },
    ],
  },
  {
    id: 'st_joseph',
    title: 'San José',
    shelfLabel: 'San José',
    shelfTitle: 'San José — custodio del Redentor',
    badge: 'SJ',
    img: josephImg,
    imgCandidates: [josephImg, josephAlt].filter(Boolean),
    variants: [
      {
        id: 'es',
        label: 'ES',
        text:
          'San José, custodio de Jesús y esposo de María, protege a la Iglesia y a nuestras familias.\n\nEnséñanos tu silencio, tu obediencia y tu trabajo fiel. Intercede por quienes buscan hogar, trabajo, consuelo y una buena muerte.\n\nSan José, patrono de la Iglesia universal, ruega por nosotros. Amén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'Saint Joseph, guardian of Jesus and spouse of Mary, protect the Church and our families.\n\nTeach us your silence, obedience, and faithful work. Intercede for those seeking a home, work, consolation, and a holy death.\n\nSaint Joseph, patron of the universal Church, pray for us. Amen.',
      },
    ],
  },
  {
    id: 'holy_spirit',
    title: 'Espíritu Santo',
    shelfLabel: 'Espíritu Santo',
    shelfTitle: 'Ven, Espíritu Santo',
    badge: 'ES',
    img: holySpiritImg,
    imgCandidates: [holySpiritImg, holySpiritAlt].filter(Boolean),
    variants: [
      {
        id: 'es',
        label: 'ES',
        text:
          'Ven, Espíritu Santo, llena los corazones de tus fieles y enciende en ellos el fuego de tu amor.\n\nEnvía, Señor, tu Espíritu y todo será creado, y renovarás la faz de la tierra.\n\nOh Dios, que has iluminado los corazones de tus hijos con la luz del Espíritu Santo, haznos dóciles a sus inspiraciones y concédenos gozar siempre de su consuelo. Por Cristo nuestro Señor. Amén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'Come, Holy Spirit, fill the hearts of your faithful and kindle in them the fire of your love.\n\nSend forth your Spirit and they shall be created, and you shall renew the face of the earth.\n\nO God, who taught the hearts of the faithful by the light of the Holy Spirit, grant that by the same Spirit we may be truly wise and ever rejoice in his consolation. Through Christ our Lord. Amen.',
      },
      {
        id: 'la',
        label: 'LA',
        text:
          'Veni, Sancte Spiritus, reple tuorum corda fidelium, et tui amoris in eis ignem accende.\n\nEmitte Spiritum tuum et creabuntur. Et renovabis faciem terrae.\n\nDeus, qui corda fidelium Sancti Spiritus illustratione docuisti, da nobis in eodem Spiritu recta sapere et de eius semper consolatione gaudere. Per Christum Dominum nostrum. Amen.',
      },
    ],
  },
  {
    id: 'holy_souls',
    title: 'Fieles Difuntos',
    shelfLabel: 'Fieles Difuntos',
    shelfTitle: 'Por los fieles difuntos',
    badge: '†',
    img: holySoulsImg,
    imgCandidates: [holySoulsImg, holySoulsAlt].filter(Boolean),
    variants: [
      {
        id: 'es',
        label: 'ES',
        text:
          'Dales, Señor, el descanso eterno, y brille para ellos la luz perpetua.\n\nQue las almas de todos los fieles difuntos, por la misericordia de Dios, descansen en paz. Amén.',
      },
      {
        id: 'en',
        label: 'EN',
        text:
          'Eternal rest grant unto them, O Lord, and let perpetual light shine upon them.\n\nMay the souls of all the faithful departed, through the mercy of God, rest in peace. Amen.',
      },
      {
        id: 'la',
        label: 'LA',
        text:
          'Requiem aeternam dona eis, Domine, et lux perpetua luceat eis.\n\nFidelium animae, per misericordiam Dei, requiescant in pace. Amen.',
      },
    ],
  },
];

export const coreOptionalPrayerById = (id) =>
  CORE_OPTIONAL_PRAYERS.find((prayer) => prayer.id === id) || null;
