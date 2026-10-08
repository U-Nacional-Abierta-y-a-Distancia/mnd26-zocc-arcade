/**
 * Partículas flotantes de la portada (decoración). Solo corren mientras la portada está visible.
 * @module ui/particulas
 */
import { $, reducirMovimiento } from '../util/dom.js';

const COLORES = ['#99FFFF', '#FFFFFF', '#99FFFF', '#5fc9c9'];
const TAMANOS = [6, 10, 14];
const CANTIDAD = 46;

let lienzo = null;
let ctx = null;
let ancho = 0;
let alto = 0;
let dpr = 1;
let particulas = [];
let corriendo = false;
let cuadro = 0;

/** Ajusta el canvas al tamaño actual de su caja. */
function medir() {
  const caja = lienzo.getBoundingClientRect();
  ancho = Math.max(1, caja.width);
  alto = Math.max(1, caja.height);
  lienzo.width = ancho * dpr;
  lienzo.height = alto * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function sembrar() {
  particulas = Array.from({ length: CANTIDAD }, () => ({
    x: Math.random() * ancho,
    y: Math.random() * alto,
    s: TAMANOS[(Math.random() * 3) | 0],
    c: COLORES[(Math.random() * 4) | 0],
    a: Math.random() * 0.7 + 0.2,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.5 + 0.15),
  }));
}

function dibujar() {
  ctx.clearRect(0, 0, ancho, alto);
  for (const p of particulas) {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.s, p.s);
  }
  ctx.globalAlpha = 1;
}

function paso() {
  for (const p of particulas) {
    p.x += p.vx; p.y += p.vy;
    if (p.y < -20) { p.y = alto + 10; p.x = Math.random() * ancho; } // reaparece abajo
  }
  dibujar();
  if (corriendo) cuadro = requestAnimationFrame(paso);
}

export const particulasPortada = {
  /** Mide, siembra y arranca la animación (si no se pidió reducir el movimiento). */
  iniciar() {
    lienzo ??= $('#particles');
    if (!lienzo) return;
    ctx ??= lienzo.getContext('2d');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    medir(); sembrar(); dibujar();
    if (!reducirMovimiento && !corriendo) { corriendo = true; cuadro = requestAnimationFrame(paso); }
  },
  /** Detiene la animación (al entrar a la zona de juego). */
  detener() {
    corriendo = false;
    cancelAnimationFrame(cuadro);
  },
};
