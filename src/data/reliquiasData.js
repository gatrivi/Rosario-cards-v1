/**
 * Reliquario — relic/icon cards of the saints, earned by prayer.
 * Unlock currency = lifetime Ave Marías (same as Camino peregrinaciones),
 * so no extra state: progress derives from useAveMariaStats + cloud sync.
 * Thresholds: early dopamine (50/200/300) then aligned with the Camino
 * milestones in LevelConfig.PEREGRINACIONES.
 */

export const RELIQUIAS = [
  {
    id: 'medalla-san-benito',
    nombre: 'Medalla de San Benito',
    tipo: 'medalla',
    santo: 'San Benito de Nursia (480–547)',
    imgId: 'sanctusBenedictus',
    reqAveMarias: 50,
    historia:
      'Padre del monaquismo occidental. Su medalla es, desde 1742, el sacramental más temido por el maligno: la cruz del santo es escudo y exorcismo.',
    virtud: 'Escudo contra el mal',
    oracion: {
      titulo: 'Crux Sacra',
      lineas: [
        'Crux sacra sit mihi lux,',
        'non draco sit mihi dux.',
        'La Cruz sea mi luz,',
        'que el dragón no sea mi guía. Amén.',
      ],
    },
  },
  {
    id: 'mandylion-rostro-santo',
    nombre: 'Mandylion — Rostro Santo',
    tipo: 'icono',
    santo: 'Icono no hecho por manos humanas',
    imgId: 'christFace',
    reqAveMarias: 200,
    historia:
      'El lienzo con el Rostro de Cristo enviado a Edesa. Tradición de los iconos "aqueiropoietos": la imagen que Cristo dejó de sí mismo como consuelo.',
    virtud: 'Mirada de Cristo',
    oracion: {
      titulo: 'Rostro Santo',
      lineas: [
        'Rostro Santo de Jesús,',
        'imprímete en mi alma,',
        'para que al mirarte',
        'me vuelva semejante a Ti. Amén.',
      ],
    },
  },
  {
    id: 'santa-teresita',
    nombre: 'Rosa de Carmelo',
    tipo: 'icono',
    santo: 'Santa Teresita del Niño Jesús (1873–1897)',
    imgId: 'santaTeresita',
    reqAveMarias: 300,
    historia:
      'Carmelita de Lisieux, Doctora de la Iglesia. Prometió "pasar su cielo derramando una lluvia de rosas" sobre la tierra. Patrona de las misiones sin salir de su claustro.',
    virtud: 'Lluvia de rosas',
    oracion: {
      titulo: 'Petición a Santa Teresita',
      lineas: [
        'Santa Teresita del Niño Jesús,',
        'flor de Carmelo, prometiste',
        'derramar una lluvia de rosas.',
        'Rogá al Señor por nosotros. Amén.',
      ],
    },
  },
  {
    id: 'reliquia-san-pedro',
    nombre: 'Reliquia de San Pedro',
    tipo: 'reliquia',
    santo: 'San Pedro, Apóstol († ca. 64)',
    imgId: 'saintPeterRelic',
    reqAveMarias: 1000,
    historia:
      'Pescador hecho roca de la Iglesia. Bajo el altar mayor de San Pedro en Roma descansan sus huesos, hallados en las excavaciones de las Grutas Vaticanas.',
    virtud: 'Firmeza en la fe',
    oracion: {
      titulo: 'Tu es Petrus',
      lineas: [
        'Tú eres Pedro,',
        'y sobre esta piedra edificaré mi Iglesia.',
        'San Pedro, apóstol y pastor,',
        'rogá por nosotros. Amén.',
      ],
    },
  },
  {
    id: 'virgen-de-lujan',
    nombre: 'Virgen de Luján',
    tipo: 'icono',
    santo: 'Nuestra Señora de Luján, Patrona de Argentina',
    imgId: 'virgenDeLujan',
    reqAveMarias: 3000,
    historia:
      'La carreta que traía su imagen se detuvo en Luján y no quiso seguir: María elegía quedarse. Cada octubre, millones caminan a su santuario.',
    virtud: 'Madre de los peregrinos',
    oracion: {
      titulo: 'A la Virgen de Luján',
      lineas: [
        '¡Oh Virgen de Luján,',
        'Madre de la Patria y de los peregrinos!',
        'Guiános por el camino de tu Hijo',
        'hasta la casa del Padre. Amén.',
      ],
    },
  },
  {
    id: 'san-luis-montfort',
    nombre: 'Esclavitud de Jesús en María',
    tipo: 'reliquia',
    santo: 'San Luis María Grignion de Montfort (1673–1716)',
    imgId: 'sanLuisMontfort',
    reqAveMarias: 3600,
    historia:
      'Misionero y apóstol del Rosario: lo predicaba en las aldeas con procesiones que duraban días. Su Tratado de la Verdadera Devoción marcó a Juan Pablo II.',
    virtud: 'Apostolado del Rosario',
    oracion: {
      titulo: 'Totus Tuus',
      lineas: [
        'Totus tuus ego sum,',
        'et omnia mea tua sunt.',
        'Todo mío es tuyo, oh María,',
        'y todo tuyo es mío. Amén.',
      ],
    },
  },
  {
    id: 'san-francisco-asis',
    nombre: 'Hábito de San Francisco',
    tipo: 'reliquia',
    santo: 'San Francisco de Asís (1181–1226)',
    imgId: 'franciscoDeAsis',
    reqAveMarias: 7000,
    historia:
      'El pobre de Asís que abrazó al leproso y recibió los estigmas en La Verna. Su Camino — Florencia a Asís — sigue hollado de peregrinos.',
    virtud: 'Paz y pobreza',
    oracion: {
      titulo: 'Oración de San Francisco',
      lineas: [
        'Señor, hazme instrumento de tu paz;',
        'donde haya odio, siembre yo amor;',
        'donde haya ofensa, perdón;',
        'donde haya tinieblas, luz. Amén.',
      ],
    },
  },
  {
    id: 'santa-faustina',
    nombre: 'Cuaderno de la Misericordia',
    tipo: 'reliquia',
    santo: 'Santa Faustina Kowalska (1905–1938)',
    imgId: 'faustinaStainedGlass',
    reqAveMarias: 8000,
    historia:
      'Apóstola de la Divina Misericordia. De su obediencia a Jesús nacieron la Coronilla, la imagen y la fiesta del Domingo de Misericordia.',
    virtud: 'Confianza absoluta',
    oracion: {
      titulo: 'Oh Sangre y Agua',
      lineas: [
        'Oh Sangre y Agua que brotaste',
        'del Corazón de Jesús como fuente de misericordia:',
        'en Ti confío. Jesús, en Ti confío. Amén.',
      ],
    },
  },
  {
    id: 'san-antonio-padua',
    nombre: 'Lengua de San Antonio',
    tipo: 'reliquia',
    santo: 'San Antonio de Padua (1195–1231)',
    imgId: 'stAnthony',
    reqAveMarias: 19000,
    historia:
      'Predicador incansable, "martillo de los herejes". Su lengua se halló incorrupta 32 años después de su muerte: la palabra que nunca se gastó.',
    virtud: 'Palabra que perdura',
    oracion: {
      titulo: 'Si quaeris miracula',
      lineas: [
        'Si buscas milagros, oh Antonio,',
        'mira al que perdió la vida en el mundo',
        'y no perdió nada del cielo.',
        'Rogá por nosotros. Amén.',
      ],
    },
  },
  {
    id: 'san-elias',
    nombre: 'Manto de Elías',
    tipo: 'reliquia',
    santo: 'San Elías el Tesbite, s. IX a.C.',
    imgId: 'eliasProfeta',
    reqAveMarias: 40000,
    historia:
      'El profeta del celo por Yahvé, llevado al cielo en un torbellino. Padre espiritual de los carmelitas, que viven bajo su manto y su cueva del Horeb.',
    virtud: 'Celo por la gloria de Dios',
    oracion: {
      titulo: 'A San Elías',
      lineas: [
        'San Elías, profeta celoso',
        'y padre de los carmelitas,',
        'desperta en nuestras almas el celo',
        'por la gloria de Dios. Amén.',
      ],
    },
  },
  {
    id: 'corona-de-espinas',
    nombre: 'Corona de Espinas',
    tipo: 'reliquia',
    santo: 'Reliquia de la Pasión — Notre-Dame, París',
    imgId: 'coronaDeEspinas',
    reqAveMarias: 50000,
    historia:
      'La corona que los soldados tejieron para el Rey de los judíos. Traída de Jerusalén a París por San Luis, rey de Francia, en 1239.',
    virtud: 'Coraje en la prueba',
    oracion: {
      titulo: 'A Jesús coronado',
      lineas: [
        'Oh Jesús, Rey coronado de espinas,',
        'hazme llevar con amor las espinas de mi vida,',
        'unidas a Tu Corazón. Amén.',
      ],
    },
  },
  {
    id: 'madre-de-dolores',
    nombre: 'Siete Dolores de María',
    tipo: 'icono',
    santo: 'Nuestra Señora de los Dolores',
    imgId: 'maryCarmen',
    reqAveMarias: 100000,
    historia:
      'La Virgen al pie de la Cruz: "junto a la cruz de Jesús estaba su Madre". Su corazón traspasado es el icono del amor que no huye.',
    virtud: 'Perseverancia al pie de la Cruz',
    oracion: {
      titulo: 'Stabat Mater',
      lineas: [
        'Oh María, Madre de los Dolores,',
        'junto a la Cruz enséñanos a permanecer,',
        'y convertí nuestras lágrimas en fuentes. Amén.',
      ],
    },
  },
];

/** Resolve unlock state of every relic for a lifetime Ave María count. */
export function resolverReliquias(totalAveMarias) {
  return RELIQUIAS.map((reliquia) => {
    const desbloqueada = totalAveMarias >= reliquia.reqAveMarias;
    return {
      reliquia,
      desbloqueada,
      faltan: desbloqueada ? 0 : reliquia.reqAveMarias - totalAveMarias,
    };
  });
}

/** Prayer text as a single string (lines joined with \n; render with pre-line). */
export function oracionTexto(reliquia) {
  return reliquia.oracion.lineas.join('\n');
}
