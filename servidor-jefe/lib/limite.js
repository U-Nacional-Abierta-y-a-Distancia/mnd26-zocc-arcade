/**
 * Límite de uso por IP, en memoria: protege el gasto de la clave si alguien abusa del chat.
 * Con varias instancias del servidor cada una cuenta aparte; para algo más robusto usa Redis o el límite del hosting.
 * @module lib/limite
 */

/**
 * @param {{porMinuto: number, porDia: number, ahora?: () => number}} opciones
 *        `ahora` devuelve milisegundos (se puede sustituir en las pruebas).
 * @returns {(ip: string) => boolean} Devuelve true si la petición se acepta (y la cuenta) o false si excede el límite.
 */
export function crearLimitador({ porMinuto, porDia, ahora = Date.now }) {
  /** @type {Map<string, {minutos: number[], dia: string, n: number}>} */
  const usos = new Map();

  return function permitido(ip) {
    const instante = ahora();
    const hoy = new Date(instante).toISOString().slice(0, 10);
    const uso = usos.get(ip) || { minutos: [], dia: hoy, n: 0 };
    if (uso.dia !== hoy) { uso.dia = hoy; uso.n = 0; }
    uso.minutos = uso.minutos.filter((t) => instante - t < 60_000);
    if (uso.minutos.length >= porMinuto || uso.n >= porDia) { usos.set(ip, uso); return false; }
    uso.minutos.push(instante);
    uso.n += 1;
    usos.set(ip, uso);
    // Limpieza ocasional para que el mapa no crezca sin fin.
    if (usos.size > 5000) for (const [k, v] of usos) if (!v.minutos.length) usos.delete(k);
    return true;
  };
}
