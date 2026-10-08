/**
 * Entrega los archivos del juego (carpeta `src/`), para probar todo desde un solo origen. En producción puede
 * hacerlo cualquier hosting de archivos estáticos; este módulo existe por comodidad.
 * @module lib/estaticos
 */
import fs from 'node:fs';
import path from 'node:path';

/** Tipo de contenido por extensión. */
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8',
};

/**
 * Crea el manejador de archivos.
 * @param {string} dirWeb                       Carpeta que se sirve en `/`.
 * @param {Record<string,string>} [rutasExtra]  Prefijo → carpeta adicional (p. ej. `/__pruebas/` en desarrollo).
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void}
 */
export function crearServidorEstatico(dirWeb, rutasExtra = {}) {
  return function estatico(req, res) {
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); res.end(); return; }

    let base = dirWeb;
    for (const [prefijo, carpeta] of Object.entries(rutasExtra)) {
      if (ruta.startsWith(prefijo)) { base = carpeta; ruta = '/' + ruta.slice(prefijo.length); break; }
    }
    if (ruta.endsWith('/')) ruta += 'index.html';

    // Nada fuera de la carpeta publicada (evita «../» y rutas absolutas).
    const archivo = path.resolve(base, '.' + ruta);
    if (archivo !== base && !archivo.startsWith(base + path.sep)) { res.writeHead(403); res.end(); return; }

    fs.stat(archivo, (err, st) => {
      if (err || !st.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('No encontrado');
        return;
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(archivo).pipe(res);
    });
  };
}
