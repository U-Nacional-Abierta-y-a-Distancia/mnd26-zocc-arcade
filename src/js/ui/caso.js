/**
 * Ventana narrativa «¿Tu familia está lista?»: EL JEFE cuenta, en escenas, por qué importa prepararse, un caso
 * hipotético de un día de El Niño en Dosquebradas, qué pasa si la familia se prepara y si no, y el reto para
 * hacerlo. La última escena muestra cuántos frentes cubre ya la familia, según su progreso real.
 *
 * Es un panel traslúcido de aspecto «tecnológico» (HUD) que se abre sobre el juego:
 *  - automáticamente al pulsar «Entrar al juego» desde la portada (salvo que la persona elija no volver a verlo);
 *  - desde cualquier elemento con `data-caso`.
 *
 * El contenido está en `datos/caso.js`; el aspecto, en `css/15-caso.css`.
 *
 * @module ui/caso
 */
import { CLAVES } from '../config.js';
import { AVATAR_JEFE } from '../datos/avatar-jefe.js';
import {
  AVISO_CASO, CONTROL, ESCENAS, FRENTE_POR_NIVEL, MOMENTOS, idDeAudio, mensajeDeEstado, narracionDeEscena,
} from '../datos/caso.js';
import { ENEMIGOS } from '../datos/agentes.js';
import { NIVELES } from '../datos/niveles.js';
import { frentesCubiertos } from '../dominio/progreso.js';
import { hayJugadorActivo, S } from '../estado/almacen.js';
import { $, el } from '../util/dom.js';
import { alEntrarAlJuego, ir } from './navegacion.js';
import { activarSonido, sonar, sonidoActivo } from './sonido.js';
import {
  cambiarVelocidad, detener, estaNarrando, narrar,
} from './narrador.js';
import { abrirVentana, cerrarVentana, hayVentana } from './ventanas.js';

/** Espera antes de abrir la narrativa al entrar, para que se vea el juego detrás (ms). */
const ESPERA_AL_ENTRAR_MS = 350;

/* ------------------------------------------------------------------ preferencia «no volver a mostrar» */

/** ¿La persona pidió no ver la narrativa al entrar? @returns {boolean} */
function estaOculto() {
  try { return localStorage.getItem(CLAVES.casoOculto) === '1'; } catch { return false; }
}

/** Velocidades de la narración que se ofrecen: valor (1 = normal) y rótulo. */
const VELOCIDADES = [['1', 'Normal'], ['1.2', 'Más rápida'], ['1.4', 'Rápida']];

/** Velocidad elegida para la narración (1 por defecto). @returns {number} */
function velocidadElegida() {
  try {
    const guardada = localStorage.getItem(CLAVES.casoVelocidad);
    return VELOCIDADES.some(([v]) => v === guardada) ? Number(guardada) : 1;
  } catch { return 1; }
}

/** Guarda la velocidad elegida. @param {string} valor */
function guardarVelocidad(valor) {
  try { localStorage.setItem(CLAVES.casoVelocidad, valor); } catch { /* sin almacenamiento */ }
}

/** ¿La persona activó la narración automática? @returns {boolean} */
function vozAutomatica() {
  try { return localStorage.getItem(CLAVES.casoVoz) === '1'; } catch { return false; }
}

/** Guarda la preferencia de narración automática. @param {boolean} activa */
function guardarVozAutomatica(activa) {
  try {
    if (activa) localStorage.setItem(CLAVES.casoVoz, '1'); else localStorage.removeItem(CLAVES.casoVoz);
  } catch { /* se pierde la preferencia, nada más */ }
}

/** Guarda la preferencia de no mostrar la narrativa al entrar. @param {boolean} ocultar */
function guardarOculto(ocultar) {
  try {
    if (ocultar) localStorage.setItem(CLAVES.casoOculto, '1'); else localStorage.removeItem(CLAVES.casoOculto);
  } catch { /* sin almacenamiento: se vuelve a mostrar la próxima vez */ }
}

/** Nombre visible de un nivel. @param {string} id @returns {string} */
const nombreDeNivel = (id) => NIVELES.find((n) => n.id === id)?.nombre ?? id;

/** Lista de textos como `<ul>`. @param {string[]} textos @param {string} clase @returns {HTMLElement} */
function lista(textos, clase) {
  const ul = el('ul', clase);
  textos.forEach((t) => ul.appendChild(el('li', null, t)));
  return ul;
}

/* ------------------------------------------------------------------ contenido de cada escena */

/** Escena 1: lo que no se controla frente a lo que sí. */
function cuerpoPregunta() {
  const caja = el('div', 'caso-dos');
  const no = el('section', 'caso-col no');
  no.append(el('h3', null, 'No lo controlas'), lista(CONTROL.noControlas, 'caso-lista'));
  const si = el('section', 'caso-col si');
  si.append(el('h3', null, 'Sí lo controlas'), lista(CONTROL.controlas, 'caso-lista'));
  caja.append(no, si);
  return caja;
}

/** Escena 2: un frente por nivel, con su enemigo. */
function cuerpoFrentes() {
  const ol = el('ol', 'caso-frentes');
  NIVELES.forEach((nivel) => {
    const li = el('li');
    li.append(el('b', null, nivel.nombre), el('span', null, FRENTE_POR_NIVEL[nivel.id]), el('small', null, `Enemigo: ${ENEMIGOS[nivel.enemigo].nombre}`));
    ol.appendChild(li);
  });
  return ol;
}

/** Escena 3: la línea de tiempo del caso. */
function cuerpoCaso() {
  const caja = el('div');
  caja.appendChild(el('p', 'caso-aviso', AVISO_CASO));
  const ol = el('ol', 'caso-momentos');
  MOMENTOS.forEach((m) => {
    const li = el('li');
    li.append(el('time', null, m.hora), el('b', null, m.titulo), el('span', null, m.situacion), el('small', null, `Frente: ${nombreDeNivel(m.nivel)}`));
    ol.appendChild(li);
  });
  caja.appendChild(ol);
  return caja;
}

/** Escena 4: los dos finales, con un interruptor para cambiar de uno al otro. */
function cuerpoConsecuencias() {
  const caja = el('div');
  const interruptor = el('div', 'caso-switch');
  interruptor.setAttribute('role', 'group');
  interruptor.setAttribute('aria-label', 'Elige el final que quieres ver');
  const ol = el('ol', 'caso-momentos finales');
  let modo = 'sin';
  caja.dataset.modo = modo;

  const pintar = () => {
    ol.innerHTML = '';
    ol.dataset.modo = modo;
    MOMENTOS.forEach((m) => {
      const li = el('li', modo);
      li.append(el('time', null, m.hora), el('b', null, m.titulo), el('span', null, modo === 'sin' ? m.sin : m.con));
      ol.appendChild(li);
    });
    botones.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
  };
  const botones = [['sin', 'Si no se prepara'], ['con', 'Si se prepara']].map(([clave, texto]) => {
    const b = /** @type {HTMLButtonElement} */ (el('button', `caso-sw ${clave}`, texto));
    b.type = 'button';
    b.dataset.modo = clave;
    b.addEventListener('click', () => { modo = clave; caja.dataset.modo = modo; pintar(); });
    interruptor.appendChild(b);
    return b;
  });
  caja.append(interruptor, ol);
  pintar();
  return caja;
}

/** Escena 5: un hábito por momento y el reto. */
function cuerpoReto() {
  const caja = el('div');
  caja.appendChild(el('p', 'caso-aviso', 'Un hábito para cambiar el final de cada momento:'));
  const ol = el('ol', 'caso-habitos');
  MOMENTOS.forEach((m) => {
    const li = el('li');
    li.append(el('b', null, nombreDeNivel(m.nivel)), el('span', null, m.habito));
    ol.appendChild(li);
  });
  caja.appendChild(ol);
  return caja;
}

/** Escena 6: cuántos frentes cubre la familia hoy (según el progreso real). */
function cuerpoEstado() {
  const caja = el('div');
  if (!hayJugadorActivo()) {
    caja.appendChild(el('p', 'caso-aviso', 'Entra al juego con tu nickname y aquí verás cuántos frentes cubre tu familia.'));
    return caja;
  }
  const frentes = frentesCubiertos(S);
  const cubiertos = frentes.filter((f) => f.cubierto).length;
  caja.appendChild(el('p', 'caso-cuenta', `${cubiertos} de ${frentes.length} frentes cubiertos`));
  const ol = el('ol', 'caso-estado');
  frentes.forEach((f) => {
    const li = el('li', f.cubierto ? 'ok' : 'falta');
    li.append(el('b', null, f.nombre), el('span', null, f.cubierto ? 'Cubierto: ya ganaste una jugada' : 'Falta: gana una jugada de este nivel'));
    ol.appendChild(li);
  });
  caja.append(ol, el('p', 'caso-nota', 'Un frente cuenta como cubierto cuando ganas al menos una jugada en ese nivel.'));
  return caja;
}

const CUERPOS = {
  pregunta: cuerpoPregunta, frentes: cuerpoFrentes, caso: cuerpoCaso, consecuencias: cuerpoConsecuencias, reto: cuerpoReto, estado: cuerpoEstado,
};

/* ------------------------------------------------------------------ la ventana */

/** Número con dos cifras (1 → «01»). @param {number} n @returns {string} */
const dos = (n) => String(n).padStart(2, '0');

/**
 * Abre la narrativa en la escena indicada.
 * @param {number} [inicio] Índice de la escena (0 = la primera).
 */
export function abrirCaso(inicio = 0) {
  let actual = Math.min(Math.max(inicio, 0), ESCENAS.length - 1);
  const tarjeta = el('div', 'modal-card caso');
  ['a', 'b', 'c', 'd'].forEach((lado) => tarjeta.appendChild(el('i', `esq ${lado}`))); // esquinas del «visor»

  const cabeza = el('div', 'caso-head');
  const avatar = el('span', 'caso-av');
  const retrato = /** @type {HTMLImageElement} */ (el('img'));
  retrato.alt = '';
  retrato.width = 96;
  retrato.height = 122;
  avatar.appendChild(retrato);
  retrato.src = AVATAR_JEFE; // incrustado: se ve aunque la carpeta assets/ no esté junto a la página
  const titulo = el('div', 'caso-burbuja');
  titulo.innerHTML = '<span class="caso-hud"><i></i>Briefing · EL JEFE</span><span class="ctag"></span><h2 id="popT"></h2>';
  cabeza.append(avatar, titulo);

  const cuerpo = el('div', 'caso-cuerpo');
  const habla = el('p', 'caso-jefe');

  const barra = el('div', 'modal-bar caso-nav');
  const puntos = el('div', 'caso-puntos');
  puntos.setAttribute('aria-hidden', 'true');
  ESCENAS.forEach(() => puntos.appendChild(el('i')));
  const omitir = el('label', 'caso-omitir');
  const casilla = /** @type {HTMLInputElement} */ (el('input'));
  casilla.type = 'checkbox';
  casilla.checked = estaOculto();
  casilla.addEventListener('change', () => guardarOculto(casilla.checked));
  omitir.dataset.pref = 'omitir';
  omitir.append(casilla, el('span', null, 'No mostrar al entrar'));
  // Narrador: leer la escena en voz alta, y (opcional) narrar y avanzar solas
  const voz = el('div', 'caso-voz');
  const escuchar = /** @type {HTMLButtonElement} */ (el('button', 'btn ghost sm caso-escuchar'));
  escuchar.type = 'button';
  const auto = el('label', 'caso-omitir');
  const casillaAuto = /** @type {HTMLInputElement} */ (el('input'));
  casillaAuto.type = 'checkbox';
  casillaAuto.checked = vozAutomatica();
  auto.append(casillaAuto, el('span', null, 'Narrar y avanzar solo'));
  const sonidoCasilla = el('label', 'caso-omitir');
  const casillaSonido = /** @type {HTMLInputElement} */ (el('input'));
  casillaSonido.type = 'checkbox';
  casillaSonido.checked = sonidoActivo();
  casillaSonido.addEventListener('change', () => {
    activarSonido(casillaSonido.checked);
    document.dispatchEvent(new Event('ysph:sonido-cambio')); // sincroniza el botón del encabezado
    if (casillaSonido.checked) sonar('escena');
  });
  sonidoCasilla.append(casillaSonido, el('span', null, 'Efectos de sonido'));
  const velocidad = el('label', 'caso-omitir caso-vel');
  const selector = /** @type {HTMLSelectElement} */ (el('select'));
  VELOCIDADES.forEach(([valor, rotulo]) => {
    const opcion = /** @type {HTMLOptionElement} */ (el('option', null, rotulo));
    opcion.value = valor;
    selector.appendChild(opcion);
  });
  selector.value = String(velocidadElegida());
  velocidad.append(el('span', null, 'Velocidad de la voz'), selector);
  voz.append(escuchar, velocidad, auto, sonidoCasilla);
  const botones = el('div', 'cgo');
  const anterior = /** @type {HTMLButtonElement} */ (el('button', 'btn ghost sm', 'Anterior'));
  const siguiente = /** @type {HTMLButtonElement} */ (el('button', 'btn sm'));
  const cerrar = /** @type {HTMLButtonElement} */ (el('button', 'btn ghost sm', 'Cerrar'));
  [anterior, siguiente, cerrar].forEach((b) => { b.type = 'button'; });
  botones.append(anterior, siguiente, cerrar);
  const izquierda = el('div', 'caso-izq');
  izquierda.append(puntos, voz, omitir);
  barra.append(izquierda, botones);
  tarjeta.append(cabeza, cuerpo, barra);

  /** Lo que EL JEFE lee en la escena actual (lo que dice + el contenido). */
  const textoDeLaEscena = () => {
    const escena = ESCENAS[actual];
    const frentes = hayJugadorActivo() ? frentesCubiertos(S) : null;
    const dice = escena.id === 'estado'
      ? mensajeDeEstado(frentes ? frentes.filter((f) => f.cubierto).length : 0)
      : escena.jefe;
    const modo = /** @type {HTMLElement | null} */ ($('.caso-cuerpo [data-modo]', cuerpo.parentElement));
    return narracionDeEscena(escena.id, dice, { modo: /** @type {any} */ (modo?.dataset.modo), frentes: frentes || undefined });
  };
  /** El botón dice «Escuchar» o «Detener» según haya lectura en curso. */
  const actualizarBoton = () => {
    escuchar.textContent = estaNarrando() ? 'Detener la voz' : 'Escuchar a EL JEFE';
    escuchar.setAttribute('aria-pressed', String(estaNarrando()));
  };
  /** Nombre del audio de la escena que se ve (si existe el archivo, se usa; si no, la voz del navegador). */
  const audioDeLaEscena = () => {
    const modo = /** @type {HTMLElement | null} */ ($('.caso-cuerpo [data-modo]', cuerpo.parentElement));
    const cubiertos = hayJugadorActivo() ? frentesCubiertos(S).filter((f) => f.cubierto).length : 0;
    return idDeAudio(ESCENAS[actual].id, { modo: /** @type {any} */ (modo?.dataset.modo), cubiertos });
  };
  /** Lee la escena; con `seguir`, al terminar pasa sola a la siguiente (si no es la última). */
  const leerEscena = (seguir) => {
    narrar(textoDeLaEscena(), () => {
      actualizarBoton();
      if (seguir && casillaAuto.checked && actual < ESCENAS.length - 1) window.setTimeout(() => { if (casillaAuto.checked && document.body.contains(tarjeta)) { actual += 1; pintar(); } }, 1200);
    }, { archivo: audioDeLaEscena(), velocidad: velocidadElegida() });
    actualizarBoton();
  };
  selector.addEventListener('change', () => {
    guardarVelocidad(selector.value);
    // Si suena un archivo se ajusta al instante; si es la voz del navegador, se reinicia la escena con la nueva velocidad.
    if (estaNarrando() && !cambiarVelocidad(velocidadElegida())) leerEscena(casillaAuto.checked);
  });
  escuchar.addEventListener('click', () => {
    if (estaNarrando()) { detener(); actualizarBoton(); } else leerEscena(false);
  });
  casillaAuto.addEventListener('change', () => {
    guardarVozAutomatica(casillaAuto.checked);
    if (casillaAuto.checked) leerEscena(true); else { detener(); actualizarBoton(); }
  });
  document.addEventListener('ysph:ventana-cerrada', detener, { once: true }); // al cerrar la ventana, la voz se calla

  let escenaPintada = false; // para que el sonido de «cambio de escena» no suene al abrir
  const pintar = () => {
    const escena = ESCENAS[actual];
    const ultima = actual === ESCENAS.length - 1;
    $('.ctag', titulo).textContent = `Escena ${dos(actual + 1)}/${dos(ESCENAS.length)} · ${escena.etiqueta}`;
    $('h2', titulo).textContent = escena.titulo;
    const dice = ultima ? mensajeDeEstado(hayJugadorActivo() ? frentesCubiertos(S).filter((f) => f.cubierto).length : 0) : escena.jefe;
    habla.innerHTML = '<b>EL JEFE:</b> <span></span>';
    $('span', habla).textContent = dice;
    cuerpo.replaceChildren(habla, CUERPOS[escena.id]());
    cuerpo.scrollTop = 0;
    Array.from(puntos.children).forEach((p, i) => p.classList.toggle('on', i === actual));
    anterior.hidden = actual === 0;
    siguiente.textContent = ultima ? 'Aceptar el reto' : 'Siguiente';
    detener(); // al cambiar de escena se corta la lectura anterior
    if (escenaPintada) sonar('escena');
    escenaPintada = true;
    actualizarBoton();
    if (casillaAuto.checked) leerEscena(true);
  };
  const aceptar = () => { cerrarVentana(); ir('retos'); };
  anterior.addEventListener('click', () => { actual -= 1; pintar(); });
  siguiente.addEventListener('click', () => { if (actual === ESCENAS.length - 1) aceptar(); else { actual += 1; pintar(); } });
  cerrar.addEventListener('click', () => cerrarVentana());

  const marco = abrirVentana(tarjeta);
  marco.classList.add('modal-caso');
  sonar('panel');
  // Flechas del teclado para pasar de escena (Esc y Tab ya los maneja la ventana).
  marco.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && actual < ESCENAS.length - 1) { actual += 1; pintar(); }
    else if (e.key === 'ArrowLeft' && actual > 0) { actual -= 1; pintar(); }
  });
  pintar();
  siguiente.focus();
}

/** Conecta la narrativa: los botones `data-caso` y la apertura automática al entrar al juego. Se llama una vez al arrancar. */
export function iniciarCaso() {
  document.addEventListener('click', (e) => {
    const disparador = /** @type {HTMLElement} */ (e.target).closest('[data-caso]');
    if (!disparador) return;
    e.preventDefault();
    abrirCaso();
  });
  // Al pulsar «Entrar al juego» desde la portada: primero la narrativa (si no se pidió omitirla).
  alEntrarAlJuego(() => {
    if (estaOculto()) return;
    window.setTimeout(() => { if (!hayVentana()) abrirCaso(); }, ESPERA_AL_ENTRAR_MS);
  });
}
