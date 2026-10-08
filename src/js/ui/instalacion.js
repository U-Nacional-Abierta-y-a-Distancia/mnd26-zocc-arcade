/**
 * Instalación de la app (PWA), descarga del APK y registro del service worker.
 *
 * La fila «Llévalo en tu bolsillo» de la portada tiene tres partes:
 *  - instalar desde el navegador (botón que solo aparece si el navegador lo permite),
 *  - el botón «Descargar APK»: es SOLO VISUAL, una propuesta de desarrollo futuro (no hay APK ni descarga),
 *  - instrucciones para iPhone.
 *
 * @module ui/instalacion
 */
import { $ } from '../util/dom.js';

/** Prepara la fila de instalación y descarga. Se llama una vez al arrancar. */
export function iniciarInstalacion() {
  const botonInstalar = $('#pwaBtn');
  if (!botonInstalar) return;
  const mensajeInstalar = $('#pwaMsg');

  const yaInstalada = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || /** @type {any} */ (navigator).standalone;
  const esIphone = /iphone|ipad|ipod/i.test(navigator.userAgent);
  mensajeInstalar.textContent = yaInstalada ? 'Ya usas la app instalada.' : (esIphone ? '' : 'O desde el menú del navegador: «Instalar app».');

  /** Evento del navegador que permite mostrar el diálogo de instalación. @type {any} */
  let ofertaDeInstalacion = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    ofertaDeInstalacion = e;
    botonInstalar.hidden = false;
    mensajeInstalar.textContent = 'Funciona sin conexión.';
  });
  botonInstalar.addEventListener('click', () => {
    if (!ofertaDeInstalacion) return;
    ofertaDeInstalacion.prompt();
    ofertaDeInstalacion.userChoice.then(() => { ofertaDeInstalacion = null; botonInstalar.hidden = true; }, () => {});
  });
  window.addEventListener('appinstalled', () => {
    botonInstalar.hidden = true;
    mensajeInstalar.textContent = '¡Instalada!';
  });
}

/** Registra el service worker (modo sin conexión), solo en HTTPS o en localhost. */
export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  navigator.serviceWorker.register('sw.js').catch(() => { /* el juego funciona igual sin él */ });
}
