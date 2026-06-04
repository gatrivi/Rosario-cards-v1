/**
 * Alternate text versions for prayers where multiple forms exist.
 * Keys match prayer ids in RosarioPrayerBook (e.g. "C" for Credo).
 */

export const PRAYER_VARIANTS = {
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
