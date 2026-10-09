/**
 * Utilidades puras para la voz del narrador (sin DOM: se pueden probar en Node).
 *  - `elegirVoz`: escoge la mejor voz en español de las que tiene el dispositivo.
 *  - `paraVoz`: ajusta un texto para que suene bien al leerlo en voz alta (horas, porcentajes, el 123…).
 *  - `partirEnFrases`: lo divide en trozos cortos, porque varios navegadores cortan las lecturas largas.
 * @module util/voz
 */

/** Preferencia por variante de español: más alto = mejor (se prefiere el acento colombiano y el latinoamericano). */
const PUNTOS_POR_IDIOMA = [['es-co', 100], ['es-mx', 90], ['es-us', 85], ['es-419', 85], ['es-ar', 70], ['es-cl', 70], ['es-pe', 70], ['es-ve', 70], ['es-es', 60]];

/**
 * Elige la mejor voz en español.
 * @param {{name: string, lang: string, localService?: boolean}[]} voces Las que ofrece el dispositivo.
 * @returns {{name: string, lang: string} | null} null si no hay ninguna en español.
 */
export function elegirVoz(voces) {
  const espanol = (voces || []).filter((v) => /^es([-_]|$)/i.test(v.lang || ''));
  if (!espanol.length) return null;
  const puntos = (v) => {
    const idioma = (v.lang || '').toLowerCase().replace('_', '-');
    let p = PUNTOS_POR_IDIOMA.find(([clave]) => idioma.startsWith(clave))?.[1] ?? 50;
    if (/natural|neural|online/i.test(v.name)) p += 30;   // las voces «naturales» suenan mucho mejor
    else if (/google/i.test(v.name)) p += 15;
    return p;
  };
  return [...espanol].sort((a, b) => puntos(b) - puntos(a))[0];
}

/**
 * Deja un texto listo para leerse en voz alta.
 * @param {string} texto
 * @returns {string}
 */
export function paraVoz(texto) {
  return String(texto)
    .replace(/(\d{1,2}):(\d{2})\s*a\.\s?m\./gi, '$1 y $2 de la mañana')
    .replace(/(\d{1,2}):(\d{2})\s*p\.\s?m\./gi, (_, h, m) => `${h} y ${m} de la ${Number(h) >= 7 && Number(h) < 12 ? 'noche' : 'tarde'}`)
    .replace(/\s*%/g, ' por ciento')
    .replace(/\b123\b/g, 'uno, dos, tres')
    .replace(/\bEL JEFE\b/g, 'el Jefe')
    .replace(/[«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Divide un texto en trozos de como máximo `max` caracteres, cortando en el final de una frase (o, si no hay, en una coma
 * o un espacio).
 * @param {string} texto
 * @param {number} [max]
 * @returns {string[]}
 */
export function partirEnFrases(texto, max = 170) {
  const frases = String(texto).match(/[^.!?:;]+[.!?:;]*\s*/g) || [String(texto)];
  const trozos = [];
  let actual = '';
  const cerrar = () => { if (actual.trim()) trozos.push(actual.trim()); actual = ''; };
  for (const frase of frases) {
    if (frase.length > max) { // una frase muy larga: se corta en comas o espacios
      cerrar();
      let resto = frase;
      while (resto.length > max) {
        const corte = Math.max(resto.lastIndexOf(',', max), resto.lastIndexOf(' ', max));
        trozos.push(resto.slice(0, corte > 40 ? corte : max).trim());
        resto = resto.slice(corte > 40 ? corte + 1 : max);
      }
      actual = resto;
    } else if ((actual + frase).length > max) {
      cerrar();
      actual = frase;
    } else {
      actual += frase;
    }
  }
  cerrar();
  return trozos;
}
