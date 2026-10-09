/**
 * Narrador: reproduce la voz de EL JEFE. Tiene dos modos, en este orden de preferencia:
 *
 *  1. ARCHIVO DE AUDIO: si existe `assets/audio/narrador/<id>.mp3` (o `.ogg`, o `.wav`) lo reproduce. Es la forma de usar una
 *     voz grabada o generada con una herramienta más natural: basta con guardar el archivo con el nombre de la escena.
 *  2. VOZ DEL NAVEGADOR: si no hay archivo, lee el texto con la voz sintetizada del dispositivo (`speechSynthesis`),
 *     eligiendo la mejor voz en español disponible.
 *
 * Uso: `narrar(texto, alTerminar, { archivo, velocidad })` empieza; `detener()` corta. `alTerminar` solo se llama si la
 * lectura llegó hasta el final (no si se detuvo).
 *
 * @module ui/narrador
 */
import { audioIncrustado } from '../util/audio-incrustado.js';
import { elegirVoz, paraVoz, partirEnFrases } from '../util/voz.js';

/**
 * Carpetas de los audios de la narración y extensiones que se buscan (en este orden). La segunda carpeta cubre el juego abierto
 * con doble clic desde `nido.html`, que queda junto a `src/` y no dentro de ella.
 */
const CARPETAS_AUDIOS = ['assets/audio/narrador', 'src/assets/audio/narrador'];

/** Direcciones donde se busca el audio `<id>`: primero el incrustado en `nido.html` (si lo hay) y luego los archivos sueltos. @param {string} id @returns {string[]} */
function direccionesDe(id) {
  const incrustados = EXTENSIONES.map((ext) => audioIncrustado(`narrador/${id}.${ext}`)).filter((d) => d !== null);
  const sueltos = CARPETAS_AUDIOS.flatMap((carpeta) => EXTENSIONES.map((ext) => `${carpeta}/${id}.${ext}`));
  return [...incrustados, ...sueltos];
}
const EXTENSIONES = ['mp3', 'ogg', 'wav'];

/** Idioma que se pide si el dispositivo no ofrece una voz en español identificable. */
const IDIOMA = 'es-CO';

/** Velocidad base de la voz del navegador (1 = normal) y tono: un poco más ágil y grave que lo estándar. */
const VELOCIDAD_BASE = 1.1;
const TONO = 0.9;

/** Cada lectura recibe un número; si cambia, las respuestas de la anterior se ignoran (así se corta limpio). */
let turno = 0;
let hablando = false;
/** Audio en reproducción (modo archivo). @type {HTMLAudioElement | null} */
let audioActual = null;

/** ¿Puede este navegador leer en voz alta con su voz? @returns {boolean} */
export const vozDisponible = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** ¿Se está narrando algo ahora (archivo o voz)? @returns {boolean} */
export const estaNarrando = () => hablando;

/** Corta lo que se esté narrando. */
export function detener() {
  turno += 1;
  hablando = false;
  if (audioActual) { audioActual.pause(); audioActual = null; }
  if (vozDisponible()) window.speechSynthesis.cancel();
}

/** Cambia la velocidad de lo que suena ahora, si es un archivo de audio (la voz del navegador no admite cambios a media lectura). @param {number} velocidad @returns {boolean} true si se pudo */
export function cambiarVelocidad(velocidad) {
  if (!audioActual) return false;
  audioActual.playbackRate = velocidad;
  return true;
}

/**
 * Intenta reproducir el audio `<id>` probando mp3, ogg y wav.
 * @param {string} id
 * @param {number} velocidad
 * @param {number} miTurno
 * @param {() => void} alTerminar
 * @param {() => void} sinArchivo  Se llama si ninguno de los archivos existe o se puede reproducir.
 */
function reproducirArchivo(id, velocidad, miTurno, alTerminar, sinArchivo) {
  let i = 0;
  const direcciones = direccionesDe(id);
  const probar = () => {
    if (miTurno !== turno) return;
    if (i >= direcciones.length) { audioActual = null; sinArchivo(); return; }
    const audio = new Audio(direcciones[i]);
    i += 1;
    audio.playbackRate = velocidad;
    audio.preservesPitch = true;
    let descartado = false;
    const pasarAlSiguiente = () => { if (descartado) return; descartado = true; probar(); };
    audio.addEventListener('error', pasarAlSiguiente, { once: true });
    audio.addEventListener('ended', () => {
      if (miTurno !== turno) return;
      hablando = false; audioActual = null;
      alTerminar();
    }, { once: true });
    audioActual = audio;
    const inicio = audio.play();
    if (inicio && typeof inicio.catch === 'function') inicio.catch(pasarAlSiguiente);
  };
  probar();
}

/**
 * Narra un texto: con el archivo de audio de la escena si existe, o con la voz del navegador.
 * @param {string} texto                        Lo que se lee si no hay archivo.
 * @param {() => void} [alTerminar]             Se llama al llegar al final.
 * @param {{archivo?: string | null, velocidad?: number}} [opciones]
 *        `archivo`: nombre base del audio (sin extensión); `velocidad`: 1 = normal, 1.2 = más rápida…
 * @returns {boolean} false si no hay forma de narrar (ni archivo ni voz del navegador).
 */
export function narrar(texto, alTerminar, { archivo = null, velocidad = 1 } = {}) {
  if (!archivo && !vozDisponible()) return false;
  detener();
  const miTurno = turno;
  hablando = true;
  const terminar = () => { hablando = false; if (alTerminar) alTerminar(); };

  const conVozDelNavegador = () => {
    if (miTurno !== turno) return;
    if (!vozDisponible()) { hablando = false; return; }
    const trozos = partirEnFrases(paraVoz(texto));
    if (!trozos.length) { hablando = false; return; }
    const voz = elegirVoz(window.speechSynthesis.getVoices());
    const leer = (i) => {
      if (miTurno !== turno) return; // alguien detuvo o empezó otra lectura
      if (i >= trozos.length) { terminar(); return; }
      const frase = new SpeechSynthesisUtterance(trozos[i]);
      if (voz) frase.voice = /** @type {SpeechSynthesisVoice} */ (voz);
      frase.lang = voz ? voz.lang : IDIOMA;
      frase.rate = Math.min(2, VELOCIDAD_BASE * velocidad);
      frase.pitch = TONO;
      frase.onend = () => leer(i + 1);
      frase.onerror = (e) => { if (e.error === 'canceled' || e.error === 'interrupted') return; hablando = false; };
      window.speechSynthesis.speak(frase);
    };
    leer(0);
  };

  if (archivo) reproducirArchivo(archivo, velocidad, miTurno, terminar, conVozDelNavegador);
  else conVozDelNavegador();
  return true;
}
