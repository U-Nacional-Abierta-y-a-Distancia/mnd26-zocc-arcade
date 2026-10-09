/**
 * Reglas del juego (sin DOM ni almacenamiento): XP, insignias, rachas y jugadas.
 * Todas las funciones reciben el estado de UN jugador como primer parámetro y no dependen del navegador,
 * por eso se pueden probar en Node (ver `pruebas/unit/`).
 *
 * Vocabulario:
 *  - nivel:    uno de los cinco temas (Agua, Energía, Calor, Fuego, Sismo).
 *  - jugada:   3 hábitos buenos + 3 descuidos de un nivel, que se muestran a la vez.
 *  - ronda:    número de la jugada en curso de un nivel (1, 2, 3…). El banco se repite cada 6.
 *  - insignia: peldaño de la escalera de `datos/insignias.js`; se gana con la XP (60 XP = una jugada ganada).
 *
 * La jugada es una CARRERA entre dos barras de vida de 3 segmentos:
 *  - cada hábito bueno marcado hiere al enemigo; con 3, el enemigo cae → VICTORIA (siguiente jugada);
 *  - cada descuido reconocido hiere al salvador; con 3, el salvador cae → DERROTA (se repite la misma jugada).
 * Gana quien llegue primero a 3.
 *
 * @module dominio/progreso
 */
import {
  BUENOS_POR_JUGADA, MALOS_POR_JUGADA, TOPE_RECONOCIDOS_POR_DIA, XP_POR_HABITO, XP_POR_ITEM_MOCHILA, XP_POR_RECONOCER,
} from '../config.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { NIVELES, buscarHabito, esHabitoMalo } from '../datos/niveles.js';
import { claveDia } from '../util/fecha.js';

/**
 * Estado de un jugador. Los nombres de los campos son los que se guardan en `localStorage`, por eso
 * se mantienen estables aunque estén en inglés (no se pueden renombrar sin migrar los datos guardados).
 * @typedef {Object} Estado
 * @property {Record<string, string[]>} days  Hábitos y descuidos marcados por día: { 'AAAA-MM-DD': ['a1', 'ma2'] }.
 * @property {string[]} kit                   Ids de los ítems de la mochila guardados.
 * @property {number} fam                     Personas en casa (para la mochila).
 * @property {Record<string, RegistroJugada>} [rd]  Jugada en curso de cada nivel.
 * @property {{from:string, at:number}} [nudge] Ánimo pendiente de mostrar.
 * @property {number} [joined]                Fecha de inscripción (ms).
 */

/**
 * Jugada en curso de un nivel.
 * @typedef {Object} RegistroJugada
 * @property {number}   r     Ronda en curso (1, 2, 3…).
 * @property {number}   c     Jugadas ganadas.
 * @property {string[]} done  Hábitos buenos marcados en esta jugada.
 * @property {string[]} [mal] Descuidos reconocidos en esta jugada.
 * @property {number}   [l]   Veces que el salvador ha caído (derrotas).
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

/** De una lista de marcas del día, solo los hábitos buenos. @param {string[]} lista @returns {string[]} */
export const buenosDe = (lista) => lista.filter((id) => !esHabitoMalo(id));

/** Total de hábitos BUENOS marcados (suma de todos los días). @param {Estado} s @returns {number} */
export function marcasTotales(s) {
  return Object.values(s.days).reduce((n, dia) => n + buenosDe(dia).length, 0);
}

/** Días con actividad registrada. @param {Estado} s @returns {number} */
export const diasActivos = (s) => Object.keys(s.days).length;

/**
 * Experiencia total: cada hábito bueno suma 20 XP; reconocer un descuido suma 2 XP (con tope diario, para premiar la
 * honestidad sin que se abuse); cada ítem de la mochila suma 5 XP.
 * @param {Estado} s @returns {number}
 */
export function xpDe(s) {
  let xp = s.kit.length * XP_POR_ITEM_MOCHILA;
  for (const dia of Object.values(s.days)) {
    const malos = dia.length - buenosDe(dia).length;
    xp += buenosDe(dia).length * XP_POR_HABITO + Math.min(malos, TOPE_RECONOCIDOS_POR_DIA) * XP_POR_RECONOCER;
  }
  return xp;
}

/** Índice (en `INSIGNIAS`) de la insignia que corresponde a una cantidad de XP. @param {number} xp @returns {number} */
export function indiceInsignia(xp) {
  let indice = 0;
  INSIGNIAS.forEach((r, i) => { if (xp >= r.xp) indice = i; });
  return indice;
}

/**
 * Días seguidos con al menos un hábito BUENO marcado. Si hoy aún no marcó nada, la racha de ayer no se pierde.
 * @param {Record<string, string[]>} dias  Marcas por día.
 * @param {Date} [ahora]
 * @returns {number}
 */
export function rachaDe(dias, ahora = new Date()) {
  const tiene = (d) => buenosDe(dias[claveDia(d)] || []).length > 0;
  const dia = new Date(ahora);
  if (!tiene(dia)) dia.setDate(dia.getDate() - 1);
  let racha = 0;
  while (tiene(dia)) { racha += 1; dia.setDate(dia.getDate() - 1); }
  return racha;
}

/* ------------------------------------------------------------------ jugadas y banco de hábitos */

/** Cantidad de jugadas distintas del banco de un nivel (18 hábitos / 3 = 6). @param {Nivel} nivel @returns {number} */
const jugadasDelBanco = (nivel) => Math.floor(nivel.habitos.length / BUENOS_POR_JUGADA);

/**
 * Los hábitos de una jugada: 3 buenos y los 3 descuidos del mismo lote. El banco se recorre en orden y se repite al
 * agotarse. El descuido `malos[k]` es el opuesto del hábito `buenos[k]`.
 * @param {Nivel} nivel
 * @param {number} ronda 1, 2, 3… (la 7 vuelve a ser la primera).
 * @returns {{buenos: Habito[], malos: Habito[]}}
 */
export function loteDe(nivel, ronda) {
  const desde = ((ronda - 1) % jugadasDelBanco(nivel)) * BUENOS_POR_JUGADA;
  return {
    buenos: nivel.habitos.slice(desde, desde + BUENOS_POR_JUGADA),
    malos: nivel.malos.slice(desde, desde + MALOS_POR_JUGADA),
  };
}

/**
 * Registro de la jugada de un nivel. Si no existe, lo CREA (efecto lateral) con la ronda 1, marcando
 * lo de esa ronda que ya se hubiera marcado hoy.
 * @param {Estado} s
 * @param {Nivel} nivel
 * @param {string} [hoyClave]
 * @returns {RegistroJugada}
 */
export function jugadaDe(s, nivel, hoyClave = claveDia()) {
  if (!s.rd) s.rd = {};
  let registro = s.rd[nivel.id];
  if (!registro) {
    const marcadosHoy = s.days[hoyClave] || [];
    const lote = loteDe(nivel, 1);
    registro = {
      r: 1,
      c: 0,
      done: lote.buenos.map((h) => h.id).filter((id) => marcadosHoy.includes(id)),
      mal: lote.malos.map((h) => h.id).filter((id) => marcadosHoy.includes(id)),
      l: 0,
    };
    s.rd[nivel.id] = registro;
  }
  if (!registro.mal) registro.mal = []; // partidas guardadas antes de existir los descuidos
  return registro;
}

/** Lote de la jugada en curso de un nivel. @param {Estado} s @param {Nivel} nivel @returns {{buenos: Habito[], malos: Habito[]}} */
export const loteActivo = (s, nivel) => loteDe(nivel, jugadaDe(s, nivel).r);

/** Hábitos buenos de la jugada en curso. @param {Estado} s @param {Nivel} nivel @returns {Habito[]} */
export const habitosActivos = (s, nivel) => loteActivo(s, nivel).buenos;

/** Cuántos hábitos buenos de la jugada en curso están marcados (= golpes al enemigo). @param {Estado} s @param {Nivel} nivel @returns {number} */
export function hechosEnJugada(s, nivel) {
  const hechos = jugadaDe(s, nivel).done;
  return habitosActivos(s, nivel).filter((h) => hechos.includes(h.id)).length;
}

/** Cuántos descuidos de la jugada en curso están reconocidos (= golpes al salvador). @param {Estado} s @param {Nivel} nivel @returns {number} */
export function malosEnJugada(s, nivel) {
  const malos = jugadaDe(s, nivel).mal;
  return loteActivo(s, nivel).malos.filter((h) => malos.includes(h.id)).length;
}

/**
 * Vida de cada bando en la jugada en curso (de 3 a 0).
 * @param {Estado} s @param {Nivel} nivel
 * @returns {{enemigo: number, salvador: number}}
 */
export function vidaDeJugada(s, nivel) {
  return {
    enemigo: BUENOS_POR_JUGADA - hechosEnJugada(s, nivel),
    salvador: MALOS_POR_JUGADA - malosEnJugada(s, nivel),
  };
}

/** Cuántos hábitos buenos del banco de un nivel se marcaron en un día concreto. @param {Estado} s @param {Nivel} nivel @param {string} clave @returns {number} */
export function hechosEnDia(s, nivel, clave) {
  const dia = s.days[clave] || [];
  return nivel.habitos.filter((h) => dia.includes(h.id)).length;
}

/** ¿Se marcó este hábito alguna vez, en cualquier día? @param {Estado} s @param {string} id @returns {boolean} */
export const hechoAlgunaVez = (s, id) => Object.values(s.days).some((dia) => dia.includes(id));

/** Jugadas GANADAS en un nivel. @param {Estado} s @param {Nivel} nivel @returns {number} */
export const jugadasCompletasDe = (s, nivel) => jugadaDe(s, nivel).c || 0;

/**
 * Los cinco «frentes» de la familia: un nivel está CUBIERTO cuando se ganó al menos una jugada en él. Alimenta la
 * narrativa «¿Tu familia está lista?» (ver `datos/caso.js`).
 * @param {Estado} s
 * @returns {{id: string, nombre: string, cubierto: boolean}[]}
 */
export function frentesCubiertos(s) {
  return NIVELES.map((nivel) => ({ id: nivel.id, nombre: nivel.nombre, cubierto: jugadasCompletasDe(s, nivel) >= 1 }));
}

/** Jugadas ganadas en todos los niveles. @param {Estado} s @returns {number} */
export const jugadasCompletas = (s) => NIVELES.reduce((n, nivel) => n + jugadasCompletasDe(s, nivel), 0);

/** Veces que cayó el salvador en un nivel. @param {Estado} s @param {Nivel} nivel @returns {number} */
export const derrotasDe = (s, nivel) => jugadaDe(s, nivel).l || 0;

/** Pasos de preparación para el fuego cumplidos (hábitos «Listo para la emergencia»). @param {Estado} s @returns {number} */
export function preparacionFuego(s) {
  const nivel = NIVELES.find((n) => n.preparacion);
  return nivel ? nivel.preparacion.filter((id) => hechoAlgunaVez(s, id)).length : 0;
}

/* ------------------------------------------------------------------ qué sigue */

/**
 * Índice del nivel que conviene jugar ahora: el de menos jugadas ganadas (el primero si hay empate).
 * Así se reparte el esfuerzo entre los cinco temas.
 * @param {Estado} s @returns {number}
 */
export function siguienteNivel(s) {
  let mejor = 0;
  NIVELES.forEach((nivel, i) => { if (jugadasCompletasDe(s, nivel) < jugadasCompletasDe(s, NIVELES[mejor])) mejor = i; });
  return mejor;
}

/** Texto de un hábito (bueno o descuido) a partir de su id (para mensajes). @param {string} id @returns {string} */
export const textoDeHabito = (id) => buscarHabito(id)?.texto ?? id;

/* ------------------------------------------------------------------ marcar un hábito */

/**
 * Victoria: el enemigo cayó. Es lo que la interfaz celebra (ventana con la insignia).
 * @typedef {Object} Victoria
 * @property {number}  nivel       Índice del nivel en `NIVELES`.
 * @property {number}  hecha       Número de la jugada que se acaba de ganar (1, 2, 3…).
 * @property {number}  insignia    Índice de la insignia que se tiene ahora (en `INSIGNIAS`).
 * @property {boolean} nueva       true si con esta jugada se ganó una insignia nueva.
 * @property {{buenos: Habito[], malos: Habito[]}} siguientes  Los hábitos de la jugada que empieza.
 */

/**
 * Derrota: el salvador cayó. La jugada se repite con los mismos hábitos; la interfaz explica cómo corregir cada descuido.
 * @typedef {Object} Derrota
 * @property {number} nivel     Índice del nivel en `NIVELES`.
 * @property {number} intento   Cuántas veces ha caído el salvador en este nivel (1, 2…).
 * @property {{malo: Habito, bueno: Habito}[]} correcciones  Cada descuido y el hábito bueno que lo corrige.
 */

/**
 * Marca o desmarca un hábito bueno o un descuido y hace avanzar la carrera. Es la regla central del juego.
 *
 * - Actualiza las marcas del día (`days`) y las de la jugada en curso (`rd[nivel].done` / `.mal`).
 * - Con el 3.er hábito bueno: VICTORIA. Suma una jugada ganada, pasa a la siguiente ronda y devuelve `victoria`.
 * - Con el 3.er descuido: DERROTA. La ronda no cambia (se repite) y devuelve `derrota`.
 * - Si la XP hace subir de insignia, `insigniaNueva` trae su índice (también al reconocer descuidos, que dan XP).
 *
 * @param {Estado} s
 * @param {Nivel} nivel
 * @param {string} idHabito      Id de un hábito bueno o de un descuido del lote en curso.
 * @param {boolean} marcado      true = marcar, false = desmarcar.
 * @param {string} [clave]       Día en que se marca (por defecto hoy).
 * @returns {{resultado: 'victoria' | 'derrota' | null, victoria: Victoria | null, derrota: Derrota | null, insigniaNueva: number | null}}
 */
export function registrarMarca(s, nivel, idHabito, marcado, clave = claveDia()) {
  const insigniaAntes = indiceInsignia(xpDe(s));
  const dia = s.days[clave] || (s.days[clave] = []);
  const registro = jugadaDe(s, nivel, clave);
  const lista = esHabitoMalo(idHabito) ? registro.mal : registro.done;

  const iDia = dia.indexOf(idHabito);
  if (marcado && iDia < 0) dia.push(idHabito);
  else if (!marcado && iDia > -1) dia.splice(iDia, 1);

  const iLista = lista.indexOf(idHabito);
  if (marcado && iLista < 0) lista.push(idHabito);
  else if (!marcado && iLista > -1) lista.splice(iLista, 1);

  if (!dia.length) delete s.days[clave];

  const insigniaAhora = indiceInsignia(xpDe(s));
  const insigniaNueva = insigniaAhora > insigniaAntes ? insigniaAhora : null;
  const lote = loteActivo(s, nivel);
  const indiceNivel = NIVELES.indexOf(nivel);

  if (marcado && hechosEnJugada(s, nivel) === BUENOS_POR_JUGADA) {
    registro.c = (registro.c || 0) + 1;
    const victoria = {
      nivel: indiceNivel,
      hecha: registro.r,
      insignia: insigniaAhora,
      nueva: insigniaNueva !== null,
      siguientes: loteDe(nivel, registro.r + 1),
    };
    registro.r += 1;
    registro.done = [];
    registro.mal = [];
    return { resultado: 'victoria', victoria, derrota: null, insigniaNueva };
  }

  if (marcado && malosEnJugada(s, nivel) === MALOS_POR_JUGADA) {
    registro.l = (registro.l || 0) + 1;
    const derrota = {
      nivel: indiceNivel,
      intento: registro.l,
      correcciones: lote.malos.map((malo, k) => ({ malo, bueno: lote.buenos[k] })),
    };
    registro.done = [];
    registro.mal = [];
    return { resultado: 'derrota', victoria: null, derrota, insigniaNueva };
  }

  return { resultado: null, victoria: null, derrota: null, insigniaNueva };
}
