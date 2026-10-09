/**
 * Narrativa de «¿Tu familia está lista?»: lo que cuenta EL JEFE en la ventana emergente. Es un CASO HIPOTÉTICO
 * (un día cualquiera de El Niño en Dosquebradas) que muestra qué pasa si la familia se prepara y qué pasa si no.
 *
 * Los momentos del caso están ligados a los cinco niveles del juego (`nivel`): cada consecuencia se evita con los
 * hábitos de ese nivel. Es un escenario ilustrativo, no un pronóstico ni una alerta oficial.
 *
 * Para cambiar la historia, edita los textos de este archivo (no hace falta tocar la interfaz). Mantén los textos
 * en condicional («puede», «podría»): son consecuencias posibles, no certezas.
 *
 * @module datos/caso
 */

/** Aviso que acompaña al caso. */
export const AVISO_CASO = 'Escenario ilustrativo: no es un pronóstico ni una alerta oficial. Sirve para imaginar qué pasaría en tu casa.';

/** Lo que no se controla y lo que sí (escena 1). */
export const CONTROL = {
  noControlas: ['Cuándo llega el fenómeno', 'Qué tan fuerte es', 'Cuánto dura', 'Qué barrio o vereda golpea primero'],
  controlas: ['Cuánta agua tienen guardada', 'Si saben dónde cerrar el gas, el agua y la luz', 'Si hay una ruta y un punto de encuentro', 'Si la mochila de emergencia está lista'],
};

/** Cómo se presenta lo que cada nivel enfrenta (escena 2). Clave: id del nivel. */
export const FRENTE_POR_NIVEL = {
  agua: 'El agua baja y los acueductos se tensionan',
  energia: 'La energía se pone a prueba',
  calor: 'El calor aprieta, sobre todo al mediodía',
  fuego: 'El pasto seco hace que una chispa crezca',
  sismo: 'La tierra puede moverse sin avisar',
};

/**
 * @typedef {Object} Momento
 * @property {string} hora       Hora del día.
 * @property {string} nivel      Id del nivel del juego que lo previene.
 * @property {string} titulo     Qué pasa, en pocas palabras.
 * @property {string} situacion  Lo que vive la familia.
 * @property {string} sin        Qué podría pasar si NO se prepararon.
 * @property {string} con        Qué pasa si SÍ se prepararon.
 * @property {string} habito     El hábito (del juego) que cambia el final.
 */

/** Los cinco momentos de un jueves de El Niño en Dosquebradas. @type {Momento[]} */
export const MOMENTOS = [
  {
    hora: '6:30 a. m.',
    nivel: 'agua',
    titulo: 'No sale agua',
    situacion: 'Llevan semanas sin llover y el acueducto comunitario raciona el servicio. Abren la llave y solo sale un hilo.',
    sin: 'Sin agua guardada, la familia podría pasar horas sin agua para beber, cocinar y asearse. Tocaría comprarla a último momento, y con la higiene descuidada es más fácil enfermarse.',
    con: 'Tenían agua en recipientes limpios y tapados, y ya cuidaban cada gota. El día arranca sin sobresaltos.',
    habito: 'Guarda agua en recipientes tapados, cierra la llave y repara las fugas.',
  },
  {
    hora: '11:30 a. m.',
    nivel: 'calor',
    titulo: 'El calor aprieta',
    situacion: 'La temperatura sube y la abuela se marea al volver del mercado, justo en las horas de más calor.',
    sin: 'Sin el hábito de hidratarse ni de buscar sombra, el cuerpo no aguanta: mareo y golpe de calor, que pega más fuerte a adultos mayores, niños y mascotas.',
    con: 'Evitaron el sol entre las 11:00 y las 16:00, hay agua fresca y ropa clara, y saben qué hacer si alguien se marea: sombra, agua y llamar al 123.',
    habito: 'Hidrátate, busca sombra y cuida a quienes más lo necesitan.',
  },
  {
    hora: '3:00 p. m.',
    nivel: 'fuego',
    titulo: 'Humo en la ladera',
    situacion: 'Una colilla cae en un pastizal seco de la ladera cercana y el fuego avanza con el viento.',
    sin: 'Sin prevención ni plan, nadie sabe por dónde salir ni dónde está el extintor. Se pierde tiempo, alguien vuelve por objetos y crece el riesgo de lesiones y de perderlo todo.',
    con: 'No hicieron quemas ni dejaron colillas, tenían la salida acordada y el 123 anotado. Salen a tiempo, sin volver por objetos, y avisan a Bomberos.',
    habito: 'Cero quemas, revisa la estufa y el gas, y acuerda la salida y el punto de encuentro.',
  },
  {
    hora: '7:30 p. m.',
    nivel: 'energia',
    titulo: 'Se va la luz',
    situacion: 'La demanda de energía sube y llega un apagón. El celular está al 8 %.',
    sin: 'A oscuras, sin linterna ni pilas, con la nevera sin frío y el celular sin batería: sin forma de comunicarse ni de enterarse de lo que pasa.',
    con: 'Tenían linterna y radio con pilas, y los equipos cargados porque cuidaban el consumo. La familia sigue informada y tranquila.',
    habito: 'Apaga lo que no usas, desconecta cargadores y deja lista una linterna.',
  },
  {
    hora: '11:40 p. m.',
    nivel: 'sismo',
    titulo: 'La tierra se mueve',
    situacion: 'Un temblor sorprende a la familia mientras duerme. En el Eje Cafetero los sismos son parte de la vida.',
    sin: 'Sin zona segura, ruta ni mochila se improvisa: objetos que caen, confusión en la salida y sin documentos, medicinas ni agua a la mano.',
    con: 'Muebles asegurados, zapatos y linterna junto a la cama, ruta ensayada y mochila lista: se agachan, se cubren, se sujetan y salen al punto de encuentro.',
    habito: 'Asegura los muebles, ensaya la ruta de evacuación y arma la mochila.',
  },
];

/**
 * Lo que dice EL JEFE al cerrar, según cuántos frentes cubre ya la familia (0 a 5).
 * @param {number} cubiertos
 * @returns {string}
 */
export function mensajeDeEstado(cubiertos) {
  if (cubiertos <= 0) return 'Todavía no cubres ningún frente. Empieza hoy con un solo hábito: ganar tu primera jugada ya cubre uno.';
  if (cubiertos < 3) return `Vas bien: ya cubres ${cubiertos} de ${MOMENTOS.length} frentes. Cada frente que falta es un momento del caso en el que tu familia tendría que improvisar.`;
  if (cubiertos < MOMENTOS.length) return `¡Casi! Cubres ${cubiertos} de ${MOMENTOS.length} frentes. Cierra el que falta y tu familia llega lista a ese jueves.`;
  return '¡Tu familia cubre los cinco frentes! Ahora lo importante es mantenerlo: la preparación se repite, no se hace una sola vez.';
}

/**
 * Las escenas de la ventana, en orden. `jefe` es lo que dice EL JEFE en cada una; el contenido de cada escena lo
 * dibuja `ui/caso.js` según su `id`.
 * @type {{id: string, titulo: string, etiqueta: string, jefe: string}[]}
 */
export const ESCENAS = [
  {
    id: 'pregunta',
    titulo: '¿Tu familia está lista?',
    etiqueta: 'La pregunta',
    jefe: 'Hola, soy EL JEFE. Hay cosas que ninguna familia puede controlar: cuándo llega un fenómeno natural, qué tan fuerte es o cuánto dura. Pero hay algo que sí está en tus manos: cómo llegan ustedes a ese día. Esa es la pregunta de este juego.',
  },
  {
    id: 'frentes',
    titulo: 'Tantos retos a la vez',
    etiqueta: 'Los frentes',
    jefe: 'Cuando algo así golpea, no viene solo: llegan varios retos juntos. Con El Niño en la Zona Occidente y Dosquebradas eso no es raro. Por eso el juego tiene cinco niveles: uno por cada frente que tu familia necesita cubrir.',
  },
  {
    id: 'caso',
    titulo: 'Un jueves en Dosquebradas',
    etiqueta: 'Caso hipotético',
    jefe: 'Te cuento un caso inventado, pero muy posible. Una familia de Dosquebradas, en plena temporada de El Niño, vive un solo jueves. Fíjate en cada momento y piensa: ¿qué haría tu familia?',
  },
  {
    id: 'consecuencias',
    titulo: 'Si se prepara… y si no',
    etiqueta: 'Las consecuencias',
    jefe: 'Mira lo que cambia en cada momento. Cambia el botón para ver los dos finales: la misma familia, el mismo día, pero una llegó preparada y la otra no.',
  },
  {
    id: 'reto',
    titulo: 'El reto para tu familia',
    etiqueta: 'El reto',
    jefe: 'No te cuento esto para asustarte. Cada una de esas consecuencias se evita con hábitos pequeños, de los que ya haces en el juego. Mi reto para ti: que tu familia cubra los cinco frentes antes de que el caso deje de ser un cuento.',
  },
  {
    id: 'estado',
    titulo: 'Tu familia hoy',
    etiqueta: 'Tu estado',
    jefe: '',
  },
];

/**
 * Los párrafos que lee el narrador en una escena: lo que dice EL JEFE más el contenido de la escena (para que quien solo
 * escucha no se pierda nada). Es texto plano; `util/voz.js` lo ajusta para la voz.
 * @param {string} idEscena
 * @param {string} dice  Lo que dice EL JEFE en esa escena.
 * @param {{modo?: 'sin' | 'con', frentes?: {nombre: string, cubierto: boolean}[]}} [extras]
 *        `modo`: qué final se está viendo en «las consecuencias»; `frentes`: el estado de la familia (escena final).
 * @returns {string}
 */
export function partesDeNarracion(idEscena, dice, extras = {}) {
  const partes = [dice];
  if (idEscena === 'pregunta') {
    partes.push(`No lo controlas: ${CONTROL.noControlas.join('; ')}.`, `Sí lo controlas: ${CONTROL.controlas.join('; ')}.`);
  } else if (idEscena === 'frentes') {
    partes.push(...Object.entries(FRENTE_POR_NIVEL).map(([nivel, frase]) => `${nivel}: ${frase}.`));
  } else if (idEscena === 'caso') {
    partes.push(AVISO_CASO, ...MOMENTOS.map((m) => `A las ${m.hora}. ${m.titulo}. ${m.situacion}`));
  } else if (idEscena === 'consecuencias') {
    const modo = extras.modo === 'con' ? 'con' : 'sin';
    partes.push(modo === 'sin' ? 'Esto puede pasar si la familia no se prepara.' : 'Esto pasa si la familia sí se prepara.',
      ...MOMENTOS.map((m) => `A las ${m.hora}. ${m.titulo}. ${m[modo]}`));
  } else if (idEscena === 'reto') {
    partes.push(...MOMENTOS.map((m) => `${m.titulo}: ${m.habito}`));
  } else if (idEscena === 'estado' && extras.frentes) {
    const cubiertos = extras.frentes.filter((f) => f.cubierto).map((f) => f.nombre);
    const faltan = extras.frentes.filter((f) => !f.cubierto).map((f) => f.nombre);
    if (cubiertos.length) partes.push(`Frentes cubiertos: ${cubiertos.join(', ')}.`);
    if (faltan.length) partes.push(`Te faltan: ${faltan.join(', ')}.`);
  }
  return partes;
}

/**
 * Lo mismo que `partesDeNarracion`, en un solo texto (es lo que lee la voz de corrido).
 * @param {string} idEscena
 * @param {string} dice
 * @param {{modo?: 'sin' | 'con', frentes?: {nombre: string, cubierto: boolean}[]}} [extras]
 * @returns {string}
 */
export function narracionDeEscena(idEscena, dice, extras = {}) {
  return partesDeNarracion(idEscena, dice, extras).join(' ');
}

/* ------------------------------------------------------------------ audios de la narración (voz grabada o sintetizada) */

/**
 * @typedef {Object} AudioNarrador
 * @property {string}   id       Nombre base del archivo (sin extensión), p. ej. `narrador-04-consecuencias-preparada`.
 * @property {string}   escena   Id de la escena (`ESCENAS[].id`).
 * @property {string}   version  '' si la escena tiene una sola versión.
 * @property {string}   titulo   Título de la escena.
 * @property {string[]} partes   Los párrafos que se leen en ese audio.
 */

/**
 * Los audios de la narración: uno por escena y versión. Es la lista que usan el generador de voz (`npm run narracion`),
 * el guion (`npm run guion`) y el juego (que busca `assets/audio/narrador/<id>.mp3|ogg|wav`).
 *
 * La última escena depende del progreso de la familia: en su audio solo se lee el mensaje de EL JEFE (según cuántos
 * frentes cubre, de 0 a 5); la lista de frentes cubiertos se ve en pantalla.
 *
 * @returns {AudioNarrador[]}
 */
export function audiosDelNarrador() {
  const audios = [];
  ESCENAS.forEach((escena, i) => {
    const base = `narrador-${String(i + 1).padStart(2, '0')}-${escena.id}`;
    const agregar = (version, partes) => audios.push({ id: version ? `${base}-${version}` : base, escena: escena.id, version, titulo: escena.titulo, partes });
    if (escena.id === 'consecuencias') {
      agregar('sin-prepararse', partesDeNarracion(escena.id, escena.jefe, { modo: 'sin' }));
      agregar('preparada', partesDeNarracion(escena.id, escena.jefe, { modo: 'con' }));
    } else if (escena.id === 'estado') {
      for (let n = 0; n <= MOMENTOS.length; n += 1) agregar(`${n}-frentes`, [mensajeDeEstado(n)]);
    } else {
      agregar('', partesDeNarracion(escena.id, escena.jefe));
    }
  });
  return audios;
}

/**
 * El audio que corresponde a lo que se está viendo ahora.
 * @param {string} idEscena
 * @param {{modo?: 'sin' | 'con', cubiertos?: number}} [vista]  `modo`: final visto en «las consecuencias»; `cubiertos`: frentes cubiertos (0-5).
 * @returns {string | null} Nombre base del archivo, o null si la escena no existe.
 */
export function idDeAudio(idEscena, vista = {}) {
  const i = ESCENAS.findIndex((e) => e.id === idEscena);
  if (i < 0) return null;
  const base = `narrador-${String(i + 1).padStart(2, '0')}-${idEscena}`;
  if (idEscena === 'consecuencias') return `${base}-${vista.modo === 'con' ? 'preparada' : 'sin-prepararse'}`;
  if (idEscena === 'estado') return `${base}-${Math.min(Math.max(vista.cubiertos ?? 0, 0), MOMENTOS.length)}-frentes`;
  return base;
}
