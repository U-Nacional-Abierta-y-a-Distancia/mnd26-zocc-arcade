/**
 * Utilidades de fecha. Los días se identifican con una clave «AAAA-MM-DD» en HORA LOCAL.
 * @module util/fecha
 */

/**
 * Clave del día en hora local.
 * @param {Date} [fecha] Por defecto, ahora.
 * @returns {string} Ejemplo: '2026-10-07'
 */
export function claveDia(fecha = new Date()) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Clave del día de hoy. @returns {string} */
export const hoy = () => claveDia();

/**
 * Convierte una clave de día en un número entero de días, para poder restar fechas.
 * @param {string} clave 'AAAA-MM-DD'
 * @returns {number}
 */
export function numeroDeDia(clave) {
  const [anio, mes, dia] = clave.split('-');
  return Math.round(new Date(Number(anio), Number(mes) - 1, Number(dia)).getTime() / 864e5);
}
