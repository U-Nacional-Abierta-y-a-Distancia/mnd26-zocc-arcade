/**
 * Avisos breves (toast) y confeti de celebración.
 * @module ui/avisos
 */
import { TIEMPOS } from '../config.js';
import { $, reducirMovimiento } from '../util/dom.js';

let temporizadorAviso = 0;

/**
 * Muestra un aviso breve en la parte inferior.
 * @param {string} mensaje
 */
export function avisar(mensaje) {
  const aviso = $('#toast');
  if (!aviso) return;
  aviso.textContent = mensaje;
  aviso.classList.add('show');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = window.setTimeout(() => aviso.classList.remove('show'), TIEMPOS.avisoMs);
}

/* ------------------------------------------------------------------ confeti */

const COLORES_CONFETI = ['#99FFFF', '#FFFFFF', '#99FFFF', '#5fc9c9'];
const TAMANOS = [6, 10, 14];

/** @type {{x:number, y:number, vx:number, vy:number, s:number, c:string, a:number, d:number}[]} */
let particulas = [];
let cuadro = 0;

/** Un cuadro de la animación: mueve, dibuja y descarta las partículas apagadas. */
function animarConfeti() {
  const lienzo = /** @type {HTMLCanvasElement} */ ($('#burst'));
  const ctx = /** @type {CanvasRenderingContext2D} */ (lienzo.getContext('2d'));
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particulas) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.a -= p.d; // gravedad y desvanecimiento
    ctx.globalAlpha = Math.max(p.a, 0);
    ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.s, p.s); // alineado a 2 px: look pixelado
  }
  ctx.globalAlpha = 1;
  particulas = particulas.filter((p) => p.a > 0.02);
  if (particulas.length) cuadro = requestAnimationFrame(animarConfeti);
  else ctx.clearRect(0, 0, innerWidth, innerHeight);
}

/**
 * Lanza una explosión de confeti pixelado.
 * @param {number} x Coordenada X en la ventana.
 * @param {number} y Coordenada Y en la ventana.
 */
export function confeti(x, y) {
  if (reducirMovimiento) return;
  const lienzo = /** @type {HTMLCanvasElement} */ ($('#burst'));
  const ctx = /** @type {CanvasRenderingContext2D} */ (lienzo.getContext('2d'));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  lienzo.width = innerWidth * dpr;
  lienzo.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particulas = Array.from({ length: 80 }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 9,
    vy: -Math.random() * 8 - 1,
    s: TAMANOS[(Math.random() * 3) | 0],
    c: COLORES_CONFETI[(Math.random() * 4) | 0],
    a: 1,
    d: 0.012 + Math.random() * 0.012,
  }));
  cancelAnimationFrame(cuadro);
  cuadro = requestAnimationFrame(animarConfeti);
}
