/**
 * Sonido del juego: efectos para las animaciones (señal de cada salvador, impactos, caída del enemigo o del
 * salvador, marcar hábitos, insignias, ventanas…). Cada efecto se describe en `datos/sonidos.js` y aquí se SINTETIZA en
 * el momento con Web Audio (osciladores y ruido filtrado): pesa casi nada, funciona sin conexión y no depende de archivos.
 * Los sonidos se sintetizan aquí mismo (no hay archivos de audio de efectos).
 *
 * Los navegadores solo dejan sonar después de que la persona toca la pantalla: todos los efectos salen de una
 * acción suya (marcar un hábito, abrir una ventana), así que no hay problema. El sonido se puede silenciar con el
 * botón del encabezado (`data-sonido`) y la elección se recuerda.
 *
 * Uso: `sonar('bien')`. La lista de nombres está en `NOMBRES_DE_SONIDO`.
 *
 * @module ui/sonido
 */
import { CLAVES } from '../config.js';
import { SONIDOS, SONIDO_POR_ID } from '../datos/sonidos.js';

/** Volumen general (0 a 1). Bajo a propósito: son efectos, no música. */
const VOLUMEN = 0.32;

/** @type {AudioContext | null} */
let contexto = null;
/** @type {GainNode | null} */
let maestro = null;
/** @type {AudioBuffer | null} */
let bufferDeRuido = null;

/** ¿Está activado el sonido? (por defecto, sí). @returns {boolean} */
export function sonidoActivo() {
  try { return localStorage.getItem(CLAVES.sonido) !== '0'; } catch { return true; }
}

/** Activa o silencia el sonido y recuerda la elección. @param {boolean} activo */
export function activarSonido(activo) {
  try { localStorage.setItem(CLAVES.sonido, activo ? '1' : '0'); } catch { /* sin almacenamiento */ }
  if (!activo && contexto && contexto.state === 'running') contexto.suspend();
}

/** Crea (una sola vez) el motor de audio. @returns {AudioContext | null} null si el navegador no tiene Web Audio. */
function motor() {
  if (!contexto) {
    const Contexto = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (!Contexto) return null;
    contexto = new Contexto();
    maestro = contexto.createGain();
    maestro.gain.value = VOLUMEN;
    maestro.connect(contexto.destination);
  }
  if (contexto.state === 'suspended') contexto.resume();
  return contexto;
}

/** Un segundo de ruido blanco, que se reutiliza. @param {AudioContext} c @returns {AudioBuffer} */
function ruido(c) {
  if (!bufferDeRuido) {
    bufferDeRuido = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const datos = bufferDeRuido.getChannelData(0);
    for (let i = 0; i < datos.length; i += 1) datos[i] = Math.random() * 2 - 1;
  }
  return bufferDeRuido;
}

/* ------------------------------------------------------------------ piezas básicas */

/**
 * Nota o «barrido» de un oscilador, con ataque rápido y caída suave.
 * @param {AudioContext} c
 * @param {{tipo?: OscillatorType, f0: number, f1?: number, t?: number, dur?: number, vol?: number, ataque?: number}} p
 *        `f0` → `f1`: frecuencia inicial y final (Hz). `t`: instante de inicio (s, relativo a ahora).
 */
function tono(c, { tipo = 'sine', f0, f1 = f0, t = 0, dur = 0.15, vol = 0.3, ataque = 0.005 }) {
  const inicio = c.currentTime + 0.01 + t;
  const oscilador = c.createOscillator();
  const ganancia = c.createGain();
  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(f0, inicio);
  if (f1 !== f0) oscilador.frequency.exponentialRampToValueAtTime(Math.max(1, f1), inicio + dur);
  ganancia.gain.setValueAtTime(0.0001, inicio);
  ganancia.gain.exponentialRampToValueAtTime(vol, inicio + ataque);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
  oscilador.connect(ganancia).connect(/** @type {GainNode} */ (maestro));
  oscilador.start(inicio);
  oscilador.stop(inicio + dur + 0.03);
}

/**
 * Ráfaga de ruido filtrado (viento, chispas, espuma, golpes secos).
 * @param {AudioContext} c
 * @param {{tipo?: BiquadFilterType, f0: number, f1?: number, q?: number, t?: number, dur?: number, vol?: number, ataque?: number}} p
 */
function soplo(c, { tipo = 'bandpass', f0, f1 = f0, q = 1, t = 0, dur = 0.2, vol = 0.3, ataque = 0.01 }) {
  const inicio = c.currentTime + 0.01 + t;
  const fuente = c.createBufferSource();
  fuente.buffer = ruido(c);
  fuente.loop = true;
  const filtro = c.createBiquadFilter();
  filtro.type = tipo;
  filtro.Q.value = q;
  filtro.frequency.setValueAtTime(f0, inicio);
  if (f1 !== f0) filtro.frequency.exponentialRampToValueAtTime(Math.max(1, f1), inicio + dur);
  const ganancia = c.createGain();
  ganancia.gain.setValueAtTime(0.0001, inicio);
  ganancia.gain.exponentialRampToValueAtTime(vol, inicio + ataque);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
  fuente.connect(filtro).connect(ganancia).connect(/** @type {GainNode} */ (maestro));
  fuente.start(inicio);
  fuente.stop(inicio + dur + 0.03);
}

/* ------------------------------------------------------------------ reproducir el catálogo */

/** Todos los sonidos que existen (para comprobar que el código no pide uno que no está). */
export const NOMBRES_DE_SONIDO = SONIDOS.map((s) => s.id);

/**
 * Hace sonar un sonido del catálogo (`datos/sonidos.js`), si el sonido está activado.
 * @param {string} nombre Uno de `NOMBRES_DE_SONIDO`.
 */
export function sonar(nombre) {
  if (!sonidoActivo()) return;
  const sonido = SONIDO_POR_ID[nombre];
  if (!sonido) return;
  try {
    const c = motor();
    if (!c) return;
    for (const capa of sonido.capas) {
      if (capa.k === 'tono') tono(c, { tipo: /** @type {OscillatorType} */ (capa.tipo), f0: capa.f0, f1: capa.f1, t: capa.t, dur: capa.dur, vol: capa.vol, ataque: capa.ataque });
      else soplo(c, { tipo: /** @type {BiquadFilterType} */ (capa.tipo), f0: capa.f0, f1: capa.f1, q: capa.q, t: capa.t, dur: capa.dur, vol: capa.vol, ataque: capa.ataque });
    }
  } catch { /* el sonido es un adorno: un fallo no debe afectar al juego */ }
}

/** Conecta los botones `data-sonido` (silenciar / activar) y los deja con el estado guardado. Se llama una vez al arrancar. */
export function iniciarSonido() {
  const pintar = () => {
    const activo = sonidoActivo();
    document.querySelectorAll('[data-sonido]').forEach((b) => {
      b.setAttribute('aria-pressed', String(activo));
      b.setAttribute('aria-label', activo ? 'Sonido activado. Tocar para silenciar' : 'Sonido silenciado. Tocar para activar');
      b.classList.toggle('off', !activo);
    });
  };
  document.addEventListener('click', (e) => {
    const boton = /** @type {HTMLElement} */ (e.target).closest('[data-sonido]');
    if (!boton) return;
    activarSonido(!sonidoActivo());
    pintar();
    sonar('bien'); // si se activó, confirma con un sonido
  });
  document.addEventListener('ysph:sonido-cambio', pintar);
  pintar();
}
