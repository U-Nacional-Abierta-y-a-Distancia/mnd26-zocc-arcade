/**
 * Sección Retos: una tarjeta por nivel con su arena (salvador contra enemigo), la barra de vida del enemigo
 * y la lista de los 6 hábitos de la jugada en curso.
 *
 * Flujo al marcar un hábito:
 *   casilla → `registrarMarca` (regla del juego) → guardar → redibujar todo → animación de combate →
 *   si se completó la jugada, ventana de la insignia (tras dejar ver caer al enemigo).
 *
 * @module ui/retos
 */
import { HABITOS_POR_JUGADA, TIEMPOS, XP_POR_HABITO } from '../config.js';
import { AGENTES, ENEMIGOS } from '../datos/agentes.js';
import { ICONOS_HABITO } from '../datos/ilustraciones.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { NIVELES } from '../datos/niveles.js';
import {
  habitosActivos, hechoAlgunaVez, hechosEnJugada, indiceInsignia, jugadaDe, jugadasCompletas, rachaDe, registrarMarca, xpDe,
} from '../dominio/progreso.js';
import { guardar, S } from '../estado/almacen.js';
import { $, $$, el, reducirMovimiento } from '../util/dom.js';
import { hoy } from '../util/fecha.js';
import { diasTexto } from '../util/texto.js';
import { avisar } from './avisos.js';
import { lanzarSenal } from './combate.js';
import { crearInsignia } from './insignias.js';
import { pintarKpis } from './kpis.js';
import { renderTodo } from './render.js';
import { ladoDeSalvadores, ladoDelEnemigo } from './tarjetas.js';
import { hayVentana, mostrarPendiente, programar } from './ventanas.js';

/**
 * Elementos de la tarjeta de cada nivel, por id de nivel.
 * @type {Record<string, {caja: HTMLElement, nivelTxt: HTMLElement, insigniaTxt: HTMLElement, arena: HTMLElement,
 *   izquierda: HTMLElement, derecha: HTMLElement, vidaTxt: HTMLElement, vida: HTMLElement, mensaje: HTMLElement,
 *   preparacion: HTMLElement | null, lista: HTMLElement}>}
 */
const zonas = {};

/** Lista de hábitos de un nivel y segmentos de la barra de vida. Se reconstruye al cambiar de jugada o de jugador. @param {import('../datos/niveles.js').Nivel} nivel */
export function construirLista(nivel) {
  const zona = zonas[nivel.id];
  const activos = habitosActivos(S, nivel);
  zona.lista.innerHTML = '';
  zona.vida.innerHTML = '';
  activos.forEach(() => zona.vida.appendChild(el('i')));

  let grupoActual = null;
  activos.forEach((habito) => {
    if (habito.grupo && habito.grupo !== grupoActual) { // subtítulo de grupo (nivel Fuego)
      grupoActual = habito.grupo;
      zona.lista.appendChild(el('li', 'rg', habito.grupo));
    }
    const fila = el('li', 'reto');
    fila.innerHTML = `<input type="checkbox" id="r-${habito.id}"><label for="r-${habito.id}"><img alt="" width="32" height="32"><span><span class="t"></span><span class="xp">+${XP_POR_HABITO} XP</span></span><span class="chk" aria-hidden="true"></span></label>`;
    /** @type {HTMLImageElement} */ ($('img', fila)).src = ICONOS_HABITO[habito.icono];
    $('.t', fila).textContent = habito.texto;
    zona.lista.appendChild(fila);
  });
}

/** Reconstruye las listas de todos los niveles (cambio de jugador, reinicio…). */
export function reconstruirListas() {
  NIVELES.forEach(construirLista);
}

/** Una persona marcó o desmarcó un hábito. @param {import('../datos/niveles.js').Nivel} nivel @param {HTMLInputElement} casilla */
function alMarcar(nivel, casilla) {
  const { completa, jugada, insigniaNueva } = registrarMarca(S, nivel, casilla.id.slice(2), casilla.checked, hoy());
  if (completa) {
    programar(jugada);
    construirLista(nivel); // ya empieza la siguiente jugada
  } else if (insigniaNueva !== null) {
    avisar(`¡Nueva insignia: ${INSIGNIAS[insigniaNueva].nombre}!`); // subió de insignia sin cerrar una jugada
  }
  guardar();
  renderTodo();
  if (casilla.checked) lanzarSenal(nivel, zonas[nivel.id], completa);
  if (completa) {
    // Se deja ver caer al enemigo antes de mostrar la insignia y los hábitos nuevos.
    setTimeout(() => { if (!hayVentana()) mostrarPendiente(); }, reducirMovimiento ? 0 : TIEMPOS.esperaAntesDeVentanasMs);
  }
}

/** Crea la tarjeta de un nivel. @param {import('../datos/niveles.js').Nivel} nivel */
function crearTarjetaDeNivel(nivel) {
  const caja = el('article', 'zone');
  caja.id = `z-${nivel.id}`;
  const nivelTxt = el('p', 'lvl', '');
  const insigniaTxt = el('p', 'lvl-ins', '');
  caja.append(nivelTxt, insigniaTxt);

  const arena = el('div', 'arena');
  const izquierda = ladoDeSalvadores(nivel, 'retos');
  const vs = el('div', 'vs', 'VS');
  vs.setAttribute('aria-hidden', 'true');
  const derecha = ladoDelEnemigo(nivel);
  arena.append(izquierda, vs, derecha);
  caja.appendChild(arena);

  const filaVida = el('div', 'hp-row');
  filaVida.appendChild(el('span', null, `Vida de ${ENEMIGOS[nivel.enemigo].nombre}`));
  const vidaTxt = el('span', null, '');
  filaVida.appendChild(vidaTxt);
  caja.appendChild(filaVida);

  const vida = el('div', 'hp');
  vida.setAttribute('aria-hidden', 'true');
  caja.appendChild(vida);

  const mensaje = el('div', 'msg');
  mensaje.setAttribute('aria-live', 'polite');
  caja.appendChild(mensaje);

  const lista = el('ul', 'retos');
  let preparacion = null;
  if (nivel.preparacion) { // medidor «¿estás listo?» (nivel Fuego)
    preparacion = el('div', 'ready');
    caja.appendChild(preparacion);
  }
  caja.appendChild(lista);

  zonas[nivel.id] = { caja, nivelTxt, insigniaTxt, arena, izquierda, derecha, vidaTxt, vida, mensaje, preparacion, lista };
  lista.addEventListener('change', (e) => {
    const casilla = /** @type {HTMLInputElement} */ (e.target);
    if (casilla && casilla.type === 'checkbox') alMarcar(nivel, casilla);
  });
  return caja;
}

/** Crea las tarjetas de los cinco niveles. Se llama una vez al arrancar. */
export function iniciarRetos() {
  const contenedor = $('#zones');
  NIVELES.forEach((nivel) => {
    contenedor.appendChild(crearTarjetaDeNivel(nivel));
    construirLista(nivel);
  });
}

/** Texto del medidor «¿Estás listo para la emergencia de fuego?». */
function pintarPreparacion(nivel, zona) {
  const hechos = nivel.preparacion.filter((id) => hechoAlgunaVez(S, id)).length;
  const total = nivel.preparacion.length;
  let marcas = '';
  for (let i = 0; i < total; i += 1) marcas += `<i${i < hechos ? ' class="on"' : ''}></i>`;
  let frase;
  if (hechos === total) frase = 'Listo: sabes dónde está el extintor, por dónde salir y a quién llamar.';
  else if (hechos === 0) frase = 'Aún no. Cumple los retos de «Listo para la emergencia» para saber si puedes actuar a tiempo.';
  else frase = `En camino: ${hechos} de ${total} pasos de preparación cumplidos.`;
  zona.preparacion.innerHTML = `<b>¿Estás listo para la emergencia de fuego?</b><span class="pips" aria-hidden="true">${marcas}</span><p>${frase}</p>`;
}

/** Fila bajo el título de cada nivel: tu insignia y cuánto falta para la siguiente. @param {HTMLElement} fila */
function pintarInsignia(fila) {
  const xp = xpDe(S);
  const i = indiceInsignia(xp);
  const siguiente = INSIGNIAS[i + 1];
  const premio = `+${HABITOS_POR_JUGADA * XP_POR_HABITO} XP al completar los ${HABITOS_POR_JUGADA} hábitos`;
  const texto = el('span', null, siguiente
    ? `${premio} · te faltan ${siguiente.xp - xp} XP para la insignia ${siguiente.nombre}`
    : `${premio} · tienes la insignia más alta: ${INSIGNIAS[i].nombre}`);
  fila.replaceChildren(crearInsignia(i, { tamano: 'mini' }), texto);
}

/** Redibuja el estado de todos los niveles y los indicadores del día. */
export function renderRetos() {
  NIVELES.forEach((nivel, indice) => {
    const zona = zonas[nivel.id];
    const activos = habitosActivos(S, nivel);
    const jugada = jugadaDe(S, nivel);
    const hechos = hechosEnJugada(S, nivel);
    const total = activos.length;

    zona.nivelTxt.textContent = `Nivel ${indice + 1} de ${NIVELES.length} · ${nivel.nombre} · Jugada ${jugada.r}`;
    pintarInsignia(zona.insigniaTxt);
    activos.forEach((h) => { /** @type {HTMLInputElement} */ ($(`#r-${h.id}`)).checked = jugada.done.includes(h.id); });
    $$('i', zona.vida).forEach((segmento, i) => segmento.classList.toggle('off', i < hechos));
    zona.vidaTxt.textContent = `${total - hechos}/${total}`;
    zona.caja.classList.toggle('out', hechos === total);
    if (zona.preparacion) pintarPreparacion(nivel, zona);

    const frase = hechos === 0 ? nivel.textos.inicio : (hechos === total ? nivel.textos.victoria : nivel.textos.medio);
    const quien = `EL JEFE · ${nivel.agentes.length > 1 ? 'tus salvadores' : AGENTES[nivel.agentes[0]].nombre}`;
    zona.mensaje.innerHTML = '<small></small><span></span>';
    $('small', zona.mensaje).textContent = `${quien} · ${hechos} de ${total} en esta jugada`;
    $('span', zona.mensaje).textContent = frase;
  });

  const racha = rachaDe(S.days);
  pintarKpis($('#today'), [
    [(S.days[hoy()] || []).length, 'Hábitos hoy'],
    [jugadasCompletas(S), 'Jugadas completadas'],
    [diasTexto(racha), 'Racha'],
    [`${xpDe(S)} XP`, 'Experiencia'],
  ]);
  $('#dateLabel').textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
