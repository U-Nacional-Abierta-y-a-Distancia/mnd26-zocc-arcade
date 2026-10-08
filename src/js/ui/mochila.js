/**
 * Sección Mochila: lista de ítems del kit de emergencia, mochila que se llena y selector de personas en casa.
 * @module ui/mochila
 */
import { PERSONAS_CASA } from '../config.js';
import { MOCHILA, TOTAL_ITEMS_MOCHILA } from '../datos/mochila.js';
import { SPRITES } from '../datos/sprites.js';
import { guardar, S } from '../estado/almacen.js';
import { $, el } from '../util/dom.js';
import { avisar, confeti } from './avisos.js';
import { renderTodo } from './render.js';
import { pintarSprite } from './sprites.js';

/** Construye la lista de ítems y sus eventos. Se llama una vez al arrancar. */
export function iniciarMochila() {
  const lista = $('#kitList');
  MOCHILA.forEach((grupo, indice) => {
    const caja = el('div', 'group');
    const titulo = el('h3', null, '<span></span><span class="cnt"></span>');
    $('span', titulo).textContent = grupo.grupo;
    titulo.id = `kg${indice}`;
    caja.appendChild(titulo);

    const items = el('ul', 'items');
    grupo.items.forEach((item) => {
      const fila = el('li', 'item');
      fila.innerHTML = `<input type="checkbox" id="${item.id}"><label for="${item.id}"><span><span class="t"></span><span class="d"></span></span><span class="chk" aria-hidden="true"></span></label>`;
      $('.t', fila).textContent = item.texto;
      const detalle = $('.d', fila);
      if (item.detalle) detalle.textContent = item.detalle; else detalle.remove();
      items.appendChild(fila);
    });
    caja.appendChild(items);
    lista.appendChild(caja);
  });

  lista.addEventListener('change', (e) => {
    const casilla = /** @type {HTMLInputElement} */ (e.target);
    if (!casilla || casilla.type !== 'checkbox') return;
    const i = S.kit.indexOf(casilla.id);
    if (casilla.checked && i < 0) S.kit.push(casilla.id);
    else if (!casilla.checked && i > -1) S.kit.splice(i, 1);
    guardar();
    const completa = S.kit.length === TOTAL_ITEMS_MOCHILA;
    renderTodo();
    if (completa && casilla.checked) {
      const caja = casilla.getBoundingClientRect();
      confeti(caja.left + caja.width / 2, caja.top);
      avisar('Mochila completa');
    }
  });

  $('#famMinus').addEventListener('click', () => { S.fam = Math.max(PERSONAS_CASA.min, S.fam - 1); guardar(); renderMochila(); });
  $('#famPlus').addEventListener('click', () => { S.fam = Math.min(PERSONAS_CASA.max, S.fam + 1); guardar(); renderMochila(); });
}

/** Mensaje de Sismo según cuánto se lleva armado y para cuántas personas. @param {number} cuantos @returns {string} */
function mensajeDeSismo(cuantos) {
  const personas = `${S.fam}${S.fam === 1 ? ' persona' : ' personas'}`;
  if (cuantos === 0) return `Soy Sismo. Empecemos por lo esencial: agua y una linterna. Recuerda alistar para ${personas}.`;
  if (cuantos < TOTAL_ITEMS_MOCHILA / 2) return `Vas bien. Piensa en ${personas} al calcular el agua y los alimentos.`;
  if (cuantos < TOTAL_ITEMS_MOCHILA) return 'Casi lista. Guárdala en un lugar al que llegues rápido, cerca de la salida.';
  return 'Mochila completa. Revísala de vez en cuando: pilas, fechas y medicamentos.';
}

/** Redibuja la mochila: marcas, contadores, porcentaje y el sprite que se va llenando. */
export function renderMochila() {
  const cuantos = S.kit.length;
  const porcentaje = Math.round((cuantos / TOTAL_ITEMS_MOCHILA) * 100);
  MOCHILA.forEach((grupo, indice) => {
    const marcados = grupo.items.filter((item) => S.kit.includes(item.id)).length;
    $('.cnt', $(`#kg${indice}`)).textContent = `${marcados}/${grupo.items.length}`;
    grupo.items.forEach((item) => { /** @type {HTMLInputElement} */ ($(`#${item.id}`)).checked = S.kit.includes(item.id); });
  });
  $('#packPct').textContent = `${porcentaje}%`;
  $('#packTrack').style.setProperty('--v', String(porcentaje));
  $('#packCount').textContent = `${cuantos} de ${TOTAL_ITEMS_MOCHILA} ítems`;
  $('#famN').textContent = String(S.fam);
  const filas = SPRITES.mochila.length;
  pintarSprite($('#packCv'), 'mochila', Math.round(filas * (1 - cuantos / TOTAL_ITEMS_MOCHILA)));
  $('#packMsg').textContent = mensajeDeSismo(cuantos);
}
