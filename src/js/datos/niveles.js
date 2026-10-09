/**
 * Los cinco niveles del juego, en el orden en que se muestran:
 * Agua, Energía, Calor, Fuego y Sismo.
 * @module datos/niveles
 */
import { HABITOS } from './habitos.js';
import { HABITOS_MALOS } from './habitos-malos.js';

/**
 * @typedef {Object} Nivel
 * @property {string}   id            Identificador estable (también es la clave del progreso por nivel).
 * @property {string}   nombre        Nombre visible.
 * @property {string[]} agentes       Claves de `AGENTES` que lo apoyan (hoy un salvador por nivel).
 * @property {string}   enemigo       Clave de `ENEMIGOS`.
 * @property {string[]} [preparacion] Ids de hábitos que miden «¿estás listo?» (solo Fuego).
 * @property {{enemigo:string, apoyo:string, debilidad:string, porQue:string, inicio:string, medio:string, victoria:string}} textos
 * @property {import('./habitos.js').Habito[]} habitos Banco de hábitos buenos del nivel (18).
 * @property {import('./habitos.js').Habito[]} malos    Banco de descuidos del nivel (18): el opuesto de cada hábito bueno.
 */

/** @type {Nivel[]} */
export const NIVELES = [
  {
    id: 'agua',
    nombre: 'Agua',
    agentes: ['aqua'],
    enemigo: 'sequia',
    textos: {
      enemigo: 'Se alimenta de caudales que bajan y suelos que se agrietan. Crece cuando se desperdicia agua.',
      apoyo: 'EL JEFE convoca a este salvador: te recuerda cuidar el agua, adapta los retos a tu casa y te muestra cuánto cuenta cada gota.',
      debilidad: 'Cada gota ahorrada; fugas reparadas',
      porQue: 'Con El Niño bajan los caudales y la recarga de acuíferos. Reparar fugas y cuidar el agua es una de las recomendaciones inmediatas.',
      inicio: 'La Voraz Sequía avanza. Empecemos por una llave cerrada.',
      medio: 'Buen ritmo. La sequía ya perdió fuerza, una más.',
      victoria: 'La Voraz Sequía se quedó sin sed. Hoy, el agua ganó.',
    },
    habitos: HABITOS.agua,
    malos: HABITOS_MALOS.agua,
  },
  {
    id: 'energia',
    nombre: 'Energía',
    agentes: ['robot'],
    enemigo: 'derroche',
    textos: {
      enemigo: 'Chupa energía de cargadores y luces olvidadas, aun cuando nadie los usa.',
      apoyo: 'EL JEFE convoca a este salvador: vigila el consumo escondido y te propone cambios pequeños, uno por día.',
      debilidad: 'Luces apagadas; equipos desconectados',
      porQue: 'Con menos agua en los embalses crece la presión sobre la generación. Las autoridades piden reforzar el ahorro de energía.',
      inicio: 'Hay corriente fantasma por toda la casa. Apaga una luz y mira.',
      medio: 'Se está quedando sin carga. Sigue desenchufando.',
      victoria: 'El Derroche Vampiro se quedó sin batería. Casa eficiente.',
    },
    habitos: HABITOS.energia,
    malos: HABITOS_MALOS.energia,
  },
  {
    id: 'calor',
    nombre: 'Calor',
    agentes: ['aqua'],
    enemigo: 'solazo',
    textos: {
      enemigo: 'Aprieta entre las 11:00 y las 16:00. Se alimenta de cuerpos sin agua, casas sin sombra y personas o animales que se quedan solos bajo el sol.',
      apoyo: 'EL JEFE convoca a H2O Guardian: te recuerda hidratarte, dónde buscar sombra y a quién cuidar con el calor.',
      debilidad: 'Hidratación, sombra, ropa fresca y cuidar a los demás',
      porQue: 'Con El Niño suben las temperaturas. Bomberos Dosquebradas recomienda evitar actividades al aire libre entre 11:00 y 16:00 y mantenerse hidratado.',
      inicio: 'El Solazo aprieta al mediodía. Un vaso de agua y una sombra lo frenan.',
      medio: 'El Solazo baja la guardia. Sigue cuidándote y cuida a los tuyos.',
      victoria: 'El Solazo se quedó sin fuerza. Hoy el calor no te ganó.',
    },
    habitos: HABITOS.calor,
    malos: HABITOS_MALOS.calor,
  },
  {
    id: 'fuego',
    nombre: 'Fuego',
    agentes: ['fuego'],
    enemigo: 'chispa',
    preparacion: ['f8', 'f9', 'f10'],
    textos: {
      enemigo: 'Una chispa le basta: una colilla, una quema, un cable, una vela. Crece en casas sin prevención y familias sin plan.',
      apoyo: 'EL JEFE convoca a Fuego Guardian: vigila cables, estufas y velas y te ayuda a comprobar si estás listo para actuar si hay fuego.',
      debilidad: 'Cero quemas; instalaciones seguras; extintor, salida y plan listos',
      porQue: 'Con El Niño sube el riesgo de incendios de cobertura vegetal y los descuidos en casa. Prevenir es lo primero; saber qué hacer si ocurre es lo segundo.',
      inicio: 'La Chispa busca por dónde empezar. Cierra primero las puertas del monte y de la casa.',
      medio: 'La llama baja. Sigue cerrando puertas.',
      victoria: 'La Chispa se quedó sin llama: prevención y plan listos.',
    },
    habitos: HABITOS.fuego,
    malos: HABITOS_MALOS.fuego,
  },
  {
    id: 'sismo',
    nombre: 'Sismo',
    agentes: ['sismo'],
    enemigo: 'replica',
    textos: {
      enemigo: 'Llega sin avisar y encuentra casas sin plan. Pierde fuerza cuando hay zona segura, ruta y mochila.',
      apoyo: 'EL JEFE convoca a este salvador: te guía para preparar a tu familia y revisa contigo la mochila de emergencia.',
      debilidad: 'Plan familiar, ruta de evacuación y mochila lista',
      porQue: 'El Eje Cafetero es una región sísmica. Un plan sencillo, ensayado en familia, reduce la improvisación.',
      inicio: 'Un temblor no avisa. Un plan sí se puede preparar hoy.',
      medio: 'La Réplica retrocede. Cada paso del plan cuenta.',
      victoria: 'La Réplica no encontró a nadie desprevenido. Plan al día.',
    },
    habitos: HABITOS.sismo,
    malos: HABITOS_MALOS.sismo,
  },
];

/** Número de niveles. */
export const TOTAL_NIVELES = NIVELES.length;

/** Busca un hábito (bueno o descuido) por su id en todos los niveles. @param {string} id @returns {import('./habitos.js').Habito | undefined} */
export function buscarHabito(id) {
  for (const nivel of NIVELES) {
    const h = nivel.habitos.find((x) => x.id === id) || nivel.malos.find((x) => x.id === id);
    if (h) return h;
  }
  return undefined;
}

/** Ids de todos los descuidos. */
const IDS_MALOS = new Set(NIVELES.flatMap((nivel) => nivel.malos.map((h) => h.id)));

/** ¿Este id es de un descuido (hábito negativo)? @param {string} id @returns {boolean} */
export const esHabitoMalo = (id) => IDS_MALOS.has(id);
