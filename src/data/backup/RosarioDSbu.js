const RosarioDS = {
  oraciones_iniciales: {
    senal_de_la_cruz:
      "En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.",
    acto_de_contrition:
      "Yo confieso ante Dios todopoderoso y ante vosotros, hermanos, que he pecado mucho de pensamiento, palabra, obra y omisión. Por mi culpa, por mi culpa, por mi gran culpa. Por eso ruego a Santa María, siempre Virgen, a los ángeles, a los santos y a vosotros, hermanos, que intercedáis por mí ante Dios, nuestro Señor. Amén.",
    credo: [
      {
        key: "padre",
        text: "Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra.",
      },
      {
        key: "hijo",
        parts: [
          "Creo en Jesucristo, su único Hijo, nuestro Señor, ",
          "que fue concebido por obra y gracia del Espíritu Santo, ",
          "nació de Santa María Virgen, ",
          "padeció bajo el poder de Poncio Pilato, ",
          "fue crucificado, muerto y sepultado, ",
          "descendió a los infiernos, ",
          "al tercer día resucitó de entre los muertos, ",
          "subió a los cielos ",
          "y está sentado a la derecha de Dios, Padre todopoderoso. ",
          "Desde allí ha de venir a juzgar a vivos y muertos.",
        ],
      },
      { key: "espiritu_santo", text: "Creo en el Espíritu Santo," },
      { key: "iglesia", text: "la santa Iglesia católica," },
      { key: "comunion", text: " la comunión de los santos," },
      { key: "perdon", text: " el perdón de los pecados," },
      { key: "resurreccion", text: "la resurrección de la carne" },
      { key: "vida", text: "y la vida eterna. Amén." },
    ],
    padre_nuestro:
      "Padre nuestro, que estás en el cielo, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.",
    avemaria:
      "Dios te salve, María, \nllena eres de gracia, \nel Señor es contigo. \nBendita tú eres entre todas las mujeres, \ny bendito es el fruto de tu vientre, Jesús. \nSanta María, \nMadre de Dios, \nruega por nosotros, \npecadores, \nahora y en la hora de nuestra muerte. \nAmén.",
    gloria:
      "Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.",
    oracion_fatima:
      "Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia.",
  },
  misterios: {
    misteriosGozosos: [
      {
        titulo: "La Anunciación del Ángel a María",
        descripcion:
          "El arcángel Gabriel anuncia a María que será la Madre del Salvador",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Lucas 1:28",
            texto:
              "Y entrando el ángel en donde ella estaba, dijo: ¡Salve, muy favorecida! El Señor es contigo; bendita tú entre las mujeres.",
          },
          {
            referencia: "Lucas 1:38",
            texto:
              "Entonces María dijo: He aquí la sierva del Señor; hágase conmigo conforme a tu palabra.",
          },
          {
            referencia: "Isaías 7:14",
            texto:
              "Por tanto, el Señor mismo os dará señal: He aquí que la virgen concebirá, y dará a luz un hijo, y llamará su nombre Emanuel.",
          },
        ],
      },
      {
        titulo: "La Visitación de María a su prima Isabel",
        descripcion:
          "María visita a su prima Isabel, quien reconoce en ella a la Madre del Señor",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Lucas 1:42-43",
            texto:
              "Y exclamó a gran voz, y dijo: Bendita tú entre las mujeres, y bendito el fruto de tu vientre. ¿Por qué se me concede esto a mí, que la madre de mi Señor venga a mí?",
          },
          {
            referencia: "Lucas 1:46-47",
            texto:
              "Entonces María dijo: Engrandece mi alma al Señor; Y mi espíritu se regocija en Dios mi Salvador.",
          },
          {
            referencia: "Lucas 1:41",
            texto:
              "Y aconteció que cuando oyó Isabel la salutación de María, la criatura saltó en su vientre; e Isabel fue llena del Espíritu Santo.",
          },
        ],
      },
      {
        titulo: "El Nacimiento de Jesús en Belén",
        descripcion:
          "El Verbo se hace carne y nace de la Virgen María en Belén",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Juan 1:14",
            texto:
              "Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.",
          },
          {
            referencia: "Lucas 2:7",
            texto:
              "Y dio a luz a su hijo primogénito, y lo envolvió en pañales, y lo acostó en un pesebre, porque no había lugar para ellos en el mesón.",
          },
          {
            referencia: "Lucas 2:10-11",
            texto:
              "Pero el ángel les dijo: No temáis; porque he aquí os doy nuevas de gran gozo, que será para todo el pueblo: que os ha nacido hoy, en la ciudad de David, un Salvador, que es CRISTO el Señor.",
          },
        ],
      },
      {
        titulo: "La Presentación del Niño Jesús en el Templo",
        descripcion:
          "María y José presentan al Niño Jesús en el Templo, donde es reconocido por Simeón y Ana",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Lucas 2:29-30",
            texto:
              "Ahora, Señor, despides a tu siervo en paz, Conforme a tu palabra; Porque han visto mis ojos tu salvación.",
          },
          {
            referencia: "Lucas 2:34-35",
            texto:
              "Y los bendijo Simeón, y dijo a su madre María: He aquí, éste está puesto para caída y para levantamiento de muchos en Israel, y para señal que será contradicha; y una espada traspasará tu misma alma.",
          },
          {
            referencia: "Levítico 12:6-8",
            texto:
              "Y cuando los días de su purificación fueren cumplidos, por hijo o por hija, traerá un cordero de un año para holocausto, y un palomino o una tórtola para expiación.",
          },
        ],
      },
      {
        titulo: "El Niño Jesús perdido y hallado en el Templo",
        descripcion:
          "Jesús, a los doce años, se queda en el Templo enseñando a los doctores",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Lucas 2:46-47",
            texto:
              "Y aconteció que tres días después le hallaron en el templo, sentado en medio de los doctores de la ley, oyéndoles y preguntándoles. Y todos los que le oían, se maravillaban de su inteligencia y de sus respuestas.",
          },
          {
            referencia: "Lucas 2:49",
            texto:
              "Entonces él les dijo: ¿Por qué me buscabais? ¿No sabíais que en los negocios de mi Padre me es necesario estar?",
          },
          {
            referencia: "Lucas 2:52",
            texto:
              "Y Jesús crecía en sabiduría y en estatura, y en gracia para con Dios y los hombres.",
          },
        ],
      },
    ],
    misteriosDolorosos: [
      {
        titulo: "La Oración de Jesús en el Huerto",
        descripcion: "Jesús ora en Getsemaní con gran angustia, sudando sangre",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Lucas 22:42",
            texto:
              "Diciendo: Padre, si quieres, pasa de mí esta copa; pero no se haga mi voluntad, sino la tuya.",
          },
          {
            referencia: "Lucas 22:44",
            texto:
              "Y estando en agonía, oraba más intensamente; y era su sudor como grandes gotas de sangre que caían hasta la tierra.",
          },
          {
            referencia: "Mateo 26:38",
            texto:
              "Entonces Jesús les dijo: Mi alma está muy triste, hasta la muerte; quedaos aquí, y velad conmigo.",
          },
        ],
      },
      {
        titulo: "La Flagelación del Señor",
        descripcion: "Jesús es azotado por orden de Pilato",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Mateo 27:26",
            texto:
              "Entonces les soltó a Barrabás; y habiendo azotado a Jesús, le entregó para ser crucificado.",
          },
          {
            referencia: "Isaías 53:5",
            texto:
              "Mas él herido fue por nuestras rebeliones, molido por nuestros pecados; el castigo de nuestra paz fue sobre él, y por su llaga fuimos nosotros curados.",
          },
          {
            referencia: "1 Pedro 2:24",
            texto:
              "Quien llevó él mismo nuestros pecados en su cuerpo sobre el madero, para que nosotros, estando muertos a los pecados, vivamos a la justicia; y por cuya herida fuisteis sanados.",
          },
        ],
      },
      {
        titulo: "La Coronación de Espinas",
        descripcion:
          "Los soldados coronan a Jesús con espinas y se burlan de Él como Rey",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Mateo 27:29",
            texto:
              "Y pusieron sobre su cabeza una corona tejida de espinas, y una caña en su mano derecha; e hincando la rodilla delante de él, le escarnecían, diciendo: ¡Salve, Rey de los judíos!",
          },
          {
            referencia: "Juan 19:5",
            texto:
              "Y salió Jesús, llevando la corona de espinas y el manto de púrpura. Y Pilato les dijo: ¡He aquí el hombre!",
          },
          {
            referencia: "Isaías 52:14",
            texto:
              "Como se asombraron de ti muchos, de tal manera fue desfigurado de los hombres su parecer, y su hermosura más que la de los hijos de los hombres.",
          },
        ],
      },
      {
        titulo: "Jesús con la Cruz a cuestas",
        descripcion: "Jesús carga la cruz camino al Calvario",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Juan 19:17",
            texto:
              "Y él, cargando su cruz, salió al lugar llamado de la Calavera, y en hebreo, Gólgota.",
          },
          {
            referencia: "Lucas 23:26",
            texto:
              "Y llevándole, tomaron a cierto Simón de Cirene, que venía del campo, y le pusieron encima la cruz para que la llevase tras Jesús.",
          },
          {
            referencia: "Mateo 16:24",
            texto:
              "Entonces Jesús dijo a sus discípulos: Si alguno quiere venir en pos de mí, niéguese a sí mismo, y tome su cruz, y sígame.",
          },
        ],
      },
      {
        titulo: "La Crucifixión y Muerte de Nuestro Señor",
        descripcion: "Jesús muere en la cruz para salvarnos del pecado",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Juan 19:30",
            texto:
              "Cuando Jesús hubo tomado el vinagre, dijo: Consumado es. Y habiendo inclinado la cabeza, entregó el espíritu.",
          },
          {
            referencia: "Lucas 23:46",
            texto:
              "Entonces Jesús, clamando a gran voz, dijo: Padre, en tus manos encomiendo mi espíritu. Y habiendo dicho esto, expiró.",
          },
          {
            referencia: "Isaías 53:7",
            texto:
              "Angustiado él, y afligido, no abrió su boca; como cordero fue llevado al matadero; y como oveja delante de sus trasquiladores, enmudeció, y no abrió su boca.",
          },
        ],
      },
    ],
    misteriosGloriosos: [
      {
        titulo: "La Resurrección del Señor",
        descripcion:
          "Jesús resucita de entre los muertos al tercer día, venciendo la muerte",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Mateo 28:6",
            texto:
              "No está aquí, pues ha resucitado, como dijo. Venid, ved el lugar donde fue puesto el Señor.",
          },
          {
            referencia: "1 Corintios 15:20",
            texto:
              "Mas ahora Cristo ha resucitado de los muertos; primicias de los que durmieron es hecho.",
          },
          {
            referencia: "Romanos 6:9",
            texto:
              "Sabiendo que Cristo, habiendo resucitado de los muertos, ya no muere; la muerte no se enseñorea más de él.",
          },
        ],
      },
      {
        titulo: "La Ascensión del Señor",
        descripcion: "Jesús asciende a los cielos delante de sus discípulos",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Hechos 1:9",
            texto:
              "Y habiendo dicho estas cosas, viéndolo ellos, fue alzado, y le recibió una nube que le ocultó de sus ojos.",
          },
          {
            referencia: "Marcos 16:19",
            texto:
              "Y el Señor, después que les habló, fue recibido arriba en el cielo, y se sentó a la diestra de Dios.",
          },
          {
            referencia: "Efesios 4:10",
            texto:
              "El que descendió, es el mismo que también subió por encima de todos los cielos para llenarlo todo.",
          },
        ],
      },
      {
        titulo: "La Venida del Espíritu Santo",
        descripcion:
          "El Espíritu Santo desciende sobre los Apóstoles y María en Pentecostés",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Hechos 2:4",
            texto:
              "Y fueron todos llenos del Espíritu Santo, y comenzaron a hablar en otras lenguas, según el Espíritu les daba que hablasen.",
          },
          {
            referencia: "Juan 14:26",
            texto:
              "Mas el Consolador, el Espíritu Santo, a quien el Padre enviará en mi nombre, él os enseñará todas las cosas, y os recordará todo lo que yo os he dicho.",
          },
          {
            referencia: "Hechos 1:8",
            texto:
              "Pero recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos en Jerusalén, en toda Judea, en Samaria, y hasta lo último de la tierra.",
          },
        ],
      },
      {
        titulo: "La Asunción de María Santísima",
        descripcion: "María es elevada en cuerpo y alma a la gloria celestial",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Apocalipsis 12:1",
            texto:
              "Apareció en el cielo una gran señal: una mujer vestida del sol, con la luna debajo de sus pies, y sobre su cabeza una corona de doce estrellas.",
          },
          {
            referencia: "Lucas 1:48",
            texto:
              "Porque ha mirado la bajeza de su sierva; pues he aquí, desde ahora me dirán bienaventurada todas las generaciones.",
          },
          {
            referencia: "Cantares 2:10",
            texto:
              "Mi amado habló, y me dijo: Levántate, oh amiga mía, hermosa mía, y ven.",
          },
        ],
      },
      {
        titulo: "La Coronación de María como Reina del Cielo y de la Tierra",
        descripcion: "María es coronada Reina del universo junto a su Hijo",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Apocalipsis 12:1",
            texto:
              "Apareció en el cielo una gran señal: una mujer vestida del sol, con la luna debajo de sus pies, y sobre su cabeza una corona de doce estrellas.",
          },
          {
            referencia: "Salmo 45:9",
            texto: "Está la reina a tu diestra con oro de Ofir.",
          },
          {
            referencia: "Jeremías 13:18",
            texto:
              "Di al rey y a la reina: Humillaos, sentaos en tierra; porque la corona de vuestra gloria caerá de vuestras cabezas.",
          },
        ],
      },
    ],
    misteriosLuminosos: [
      {
        titulo: "El Bautismo de Jesús en el Jordán",
        descripcion:
          "Jesús es bautizado por Juan y se revela como el Hijo amado del Padre",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Mateo 3:17",
            texto:
              "Y hubo una voz de los cielos, que decía: Este es mi Hijo amado, en quien tengo complacencia.",
          },
          {
            referencia: "Marcos 1:10-11",
            texto:
              "Y luego, cuando subía del agua, vio abrirse los cielos, y al Espíritu como paloma que descendía sobre él. Y vino una voz de los cielos que decía: Tú eres mi Hijo amado; en ti tengo complacencia.",
          },
          {
            referencia: "Juan 1:34",
            texto:
              "Y yo le vi, y he dado testimonio de que éste es el Hijo de Dios.",
          },
        ],
      },
      {
        titulo: "Las Bodas de Caná",
        descripcion: "Jesús realiza su primer milagro a petición de su Madre",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Juan 2:5",
            texto:
              "Su madre dijo a los que servían: Haced todo lo que él os dijere.",
          },
          {
            referencia: "Juan 2:11",
            texto:
              "Este principio de señales hizo Jesús en Caná de Galilea, y manifestó su gloria; y sus discípulos creyeron en él.",
          },
          {
            referencia: "Juan 2:3-4",
            texto:
              "Y faltando el vino, la madre de Jesús le dijo: No tienen vino. Jesús le dijo: ¿Qué tienes conmigo, mujer? Aún no ha venido mi hora.",
          },
        ],
      },
      {
        titulo: "El Anuncio del Reino de Dios",
        descripcion:
          "Jesús predica el Reino de los Cielos y llama a la conversión",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Marcos 1:15",
            texto:
              "Diciendo: El tiempo se ha cumplido, y el reino de Dios se ha acercado; arrepentíos, y creed en el evangelio.",
          },
          {
            referencia: "Mateo 5:3",
            texto:
              "Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos.",
          },
          {
            referencia: "Lucas 4:43",
            texto:
              "Pero él les dijo: Es necesario que también a otras ciudades anuncie el evangelio del reino de Dios; porque para esto he sido enviado.",
          },
        ],
      },
      {
        titulo: "La Transfiguración",
        descripcion:
          "Jesús se transfigura ante Pedro, Santiago y Juan en el monte",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Mateo 17:2",
            texto:
              "Y se transfiguró delante de ellos, y resplandeció su rostro como el sol, y sus vestidos se hicieron blancos como la luz.",
          },
          {
            referencia: "Mateo 17:5",
            texto:
              "Mientras él aún hablaba, una nube de luz los cubrió; y he aquí una voz desde la nube, que decía: Este es mi Hijo amado, en quien tengo complacencia; a él oíd.",
          },
          {
            referencia: "2 Pedro 1:17-18",
            texto:
              "Pues cuando él recibió de Dios Padre honra y gloria, le fue enviada desde la magnífica gloria una voz que decía: Este es mi Hijo amado, en el cual tengo complacencia. Y nosotros oímos esta voz enviada del cielo, cuando estábamos con él en el monte santo.",
          },
        ],
      },
      {
        titulo: "La Institución de la Eucaristía",
        descripcion: "Jesús instituye la Sagrada Eucaristía en la Última Cena",
        imagen: "",
        citasEscrituristicas: [
          {
            referencia: "Mateo 26:26",
            texto:
              "Y mientras comían, tomó Jesús el pan, y bendijo, y lo partió, y dio a sus discípulos, y dijo: Tomad, comed; esto es mi cuerpo.",
          },
          {
            referencia: "1 Corintios 11:24-25",
            texto:
              "Y habiendo dado gracias, lo partió, y dijo: Tomad, comed; esto es mi cuerpo que por vosotros es partido; haced esto en memoria de mí. Asimismo tomó también la copa, después de haber cenado, diciendo: Esta copa es el nuevo pacto en mi sangre; haced esto todas las veces que la bebiereis, en memoria de mí.",
          },
          {
            referencia: "Juan 6:51",
            texto:
              "Yo soy el pan vivo que descendió del cielo; si alguno comiere de este pan, vivirá para siempre; y el pan que yo daré es mi carne, la cual yo daré por la vida del mundo.",
          },
        ],
      },
    ],
  },
  oraciones_finales: {
    litaniaLauretana: {
      invocacionesIniciales: [
        { invocacion: "Señor, ten piedad", respuesta: "Señor, ten piedad" },
        { invocacion: "Cristo, ten piedad", respuesta: "Cristo, ten piedad" },
        { invocacion: "Señor, ten piedad", respuesta: "Señor, ten piedad" },
        { invocacion: "Cristo, óyenos", respuesta: "Cristo, óyenos" },
        { invocacion: "Cristo, escúchanos", respuesta: "Cristo, escúchanos" },
        {
          invocacion: "Dios Padre celestial",
          respuesta: "Ten piedad de nosotros",
        },
        {
          invocacion: "Dios Hijo, Redentor del mundo",
          respuesta: "Ten piedad de nosotros",
        },
        {
          invocacion: "Dios Espíritu Santo",
          respuesta: "Ten piedad de nosotros",
        },
        {
          invocacion: "Santísima Trinidad, un solo Dios",
          respuesta: "Ten piedad de nosotros",
        },
      ],
      invocacionesMarianasBasicas: [
        { invocacion: "Santa María", respuesta: "Ruega por nosotros" },
        { invocacion: "Santa Madre de Dios", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Santa Virgen de las vírgenes",
          respuesta: "Ruega por nosotros",
        },
      ],
      titulosMaternales: [
        { invocacion: "Madre de Cristo", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Madre de la divina gracia",
          respuesta: "Ruega por nosotros",
        },
        { invocacion: "Madre purísima", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre castísima", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre siempre virgen", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre inmaculada", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre sin mancilla", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre amable", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre admirable", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Madre del buen consejo",
          respuesta: "Ruega por nosotros",
        },
        { invocacion: "Madre del Creador", respuesta: "Ruega por nosotros" },
        { invocacion: "Madre del Salvador", respuesta: "Ruega por nosotros" },
      ],
      titulosVirginales: [
        { invocacion: "Virgen prudentísima", respuesta: "Ruega por nosotros" },
        { invocacion: "Virgen venerable", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Virgen digna de alabanza",
          respuesta: "Ruega por nosotros",
        },
        { invocacion: "Virgen poderosa", respuesta: "Ruega por nosotros" },
        { invocacion: "Virgen clemente", respuesta: "Ruega por nosotros" },
        { invocacion: "Virgen fiel", respuesta: "Ruega por nosotros" },
      ],
      simbolosMarianosClasicos: [
        { invocacion: "Espejo de justicia", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Trono de la sabiduría",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Causa de nuestra alegría",
          respuesta: "Ruega por nosotros",
        },
        { invocacion: "Vaso espiritual", respuesta: "Ruega por nosotros" },
        { invocacion: "Vaso digno de honor", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Vaso insigne de devoción",
          respuesta: "Ruega por nosotros",
        },
        { invocacion: "Rosa mística", respuesta: "Ruega por nosotros" },
        { invocacion: "Torre de David", respuesta: "Ruega por nosotros" },
        { invocacion: "Torre de marfil", respuesta: "Ruega por nosotros" },
        { invocacion: "Casa de oro", respuesta: "Ruega por nosotros" },
        { invocacion: "Arca de la alianza", respuesta: "Ruega por nosotros" },
        { invocacion: "Puerta del cielo", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Estrella de la mañana",
          respuesta: "Ruega por nosotros",
        },
      ],
      titulosSaludRefugio: [
        {
          invocacion: "Salud de los enfermos",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Refugio de los pecadores",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Consoladora de los afligidos",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Auxilio de los cristianos",
          respuesta: "Ruega por nosotros",
        },
      ],
      titulosRegios: [
        { invocacion: "Reina de los Ángeles", respuesta: "Ruega por nosotros" },
        {
          invocacion: "Reina de los Patriarcas",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina de los Profetas",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina de los Apóstoles",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina de los Mártires",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina de los Confesores",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina de las Vírgenes",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina de todos los Santos",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina concebida sin pecado original",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina asunta a los cielos",
          respuesta: "Ruega por nosotros",
        },
        {
          invocacion: "Reina del Santísimo Rosario",
          respuesta: "Ruega por nosotros",
        },
        { invocacion: "Reina de la familia", respuesta: "Ruega por nosotros" },
        { invocacion: "Reina de la paz", respuesta: "Ruega por nosotros" },
      ],
      oracionFinal: [
        {
          invocacion: "Cordero de Dios, que quitas el pecado del mundo",
          respuesta: "Perdónanos, Señor",
        },
        {
          invocacion: "Cordero de Dios, que quitas el pecado del mundo",
          respuesta: "Escúchanos, Señor",
        },
        {
          invocacion: "Cordero de Dios, que quitas el pecado del mundo",
          respuesta: "Ten piedad de nosotros",
        },
        {
          invocacion: "Ruega por nosotros, Santa Madre de Dios",
          respuesta:
            "Para que seamos dignos de las promesas de Nuestro Señor Jesucristo",
        },
      ],
      oremos: {
        texto:
          "Te rogamos nos concedas, Señor Dios nuestro, gozar de continua salud de alma y cuerpo, y por la gloriosa intercesión de la bienaventurada siempre Virgen María, vernos libres de las tristezas presentes y disfrutar de las alegrías eternas. Por Cristo nuestro Señor. Amén.",
      },
    },
    salve:
      "Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A Ti clamamos los desterrados hijos de Eva; a Ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María! Ruega por nosotros, Santa Madre de Dios, para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo. Amén.",
    oracion_por_el_papa:
      "Oh Dios, que has puesto la sede de Pedro como fundamento de la unidad de la Iglesia, concede al Papa Francisco, tu siervo, ser para todos los fieles principio y fundamento visible de la fe y de la comunión. Por Jesucristo, nuestro Señor. Amén.",
    senal_de_la_cruz_final:
      "En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.",
  },
};

export default RosarioDS;
