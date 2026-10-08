/**
 * Lógica del chat de EL JEFE que no depende del navegador: respuestas predefinidas, detección de peligro
 * inmediato y el resumen del juego que se envía a la IA. Se usa cuando no hay IA disponible y como protocolo
 * de seguridad (las emergencias SIEMPRE se responden en local, sin esperar a la IA).
 * @module dominio/chat
 */
import { HABITOS_POR_JUGADA, XP_POR_HABITO } from '../config.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { NIVELES } from '../datos/niveles.js';
import { normalizar } from '../util/texto.js';
import {
  habitosActivos, hechoAlgunaVez, hechosEnJugada, indiceInsignia, jugadaDe, jugadasCompletas,
  preparacionFuego, rachaDe, siguienteNivel, textoDeHabito, xpDe,
} from './progreso.js';

/** @typedef {import('./progreso.js').Estado} Estado */

/** Respuestas por tema: [expresión sobre el texto normalizado, respuesta]. El orden importa (gana la primera). */
export const RESPUESTAS_POR_TEMA = [
  [/gas|huelo/, 'Si huele a gas: no enciendas luces, fósforos ni aparatos eléctricos. Abre puertas y ventanas, cierra la llave del gas si puedes hacerlo con seguridad, sal con tu familia y llama al 123 desde afuera.'],
  [/incendio|fuego|quema|colilla|extintor|chispa/, 'Prevención: nada de quemas, colillas ni vidrio en lotes y laderas; revisa estufa, gas, cables y velas. Si hay un fuego pequeño y tienes extintor, puede bastar; si crece, no lo enfrentes: sal, no vuelvas por objetos y llama al 123.'],
  [/sismo|temblor|terremoto|replica/, 'Durante un temblor: agáchate, cúbrete y sujétate lejos de ventanas y objetos que caigan. Cuando pase, sal con calma por la ruta acordada, sin ascensores, y ve al punto de encuentro. Asegura muebles altos y practica la ruta en familia.'],
  [/mochila|kit/, 'Tu mochila de emergencia lleva agua, alimentos no perecederos, botiquín, linterna, radio de pilas, silbato, documentos en bolsa sellada y dinero en efectivo. Ármala ítem por ítem en la pestaña Mochila.'],
  [/agua|fuga|grifo|llave|sequia/, 'Cierra la llave mientras te cepillas o enjabonas, reporta fugas, reutiliza el agua del enjuague, riega temprano o al atardecer y guarda agua en recipientes limpios y tapados.'],
  [/energia|luz|cargador|bombillo|nevera|vampiro/, 'Apaga las luces al salir, desconecta cargadores y equipos, ventila antes de usar el ventilador, usa LED y junta la ropa para planchar o lavar en tandas.'],
  [/calor|sol\b|hidrat|sombra|temperatura/, 'Entre las 11:00 y las 16:00 evita el sol fuerte, hidrátate, busca sombra, usa ropa clara y nunca dejes a niños, adultos mayores ni mascotas en un carro cerrado.'],
  [/123|emergencia|bomberos|telefono|numero/, 'En una emergencia llama al 123. Anota los números importantes en papel y en el celular, por si falla la batería.'],
  [/nino|fenomeno|clima/, 'El Niño es un fenómeno que se instala poco a poco y puede traer menos lluvias y más calor. Consulta los boletines del IDEAM y las indicaciones de tu gestión del riesgo municipal.'],
  [/hola|buenas|quien eres|jefe|ayuda/, '¡Hola! Soy El JEFE. Puedo decirte cuál es tu siguiente reto, cómo vas, si estás listo para el fuego y darte consejos de agua, energía, calor, fuego y sismo.'],
];

const RESPUESTA_GAS = RESPUESTAS_POR_TEMA[0][1];
const RESPUESTA_FUEGO = RESPUESTAS_POR_TEMA[1][1];
const RESPUESTA_SISMO = RESPUESTAS_POR_TEMA[2][1];
const RESPUESTA_PELIGRO_GENERAL = 'Si estás en peligro ahora: 1) ponte a salvo y saca a tu familia, sin volver por objetos; 2) llama al 123 desde un lugar seguro; 3) sigue las indicaciones de Bomberos y de la gestión del riesgo. El juego puede esperar.';
const RESPUESTA_DESCONOCIDA = 'Aún no sé responder eso. Prueba con: tu siguiente reto, cómo vas, si estás listo para el fuego, o un tema (agua, energía, calor, fuego, sismo, mochila).';

/** Frases que indican peligro inmediato (sobre texto normalizado, sin tildes). */
const PATRON_URGENTE = /(huelo|huele|olor)( a)? gas|escape de gas|hay (fuego|humo|un incendio|incendio)|(esta|estamos) (quemando|temblando)|esta temblando|temblor (ahora|ya)|incendio (ahora|en mi|en la)|(estoy|estamos) (herid|atrapad|ahogando)|emergencia (real|ahora)|socorro|auxilio/;

/**
 * ¿El mensaje describe un peligro inmediato?
 * @param {string} texto Texto tal como lo escribió la persona.
 * @returns {boolean}
 */
export const esUrgente = (texto) => PATRON_URGENTE.test(normalizar(texto));

/**
 * Protocolo de seguridad para un peligro inmediato (gas, sismo, fuego o genérico).
 * @param {string} texto
 * @returns {string}
 */
export function respuestaUrgente(texto) {
  const n = normalizar(texto);
  if (/gas/.test(n)) return RESPUESTA_GAS;
  if (/sismo|temblor|temblando/.test(n)) return RESPUESTA_SISMO;
  if (/fuego|incendio|humo|quem/.test(n)) return RESPUESTA_FUEGO;
  return RESPUESTA_PELIGRO_GENERAL;
}

const entre = (t) => `«${t}»`;

/** Qué reto sigue. @param {Estado} s @returns {string} */
function mensajeSiguiente(s) {
  const i = siguienteNivel(s);
  const nivel = NIVELES[i];
  const jugada = jugadaDe(s, nivel);
  const ejemplo = habitosActivos(s, nivel).find((h) => !jugada.done.includes(h.id));
  const faltan = HABITOS_POR_JUGADA - hechosEnJugada(s, nivel);
  return `Te conviene el nivel ${i + 1} (${nivel.nombre}): te faltan ${faltan} hábitos para completar la jugada ${jugada.r}. Por ejemplo: ${entre(ejemplo.texto)}.`;
}

/** Insignia actual y lo que falta para la siguiente. @param {Estado} s @returns {string} */
function mensajeInsignia(s) {
  const xp = xpDe(s);
  const i = indiceInsignia(xp);
  const siguiente = INSIGNIAS[i + 1];
  const actual = `Tu insignia es ${INSIGNIAS[i].nombre}: ${INSIGNIAS[i].lema}`;
  if (!siguiente) return `${actual} Es la más alta de la escalera. Sigue repitiendo tus hábitos para mantenerla.`;
  const faltan = siguiente.xp - xp;
  return `${actual} Para «${siguiente.nombre}» te faltan ${faltan} XP, unos ${Math.ceil(faltan / XP_POR_HABITO)} hábitos. Repetir tus hábitos cada día es la forma más rápida de subir.`;
}

/** Cómo va la preparación para el fuego. @param {Estado} s @returns {string} */
function mensajePreparacion(s) {
  const nivel = NIVELES.find((n) => n.preparacion);
  const faltan = nivel.preparacion.filter((id) => !hechoAlgunaVez(s, id));
  if (!faltan.length) {
    return `Sí: ya cumpliste los ${nivel.preparacion.length} pasos de preparación. Sabes dónde está el extintor, por dónde salir y qué hacer. Si hay fuego: sal y llama al 123.`;
  }
  return `Vas ${nivel.preparacion.length - faltan.length} de ${nivel.preparacion.length} en preparación para el fuego. Te falta: ${faltan.map((id) => entre(textoDeHabito(id))).join('; ')}.`;
}

/** Resumen del progreso. @param {Estado} s @returns {string} */
function mensajeProgreso(s) {
  const xp = xpDe(s);
  const racha = rachaDe(s.days);
  return `Llevas ${xp} XP, insignia ${INSIGNIAS[indiceInsignia(xp)].nombre}, racha de ${racha} ${racha === 1 ? 'día' : 'días'} y ${jugadasCompletas(s)} jugadas completadas.`;
}

/**
 * Respuesta predefinida a una pregunta (sin IA).
 * @param {string} texto
 * @param {Estado} s
 * @returns {string}
 */
export function responderLocal(texto, s) {
  const n = normalizar(texto);
  if (/insignia|medalla|escalera|rango/.test(n)) return mensajeInsignia(s);
  if (/siguiente|que sigo|que sigue|que hago ahora/.test(n)) return mensajeSiguiente(s);
  if (/listo|prepar/.test(n) && /fuego|incendio/.test(n)) return mensajePreparacion(s);
  if (/como voy|progreso|racha|xp|puntos/.test(n)) return mensajeProgreso(s);
  const tema = RESPUESTAS_POR_TEMA.find(([patron]) => patron.test(n));
  return tema ? tema[1] : RESPUESTA_DESCONOCIDA;
}

/**
 * Resumen del juego que se envía a la IA. Son SOLO números: nunca el nickname ni datos personales.
 * El servidor lo vuelve a validar y lo convierte en texto (ver `servidor-jefe`).
 * @param {Estado} s
 * @returns {{xp:number, insignia:number, racha:number, jugadas:number, fuego:number, niveles:{j:number, h:number, c:number}[]}}
 */
export function contextoParaIA(s) {
  const xp = xpDe(s);
  return {
    xp,
    insignia: indiceInsignia(xp),
    racha: rachaDe(s.days),
    jugadas: jugadasCompletas(s),
    fuego: preparacionFuego(s),
    niveles: NIVELES.map((nivel) => {
      const j = jugadaDe(s, nivel);
      return { j: j.r, h: hechosEnJugada(s, nivel), c: j.c || 0 };
    }),
  };
}
