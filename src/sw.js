/**
 * Service worker de «NIDO»: permite usar el juego sin conexión.
 *
 * Estrategia: RED PRIMERO, con respaldo en la caché. Si hay internet siempre se muestra la versión más nueva
 * (y se guarda una copia); si no hay, se usa la última copia guardada.
 *
 * Al instalarse precarga lo imprescindible para arrancar sin red (lista `NUCLEO`). Si agregas o renombras un
 * archivo de css/ o js/, actualiza la lista Y sube `VERSION`; `pruebas/unit/estructura.test.js` avisa si
 * algo de la lista no existe o si falta algún archivo.
 *
 * No intercepta `/api/` (el chat con la IA) ni `/downloads/`, ni peticiones a otros dominios.
 */
const VERSION = 'ysph-v20';

/** Archivos que se guardan al instalar (rutas relativas a este archivo). */
const NUCLEO = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/icon-192.png',
  'css/00-tokens.css',
  'css/01-base.css',
  'css/02-botones.css',
  'css/03-cabecera.css',
  'css/04-portada.css',
  'css/05-personajes.css',
  'css/06-juego.css',
  'css/07-mochila.css',
  'css/08-ranking.css',
  'css/09-insignias.css',
  'css/10-ventanas.css',
  'css/11-familia.css',
  'css/12-chat.css',
  'css/13-presentacion.css',
  'css/14-pie-y-avisos.css',
  'css/15-caso.css',
  'js/config.js',
  'js/datos/agentes.js',
  'js/datos/avatar-jefe.js',
  'js/datos/caso.js',
  'js/datos/habitos-malos.js',
  'js/datos/habitos.js',
  'js/datos/ilustraciones.js',
  'js/datos/insignias.js',
  'js/datos/mochila.js',
  'js/datos/musica.js',
  'js/datos/niveles.js',
  'js/datos/sonidos.js',
  'js/datos/sprites.js',
  'js/dominio/chat.js',
  'js/dominio/familia.js',
  'js/dominio/musica.js',
  'js/dominio/progreso.js',
  'js/dominio/ranking.js',
  'js/estado/almacen.js',
  'js/main.js',
  'js/ui/avisos.js',
  'js/ui/caso.js',
  'js/ui/chat/arrastre.js',
  'js/ui/chat/cliente-ia.js',
  'js/ui/chat/panel.js',
  'js/ui/combate.js',
  'js/ui/familia.js',
  'js/ui/identidad.js',
  'js/ui/insignias.js',
  'js/ui/instalacion.js',
  'js/ui/kpis.js',
  'js/ui/mochila.js',
  'js/ui/musica.js',
  'js/ui/narrador.js',
  'js/ui/navegacion.js',
  'js/ui/particulas.js',
  'js/ui/presentacion.js',
  'js/ui/ranking.js',
  'js/ui/render.js',
  'js/ui/retos.js',
  'js/ui/sonido.js',
  'js/ui/sprites.js',
  'js/ui/tarjetas.js',
  'js/ui/ventanas.js',
  'js/util/audio-incrustado.js',
  'js/util/dom.js',
  'js/util/fecha.js',
  'js/util/texto.js',
  'js/util/voz.js',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(NUCLEO))
      .then(() => self.skipWaiting()),
  );
});

// Al activarse, borra las cachés de versiones anteriores y toma el control de las pestañas abiertas.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  const url = new URL(peticion.url);
  const esPropia = url.origin === location.origin;
  const esApiODescarga = url.pathname.includes('/api/') || url.pathname.includes('/downloads/');
  if (peticion.method !== 'GET' || !esPropia || esApiODescarga) return;

  evento.respondWith(
    fetch(peticion)
      .then((respuesta) => {
        if (respuesta && respuesta.status === 200) {
          const copia = respuesta.clone();
          caches.open(VERSION).then((cache) => cache.put(peticion, copia));
        }
        return respuesta;
      })
      .catch(() => caches.match(peticion).then((guardada) => guardada || caches.match('index.html'))),
  );
});
