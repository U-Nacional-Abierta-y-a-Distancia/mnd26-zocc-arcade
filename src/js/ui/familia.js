/**
 * Sección Familia: nombre de la familia, inscripción de integrantes y ranking familiar.
 * (La lógica de ordenar y de decidir quién necesita ayuda está en `dominio/familia.js`.)
 * @module ui/familia
 */
import { NOMBRE_FAMILIA_MAX, APODO } from '../config.js';
import { mensajeDeApodoInvalido, normalizarApodo, ordenarFamilia } from '../dominio/familia.js';
import {
  apodosDeLaFamilia, enviarAnimo, inscribir, nombrarFamilia, quitarIntegrante, R,
} from '../estado/almacen.js';
import { $, boton, el } from '../util/dom.js';
import { avisar } from './avisos.js';
import { cambiarJugador } from './identidad.js';

/** Clase CSS y texto de cada estado del ranking familiar. */
const ESTADOS = {
  ayuda: { clase: 'help', texto: 'Necesita ayuda' },
  lidera: { clase: 'lead', texto: 'Va liderando' },
  aldia: { clase: 'ok', texto: 'Al día' },
};

/** Formulario «Nombre de la familia». @returns {HTMLElement} */
function formularioNombre() {
  const formulario = el('form', 'fam-card');
  const etiqueta = el('label', null, 'Nombre de la familia');
  etiqueta.setAttribute('for', 'famName');
  const campo = /** @type {HTMLInputElement} */ (el('input'));
  campo.id = 'famName';
  campo.type = 'text';
  campo.maxLength = NOMBRE_FAMILIA_MAX;
  campo.value = R.famName || '';
  campo.placeholder = 'Ej.: Los Salazar';
  campo.autocomplete = 'off';
  const guardar = /** @type {HTMLButtonElement} */ (el('button', 'btn ghost sm', 'Guardar'));
  guardar.type = 'submit';
  formulario.append(etiqueta, campo, guardar);
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    nombrarFamilia(campo.value.trim());
    avisar('Nombre guardado');
    renderFamilia();
  });
  return formulario;
}

/** Formulario «Inscribir a un integrante». @returns {HTMLElement} */
function formularioInscribir() {
  const formulario = el('form', 'fam-card');
  const etiqueta = el('label', null, 'Inscribir a un integrante (su nickname)');
  etiqueta.setAttribute('for', 'famAdd');
  const campo = /** @type {HTMLInputElement} */ (el('input'));
  campo.id = 'famAdd';
  campo.type = 'text';
  campo.maxLength = APODO.max;
  campo.autocomplete = 'off';
  campo.autocapitalize = 'off';
  campo.spellcheck = false;
  const inscribirBtn = /** @type {HTMLButtonElement} */ (el('button', 'btn sm', 'Inscribir'));
  inscribirBtn.type = 'submit';
  const error = el('p', 'nk-err');
  error.setAttribute('role', 'alert');
  formulario.append(etiqueta, campo, inscribirBtn, error);
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const apodo = normalizarApodo(campo.value);
    campo.value = apodo;
    const mensaje = mensajeDeApodoInvalido(apodo, apodosDeLaFamilia());
    if (mensaje) {
      error.textContent = `⚠ ${mensaje}`;
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }
    inscribir(apodo);
    avisar(`${apodo} quedó inscrito`);
    renderFamilia();
    $('#famAdd')?.focus();
  });
  return formulario;
}

/** Una fila del ranking. @param {import('../dominio/familia.js').FilaFamilia} fila @returns {HTMLElement} */
function filaDeRanking(fila) {
  const esActivo = fila.apodo === R.active;
  const estado = ESTADOS[fila.estado];
  const item = el('li', `fam-row${esActivo ? ' me' : ''}`);
  const quien = el('div', 'who');
  const nombre = el('b');
  nombre.textContent = fila.apodo + (esActivo ? ' (tú)' : '');
  const detalle = el('small');
  detalle.textContent = `${fila.insignia} · ${fila.motivo}`;
  quien.append(nombre, detalle);

  const cifras = el('div', 'stats');
  [[fila.xp, 'XP'], [fila.racha, 'Racha'], [fila.hoy, 'Hoy'], [fila.jugadas, 'Jugadas']].forEach(([valor, rotulo]) => {
    const celda = el('span');
    celda.innerHTML = '<b></b><i></i>';
    $('b', celda).textContent = String(valor);
    $('i', celda).textContent = String(rotulo);
    cifras.appendChild(celda);
  });

  const acciones = el('div', 'act');
  if (!esActivo) {
    acciones.appendChild(boton('btn ghost sm', `Jugar como ${fila.apodo}`, () => cambiarJugador(fila.apodo)));
    if (fila.estado === 'ayuda') {
      acciones.appendChild(boton('btn sm', 'Dar ánimo', () => {
        enviarAnimo(fila.apodo, R.active || 'Alguien de tu familia');
        avisar(`Ánimo enviado a ${fila.apodo}`);
      }));
    }
    const quitar = boton('btn ghost sm fam-rm', 'Quitar', () => {
      if (window.confirm(`¿Quitar a ${fila.apodo} y borrar su progreso de este dispositivo?`)) {
        quitarIntegrante(fila.apodo);
        renderFamilia();
      }
    });
    quitar.setAttribute('aria-label', `Quitar a ${fila.apodo} de la familia`);
    acciones.appendChild(quitar);
  }

  item.append(el('span', 'pos', String(fila.puesto)), quien, cifras, el('span', `st ${estado.clase}`, estado.texto), acciones);
  return item;
}

/** Pinta la sección Familia completa. */
export function renderFamilia() {
  const caja = $('#famBox');
  if (!caja) return;
  caja.innerHTML = '';
  const filas = ordenarFamilia(R.members);
  const xpTotal = filas.reduce((n, f) => n + f.xp, 0);
  const jugadas = filas.reduce((n, f) => n + f.jugadas, 0);

  caja.appendChild(formularioNombre());
  caja.appendChild(formularioInscribir());

  const resumen = el('div', 'fam-sum');
  resumen.innerHTML = '<h2></h2><p></p>';
  $('h2', resumen).textContent = `Ranking de ${R.famName || 'tu familia'}`;
  $('p', resumen).textContent = `${filas.length}${filas.length === 1 ? ' integrante' : ' integrantes'} · ${xpTotal} XP en total · ${jugadas} jugadas completadas`;
  caja.appendChild(resumen);
  if (filas.length < 2) caja.appendChild(el('p', 'note', 'Inscribe al menos a otro integrante para comparar quién va mejor y quién necesita ayuda.'));

  const lista = el('ol', 'fam-list');
  filas.forEach((fila) => lista.appendChild(filaDeRanking(fila)));
  caja.appendChild(lista);
}
