/**
 * Dibujo de los sprites en pixel art sobre un `<canvas>`.
 * Los datos de cada sprite están en `datos/sprites.js` (solo la mitad izquierda; aquí se espeja).
 * @module ui/sprites
 */
import { ANCHO_MITAD, PALETA, SPRITES } from '../datos/sprites.js';
import { el } from '../util/dom.js';

/** Colores de las filas «apagadas» (la parte de la mochila que aún no se llena). */
const APAGADO_OSCURO = '#142628';
const APAGADO_CLARO = '#1f4b4e';

/**
 * Dibuja un sprite en un canvas existente, ajustando su tamaño.
 * @param {HTMLCanvasElement} lienzo
 * @param {string} nombre Clave de `SPRITES`.
 * @param {number | null} [corte] Filas desde arriba que se pintan apagadas (para llenar la mochila de abajo hacia arriba).
 */
export function pintarSprite(lienzo, nombre, corte) {
  const filas = SPRITES[nombre];
  const alto = filas.length;
  lienzo.width = ANCHO_MITAD * 2;
  lienzo.height = alto;
  const ctx = /** @type {CanvasRenderingContext2D} */ (lienzo.getContext('2d'));
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ANCHO_MITAD; x += 1) {
      const c = filas[y].charAt(x);
      if (!c || c === '.') continue;
      let color = PALETA[c];
      if (corte != null && y < corte) color = (c === 'k' || c === 'g') ? APAGADO_OSCURO : APAGADO_CLARO;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);                       // mitad izquierda
      ctx.fillRect(ANCHO_MITAD * 2 - 1 - x, y, 1, 1); // mitad derecha (espejo)
    }
  }
}

/**
 * Crea un canvas nuevo con un sprite.
 * @param {string} nombre
 * @param {number | null} [corte]
 * @returns {HTMLCanvasElement}
 */
export function crearSprite(nombre, corte) {
  const lienzo = /** @type {HTMLCanvasElement} */ (el('canvas'));
  pintarSprite(lienzo, nombre, corte);
  return lienzo;
}
