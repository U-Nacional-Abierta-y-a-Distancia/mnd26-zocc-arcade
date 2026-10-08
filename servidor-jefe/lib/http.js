/**
 * Utilidades pequeñas de HTTP compartidas por el servidor.
 * @module lib/http
 */

/** Responde con JSON (sin caché). @param {import('node:http').ServerResponse} res @param {number} estado @param {unknown} cuerpo */
export function responderJson(res, estado, cuerpo) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(cuerpo));
}

/**
 * IP de quien llama. Detrás de un proxy se usa `X-Forwarded-For` (solo actívalo si de verdad hay un proxy
 * de confianza: de lo contrario cualquiera podría falsear su IP y saltarse el límite de uso).
 * @param {import('node:http').IncomingMessage} req
 * @param {boolean} detrasDeProxy
 * @returns {string}
 */
export function ipDe(req, detrasDeProxy) {
  if (detrasDeProxy) {
    const reenviada = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (reenviada) return reenviada;
  }
  return req.socket.remoteAddress || 'desconocida';
}

/** Cabeceras de seguridad (y CORS si la página está en otro dominio). @param {import('node:http').ServerResponse} res @param {string} origenCors */
export function cabecerasBase(res, origenCors) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (origenCors) {
    res.setHeader('Access-Control-Allow-Origin', origenCors);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
}
