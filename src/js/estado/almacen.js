/**
 * Almacenamiento del progreso en `localStorage`.
 *
 * Qué se guarda (clave `ysph-v2`), una sola raíz para toda la familia:
 *
 *   { famName: 'Los Salazar',          // nombre de la familia (opcional)
 *     active:  'Mama',                 // nickname del jugador activo
 *     members: { Mama: <Estado>, … } } // un estado por integrante (ver `dominio/progreso.js`)
 *
 * Los nombres de estos campos (`famName`, `active`, `members`) son los guardados en los dispositivos de las
 * personas: NO los renombres sin escribir una migración.
 *
 * Este módulo expone dos «ranuras» vivas (`R` y `S`): cualquier otro módulo que las importe ve siempre el valor
 * actual, aunque cambie de jugador. Solo este módulo las reasigna.
 *
 * @module estado/almacen
 */
import { CLAVES } from '../config.js';
import { estadoNuevo, repararEstado } from '../dominio/progreso.js';

/** @typedef {import('../dominio/progreso.js').Estado} Estado */
/** @typedef {{famName: string, active: string | null, members: Record<string, Estado>, legacy?: Estado}} Raiz */

/** Toda la familia. @type {Raiz} */
export let R = { famName: '', active: null, members: {} };

/** Estado del jugador activo (un estado vacío mientras nadie haya entrado). @type {Estado} */
export let S = { days: {}, kit: [], fam: 3 };

/** Dónde se guarda. Por defecto `localStorage`; las pruebas pueden inyectar otro. @type {Storage | null} */
let disco = null;

/** Devuelve el almacenamiento disponible o null (modo privado, bloqueado…). */
function almacenamiento() {
  if (disco) return disco;
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

/**
 * Lee lo guardado y deja listas `R` y `S`. Se llama una vez al arrancar.
 * Si solo existe el formato antiguo (un único jugador, `arcade-habitos-v1`), lo guarda como `R.legacy` para
 * asignarlo al primer nickname que se cree.
 * @param {Storage} [almacen] Almacenamiento alternativo (pruebas).
 */
export function cargar(almacen) {
  if (almacen) disco = almacen;
  R = { famName: '', active: null, members: {} };
  S = { days: {}, kit: [], fam: 3 };
  try {
    const guardado = almacenamiento()?.getItem(CLAVES.estado);
    if (guardado) {
      const raiz = JSON.parse(guardado);
      if (raiz && raiz.members) R = raiz;
    } else {
      const antiguo = almacenamiento()?.getItem(CLAVES.estadoAntiguo);
      if (antiguo) {
        const e = JSON.parse(antiguo);
        if (e && e.days) R.legacy = e;
      }
    }
  } catch { /* datos corruptos o sin acceso: se empieza de cero */ }
  if (R.active && R.members[R.active]) S = repararEstado(R.members[R.active]);
  else R.active = null;
}

/** Guarda todo. Si el almacenamiento no está disponible, el juego sigue funcionando sin persistir. */
export function guardar() {
  if (R.active) R.members[R.active] = S;
  try { almacenamiento()?.setItem(CLAVES.estado, JSON.stringify(R)); } catch { /* sin espacio o bloqueado */ }
}

/** Nickname del jugador activo (o 'jugador' si nadie ha entrado). @returns {string} */
export const apodoActivo = () => R.active || 'jugador';

/** ¿Hay un jugador activo? @returns {boolean} */
export const hayJugadorActivo = () => Boolean(R.active);

/** Nicknames inscritos en la familia. @returns {string[]} */
export const apodosDeLaFamilia = () => Object.keys(R.members);

/**
 * Inscribe a un integrante con un estado nuevo.
 * @param {string} apodo Ya validado (ver `dominio/familia.js`).
 * @param {{ heredarAntiguo?: boolean }} [opciones]
 *        `heredarAntiguo`: si es el primer integrante y había un progreso del formato antiguo, lo recibe.
 */
export function inscribir(apodo, { heredarAntiguo = false } = {}) {
  if (R.members[apodo]) return;
  const hereda = heredarAntiguo && R.legacy && Object.keys(R.members).length === 0;
  R.members[apodo] = hereda ? repararEstado(/** @type {Estado} */ (R.legacy)) : estadoNuevo();
  if (heredarAntiguo) delete R.legacy;
  if (!R.members[apodo].joined) R.members[apodo].joined = Date.now();
  guardar();
}

/**
 * Cambia el jugador activo. Guarda al saliente y carga al entrante.
 * @param {string} apodo
 * @returns {boolean} false si no existe.
 */
export function activarJugador(apodo) {
  if (!R.members[apodo]) return false;
  guardar();
  R.active = apodo;
  S = repararEstado(R.members[apodo]);
  guardar();
  return true;
}

/** Quita a un integrante y borra su progreso de este dispositivo. @param {string} apodo */
export function quitarIntegrante(apodo) {
  delete R.members[apodo];
  guardar();
}

/** Cambia el nombre de la familia. @param {string} nombre */
export function nombrarFamilia(nombre) {
  R.famName = nombre;
  guardar();
}

/** Deja un ánimo pendiente para un integrante. @param {string} para @param {string} de */
export function enviarAnimo(para, de) {
  R.members[para].nudge = { from: de, at: Date.now() };
  guardar();
}

/** Toma el ánimo pendiente del jugador activo (y lo borra). @returns {{from: string, at: number} | null} */
export function consumirAnimo() {
  const animo = S.nudge;
  if (!animo) return null;
  delete S.nudge;
  guardar();
  return animo;
}

/** Borra el progreso (hábitos y mochila) del jugador activo. */
export function reiniciarProgreso() {
  S = { days: {}, kit: [], fam: 3 };
  guardar();
}
