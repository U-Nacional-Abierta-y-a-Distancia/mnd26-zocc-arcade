/**
 * Sección Ranking (progreso personal, con la escalera de insignias) y el indicador de insignia de la cabecera.
 * @module ui/ranking
 */
import { BUENOS_POR_JUGADA, XP_POR_HABITO } from '../config.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { indiceInsignia, marcasTotales, rachaDe, xpDe } from '../dominio/progreso.js';
import { dominioSemanal, ultimosDias } from '../dominio/ranking.js';
import { apodoActivo, reiniciarProgreso, S } from '../estado/almacen.js';
import { $, el } from '../util/dom.js';
import { crearInsignia } from './insignias.js';
import { pintarKpis } from './kpis.js';
import { renderTodo } from './render.js';
import { reconstruirListas } from './retos.js';

const INICIALES_DIA = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // domingo = 0

/** Porcentaje de avance dentro de la insignia actual (100 si ya es el máximo). @param {number} xp @returns {number} */
function progresoDeInsignia(xp) {
  const i = indiceInsignia(xp);
  const actual = INSIGNIAS[i]; const siguiente = INSIGNIAS[i + 1];
  return siguiente ? Math.round(((xp - actual.xp) / (siguiente.xp - actual.xp)) * 100) : 100;
}

/** Indicador de insignia y XP de la cabecera de la zona de juego. */
export function renderChip() {
  const xp = xpDe(S);
  const insignia = INSIGNIAS[indiceInsignia(xp)];
  $('.xp-chip').setAttribute('title', `${apodoActivo()} · ${insignia.nombre}`);
  $('#chipRank').textContent = insignia.nombre;
  $('#chipXp').textContent = `${xp} XP`;
  $('#chipBar').style.setProperty('--p', String(progresoDeInsignia(xp)));
}

/** Pinta la sección Ranking. */
export function renderRanking() {
  const xp = xpDe(S);
  const i = indiceInsignia(xp);
  const insignia = INSIGNIAS[i]; const siguiente = INSIGNIAS[i + 1];
  $('#rkBadge').replaceChildren(crearInsignia(i, { tamano: 'grande' }));
  $('#rkName').textContent = insignia.nombre;
  $('#rkLema').textContent = insignia.lema;
  $('#rkBar').style.setProperty('--v', String(progresoDeInsignia(xp)));
  $('#rkNext').textContent = siguiente ? `Te faltan ${siguiente.xp - xp} XP para ${siguiente.nombre}.` : 'Tienes la insignia más alta. Sigue repitiendo tus hábitos para mantenerla.';
  pintarKpis($('#rkKpis'), [[`${xp} XP`, 'Experiencia'], [String(rachaDe(S.days)), 'Racha (días)'], [String(marcasTotales(S)), 'Hábitos marcados']]);

  // Últimos 7 días
  const dias = ultimosDias(S);
  const maximo = Math.max(1, ...dias.map((d) => d.cantidad));
  const barras = $('#bars');
  barras.innerHTML = '';
  dias.forEach((dia, j) => {
    const celda = el('div', j === dias.length - 1 ? 'today' : '');
    const columna = el('div', `col${dia.cantidad ? '' : ' zero'}`);
    columna.style.height = `${Math.max((dia.cantidad / maximo) * 100, dia.cantidad ? 6 : 3)}%`;
    celda.appendChild(columna);
    celda.appendChild(el('span', null, INICIALES_DIA[dia.fecha.getDay()] + (dia.cantidad ? ` ${dia.cantidad}` : '')));
    barras.appendChild(celda);
  });
  barras.setAttribute('aria-label', `Hábitos por día en los últimos 7 días: ${dias.map((d) => d.cantidad).join(', ')}`);

  // Dominio de cada nivel esta semana
  const dominio = $('#mast');
  dominio.innerHTML = '';
  dominioSemanal(S, dias).forEach(({ nivel, porcentaje }) => {
    const fila = el('div', 'mrow');
    fila.appendChild(el('span', null, nivel));
    const pista = el('span', 'track');
    pista.style.setProperty('--v', String(porcentaje));
    fila.appendChild(pista);
    fila.appendChild(el('b', null, `${porcentaje}%`));
    dominio.appendChild(fila);
  });

  // Escalera de insignias: las ganadas en color, las que faltan apagadas
  const escalera = $('#ladder');
  escalera.innerHTML = '';
  const xpPorJugada = BUENOS_POR_JUGADA * XP_POR_HABITO;
  INSIGNIAS.forEach((ins, j) => {
    const fila = el('li', (j <= i ? 'got' : '') + (j === i ? ' now' : ''));
    fila.appendChild(crearInsignia(j, { bloqueada: j > i }));
    fila.appendChild(el('b', null, ins.nombre));
    fila.appendChild(el('span', null, j === 0 ? 'Punto de partida' : `${ins.xp} XP · ${Math.ceil(ins.xp / xpPorJugada) === 1 ? '1 jugada' : `unas ${Math.ceil(ins.xp / xpPorJugada)} jugadas`}`));
    fila.appendChild(el('small', null, ins.lema));
    escalera.appendChild(fila);
  });
}

/** Botón «Reiniciar mi progreso» (pide confirmar con un segundo toque). Se llama una vez al arrancar. */
export function iniciarReinicio() {
  const boton = $('#resetAll');
  boton.addEventListener('click', () => {
    if (boton.dataset.armed === '1') {
      reiniciarProgreso();
      reconstruirListas();
      boton.dataset.armed = '0';
      boton.textContent = 'Reiniciar mi progreso';
      $('#resetNote').textContent = 'Progreso reiniciado.';
      renderTodo();
    } else {
      boton.dataset.armed = '1';
      boton.textContent = 'Toca de nuevo para confirmar';
      $('#resetNote').textContent = 'Se borrarán hábitos y mochila de este dispositivo.';
    }
  });
}
