/**
 * Reglas de la familia: validación del nickname y ranking familiar. Sin DOM ni almacenamiento.
 * @module dominio/familia
 */
import { APODO, FAMILIA } from '../config.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { claveDia, numeroDeDia } from '../util/fecha.js';
import { indiceInsignia, rachaDe, xpDe } from './progreso.js';

/** @typedef {import('./progreso.js').Estado} Estado */

/**
 * Comprueba un nickname.
 * @param {string} apodo                 Ya recortado (sin espacios en los extremos).
 * @param {string[]} apodosExistentes    Los de la familia, para evitar repetidos (sin distinguir mayúsculas).
 * @returns {string} Mensaje de error para mostrar, o '' si es válido.
 */
export function mensajeDeApodoInvalido(apodo, apodosExistentes) {
  if (!APODO.patron.test(apodo)) {
    return `Usa de ${APODO.min} a ${APODO.max} letras, números, guion o guion bajo, sin espacios.`;
  }
  const repetido = apodosExistentes.some((a) => a.toLowerCase() === apodo.toLowerCase());
  if (repetido) return 'Ese nickname ya está inscrito en tu familia. Elige otro.';
  return '';
}

/**
 * Estados del ranking familiar.
 * @typedef {'lidera' | 'aldia' | 'ayuda'} EstadoFamiliar
 */

/**
 * Datos de un integrante para el ranking.
 * @typedef {Object} FilaFamilia
 * @property {string} apodo
 * @property {number} xp
 * @property {string} insignia       Nombre de la insignia que tiene.
 * @property {number} racha
 * @property {number} hoy            Hábitos marcados hoy.
 * @property {number} jugadas        Jugadas completadas.
 * @property {number|null} diasSinMarcar  Días desde su última actividad (null si nunca marcó nada).
 * @property {string|null} ultimoDia
 * @property {number} puesto         1 = primero.
 * @property {EstadoFamiliar} estado
 * @property {string} motivo         Frase que explica el estado.
 */

/**
 * Resume el progreso de un integrante a partir de su propio estado.
 * @param {string} apodo
 * @param {Estado} miembro
 * @param {string} [hoyClave]
 * @param {Date} [ahora]
 * @returns {Omit<FilaFamilia, 'puesto'|'estado'|'motivo'>}
 */
export function estadisticasDe(apodo, miembro, hoyClave = claveDia(), ahora = new Date()) {
  const dias = miembro.days || {};
  let ultimoDia = null;
  for (const [clave, lista] of Object.entries(dias)) {
    if (lista.length && (!ultimoDia || clave > ultimoDia)) ultimoDia = clave;
  }
  const xp = xpDe({ days: dias, kit: miembro.kit || [], fam: 0 });
  const jugadas = Object.values(miembro.rd || {}).reduce((n, j) => n + (j.c || 0), 0);
  return {
    apodo,
    xp,
    insignia: INSIGNIAS[indiceInsignia(xp)].nombre,
    racha: rachaDe(dias, ahora),
    hoy: (dias[hoyClave] || []).length,
    jugadas,
    diasSinMarcar: ultimoDia ? numeroDeDia(hoyClave) - numeroDeDia(ultimoDia) : null,
    ultimoDia,
  };
}

/**
 * Ordena a la familia (más XP primero; empates por racha y luego por nombre) y asigna a cada integrante su
 * puesto y su estado:
 *  - «ayuda»:  aún no empezó, lleva 2 o más días sin marcar, o tiene menos del 40 % de las XP del líder.
 *  - «lidera»: va primero (solo si hay al menos dos integrantes y tiene XP).
 *  - «aldia»:  el resto.
 * @param {Record<string, Estado>} miembros
 * @param {string} [hoyClave]
 * @param {Date} [ahora]
 * @returns {FilaFamilia[]}
 */
export function ordenarFamilia(miembros, hoyClave = claveDia(), ahora = new Date()) {
  const filas = Object.entries(miembros)
    .map(([apodo, miembro]) => estadisticasDe(apodo, miembro, hoyClave, ahora))
    .sort((a, b) => b.xp - a.xp || b.racha - a.racha || a.apodo.localeCompare(b.apodo));
  const maximo = filas.length ? filas[0].xp : 0;

  return filas.map((fila, i) => {
    let estado = 'aldia';
    let motivo = fila.hoy ? 'Al día, ya marcó hoy' : 'Al día';
    if (fila.diasSinMarcar == null) {
      estado = 'ayuda'; motivo = 'Aún no ha empezado';
    } else if (fila.diasSinMarcar >= FAMILIA.diasSinActividad) {
      estado = 'ayuda'; motivo = `Lleva ${fila.diasSinMarcar} días sin marcar hábitos`;
    } else if (filas.length > 1 && maximo > 0 && fila.xp < maximo * FAMILIA.fraccionRezago) {
      estado = 'ayuda'; motivo = 'Va bastante atrás del grupo';
    } else if (i === 0 && filas.length > 1 && fila.xp > 0) {
      estado = 'lidera'; motivo = 'Va liderando';
    }
    return { ...fila, puesto: i + 1, estado: /** @type {EstadoFamiliar} */ (estado), motivo };
  });
}
