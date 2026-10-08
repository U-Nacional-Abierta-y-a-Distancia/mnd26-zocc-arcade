/**
 * Navegación: portada ↔ zona de juego, secciones, menús hamburguesa y barra de progreso de la portada.
 *
 * La página es de una sola pantalla (`index.html`): las «vistas» son secciones que se muestran u ocultan.
 *   'home'                                                  → portada
 *   'retos' | 'mochila' | 'agentes' | 'familia' | 'ranking' → zona de juego
 * Cualquier elemento con `data-go="vista"` navega a esa vista; con `data-scroll="id"` baja a esa sección de la portada.
 *
 * @module ui/navegacion
 */
import { hayJugadorActivo } from '../estado/almacen.js';
import { $, $$, reducirMovimiento } from '../util/dom.js';
import { renderFamilia } from './familia.js';
import { pedirApodo } from './identidad.js';
import { particulasPortada } from './particulas.js';
import { renderTodo } from './render.js';

/** Vistas de la zona de juego (todas requieren haberse identificado). */
const VISTAS_DE_JUEGO = ['retos', 'mochila', 'agentes', 'familia', 'ranking'];

let vista = 'home';

/** Vista que se está mostrando. @returns {string} */
export const vistaActual = () => vista;

/**
 * Muestra una vista. Si es de la zona de juego y nadie se ha identificado, pide el nickname primero.
 * @param {string} destino 'home' o una de `VISTAS_DE_JUEGO`.
 */
export function ir(destino) {
  const enJuego = VISTAS_DE_JUEGO.includes(destino);
  if (enJuego && !hayJugadorActivo()) { pedirApodo(() => ir(destino)); return; }
  vista = destino;

  $('#home').hidden = enJuego;
  $('#appView').hidden = !enJuego;
  $('#landNav').hidden = enJuego;
  $('#appNav').hidden = !enJuego;
  document.body.classList.toggle('in-app', enJuego);
  $('#scrollbar').style.display = enJuego ? 'none' : '';
  VISTAS_DE_JUEGO.forEach((v) => { $(`#v-${v}`).hidden = (v !== destino); });
  $$('#tabs button').forEach((b) => {
    if (b.getAttribute('data-go') === destino) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  cerrarMenuDePortada();
  abrirMenuDeJuego(false);
  if (enJuego) {
    particulasPortada.detener();
    renderTodo();
    if (destino === 'familia') renderFamilia();
  } else {
    particulasPortada.iniciar();
  }
  window.scrollTo(0, 0);
  const titulo = enJuego ? $(`#v-${destino} h1`) : null;
  if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
}

/* ------------------------------------------------------------------ menú de la portada (móvil) */

function cerrarMenuDePortada() {
  $('#landLinks').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
}

/* ------------------------------------------------------------------ menú de la zona de juego (hamburguesa) */

/**
 * Abre o cierra el menú con las seis secciones del juego.
 * @param {boolean} abrir
 */
function abrirMenuDeJuego(abrir) {
  const menu = $('#tabs');
  const boton = $('#appMenuBtn');
  menu.classList.toggle('open', abrir);
  boton.setAttribute('aria-expanded', String(abrir));
  boton.setAttribute('aria-label', abrir ? 'Cerrar el menú del juego' : 'Abrir el menú del juego');
  if (abrir) (($('button[aria-current="page"]', menu) || $('button', menu)))?.focus(); // el foco va a la sección actual
}

/** Conecta clics, menús, barra de progreso y cambio de tamaño. Se llama una vez al arrancar. */
export function iniciarNavegacion() {
  // Navegación por atributos: data-go (cambiar de vista) y data-scroll (bajar a una sección de la portada).
  document.addEventListener('click', (e) => {
    const objetivo = /** @type {HTMLElement} */ (e.target);
    const enlaceIr = objetivo.closest('[data-go]');
    if (enlaceIr) { ir(enlaceIr.getAttribute('data-go')); return; }
    const bajar = objetivo.closest('[data-scroll]');
    if (bajar) {
      document.getElementById(bajar.getAttribute('data-scroll'))?.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth' });
      cerrarMenuDePortada();
    }
  });

  // Menú hamburguesa de la portada (pantallas angostas).
  $('#menuBtn').addEventListener('click', () => {
    const abierto = $('#landLinks').classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', String(abierto));
    $('#menuBtn').setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  // Menú hamburguesa de la zona de juego: botón, clic fuera y Esc.
  $('#appMenuBtn').addEventListener('click', () => abrirMenuDeJuego(!$('#tabs').classList.contains('open')));
  document.addEventListener('click', (e) => {
    const objetivo = /** @type {HTMLElement} */ (e.target);
    if ($('#tabs').classList.contains('open') && !objetivo.closest('#tabs') && !objetivo.closest('#appMenuBtn')) abrirMenuDeJuego(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#tabs').classList.contains('open')) { abrirMenuDeJuego(false); $('#appMenuBtn').focus(); }
  });

  // Barra de progreso de lectura de la portada.
  const barra = $('#scrollbar');
  window.addEventListener('scroll', () => {
    const raiz = document.documentElement;
    const maximo = raiz.scrollHeight - innerHeight;
    barra.style.setProperty('--p', (maximo > 0 ? Math.min(100, Math.max(0, (scrollY / maximo) * 100)) : 0).toFixed(1));
  }, { passive: true });

  // Al cambiar el tamaño, las partículas de la portada se vuelven a medir.
  let espera = 0;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = window.setTimeout(() => { if (vista === 'home') particulasPortada.iniciar(); }, 200);
  });
}
