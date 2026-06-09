/**
 * Alternate text versions for prayers where multiple forms exist.
 * Keys match prayer ids in RosarioPrayerBook (e.g. "C" for Credo).
 */

const AVE_LATIN =
  'Ave Maria, gratia plena, Dominus tecum.\n' +
  'Benedicta tu in mulieribus,\n' +
  'et benedictus fructus ventris tui, Iesus.\n' +
  'Sancta Maria, Mater Dei,\n' +
  'ora pro nobis peccatoribus,\n' +
  'nunc et in hora mortis nostrae.\n' +
  'Amen.';

export const PRAYER_VARIANTS = {
  SC: [
    {
      id: 'es',
      label: 'Español',
      text: 'En el nombre del Padre,\ny del Hijo,\ny del Espíritu Santo.\nAmén.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text: 'In nomine Patris, et Filii, et Spiritus Sancti.\nAmen.',
    },
  ],
  P: [
    {
      id: 'es',
      label: 'Español',
      text:
        'Padre nuestro, que estás en el cielo, santificado sea tu nombre; ' +
        'venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. ' +
        'Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros ' +
        'perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text:
        'Pater noster, qui es in caelis, sanctificetur nomen tuum.\n' +
        'Adveniat regnum tuum.\n' +
        'Fiat voluntas tua, sicut in caelo, et in terra.\n' +
        'Panem nostrum cotidianum da nobis hodie.\n' +
        'Et dimitte nobis debita nostra,\n' +
        'sicut et nos dimittimus debitoribus nostris.\n' +
        'Et ne nos inducas in tentationem,\n' +
        'sed libera nos a malo.\n' +
        'Amen.',
    },
  ],
  A: [
    {
      id: 'es',
      label: 'Español',
      text:
        'Dios te salve, María,\nllena eres de gracia,\nel Señor es contigo.\n' +
        'Bendita tú eres entre todas las mujeres,\ny bendito es el fruto de tu vientre, Jesús.\n' +
        'Santa María, Madre de Dios,\nruega por nosotros, pecadores,\n' +
        'ahora y en la hora de nuestra muerte.\nAmén.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text: AVE_LATIN,
    },
  ],
  G: [
    {
      id: 'es',
      label: 'Español',
      text:
        'Gloria al Padre, y al Hijo, y al Espíritu Santo.\n' +
        'Como era en el principio, ahora y siempre,\npor los siglos de los siglos. Amén.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text:
        'Gloria Patri, et Filio, et Spiritui Sancto.\n' +
        'Sicut erat in principio, et nunc, et semper,\n' +
        'et in saecula saeculorum.\n' +
        'Amen.',
    },
  ],
  C: [
    {
      id: 'versos',
      label: 'Por versos',
      text: [
        'Creo en Dios, Padre todopoderoso,',
        'Creador del cielo y de la tierra.',
        '',
        'Creo en Jesucristo, su único Hijo, nuestro Señor,',
        'que fue concebido por obra y gracia del Espíritu Santo,',
        'nació de Santa María Virgen,',
        'padeció bajo el poder de Poncio Pilato,',
        'fue crucificado, muerto y sepultado,',
        'descendió a los infiernos,',
        'al tercer día resucitó de entre los muertos,',
        'subió a los cielos',
        'y está sentado a la derecha de Dios, Padre todopoderoso.',
        'Desde allí ha de venir a juzgar a vivos y muertos.',
        '',
        'Creo en el Espíritu Santo,',
        'la santa Iglesia católica,',
        'la comunión de los santos,',
        'el perdón de los pecados,',
        'la resurrección de la carne',
        'y la vida eterna.',
        'Amén.',
      ].join('\n'),
    },
    {
      id: 'niceno',
      label: 'Niceno',
      text: [
        'Creo en un solo Dios,',
        'Padre todopoderoso,',
        'Creador del cielo y de la tierra,',
        'de todo lo visible e invisible.',
        '',
        'Creo en un solo Señor, Jesucristo,',
        'Hijo único de Dios,',
        'nacido del Padre antes de todos los siglos:',
        'Dios de Dios, Luz de Luz,',
        'Dios verdadero de Dios verdadero,',
        'engendrado, no creado,',
        'consubstancial al Padre;',
        'por él todas las cosas fueron hechas.',
        '',
        'Por nosotros, los hombres, y por nuestra salvación',
        'bajó del cielo,',
        'y por obra del Espíritu Santo',
        'se encarnó de María, la Virgen, y se hizo hombre;',
        'y por nuestra causa fue crucificado',
        'en tiempos de Poncio Pilato;',
        'padeció y fue sepultado,',
        'y resucitó al tercer día, según las Escrituras,',
        'y subió a los cielos,',
        'y está sentado a la derecha del Padre;',
        'y de nuevo vendrá con gloria',
        'para juzgar a vivos y muertos,',
        'y su reino no tendrá fin.',
        '',
        'Creo en el Espíritu Santo, Señor y dador de vida,',
        'que procede del Padre y del Hijo,',
        'que con el Padre y el Hijo',
        'recibe una misma adoración y gloria,',
        'y que habló por los profetas.',
        '',
        'Creo en la Iglesia,',
        'que es una, santa, católica y apostólica.',
        'Confieso que hay un solo bautismo',
        'para el perdón de los pecados.',
        'Espero la resurrección de los muertos',
        'y la vida del mundo futuro.',
        'Amén.',
      ].join('\n'),
    },
    {
      id: 'breve',
      label: 'Breve',
      text:
        'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. ' +
        'Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, ' +
        'nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, ' +
        'descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado ' +
        'a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. ' +
        'Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, ' +
        'la resurrección de la carne y la vida eterna. Amén.',
    },
  ],
};

export function getPrayerVariants(prayerId) {
  return PRAYER_VARIANTS[prayerId] || null;
}

export function getVariantStorageKey(prayerId) {
  return `bookletVariant_${prayerId}`;
}
