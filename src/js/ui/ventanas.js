/**
 * Ventanas emergentes de la jugada, que se abren cuando termina la animación de combate:
 *  - VICTORIA («¡Jugada N completada!»): el enemigo cayó. Muestra la insignia que tienes (con confeti si es nueva),
 *    cuánto falta para la siguiente y los hábitos de la jugada que empieza.
 *  - DERROTA («Tu salvador cayó»): los descuidos ganaron. Explica cómo corregir cada uno y deja repetir la jugada.
 *
 * La regla del juego (`registrarMarca`) entrega los datos; `programar` los guarda y `mostrarPendiente` abre la
 * ventana que corresponda.
 *
 * Solo puede haber una ventana a la vez. Es accesible: `role="dialog"`, el foco queda atrapado dentro, Esc la
 * cierra y el foco vuelve al elemento que la abrió.
 *
 * @module ui/ventanas
 */
import { BUENOS_POR_JUGADA, MALOS_POR_JUGADA, XP_POR_HABITO } from '../config.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { ENEMIGOS } from '../datos/agentes.js';
import { NIVELES } from '../datos/niveles.js';
import { xpDe } from '../dominio/progreso.js';
import { S } from '../estado/almacen.js';
import { $, $$, el } from '../util/dom.js';
import { confeti } from './avisos.js';
import { sonar } from './sonido.js';
import { crearInsignia } from './insignias.js';
import { ir, vistaActual } from './navegacion.js';

/** @typedef {import('../dominio/progreso.js').Victoria & {tipo: 'victoria'}} VictoriaPendiente */
/** @typedef {import('../dominio/progreso.js').Derrota & {tipo: 'derrota'}} DerrotaPendiente */

/** Ventana abierta (o null). @type {HTMLElement | null} */
let ventana = null;
/** Elemento que tenía el foco antes de abrir la ventana. @type {Element | null} */
let focoPrevio = null;
/** Victoria o derrota que aún no se muestra. @type {VictoriaPendiente | DerrotaPendiente | null} */
let pendiente = null;

/** ¿Hay una ventana abierta? @returns {boolean} */
export const hayVentana = () => ventana !== null;

/** Guarda el resultado de la jugada para mostrarlo enseguida con `mostrarPendiente`. @param {VictoriaPendiente | DerrotaPendiente} resultado */
export function programar(resultado) {
  pendiente = resultado;
}

/** Descarta lo pendiente (al cambiar de jugador: era del anterior). */
export function descartarPendiente() {
  pendiente = null;
}

/** Cierra la ventana actual. */
export function cerrarVentana() {
  if (!ventana) return;
  ventana.remove();
  ventana = null;
  document.body.classList.remove('modal-open');
  document.dispatchEvent(new Event('ysph:ventana-cerrada')); // p. ej. el narrador deja de hablar
  if (focoPrevio instanceof HTMLElement) focoPrevio.focus();
}

/** Abre la ventana del resultado pendiente (si hay y no hay otra ventana abierta). */
export function mostrarPendiente() {
  if (!pendiente || ventana) return;
  const resultado = pendiente;
  pendiente = null;
  if (resultado.tipo === 'victoria') abrirVentanaDeVictoria(resultado);
  else abrirVentanaDeDerrota(resultado);
}

/**
 * Crea el marco (fondo, accesibilidad, teclado) y lo muestra con la tarjeta dada. Lo usan las ventanas de resultado
 * y la narrativa de EL JEFE (`ui/caso.js`).
 * @param {HTMLElement} tarjeta
 * @returns {HTMLElement} El marco (por si hace falta escuchar más teclas).
 */
export function abrirVentana(tarjeta) {
  focoPrevio = document.activeElement;
  const marco = el('div', 'modal');
  marco.setAttribute('role', 'dialog');
  marco.setAttribute('aria-modal', 'true');
  marco.setAttribute('aria-labelledby', 'popT');
  marco.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrarVentana(); return; }
    if (e.key !== 'Tab') return;
    // Trampa de foco: Tab no sale de la ventana.
    const enfocables = $$('button', marco);
    if (!enfocables.length) return;
    const primero = enfocables[0]; const ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });
  marco.addEventListener('click', (e) => { if (e.target === marco) cerrarVentana(); });
  marco.appendChild(tarjeta);
  document.body.appendChild(marco);
  document.body.classList.add('modal-open');
  ventana = marco;
  return marco;
}

/** Botón de ventana. @param {string} clase @param {string} texto @param {() => void} alClic @returns {HTMLButtonElement} */
function botonDeVentana(clase, texto, alClic) {
  const b = /** @type {HTMLButtonElement} */ (el('button', clase));
  b.textContent = texto;
  b.onclick = alClic;
  return b;
}

/** Lo que dice la ventana sobre la insignia: la ganada, o cuánto falta para la siguiente. @param {VictoriaPendiente} jugada */
function textoDeInsignia(jugada) {
  const actual = INSIGNIAS[jugada.insignia];
  const siguiente = INSIGNIAS[jugada.insignia + 1];
  const xp = xpDe(S);
  if (jugada.nueva) return { titulo: `¡Nueva insignia: ${actual.nombre}!`, detalle: actual.lema };
  if (!siguiente) return { titulo: `Insignia ${actual.nombre}`, detalle: 'Es la más alta de la escalera. Sigue repitiendo tus hábitos.' };
  const faltan = siguiente.xp - xp;
  return {
    titulo: `Insignia ${actual.nombre}`,
    detalle: `Te faltan ${faltan} XP (unos ${Math.ceil(faltan / XP_POR_HABITO)} hábitos) para ${siguiente.nombre}.`,
  };
}

/** Construye y abre la ventana «¡Jugada N completada!». @param {VictoriaPendiente} jugada */
function abrirVentanaDeVictoria(jugada) {
  const nivel = NIVELES[jugada.nivel];
  const tarjeta = el('div', 'modal-card');
  const cuerpo = el('div', 'cbody round-body');
  cuerpo.innerHTML = '<div class="premio"></div><span class="ctag"></span><h2 id="popT"></h2><p class="rwin"></p>'
    + '<div class="ins-texto"><b></b><span></span></div><p class="rnext"></p><ul class="rlist"></ul>';
  $('.premio', cuerpo).appendChild(crearInsignia(jugada.insignia, { tamano: 'grande' }));
  $('.ctag', cuerpo).textContent = `Nivel ${jugada.nivel + 1} de ${NIVELES.length} · ${nivel.nombre}`;
  $('h2', cuerpo).textContent = `¡Jugada ${jugada.hecha} completada!`;
  $('.rwin', cuerpo).textContent = nivel.textos.victoria;
  const { titulo, detalle } = textoDeInsignia(jugada);
  $('.ins-texto b', cuerpo).textContent = titulo;
  $('.ins-texto span', cuerpo).textContent = detalle;
  $('.rnext', cuerpo).textContent = `Llegan ${BUENOS_POR_JUGADA} hábitos buenos y ${MALOS_POR_JUGADA} descuidos nuevos para la jugada ${jugada.hecha + 1}:`;
  jugada.siguientes.buenos.forEach((habito) => {
    const fila = el('li');
    fila.textContent = habito.texto;
    $('.rlist', cuerpo).appendChild(fila);
  });
  jugada.siguientes.malos.forEach((habito) => {
    const fila = el('li', 'malo');
    fila.textContent = `Descuido: ${habito.texto}`;
    $('.rlist', cuerpo).appendChild(fila);
  });
  cuerpo.classList.toggle('nueva', jugada.nueva);
  tarjeta.appendChild(cuerpo);

  const barra = el('div', 'modal-bar');
  const fila = el('div', 'cgo');
  const empezar = botonDeVentana('btn sm', `Empezar la jugada ${jugada.hecha + 1}`, () => {
    cerrarVentana();
    const zona = document.getElementById(`z-${nivel.id}`);
    if (zona && vistaActual() === 'retos') zona.scrollIntoView({ block: 'start' });
  });
  const verEscalera = botonDeVentana('btn ghost sm', 'Ver mis insignias', () => { cerrarVentana(); ir('ranking'); });
  fila.append(empezar, verEscalera);
  barra.appendChild(fila);
  tarjeta.appendChild(barra);

  abrirVentana(tarjeta);
  sonar(jugada.nueva ? 'insignia' : 'victoria');
  if (jugada.nueva) confeti(innerWidth / 2, innerHeight * 0.3);
  empezar.focus();
}

/** Construye y abre la ventana «Tu salvador cayó». @param {DerrotaPendiente} derrota */
function abrirVentanaDeDerrota(derrota) {
  const nivel = NIVELES[derrota.nivel];
  const tarjeta = el('div', 'modal-card derrota');
  const cuerpo = el('div', 'cbody round-body');
  cuerpo.innerHTML = '<span class="ctag"></span><h2 id="popT"></h2><p class="rwin"></p><p class="rnext"></p><ul class="rlist corregir"></ul>';
  $('.ctag', cuerpo).textContent = `Nivel ${derrota.nivel + 1} de ${NIVELES.length} · ${nivel.nombre}`;
  $('h2', cuerpo).textContent = '¡Tu salvador cayó!';
  $('.rwin', cuerpo).textContent = `Reconociste ${MALOS_POR_JUGADA} descuidos antes de lograr tus ${BUENOS_POR_JUGADA} hábitos buenos y ${ENEMIGOS[nivel.enemigo].nombre} se hizo más fuerte. No pierdes XP: reconocerlo ya fue valiente (y suma). Repite la jugada.`;
  $('.rnext', cuerpo).textContent = 'Cómo corregir cada descuido:';
  derrota.correcciones.forEach(({ malo, bueno }) => {
    const fila = el('li');
    fila.innerHTML = '<s></s><b></b>';
    $('s', fila).textContent = malo.texto;
    $('b', fila).textContent = `En su lugar: ${bueno.texto}`;
    $('.rlist', cuerpo).appendChild(fila);
  });
  tarjeta.appendChild(cuerpo);

  const barra = el('div', 'modal-bar');
  const fila = el('div', 'cgo');
  const reintentar = botonDeVentana('btn sm', 'Intentarlo de nuevo', () => {
    cerrarVentana();
    const zona = document.getElementById(`z-${nivel.id}`);
    if (zona && vistaActual() === 'retos') zona.scrollIntoView({ block: 'start' });
  });
  fila.appendChild(reintentar);
  barra.appendChild(fila);
  tarjeta.appendChild(barra);

  abrirVentana(tarjeta);
  sonar('derrota');
  reintentar.focus();
}
