/**
 * Identificación del jugador: ventana de nickname y cambio de jugador.
 * @module ui/identidad
 */
import { mensajeDeApodoInvalido, normalizarApodo } from '../dominio/familia.js';
import {
  activarJugador, apodosDeLaFamilia, consumirAnimo, guardar, inscribir,
} from '../estado/almacen.js';
import { $, boton, el } from '../util/dom.js';
import { avisar } from './avisos.js';
import { renderFamilia } from './familia.js';
import { renderTodo } from './render.js';
import { reconstruirListas } from './retos.js';
import { cerrarVentana, descartarPendiente } from './ventanas.js';

/** Ventana de nickname abierta (o null). @type {HTMLElement | null} */
let ventanaApodo = null;

/**
 * Pasa a jugar como otro integrante: carga su progreso y repinta todo.
 * @param {string} apodo Debe estar inscrito.
 */
export function cambiarJugador(apodo) {
  if (!activarJugador(apodo)) return;
  descartarPendiente();  // la ventana pendiente era del jugador anterior
  cerrarVentana();
  reconstruirListas();   // cada jugador tiene su propia jugada en curso
  guardar();
  renderTodo();
  renderFamilia();
  const animo = consumirAnimo();
  if (animo) avisar(`${animo.from} te mandó ánimo: ¡tú puedes!`);
}

/** Cierra la ventana de nickname. */
function cerrarVentanaDeApodo() {
  if (!ventanaApodo) return;
  ventanaApodo.remove();
  ventanaApodo = null;
  document.body.classList.remove('modal-open');
}

/**
 * Pide el nickname antes de entrar al juego. Permite elegir uno ya inscrito o crear uno nuevo.
 * @param {() => void} alTerminar  Se llama cuando la persona ya quedó identificada.
 * @param {() => void} [alCancelar] Se llama si cierra la ventana sin entrar («Ahora no» o Esc).
 */
export function pedirApodo(alTerminar, alCancelar) {
  if (ventanaApodo) return;
  ventanaApodo = el('div', 'modal');
  ventanaApodo.setAttribute('role', 'dialog');
  ventanaApodo.setAttribute('aria-modal', 'true');
  ventanaApodo.setAttribute('aria-labelledby', 'nkT');

  const tarjeta = el('div', 'modal-card');
  const formulario = el('form', 'cbody nick-form');
  formulario.innerHTML = '<span class="ctag">Identifícate</span><h2 id="nkT">¿Cuál es tu nickname?</h2><p>Es el nombre con el que aparecerás en el ranking familiar. No uses tu nombre completo ni datos personales.</p><label for="nkIn" class="nk-l">Nickname</label><input id="nkIn" type="text" maxlength="16" autocomplete="off" autocapitalize="off" spellcheck="false"><p class="nk-err" role="alert"></p><div class="cgo"><button class="btn sm" type="submit">Entrar al juego</button><button class="btn ghost sm nk-cancel" type="button">Ahora no</button></div>';

  const inscritos = apodosDeLaFamilia();
  if (inscritos.length) { // atajo: «¿ya estás inscrito?»
    const bloque = el('div', 'nk-have');
    bloque.appendChild(el('p', null, '¿Ya estás inscrito? Elige tu nickname:'));
    const fila = el('div', 'cgo');
    inscritos.forEach((apodo) => {
      fila.appendChild(boton('btn ghost sm', apodo, () => {
        cerrarVentanaDeApodo();
        cambiarJugador(apodo);
        alTerminar();
      }));
    });
    bloque.appendChild(fila);
    formulario.insertBefore(bloque, $('.cgo', formulario));
  }

  tarjeta.appendChild(formulario);
  ventanaApodo.appendChild(tarjeta);
  document.body.appendChild(ventanaApodo);
  document.body.classList.add('modal-open');

  const campo = /** @type {HTMLInputElement} */ ($('#nkIn', formulario));
  const error = $('.nk-err', formulario);
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const apodo = normalizarApodo(campo.value);
    campo.value = apodo; // si había espacios, se ve cómo quedó («Los_Salazar»)
    const mensaje = mensajeDeApodoInvalido(apodo, apodosDeLaFamilia());
    if (mensaje) {
      error.textContent = `⚠ ${mensaje}`;
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }
    inscribir(apodo, { heredarAntiguo: true }); // el primero hereda el progreso del formato antiguo, si lo había
    cerrarVentanaDeApodo();
    cambiarJugador(apodo);
    avisar(`¡Bienvenido, ${apodo}!`);
    alTerminar();
  });
  $('.nk-cancel', formulario).onclick = () => { cerrarVentanaDeApodo(); if (alCancelar) alCancelar(); };
  ventanaApodo.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrarVentanaDeApodo(); if (alCancelar) alCancelar(); }
  });
  campo.focus();
}
