/**
 * Utilidades mínimas para trabajar con el DOM (el proyecto no usa librerías).
 * @module util/dom
 */

/** ¿La persona pidió reducir el movimiento? Si es así se omiten las animaciones largas. */
export const reducirMovimiento = typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Primer elemento que coincide con el selector.
 * @param {string} selector
 * @param {ParentNode} [raiz]
 * @returns {HTMLElement | null}
 */
export const $ = (selector, raiz = document) => /** @type {HTMLElement | null} */ (raiz.querySelector(selector));

/**
 * Todos los elementos que coinciden con el selector, como un arreglo.
 * @param {string} selector
 * @param {ParentNode} [raiz]
 * @returns {HTMLElement[]}
 */
export const $$ = (selector, raiz = document) => /** @type {HTMLElement[]} */ (Array.from(raiz.querySelectorAll(selector)));

/**
 * Crea un elemento.
 * @param {string} etiqueta Nombre de la etiqueta ('div', 'button'…).
 * @param {string | null} [clase] Clases CSS separadas por espacios.
 * @param {string | null} [html] Contenido HTML interno. ¡Solo texto propio del juego, nunca datos de la persona!
 * @returns {HTMLElement}
 */
export function el(etiqueta, clase, html) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (html != null) nodo.innerHTML = html;
  return nodo;
}

/**
 * Crea un botón.
 * @param {string} clase
 * @param {string} texto Texto plano.
 * @param {() => void} [alHacerClic]
 * @returns {HTMLButtonElement}
 */
export function boton(clase, texto, alHacerClic) {
  const b = /** @type {HTMLButtonElement} */ (el('button', clase));
  b.type = 'button';
  b.textContent = texto;
  if (alHacerClic) b.addEventListener('click', alHacerClic);
  return b;
}
