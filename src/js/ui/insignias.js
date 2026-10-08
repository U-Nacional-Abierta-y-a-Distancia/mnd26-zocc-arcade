/**
 * Dibujo de las insignias (escudos al estilo de los exploradores). Los datos están en `datos/insignias.js`;
 * aquí solo se convierten en un elemento que se puede poner en la cabecera, en una ventana o en una lista.
 * @module ui/insignias
 */
import { INSIGNIAS, SIMBOLOS } from '../datos/insignias.js';
import { el } from '../util/dom.js';

const ESCUDO = 'M32 3l25 9v20c0 15-10.5 25-25 29C17.5 57 7 47 7 32V12z';
const ESTRELLITA = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z';

/**
 * Crea el escudo de una insignia.
 * @param {number} indice               Posición en `INSIGNIAS`.
 * @param {{bloqueada?: boolean, tamano?: 'mini' | 'normal' | 'grande'}} [opciones]
 *        `bloqueada`: aún no se ha ganado (se ve apagada y sin brillo).
 * @returns {HTMLElement}
 */
export function crearInsignia(indice, { bloqueada = false, tamano = 'normal' } = {}) {
  const insignia = INSIGNIAS[indice];
  const caja = el('span', `ins ins-${insignia.metal} ins-${tamano}${bloqueada ? ' ins-off' : ''}`);
  caja.setAttribute('role', 'img');
  caja.setAttribute('aria-label', `Insignia ${insignia.nombre}${bloqueada ? ' (aún sin ganar)' : ''}`);
  // La leyenda lleva tres estrellitas sobre el símbolo.
  const estrellas = insignia.metal === 'leyenda'
    ? [-11, 0, 11].map((dx) => `<path class="ins-estrella" transform="translate(${32 + dx - 4.5} 9) scale(.375)" d="${ESTRELLITA}"/>`).join('')
    : '';
  caja.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><path class="ins-escudo" d="${ESCUDO}"/>`
    + `<path class="ins-borde" d="${ESCUDO}" transform="translate(32 32) scale(.82) translate(-32 -32)"/>`
    + `<g class="ins-simbolo" transform="translate(17 19) scale(1.25)">${SIMBOLOS[insignia.simbolo]}</g>${estrellas}</svg>`;
  return caja;
}
