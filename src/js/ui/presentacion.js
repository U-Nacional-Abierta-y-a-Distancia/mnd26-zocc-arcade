/**
 * Presentación inicial: dos pantallas antes de la portada.
 *  1. (5 s) El logo de ARCADE, quiénes diseñan el juego, el logo de las Olimpiadas Unadistas y una barra de carga.
 *  2. (7 s) «Cargando el juego…»: para quién es, en qué consiste y los cinco niveles, que aparecen uno a uno.
 *
 * Se muestra una vez por sesión del navegador. Se puede saltar con «Saltar», «Entrar al juego» o Esc.
 * Los tiempos están en `config.js` (`TIEMPOS`). El marcado está al inicio de `index.html` (`#splash`).
 *
 * @module ui/presentacion
 */
import { CLAVES, TIEMPOS } from '../config.js';
import { $, $$, reducirMovimiento } from '../util/dom.js';

/** Arranca la presentación (o la quita de inmediato si ya se vio en esta sesión). */
export function iniciarPresentacion() {
  const cubierta = $('#splash');
  if (!cubierta) return;

  let yaVista = false;
  try { yaVista = sessionStorage.getItem(CLAVES.presentacionVista) === '1'; } catch { /* ignorar */ }
  if (yaVista) { cubierta.remove(); return; }

  document.body.classList.add('splash-on');
  const escena1 = $('#sp1');
  const escena2 = $('#sp2');
  const temporizadores = [];
  let terminada = false;
  const en = (accion, ms) => temporizadores.push(setTimeout(accion, ms));

  /** Termina la presentación: recuerda que ya se vio, se desvanece y deja el foco en el título de la portada. */
  function terminar() {
    if (terminada) return;
    terminada = true;
    temporizadores.forEach(clearTimeout);
    try { sessionStorage.setItem(CLAVES.presentacionVista, '1'); } catch { /* ignorar */ }
    cubierta.classList.add('out');
    setTimeout(() => {
      cubierta.remove();
      document.body.classList.remove('splash-on');
      const titulo = $('#home h1');
      if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
    }, reducirMovimiento ? 0 : 500);
  }
  $('.splash-skip', cubierta).addEventListener('click', terminar);
  $('.sp-enter', cubierta).addEventListener('click', terminar);
  cubierta.addEventListener('keydown', (e) => { if (e.key === 'Escape') terminar(); });

  // Escena 1: la barra se llena con CSS en 5 s; aquí solo se actualiza su valor para lectores de pantalla.
  const barra = $('.sp-bar', escena1);
  requestAnimationFrame(() => requestAnimationFrame(() => cubierta.classList.add('run1')));
  let porcentaje = 0;
  const lectura = setInterval(() => {
    porcentaje = Math.min(100, porcentaje + 2);
    barra.setAttribute('aria-valuenow', String(porcentaje));
    if (porcentaje >= 100) clearInterval(lectura);
  }, 100);

  // Escena 2: el juego «se carga»; los bloques aparecen escalonados.
  en(() => {
    escena1.classList.remove('on');
    escena2.classList.add('on');
    cubierta.classList.add('run2');
    $('.sp-enter', cubierta).focus({ preventScroll: true });
  }, TIEMPOS.presentacionEscena1Ms);
  $$('.sp-block,.sp-chips', escena2).forEach((bloque, i) => {
    en(() => bloque.classList.add('in'), TIEMPOS.presentacionEscena1Ms + TIEMPOS.presentacionBloquesMs[i]);
  });
  en(() => { $('.sp-load', escena2).textContent = 'Listo'; }, TIEMPOS.presentacionEscena1Ms + TIEMPOS.presentacionListoMs);
  en(terminar, TIEMPOS.presentacionEscena1Ms + TIEMPOS.presentacionFinMs);

  $('.splash-skip', cubierta).focus({ preventScroll: true });
}
