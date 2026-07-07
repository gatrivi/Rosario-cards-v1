import { imagePath } from './imageRegistry';

export const SAGRADO_CORAZON_ADORACION_ID = 'sagrado_corazon_adoracion';

/** Header thumb only — existing sacred-heart tagged asset. */
export const sagradoCorazonAdoracionThumbnail = imagePath('faustinaDivinoCorazon');

const LITANY_RESPONSE = 'Te rogamos, óyenos.';

/** 33 invocations — folleto OCR + verificación aciprensa.com/Oracion/letaniassc.htm */
const LITANY_INVOCATIONS = [
  'Corazón de Jesús, Hijo del Padre Eterno',
  'Corazón de Jesús, formado en el seno de la Virgen Madre por el Espíritu Santo',
  'Corazón de Jesús, al Verbo de Dios substancialmente unido',
  'Corazón de Jesús, de majestad infinita',
  'Corazón de Jesús, Templo santo de Dios',
  'Corazón de Jesús, Tabernáculo del Altísimo',
  'Corazón de Jesús, Casa de Dios y puerta del cielo',
  'Corazón de Jesús, Horno ardiente de caridad',
  'Corazón de Jesús, Santuario de justicia y de amor',
  'Corazón de Jesús, lleno de bondad y de amor',
  'Corazón de Jesús, Abismo de todas las virtudes',
  'Corazón de Jesús, digno de toda alabanza',
  'Corazón de Jesús, Rey y centro de todos los corazones',
  'Corazón de Jesús, en que están escondidos todos los tesoros de la sabiduría y de la ciencia',
  'Corazón de Jesús, en que mora toda la plenitud de la divinidad',
  'Corazón de Jesús, en que el Padre se agradó',
  'Corazón de Jesús, de cuya plenitud todos nosotros hemos recibido',
  'Corazón de Jesús, deseo de los eternos collados',
  'Corazón de Jesús, paciente y muy misericordioso',
  'Corazón de Jesús, liberal con todos los que te invocan',
  'Corazón de Jesús, fuente de vida y de santidad',
  'Corazón de Jesús, propiciación por nuestros pecados',
  'Corazón de Jesús, colmado de oprobios',
  'Corazón de Jesús, desgarrado por nuestros pecados',
  'Corazón de Jesús, hecho obediente hasta la muerte',
  'Corazón de Jesús, con lanza traspasado',
  'Corazón de Jesús, fuente de todo consuelo',
  'Corazón de Jesús, vida y resurrección nuestra',
  'Corazón de Jesús, paz y reconciliación nuestra',
  'Corazón de Jesús, víctima por nuestros pecados',
  'Corazón de Jesús, salvación de los que en Ti esperan',
  'Corazón de Jesús, esperanza de los que en Ti mueren',
  'Corazón de Jesús, delicias de todos los Santos',
];

const sacredHeartLitanyVerses = LITANY_INVOCATIONS.map((invocation) => ({
  invocation,
  response: LITANY_RESPONSE,
}));

const sacredHeartLitanySections = [
  { name: 'Invocaciones al Sagrado Corazón (I)', start: 0, end: 17, total: 18 },
  { name: 'Invocaciones al Sagrado Corazón (II)', start: 18, end: 32, total: 15 },
];

const ORACION_TIEMPO_TEXT = `Señor te he dirigido frecuentemente una oración
decididamente sin sentido:
te he pedido tiempo.
Mi jornada de veinticuatro horas, no me basta.
Necesito al menos seis horas más
para responder a todas las llamadas,
atender a los compromisos,
despachar el trabajo retrasado,
responder puntualmente a las cartas.

Dame la fuerza, Señor, el coraje,
la libertad, para realizar este gesto alocado.
Entonces estoy seguro de que
no volveré a decir la acostumbrada excusa:
"No tengo tiempo"
Podré por el contrario, declarar en tono triunfal:
"¡Tengo Tiempo!"
Tiempo para hacer las cosas adecuadas,
de la manera adecuada, con el corazón adecuado.
Señor, quítame tiempo.
No vendré a quejarme por ello,
por el contrario, te daré las gracias.
Porque el tiempo que me queda,
será un tiempo totalmente diferente.

Solo ahora me doy cuenta
de lo equivocado de aquella oración
Que desfachatez y que presunción,
perdóname, Señor.
El tiempo que me has dado,
es más que suficiente, lo reconozco,
suficiente para hacer aquellas cosas
que Tú esperas de mí
y para hacerlas bien.

No se trata de tener más tiempo a disposición,
sino de tener más ideales a disposición
para llenar de significado el tiempo que poseo.
Deseo más bien que mi tiempo sea más rico de tu amor.
Para eso, te autorizo, Señor
a que me quites tiempo.
Esta es mi petición, opuesta a la anterior.
Te pido que me quites horas,
de las veinticuatro que tengo a mi disposición.
Dos, tres, incluso, seis al menos.
Como quieras mejor.
Que hermosura, Señor,
unas cuantas horas tomadas de lo necesario,
no de lo superfluo de la jornada, y destinado a Ti.
Poder anunciar: Me faltan seis horas al día,
porque las he "despilfarrado" en oración.

(P. Alessandro Pronzato)`;

/** Salmo 116 (numeración Vulgata) — folleto + Biblia litúrgica (franciscanos.org/oracion/salmo116.htm) */
const SALMO_116_TEXT = `Alabad al Señor, todas las naciones, aclamadlo, todos los pueblos.

Firme es su misericordia con nosotros, su fidelidad dura para siempre.`;

export const SAGRADO_CORAZON_ADORACION_STEPS = [
  {
    id: 'SCA_EXPO',
    type: 'reading',
    title: 'Exposición del Santísimo Sacramento',
    subtitle: 'Solemnidad del Sagrado Corazón de Jesús',
    text: 'ADORACIÓN EUCARÍSTICA\nSolemnidad del Sagrado Corazón de Jesús',
    imageHint: 'Custodia / Santísimo Sacramento',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_HYMN_CANTEMOS',
    type: 'hymn',
    title: 'Cantemos al Amor de los amores',
    text: '[Canto: Cantemos al Amor de los amores — letra pendiente por derechos]\n\nDel Valle – Sagastizábal, 1911.\nCante la asamblea según la costumbre de la parroquia.',
    imageHint: 'Jesús Eucaristía',
    copyrightStatus: 'restricted',
  },
  {
    id: 'SCA_HYMN_LAUDATE',
    type: 'hymn',
    title: 'Laudate omnes gentes',
    text: '[Canto: Laudate omnes gentes — letra pendiente por derechos]\n\nTaizé.\nCante la asamblea según la costumbre de la parroquia.',
    imageHint: 'Iglesia / adoración eucarística',
    copyrightStatus: 'restricted',
  },
  {
    id: 'SCA_ORACION_INICIAL',
    type: 'prayer',
    title: 'Oración inicial',
    text: `Señor Mío y Dios Mío,
creo firmemente que estás aquí,
que me ves, que me oyes,
Te adoro con profunda reverencia,
te pido perdón de mis pecados
y gracia para hacer con fruto este rato de oración.
Madre Mía Inmaculada, San José mi padre y señor,
Ángel de mi Guarda, interceded por mi. Amén.

(San Josemaría Escrivá)`,
    imageHint: 'Jesús Eucaristía',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_CONTRICION',
    type: 'prayer',
    title: 'Acto de Contrición',
    text: `O bone Jesu, o dulcissime Jesu, o piisime Jesu:
Miserere nobis.
Oh Buen Jesús, oh dulcísimo Jesús, oh piadosísimo Jesús:
Ten piedad de nosotros.`,
    imageHint: 'Sagrado Corazón de Jesús',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_O_BONE_JESU',
    type: 'prayer',
    title: 'Oh Buen Jesús',
    text: `Oh, dulcísimo Jesús que,
oculto bajo el velo eucarístico,
escuchas piadoso nuestra humilde súplica
para presentarla ante el trono del Altísimo,
acepta ahora benignamente
los ardientes anhelos de nuestro corazón.

Ilumina nuestra inteligencia,
dirige nuestra voluntad,
revigoriza nuestra constancia,
y enciende en nuestro corazón la llama de un santo entusiasmo,
a fin de que, superando nuestra debilidad y venciendo toda adversidad,
sepamos rendirte un homenaje
menos indigno de tu grandeza y majestad,
más adecuado a nuestras ansias y a nuestros santos deseos.
(PP. Pío XII)
Amén.

ACTO DE FE:

¡Oh Buen Jesús! yo creo firmemente que por mi bien estás en el altar,
que das tu Cuerpo y Sangre juntamente al alma fiel en celestial manjar.

ACTO DE COMUNIÓN:

Dulce maná y celestial comida, gozo y salud de quien te come bien,
ven sin tardar, mi Dios, mi Luz, mi Vida, desciende a mí, hasta mi pecho ven.

ACTO DE ESPERANZA:

Espero en Ti, piadoso Jesús mío, oigo tu voz que dice: ¡ven a mí!
Porque eres fiel, por eso en ti confío: todo, Señor, espérolo de ti.`,
    imageHint: 'Corazón traspasado',
    copyrightStatus: 'unknown',
  },
  {
    id: 'SCA_LITANY',
    type: 'litany',
    title: 'Letanías al Sagrado Corazón',
    response: 'R. Te rogamos, óyenos.',
    text: `R. Te rogamos, óyenos. (Cantor)\n\n${LITANY_INVOCATIONS.join(',\n')}.`,
    verses: sacredHeartLitanyVerses,
    sections: sacredHeartLitanySections,
    imageHint: 'Sagrado Corazón de Jesús',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_INV_NOBLE',
    type: 'invocation',
    title: 'Dame, Señor, un noble corazón',
    response: 'R. Dame, Señor, un noble corazón.',
    text: `R. Dame, Señor, un noble corazón.
1. Oh Cristo, para poder servirte mejor…
2. Un corazón fuerte, para aspirar por altos ideales y no por opciones mediocres.
3. Un corazón generoso en el trabajo, viendo en él un medio de santificación.
4. Un corazón grande para el sufrimiento, siendo valiente ante mi propia cruz.
5. Un corazón grande para con el mundo, siendo comprensivo con sus fragilidades pero fuerte ante sus seducciones.
6. Un corazón grande para los hombres, leal y atento para con todos.
7. Un corazón especialmente servicial y delicado con los pequeños y humildes.
8. Un corazón nunca centrado sobre mí, siempre apoyado en ti.
9. Un corazón feliz de servirte y servir a mis hermanos todos los días de mi vida.`,
    imageHint: 'Cristo Buen Pastor',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_ORACION_TIEMPO',
    type: 'prayer',
    title: 'Señor, quítame tiempo',
    text: ORACION_TIEMPO_TEXT,
    imageHint: 'Sagrado Corazón de Jesús',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_INV_IMITAR',
    type: 'invocation',
    title: 'Queremos imitarte, Señor',
    response: 'R. Queremos imitarte, Señor.',
    text: `R. Queremos imitarte, Señor.
1. Nos has mostrado con tu ejemplo, Señor, que es posible vivir para los demás.
2. Tu vida es un espejo fiel donde mirarnos, para descubrir cuánto nos falta cambiar.
3. Tu vida es un espejo fiel donde mirarnos, para descubrir cuánto todavía podemos dar a los demás.
4. Tú saliste a recorrer los caminos para ir al encuentro del necesitado y el excluido.
5. Tú acogiste a los despreciados y a los que todos marginaban y dejaban a un costado.
6. Tú atendiste las necesidades del pueblo y sanaste sus enfermedades.
7. Tú les enseñaste a compartir el pan.
8. Tú les enseñaste a vivir unidos.
9. Tú ofreciste tu vida hasta el final, hasta entregarla por amor.
10. Tú ofreciste tu vida para que podamos alcanzar la vida verdadera.
11. Señor del servicio, muéstranos el camino que lleva a darlo todo por los demás.`,
    imageHint: 'Cristo Buen Pastor',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_LECTURA',
    type: 'reading',
    title: 'Mateo 20, 25-28',
    subtitle: 'Lectura Bíblica',
    text: `Jesús llamó a sus discípulos y les dijo: «Ustedes saben que los jefes de las naciones dominan sobre ellas y los poderosos les hacen sentir su autoridad. Entre ustedes no debe suceder así. Al contrario, el que quiera ser grande, que se haga servidor de ustedes; y el que quiera ser el primero que se haga su esclavo: como el Hijo del hombre, que no vino para ser servido, sino para servir y dar su vida en rescate por muchos». Palabra de Dios.

Gustate et videte quoniam suavis est Dominus.
(Gustad y ved cuan suave es el Señor)

En esto reconocerán que son todos discípulos míos:
si ustedes se aman como los he amado yo.`,
    imageHint: 'Cristo Buen Pastor',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_PETICIONES',
    type: 'petition',
    title: 'Señor, escúchanos',
    response: 'R. Señor, escúchanos.',
    text: `R. Señor, escúchanos. (Cantor)
1. Otorga a nuestro Santo Padre Francisco valentía para defender la fe. R.
2. Otorga a nuestra Pastor Jorge, sabiduría, firmeza y fidelidad. R.
3. Otorga a tu Iglesia, numerosos y santos ministros del altar. R.
4. Otorga a todos los bautizados hambre y sed de tu Cuerpo. R.
5. Otorga a los hombres pecadores un fuerte deseo de conversión y perdón. R.
6. Otorga a estos servidores tuyos, la gracia de servir a sus hermanos con paciencia y amor. R.
7. Otórganos a todos, la experiencia y consuelo de sabernos y sentirnos amados por Ti. R.
8. Enséñanos a escuchar tu Voz y seguir tu Voluntad. R.
9. Enséñanos a perseverar en la oración y en el servicio. R.
10. Enciende en nuestros corazones el ansia de adorarte periódicamente en la Santa Hostia expuesta en nuestras capillas. R.
11. Enciende en nuestros corazones la gracia de crecer espiritualmente mediante una Confesión frecuente. R.
12. Enciende en nuestros corazones el deseo de recibirte todos los días en la Santa Comunión. R.`,
    imageHint: 'Iglesia / adoración eucarística',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_ACLAMACIONES',
    type: 'acclamation',
    title: 'Aclamaciones Eucarísticas',
    response: 'R. Bendito sea el Sagrado Corazón.',
    text: `R. Bendito sea el Sagrado Corazón.
Bendito sea el Corazón que nos revela el amor de Dios.
Bendito sea el Corazón que tanto amó al Padre.
Bendito sea el Corazón que tanto amó a los hombres.
Bendito sea el Corazón que proclama las Bienaventuranzas.
Bendito sea el Corazón suave y humilde que aligera nuestra carga.
Bendito sea el Corazón que ofrece el perdón a los pecadores.
Bendito sea el Corazón que recibió tanta ingratitud a cambio de su amor.
Bendito sea el Corazón abierto por la lanza.
Bendito sea el Corazón de donde surgió el agua del bautismo.
Bendito sea el Corazón de donde surgió la sangre de la nueva alianza.
Bendito sea el Corazón de donde nació la Iglesia, la nueva Eva.
Bendito sea el Corazón que nos ha dado a María por madre.`,
    imageHint: 'Jesús Eucaristía',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_TANTUM_ERGO',
    type: 'prayer',
    title: 'Bendición Eucarística',
    text: `Tantum ergo Sacramentum
veneremur cernui:
Et antiquum documentum
novo cedat ritui:
Praestet fides supplementum
sensuum defectui.
Genitori, genitoque
laus et jubilatio,
Salus, honor, virtus quoque
sit et benedictio.
Procedenti ab utroque
comparsit laudatio.

Tan augusto Sacramento
veneremos en verdad:
que los ritos ya pasados
den al nuevo su lugar:
que la fe preste a los ojos
la visión con qué mirar.
Al Padre y al Hijo,
demos gloria y júbilo,
salud, honor, virtud
y también la bendición.
Y a Quien de ambos procede
llegue también esta alabanza.`,
    imageHint: 'Jesús Eucaristía',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_RESERVA',
    type: 'reservation',
    title: 'Reserva — Salmo 116',
    text: SALMO_116_TEXT,
    imageHint: 'Custodia / Santísimo Sacramento',
    copyrightStatus: 'public-domain',
  },
  {
    id: 'SCA_ORACION_FINAL',
    type: 'closing',
    title: 'Oración final',
    text: `Dios todo poderoso,
que derramaste el Espíritu Santo sobre los apóstoles
reunidos en oración con María,
la madre de Jesús,
concédenos, por intercesión de la Virgen,
entregarnos fielmente a tu servicio
y proclamar la gloria de tu nombre,
con testimonio de palabra y vida.
Por nuestro Señor Jesucristo.
Amén.`,
    imageHint: 'Sagrado Corazón de Jesús',
    copyrightStatus: 'public-domain',
  },
];

export function isSagradoCorazonAdoracionMode(mysteryType) {
  return mysteryType === SAGRADO_CORAZON_ADORACION_ID;
}

/** Libro sequence — no img/imgCandidates (imageHint preserved on step metadata only). */
export function getSagradoCorazonAdoracionSequence() {
  return SAGRADO_CORAZON_ADORACION_STEPS.map((step) => {
    const out = {
      id: step.id,
      title: step.title,
      text: step.text,
      type: step.type,
    };
    if (step.subtitle) out.subtitle = step.subtitle;
    if (step.response) out.response = step.response;
    if (step.verses?.length) {
      out.verses = step.verses;
      out.sections = step.sections;
    }
    return out;
  });
}
