/**
 * Ensambla el servidor HTTP: rutas, límite de uso y chat. No arranca nada por sí mismo (eso lo hace `server.js`),
 * así las pruebas pueden crear un servidor con piezas falsas y sin red.
 *
 * Rutas:
 *  - GET  /api/jefe/salud  → { ia: true|false }  (¿hay clave configurada?)
 *  - POST /api/jefe        → chat en streaming (ver `lib/chat.js`)
 *  - GET  /…               → archivos del juego
 * @module lib/app
 */
import http from 'node:http';
import { crearManejadorChat } from './chat.js';
import { crearServidorEstatico } from './estaticos.js';
import { cabecerasBase, ipDe, responderJson } from './http.js';
import { crearLimitador } from './limite.js';

/**
 * @param {Object} deps
 * @param {import('./config.js').Config} deps.config
 * @param {string} deps.prompt
 * @param {() => any} deps.cliente
 * @param {() => boolean} deps.hayClave
 * @param {(ip: string) => boolean} [deps.permitido]  Por defecto, el límite por IP de la configuración.
 * @param {{log: Function, error: Function}} [deps.registro]
 * @returns {http.Server}
 */
export function crearServidor({ config, prompt, cliente, hayClave, permitido, registro = console }) {
  const limite = permitido ?? crearLimitador({ porMinuto: config.limitePorMinuto, porDia: config.limitePorDia });
  const chat = crearManejadorChat({ config, prompt, cliente, hayClave, permitido: limite, registro });
  const estatico = crearServidorEstatico(config.dirWeb, config.rutasExtra);

  return http.createServer(async (req, res) => {
    cabecerasBase(res, config.origenCors);
    const { pathname } = new URL(req.url, 'http://x');
    try {
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      if (pathname === '/api/jefe/salud' && req.method === 'GET') return responderJson(res, 200, { ia: hayClave() });
      if (pathname === '/api/jefe' && req.method === 'POST') return await chat(req, res, ipDe(req, config.detrasDeProxy));
      if (pathname.startsWith('/api/')) return responderJson(res, 404, { error: 'no_existe' });
      if (req.method === 'GET' || req.method === 'HEAD') return estatico(req, res);
      res.writeHead(405);
      res.end();
    } catch (e) {
      registro.error('[jefe] fallo inesperado:', e?.message ?? e);
      if (!res.headersSent) responderJson(res, 500, { error: 'interno' }); else res.end();
    }
  });
}
