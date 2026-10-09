/**
 * Sección Retos: una tarjeta por nivel con su arena (salvador contra enemigo), las dos barras de vida y las dos
 * listas de la jugada en curso: 3 hábitos BUENOS (hieren al enemigo) y 3 DESCUIDOS (hieren al salvador).
 *
 * Flujo al marcar:
 *   casilla → `registrarMarca` (regla del juego) → guardar → redibujar todo → animación (señal del salvador o ataque
 *   del enemigo) → si alguien cayó, ventana de victoria (insignia) o de derrota (tras dejar ver el golpe final).
 *
 * @module ui/retos
 */
import { BUENOS_POR_JUGADA, MALOS_POR_JUGADA, TIEMPOS, XP_POR_HABITO } from '../config.js';
import { AGENTES, ENEMIGOS } from '../datos/agentes.js';
import { ICONOS_HABITO } from '../datos/ilustraciones.js';
import { INSIGNIAS } from '../datos/insignias.js';
import { NIVELES, esHabitoMalo } from '../datos/niveles.js';
import {
  buenosDe, hechoAlgunaVez, indiceInsignia, jugadaDe, jugadasCompletas, loteActivo, rachaDe, registrarMarca, vidaDeJugada, xpDe,
} from '../dominio/progreso.js';
import { guardar, S } from '../estado/almacen.js';
import { $, $$, el, reducirMovimiento } from '../util/dom.js';
import { hoy } from '../util/fecha.js';
import { diasTexto } from '../util/texto.js';
import { avisar } from './avisos.js';
import { lanzarAtaque, lanzarSenal } from './combate.js';
import { crearInsignia } from './insignias.js';
import { pintarKpis } from './kpis.js';
import { renderTodo } from './render.js';
import { sonar } from './sonido.js';
import { ladoDeSalvadores, ladoDelEnemigo } from './tarjetas.js';
import { hayVentana, mostrarPendiente, programar } from './ventanas.js';

/**
 * Elementos de la tarjeta de cada nivel, por id de nivel.
 * @type {Record<string, {caja: HTMLElement, nivelTxt: HTMLElement, insigniaTxt: HTMLElement, arena: HTMLElement,
 *   izquierda: HTMLElement, derecha: HTMLElement, vidaTxt: HTMLElement, vida: HTMLElement,
 *   vidaAliadaTxt: HTMLElement, vidaAliada: HTMLElement, mensaje: HTMLElement,
 *   preparacion: HTMLElement | null, lista: HTMLElement, listaMalos: HTMLElement}>}
 */
const zonas = {};

/** Fila de una lista: casilla + icono + texto + XP o aviso. @param {import('../datos/habitos.js').Habito} habito @param {boolean} malo */
function filaDeHabito(habito, malo) {
  const fila = el('li', malo ? 'reto malo' : 'reto');
  const pie = malo ? 'Lo hice hoy' : `+${XP_POR_HABITO} XP`;
  fila.innerHTML = `<input type="checkbox" id="r-${habito.id}"><label for="r-${habito.id}"><img alt="" width="32" height="32"><span><span class="t"></span><span class="xp">${pie}</span></span><span class="chk" aria-hidden="true"></span></label>`;
  /** @type {HTMLImageElement} */ ($('img', fila)).src = ICONOS_HABITO[habito.icono];
  $('.t', fila).textContent = habito.texto;
  return fila;
}

/** Segmentos de una barra de vida. @param {HTMLElement} barra */
function segmentos(barra) {
  barra.innerHTML = '';
  for (let i = 0; i < BUENOS_POR_JUGADA; i += 1) barra.appendChild(el('i'));
}

/**
 * Las dos listas de un nivel y los segmentos de las barras de vida. Se reconstruye al cambiar de jugada o de jugador.
 * @param {import('../datos/niveles.js').Nivel} nivel
 */
export function construirLista(nivel) {
  const zona = zonas[nivel.id];
  const { buenos, malos } = loteActivo(S, nivel);
  zona.lista.innerHTML = '';
  zona.listaMalos.innerHTML = '';
  segmentos(zona.vida);
  segmentos(zona.vidaAliada);

  let grupoActual = null;
  buenos.forEach((habito) => {
    if (habito.grupo && habito.grupo !== grupoActual) { // subtítulo de grupo (nivel Fuego)
      grupoActual = habito.grupo;
      zona.lista.appendChild(el('li', 'rg', habito.grupo));
    }
    zona.lista.appendChild(filaDeHabito(habito, false));
  });
  malos.forEach((habito) => zona.listaMalos.appendChild(filaDeHabito(habito, true)));
}

/** Reconstruye las listas de todos los niveles (cambio de jugador, reinicio…). */
export function reconstruirListas() {
  NIVELES.forEach(construirLista);
}

/** Una persona marcó o desmarcó un hábito bueno o un descuido. @param {import('../datos/niveles.js').Nivel} nivel @param {HTMLInputElement} casilla */
function alMarcar(nivel, casilla) {
  const id = casilla.id.slice(2);
  const malo = esHabitoMalo(id);
  const res = registrarMarca(S, nivel, id, casilla.checked, hoy());
  sonar(casilla.checked ? (malo ? 'mal' : 'bien') : 'quitar');
  if (res.resultado === 'victoria') programar({ tipo: 'victoria', ...res.victoria });
  else if (res.resultado === 'derrota') programar({ tipo: 'derrota', ...res.derrota });
  if (res.resultado) construirLista(nivel); // empieza la jugada siguiente (o se repite la misma)
  else if (res.insigniaNueva !== null) avisar(`¡Nueva insignia: ${INSIGNIAS[res.insigniaNueva].nombre}!`); // subió de insignia sin cerrar una jugada

  guardar();
  renderTodo();
  if (casilla.checked) {
    if (malo) lanzarAtaque(nivel, zonas[nivel.id], res.resultado === 'derrota');
    else lanzarSenal(nivel, zonas[nivel.id], res.resultado === 'victoria');
  }
  if (res.resultado) {
    // Se deja ver el golpe final antes de mostrar la ventana de victoria o de derrota.
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

  // Vida del enemigo (se apaga con tus hábitos buenos) y vida del salvador (se apaga con tus descuidos).
  const filaVida = el('div', 'hp-row');
  filaVida.appendChild(el('span', null, `Vida de ${ENEMIGOS[nivel.enemigo].nombre}`));
  const vidaTxt = el('span', null, '');
  filaVida.appendChild(vidaTxt);
  caja.appendChild(filaVida);
  const vida = el('div', 'hp');
  vida.setAttribute('aria-hidden', 'true');
  caja.appendChild(vida);

  const nombreAliado = nivel.agentes.length > 1 ? 'tus salvadores' : AGENTES[nivel.agentes[0]].nombre;
  const filaVidaAliada = el('div', 'hp-row ally');
  filaVidaAliada.appendChild(el('span', null, `Vida de ${nombreAliado}`));
  const vidaAliadaTxt = el('span', null, '');
  filaVidaAliada.appendChild(vidaAliadaTxt);
  caja.appendChild(filaVidaAliada);
  const vidaAliada = el('div', 'hp ally');
  vidaAliada.setAttribute('aria-hidden', 'true');
  caja.appendChild(vidaAliada);

  const mensaje = el('div', 'msg');
  mensaje.setAttribute('aria-live', 'polite');
  caja.appendChild(mensaje);

  let preparacion = null;
  if (nivel.preparacion) { // medidor «¿estás listo?» (nivel Fuego)
    preparacion = el('div', 'ready');
    caja.appendChild(preparacion);
  }

  caja.appendChild(el('h3', 'lista-t', `Hábitos que hieren a ${ENEMIGOS[nivel.enemigo].nombre}`));
  const lista = el('ul', 'retos');
  caja.appendChild(lista);
  const tituloMalos = el('h3', 'lista-t malo', '¿Caíste en algún descuido hoy? Reconocerlo fortalece al enemigo');
  caja.appendChild(tituloMalos);
  const listaMalos = el('ul', 'retos malos');
  caja.appendChild(listaMalos);

  zonas[nivel.id] = { caja, nivelTxt, insigniaTxt, arena, izquierda, derecha, vidaTxt, vida, vidaAliadaTxt, vidaAliada, mensaje, preparacion, lista, listaMalos };
  const alCambiar = (e) => {
    const casilla = /** @type {HTMLInputElement} */ (e.target);
    if (casilla && casilla.type === 'checkbox') alMarcar(nivel, casilla);
  };
  lista.addEventListener('change', alCambiar);
  listaMalos.addEventListener('change', alCambiar);
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
  const premio = `+${BUENOS_POR_JUGADA * XP_POR_HABITO} XP al ganar la jugada (${BUENOS_POR_JUGADA} hábitos buenos)`;
  const texto = el('span', null, siguiente
    ? `${premio} · te faltan ${siguiente.xp - xp} XP para la insignia ${siguiente.nombre}`
    : `${premio} · tienes la insignia más alta: ${INSIGNIAS[i].nombre}`);
  fila.replaceChildren(crearInsignia(i, { tamano: 'mini' }), texto);
}

/** Mensaje del salvador: avisa si el enemigo se está fortaleciendo. */
function frasePara(nivel, hechos, malos) {
  const enemigo = ENEMIGOS[nivel.enemigo].nombre;
  if (malos >= 2) return `¡Cuidado! ${enemigo} se fortalece: con ${MALOS_POR_JUGADA - malos} descuido más, tu salvador cae.`;
  if (malos === 1) return `${enemigo} se hizo más fuerte con ese descuido. Compénsalo con hábitos buenos.`;
  return hechos === 0 ? nivel.textos.inicio : nivel.textos.medio;
}

/** Redibuja el estado de todos los niveles y los indicadores del día. */
export function renderRetos() {
  NIVELES.forEach((nivel, indice) => {
    const zona = zonas[nivel.id];
    const { buenos, malos } = loteActivo(S, nivel);
    const jugada = jugadaDe(S, nivel);
    const vida = vidaDeJugada(S, nivel);
    const hechos = BUENOS_POR_JUGADA - vida.enemigo;
    const reconocidos = MALOS_POR_JUGADA - vida.salvador;

    zona.nivelTxt.textContent = `Nivel ${indice + 1} de ${NIVELES.length} · ${nivel.nombre} · Jugada ${jugada.r}${jugada.l ? ` · intento ${jugada.l + 1}` : ''}`;
    pintarInsignia(zona.insigniaTxt);
    buenos.forEach((h) => { /** @type {HTMLInputElement} */ ($(`#r-${h.id}`)).checked = jugada.done.includes(h.id); });
    malos.forEach((h) => { /** @type {HTMLInputElement} */ ($(`#r-${h.id}`)).checked = jugada.mal.includes(h.id); });
    $$('i', zona.vida).forEach((segmento, i) => segmento.classList.toggle('off', i < hechos));
    $$('i', zona.vidaAliada).forEach((segmento, i) => segmento.classList.toggle('off', i < reconocidos));
    zona.vidaTxt.textContent = `${vida.enemigo}/${BUENOS_POR_JUGADA}`;
    zona.vidaAliadaTxt.textContent = `${vida.salvador}/${MALOS_POR_JUGADA}`;
    zona.caja.style.setProperty('--mal', String(reconocidos)); // el enemigo crece y el salvador se debilita (CSS)
    zona.caja.dataset.mal = String(reconocidos);
    if (zona.preparacion) pintarPreparacion(nivel, zona);

    const quien = `EL JEFE · ${nivel.agentes.length > 1 ? 'tus salvadores' : AGENTES[nivel.agentes[0]].nombre}`;
    zona.mensaje.innerHTML = '<small></small><span></span>';
    $('small', zona.mensaje).textContent = `${quien} · ${hechos} de ${BUENOS_POR_JUGADA} buenos · ${reconocidos} de ${MALOS_POR_JUGADA} descuidos`;
    $('span', zona.mensaje).textContent = frasePara(nivel, hechos, reconocidos);
  });

  const racha = rachaDe(S.days);
  pintarKpis($('#today'), [
    [buenosDe(S.days[hoy()] || []).length, 'Hábitos buenos hoy'],
    [jugadasCompletas(S), 'Jugadas ganadas'],
    [diasTexto(racha), 'Racha'],
    [`${xpDe(S)} XP`, 'Experiencia'],
  ]);
  $('#dateLabel').textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
