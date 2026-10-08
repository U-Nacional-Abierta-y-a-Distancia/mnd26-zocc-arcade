/**
 * Hace que un elemento flotante (`position: fixed`) se pueda mover por toda la pantalla con el ratón, el dedo o
 * el teclado (flechas; Mayús = más lejos). Recuerda la posición entre visitas y nunca deja que se salga de la ventana.
 *
 * Distingue «arrastrar» de «tocar»: un movimiento de más de 6 px es un arrastre; si no, es un clic normal.
 *
 * @module ui/chat/arrastre
 */

const UMBRAL_ARRASTRE_PX = 6;
const PASO_TECLADO_PX = 20;
const PASO_TECLADO_GRANDE_PX = 80;
const MARGEN_PX = 8;

/**
 * @param {HTMLElement} elemento
 * @param {{ clave: string, anchoInicial?: number, altoInicial?: number, margenInicial?: number }} opciones
 *        `clave`: dónde se guarda la posición en `localStorage`.
 * @returns {{ fueArrastre: () => boolean }}
 *          `fueArrastre()` dice si el último gesto fue un arrastre (y lo reinicia): úsalo para ignorar el clic que
 *          el navegador dispara al soltar.
 */
export function hacerArrastrable(elemento, { clave, anchoInicial = 92, altoInicial = 150, margenInicial = 16 }) {
  let arrastrado = false;
  /** @type {{id:number, x:number, y:number, izq:number, arr:number, activo:boolean} | null} */
  let gesto = null;

  const medida = () => ({ ancho: elemento.offsetWidth || anchoInicial, alto: elemento.offsetHeight || altoInicial });

  /** Coloca el elemento limitando la posición a la ventana. @returns {{x:number, y:number}} */
  function colocar(x, y, guardar) {
    const { ancho, alto } = medida();
    const p = {
      x: Math.min(Math.max(MARGEN_PX, x), Math.max(MARGEN_PX, innerWidth - ancho - MARGEN_PX)),
      y: Math.min(Math.max(MARGEN_PX, y), Math.max(MARGEN_PX, innerHeight - alto - MARGEN_PX)),
    };
    elemento.style.left = `${p.x}px`;
    elemento.style.top = `${p.y}px`;
    elemento.style.right = 'auto';
    elemento.style.bottom = 'auto';
    if (guardar) { try { localStorage.setItem(clave, JSON.stringify(p)); } catch { /* sin almacenamiento */ } }
    return p;
  }

  /** Posición guardada o, si no hay, la esquina inferior derecha. */
  function posicionInicial() {
    let guardada = null;
    try { guardada = JSON.parse(localStorage.getItem(clave)); } catch { /* ignorar */ }
    const { ancho, alto } = medida();
    if (guardada && Number.isFinite(guardada.x) && Number.isFinite(guardada.y)) colocar(guardada.x, guardada.y, false);
    else colocar(innerWidth - ancho - margenInicial, innerHeight - alto - margenInicial, false);
  }

  elemento.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const caja = elemento.getBoundingClientRect();
    gesto = { id: e.pointerId, x: e.clientX, y: e.clientY, izq: caja.left, arr: caja.top, activo: false };
    try { elemento.setPointerCapture(e.pointerId); } catch { /* eventos sintéticos */ }
  });

  elemento.addEventListener('pointermove', (e) => {
    if (!gesto || gesto.id !== e.pointerId) return;
    const dx = e.clientX - gesto.x; const dy = e.clientY - gesto.y;
    if (!gesto.activo && Math.hypot(dx, dy) > UMBRAL_ARRASTRE_PX) {
      gesto.activo = true;
      elemento.classList.add('arrastrando');
    }
    if (gesto.activo) colocar(gesto.izq + dx, gesto.arr + dy, false);
  });

  /** Fin del gesto (soltar o cancelar). */
  function soltar(e) {
    if (!gesto || gesto.id !== e.pointerId) return;
    if (gesto.activo) {
      arrastrado = true;
      const caja = elemento.getBoundingClientRect();
      colocar(caja.left, caja.top, true);
      setTimeout(() => { arrastrado = false; }, 60);
    }
    elemento.classList.remove('arrastrando');
    gesto = null;
  }
  elemento.addEventListener('pointerup', soltar);
  elemento.addEventListener('pointercancel', soltar);

  // Teclado: flechas mueven; Mayús mueve más.
  elemento.addEventListener('keydown', (e) => {
    const paso = e.shiftKey ? PASO_TECLADO_GRANDE_PX : PASO_TECLADO_PX;
    const dx = e.key === 'ArrowLeft' ? -paso : e.key === 'ArrowRight' ? paso : 0;
    const dy = e.key === 'ArrowUp' ? -paso : e.key === 'ArrowDown' ? paso : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    const caja = elemento.getBoundingClientRect();
    colocar(caja.left + dx, caja.top + dy, true);
  });

  // Si cambia el tamaño de la ventana, se vuelve a limitar a la pantalla.
  window.addEventListener('resize', () => {
    if (!elemento.offsetWidth) return; // oculto (chat abierto)
    const caja = elemento.getBoundingClientRect();
    colocar(caja.left, caja.top, false);
  });

  posicionInicial();

  return {
    fueArrastre() {
      const fue = arrastrado;
      arrastrado = false;
      return fue;
    },
  };
}
