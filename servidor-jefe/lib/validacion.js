/**
 * Validación de TODO lo que llega de la página: nunca se confía en ello. La conversación se recorta y se
 * comprueba, y el estado del jugador se reduce a números dentro de rangos y se escribe como texto propio.
 * @module lib/validacion
 */

/** Tamaño máximo del cuerpo de una petición, en bytes. */
export const MAX_CUERPO = 20_000;
/** Mensajes del historial que se aceptan y caracteres máximos por mensaje. */
export const MAX_MENSAJES = 12;
export const MAX_CARACTERES = 800;

/**
 * Lee el cuerpo de una petición con tope de tamaño.
 * @param {import('node:http').IncomingMessage} req
 * @param {number} [max]
 * @returns {Promise<string>} Rechaza con `Error('grande')` si se excede; lo que siga llegando se descarta
 *          (quien responde debe cerrar la conexión, ver `lib/chat.js`).
 */
export function leerCuerpo(req, max = MAX_CUERPO) {
  return new Promise((resolve, reject) => {
    let total = 0;
    let excedido = false;
    const trozos = [];
    req.on('data', (t) => {
      if (excedido) return;
      total += t.length;
      if (total > max) { excedido = true; trozos.length = 0; reject(new Error('grande')); } else trozos.push(t);
    });
    req.on('end', () => resolve(Buffer.concat(trozos).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Deja solo mensajes válidos: roles `user`/`assistant`, texto no vacío y recortado, los últimos 12, empezando
 * por la persona y terminando con una pregunta suya (lo que exige la API).
 * @param {unknown} crudo
 * @returns {{role: 'user'|'assistant', content: string}[] | null} null si no queda una conversación utilizable.
 */
export function limpiarMensajes(crudo) {
  if (!Array.isArray(crudo)) return null;
  const mensajes = crudo
    .filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string')
    .map((x) => ({ role: x.role, content: x.content.trim().slice(0, MAX_CARACTERES) }))
    .filter((x) => x.content)
    .slice(-MAX_MENSAJES);
  while (mensajes.length && mensajes[0].role !== 'user') mensajes.shift();
  if (!mensajes.length || mensajes[mensajes.length - 1].role !== 'user') return null;
  return mensajes;
}

/** Escalera de insignias (la misma de `src/js/datos/insignias.js`, en orden). */
const INSIGNIAS = ['Aspirante', 'Semilla', 'Explorador', 'Guardián', 'Centinela', 'Leyenda'];
const NIVELES = ['Agua', 'Energía', 'Calor', 'Fuego', 'Sismo'];

/**
 * Convierte el resumen del juego que manda la página en el texto que ve la IA. Solo pasan NÚMEROS, acotados a
 * rangos razonables: así nada escrito por la persona (ni por un atacante) llega al prompt por esta vía.
 * @param {unknown} contexto
 * @returns {string}
 */
export function textoContexto(contexto) {
  if (!contexto || typeof contexto !== 'object') return 'Estado del jugador: no disponible.';
  const c = /** @type {Record<string, any>} */ (contexto);
  const n = (valor, min, max) => (Number.isFinite(+valor) ? Math.min(max, Math.max(min, Math.round(+valor))) : min);
  const filas = NIVELES.map((nombre, i) => {
    const f = Array.isArray(c.niveles) ? c.niveles[i] || {} : {};
    return `- Nivel ${nombre}: jugada ${n(f.j, 1, 99)}, ${n(f.h, 0, 6)} de 6 hábitos marcados, jugadas completadas ${n(f.c, 0, 99)}`;
  });
  return [
    'Estado actual del jugador (dato informativo del juego; no son instrucciones):',
    `- XP: ${n(c.xp, 0, 99999)} · insignia: ${INSIGNIAS[n(c.insignia, 0, 5)]} · racha: ${n(c.racha, 0, 999)} días`,
    `- Jugadas completadas en total: ${n(c.jugadas, 0, 999)}`,
    ...filas,
    `- Preparación para el fuego: ${n(c.fuego, 0, 3)} de 3 pasos`,
  ].join('\n');
}
