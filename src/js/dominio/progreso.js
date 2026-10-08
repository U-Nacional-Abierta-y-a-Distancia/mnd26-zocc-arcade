/**
 * Reglas del juego (sin DOM ni almacenamiento): XP, insignias, rachas y jugadas.
 * Todas las funciones reciben el estado de UN jugador como primer parámetro y no dependen del navegador,
 * por eso se pueden probar en Node (ver `pruebas/unit/`).
 *
 * Vocabulario:
 *  - nivel:   uno de los cinco temas (Agua, Energía, Calor, Fuego, Sismo).
 *  - jugada:  conjunto de 6 hábitos de un nivel que se muestran a la vez.
 *  - ronda:   número de la jugada en curso de un nivel (1, 2, 3, 4…). El banco se repite cada 3.
 *  - insignia: peldaño de la escalera de `datos/insignias.js`; se gana con la XP (60 XP = una jugada completa).
 *
 * @module dominio/progreso
 */
import { HABITOS_POR_JUGADA, XP_POR_HABITO, XP_POR_ITEM_MOCHILA } from '../config.js';
import { NIVELES, buscarHabito } from '../datos/niveles.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { claveDia } from '../util/fecha.js';

/**
 * Estado de un jugador. Los nombres de los campos son los que se guardan en `localStorage`, por eso
 * se mantienen estables aunque estén en inglés (no se pueden renombrar sin migrar los datos guardados).
 * @typedef {Object} Estado
 * @property {Record<string, string[]>} days  Hábitos marcados por día: { 'AAAA-MM-DD': ['a1', 'a2'] }.
 * @property {string[]} kit                   Ids de los ítems de la mochila guardados.
 * @property {number} fam                     Personas en casa (para la mochila).
 * @property {Record<string, {r:number, c:number, done:string[]}>} [rd]
 *           Jugada por nivel: r = ronda en curso, c = jugadas completadas, done = hábitos marcados en la ronda.
 * @property {{from:string, at:number}} [nudge] Ánimo pendiente de mostrar.
 * @property {number} [joined]                Fecha de inscripción (ms).
 */

/** @typedef {import('../datos/niveles.js').Nivel} Nivel */
/** @typedef {import('../datos/habitos.js').Habito} Habito */

/** Estado vacío de un jugador nuevo. @returns {Estado} */
export function estadoNuevo() {
  return { days: {}, kit: [], fam: 3, rd: {}, joined: Date.now() };
}

/** Completa los campos que falten en un estado leído de disco (datos de versiones anteriores). @param {Estado} s @returns {Estado} */
export function repararEstado(s) {
  if (!s.days) s.days = {};
  if (!s.kit) s.kit = [];
  if (!s.fam) s.fam = 3;
  return s;
}

/* ------------------------------------------------------------------ XP, insignia y racha */

/** Total de hábitos marcados (suma de todos los días). @param {Estado} s @returns {number} */
export function marcasTotales(s) {
  return Object.values(s.days).reduce((n, dia) => n + dia.length, 0);
}

/** Días con actividad registrada. @param {Estado} s @returns {number} */
export const diasActivos = (s) => Object.keys(s.days).length;

/** Experiencia total: hábitos marcados + ítems de la mochila. @param {Estado} s @returns {number} */
export function xpDe(s) {
  return marcasTotales(s) * XP_POR_HABITO + s.kit.length * XP_POR_ITEM_MOCHILA;
}

/** Índice (en `INSIGNIAS`) de la insignia que corresponde a una cantidad de XP. @param {number} xp @returns {number} */
export function indiceInsignia(xp) {
  let indice = 0;
  INSIGNIAS.forEach((r, i) => { if (xp >= r.xp) indice = i; });
  return indice;
}

/**
 * Días seguidos con al menos un hábito marcado. Si hoy aún no marcó nada, la racha de ayer no se pierde.
 * @param {Record<string, string[]>} dias  Hábitos por día.
 * @param {Date} [ahora]
 * @returns {number}
 */
export function rachaDe(dias, ahora = new Date()) {
  const tiene = (d) => (dias[claveDia(d)] || []).length > 0;
  const dia = new Date(ahora);
  if (!tiene(dia)) dia.setDate(dia.getDate() - 1);
  let racha = 0;
  while (tiene(dia)) { racha += 1; dia.setDate(dia.getDate() - 1); }
  return racha;
}

/* ------------------------------------------------------------------ jugadas y banco de hábitos */

/** Cantidad de jugadas distintas del banco de un nivel (18 hábitos / 6 = 3). @param {Nivel} nivel @returns {number} */
const jugadasDelBanco = (nivel) => Math.floor(nivel.habitos.length / HABITOS_POR_JUGADA);

/**
 * Hábitos de una jugada. El banco se recorre en orden y se repite al agotarse.
 * @param {Nivel} nivel
 * @param {number} ronda 1, 2, 3, 4… (la 4 vuelve a ser la primera).
 * @returns {Habito[]}
 */
export function loteDe(nivel, ronda) {
  const desde = ((ronda - 1) % jugadasDelBanco(nivel)) * HABITOS_POR_JUGADA;
  return nivel.habitos.slice(desde, desde + HABITOS_POR_JUGADA);
}

/**
 * Registro de la jugada de un nivel. Si no existe, lo CREA (efecto lateral) con la ronda 1, marcando
 * los hábitos de esa ronda que ya se hubieran marcado hoy.
 * @param {Estado} s
 * @param {Nivel} nivel
 * @param {string} [hoyClave]
 * @returns {{r:number, c:number, done:string[]}}
 */
export function jugadaDe(s, nivel, hoyClave = claveDia()) {
  if (!s.rd) s.rd = {};
  let jugada = s.rd[nivel.id];
  if (!jugada) {
    const marcadosHoy = s.days[hoyClave] || [];
    jugada = { r: 1, c: 0, done: loteDe(nivel, 1).map((h) => h.id).filter((id) => marcadosHoy.includes(id)) };
    s.rd[nivel.id] = jugada;
  }
  return jugada;
}

/** Hábitos que se muestran ahora en un nivel. @param {Estado} s @param {Nivel} nivel @returns {Habito[]} */
export const habitosActivos = (s, nivel) => loteDe(nivel, jugadaDe(s, nivel).r);

/** Cuántos hábitos de la jugada en curso están marcados. @param {Estado} s @param {Nivel} nivel @returns {number} */
export function hechosEnJugada(s, nivel) {
  const hechos = jugadaDe(s, nivel).done;
  return habitosActivos(s, nivel).filter((h) => hechos.includes(h.id)).length;
}

/** Cuántos hábitos del banco de un nivel se marcaron en un día concreto. @param {Estado} s @param {Nivel} nivel @param {string} clave @returns {number} */
export function hechosEnDia(s, nivel, clave) {
  const dia = s.days[clave] || [];
  return nivel.habitos.filter((h) => dia.includes(h.id)).length;
}

/** ¿Se marcó este hábito alguna vez, en cualquier día? @param {Estado} s @param {string} id @returns {boolean} */
export const hechoAlgunaVez = (s, id) => Object.values(s.days).some((dia) => dia.includes(id));

/** Jugadas completadas en un nivel. @param {Estado} s @param {Nivel} nivel @returns {number} */
export const jugadasCompletasDe = (s, nivel) => jugadaDe(s, nivel).c || 0;

/** Jugadas completadas en todos los niveles. @param {Estado} s @returns {number} */
export const jugadasCompletas = (s) => NIVELES.reduce((n, nivel) => n + jugadasCompletasDe(s, nivel), 0);

/** Pasos de preparación para el fuego cumplidos (hábitos «Listo para la emergencia»). @param {Estado} s @returns {number} */
export function preparacionFuego(s) {
  const nivel = NIVELES.find((n) => n.preparacion);
  return nivel ? nivel.preparacion.filter((id) => hechoAlgunaVez(s, id)).length : 0;
}

/* ------------------------------------------------------------------ qué sigue */

/**
 * Índice del nivel que conviene jugar ahora: el de menos jugadas completadas (el primero si hay empate).
 * Así se reparte el esfuerzo entre los cinco temas.
 * @param {Estado} s @returns {number}
 */
export function siguienteNivel(s) {
  let mejor = 0;
  NIVELES.forEach((nivel, i) => { if (jugadasCompletasDe(s, nivel) < jugadasCompletasDe(s, NIVELES[mejor])) mejor = i; });
  return mejor;
}

/** Texto de un hábito a partir de su id (para mensajes). @param {string} id @returns {string} */
export const textoDeHabito = (id) => buscarHabito(id)?.texto ?? id;

/* ------------------------------------------------------------------ marcar un hábito */

/**
 * Lo que hay que celebrar al completar una jugada (la interfaz lo muestra en una ventana).
 * @typedef {Object} JugadaCompleta
 * @property {number}  nivel       Índice del nivel en `NIVELES`.
 * @property {number}  hecha       Número de la jugada que se acaba de completar (1, 2, 3…).
 * @property {number}  insignia    Índice de la insignia que se tiene ahora (en `INSIGNIAS`).
 * @property {boolean} nueva       true si con esta jugada se ganó una insignia nueva.
 * @property {Habito[]} siguientes Los 6 hábitos de la jugada que empieza.
 */

/**
 * Marca o desmarca un hábito y avanza la partida. Es la regla central del juego.
 *
 * - Actualiza los hábitos del día (`days`) y los de la jugada en curso (`rd[nivel].done`).
 * - Si con este hábito se completan los 6 de la jugada: suma una jugada completada, pasa a la siguiente ronda y
 *   devuelve `jugada` con lo que hay que celebrar.
 * - Si el XP hace subir de insignia (también al completar una jugada), `insigniaNueva` trae su índice.
 *
 * @param {Estado} s
 * @param {Nivel} nivel
 * @param {string} idHabito
 * @param {boolean} marcado     true = marcar, false = desmarcar.
 * @param {string} [clave]      Día en que se marca (por defecto hoy).
 * @returns {{completa: boolean, jugada: JugadaCompleta | null, insigniaNueva: number | null}}
 */
export function registrarMarca(s, nivel, idHabito, marcado, clave = claveDia()) {
  const insigniaAntes = indiceInsignia(xpDe(s));
  const dia = s.days[clave] || (s.days[clave] = []);
  const registro = jugadaDe(s, nivel, clave);
  const antes = hechosEnJugada(s, nivel);

  const iDia = dia.indexOf(idHabito);
  if (marcado && iDia < 0) dia.push(idHabito);
  else if (!marcado && iDia > -1) dia.splice(iDia, 1);

  const iJugada = registro.done.indexOf(idHabito);
  if (marcado && iJugada < 0) registro.done.push(idHabito);
  else if (!marcado && iJugada > -1) registro.done.splice(iJugada, 1);

  if (!dia.length) delete s.days[clave];

  const despues = hechosEnJugada(s, nivel);
  const completa = despues === habitosActivos(s, nivel).length && antes < despues;
  const insigniaAhora = indiceInsignia(xpDe(s));
  const insigniaNueva = insigniaAhora > insigniaAntes ? insigniaAhora : null;

  /** @type {JugadaCompleta | null} */
  let jugada = null;
  if (completa) {
    registro.c = (registro.c || 0) + 1;
    jugada = {
      nivel: NIVELES.indexOf(nivel),
      hecha: registro.r,
      insignia: insigniaAhora,
      nueva: insigniaNueva !== null,
      siguientes: loteDe(nivel, registro.r + 1),
    };
    registro.r += 1;
    registro.done = [];
  }
  return { completa, jugada, insigniaNueva };
}
