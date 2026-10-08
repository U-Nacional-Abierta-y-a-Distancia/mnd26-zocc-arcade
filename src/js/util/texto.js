/**
 * Utilidades de texto (sin DOM: se pueden probar en Node).
 * @module util/texto
 */

/**
 * Pasa a minúsculas y quita las tildes, para comparar lo que escribe la persona.
 * @param {string} s
 * @returns {string} 'Cómo VOY' → 'como voy'
 */
export function normalizar(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Escapa los caracteres con significado en HTML. @param {string} s @returns {string} */
export function escaparHtml(s) {
  return s.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
}

/**
 * Convierte el texto de una respuesta (con **negritas**, viñetas «- » y saltos de línea) en HTML seguro.
 * Primero escapa todo el HTML, así que nada de lo que llegue de la IA puede inyectar etiquetas.
 * @param {unknown} texto
 * @returns {string}
 */
export function formatoLigero(texto) {
  return escaparHtml(String(texto))
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/^\s*[-*] /gm, '• ')
    .replace(/\n/g, '<br>');
}

/** Singular o plural de «día». @param {number} n @returns {string} '1 día' / '3 días' */
export const diasTexto = (n) => `${n} ${n === 1 ? 'día' : 'días'}`;
