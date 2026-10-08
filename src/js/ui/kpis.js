/**
 * Fila de tarjetas con un número grande y su etiqueta (Retos y Ranking las usan).
 * @module ui/kpis
 */
import { el } from '../util/dom.js';

/**
 * Reemplaza el contenido de un contenedor por tarjetas `[valor, etiqueta]`.
 * @param {HTMLElement} contenedor
 * @param {[string | number, string][]} filas
 */
export function pintarKpis(contenedor, filas) {
  contenedor.innerHTML = '';
  filas.forEach(([valor, etiqueta]) => {
    const tarjeta = el('div', 'kpi');
    tarjeta.appendChild(el('b', null, String(valor)));
    tarjeta.appendChild(el('span', null, etiqueta));
    contenedor.appendChild(tarjeta);
  });
}
