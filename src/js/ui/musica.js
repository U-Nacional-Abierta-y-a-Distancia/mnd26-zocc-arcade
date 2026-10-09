/**
 * Música de fondo: una pista en bucle según dónde estés (portada, retos o panel narrado), con entrada y salida suaves.
 *
 *  · Respeta el botón de sonido: si lo silencias, la música se apaga también.
 *  · Baja el volumen mientras EL JEFE habla, para que se le entienda.
 *  · Intenta sonar desde la presentación inicial. Si el navegador no lo permite (suele exigir un toque antes), la presentación muestra
 *    «Toca la pantalla para activar el sonido» y la música empieza con el primer toque o tecla. Se pausa si la pestaña no se ve.
 *  · Si los archivos no están, no pasa nada: el juego sigue sin música.
 *
 * Las reglas están en `dominio/musica.js` y los datos en `datos/musica.js`.
 *
 * @module ui/musica
 */
import { CARPETAS_MUSICA, PISTAS } from '../datos/musica.js';
import { acercar, pistaPara, volumenPara } from '../dominio/musica.js';
import { audioIncrustado } from '../util/audio-incrustado.js';
import { vistaActual } from './navegacion.js';
import { estaNarrando } from './narrador.js';
import { sonidoActivo } from './sonido.js';

/** Cada cuánto se revisa qué debe sonar (ms) y cuánto cambia el volumen por revisión (entrada/salida de ~1,5 s). */
const INTERVALO_MS = 100;
const PASO_VOLUMEN = 0.02;

/** @typedef {{audio: HTMLAudioElement, volumen: number, direcciones: string[], cual: number}} Reproductor */
/** @type {Map<string, Reproductor>} */
const reproductores = new Map();
/** ¿Se supone que el navegador deja sonar? Empieza en sí; si rechaza la reproducción pasa a no hasta el próximo toque o tecla. */
let desbloqueada = true;

/** El navegador no deja sonar todavía: se espera al primer toque o tecla. @param {{name?: string}} [error] */
function rechazada(error) {
  if (error && error.name === 'NotAllowedError') desbloqueada = false;
}

/** Crea (una vez) el reproductor de una pista; busca primero el audio incrustado en `nido.html` y luego los archivos (si no está en una carpeta, prueba la siguiente). @param {string} clave @returns {Reproductor} */
function reproductorDe(clave) {
  let r = reproductores.get(clave);
  if (r) return r;
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  /** @type {Reproductor} */
  const incrustada = audioIncrustado(`musica/${PISTAS[clave].archivo}`);
  const direcciones = [...(incrustada ? [incrustada] : []), ...CARPETAS_MUSICA.map((carpeta) => `${carpeta}/${PISTAS[clave].archivo}`)];
  r = { audio, volumen: 0, direcciones, cual: 0 };
  const poner = () => { audio.src = r.direcciones[r.cual]; };
  audio.addEventListener('error', () => {
    if (r.cual + 1 < r.direcciones.length) { r.cual += 1; poner(); if (desbloqueada) audio.play().catch(rechazada); }
  });
  poner();
  reproductores.set(clave, r);
  return r;
}

/** Una vuelta: acerca el volumen de cada pista a su objetivo (la actual sube; las demás bajan y se pausan). */
function revisar() {
  const objetivo = volumenPara({ sonido: sonidoActivo(), desbloqueada, oculta: document.hidden, narrando: estaNarrando() });
  const actual = pistaPara({ vista: vistaActual(), panelAbierto: Boolean(document.querySelector('.modal-caso')) });
  if (objetivo > 0) reproductorDe(actual);          // crea la pista que toca (las demás ya creadas se van apagando)
  const aviso = document.querySelector('.sp-sonido');   // pista en la presentación: «Toca la pantalla para activar el sonido»
  if (aviso) aviso.hidden = desbloqueada || !sonidoActivo();
  for (const [clave, r] of reproductores) {
    r.volumen = acercar(r.volumen, clave === actual ? objetivo : 0, PASO_VOLUMEN);
    r.audio.volume = Math.max(0, Math.min(1, r.volumen));
    if (r.volumen > 0 && r.audio.paused && !r.audio.error) r.audio.play().catch(rechazada); // si no hay archivo, el reproductor lo detecta solo
    else if (r.volumen === 0 && !r.audio.paused) r.audio.pause();
  }
}

/** Arranca la música. Se llama una vez al iniciar el juego. */
export function iniciarMusica() {
  const desbloquear = () => { desbloqueada = true; };
  for (const evento of ['pointerdown', 'keydown', 'touchstart']) document.addEventListener(evento, desbloquear, { capture: true });
  window.setInterval(revisar, INTERVALO_MS);
}
