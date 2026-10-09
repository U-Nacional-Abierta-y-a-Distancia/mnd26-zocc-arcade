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
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.txt': 'text/plain; charset=utf-8',
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
      const cabeceras = {
        'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes', // el audio y el video lo necesitan para conocer su duración y poder adelantarse
      };
      // Rango de bytes (p. ej. «bytes=0-» o «bytes=1000-1999»): los reproductores de audio lo piden.
      const rango = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''));
      if (rango && (rango[1] || rango[2])) {
        let inicio = rango[1] ? Number(rango[1]) : st.size - Number(rango[2]);
        let fin = rango[1] && rango[2] ? Number(rango[2]) : st.size - 1;
        inicio = Math.max(0, inicio); fin = Math.min(fin, st.size - 1);
        if (inicio > fin) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); res.end(); return; }
        res.writeHead(206, { ...cabeceras, 'Content-Range': `bytes ${inicio}-${fin}/${st.size}`, 'Content-Length': fin - inicio + 1 });
        if (req.method === 'HEAD') { res.end(); return; }
        fs.createReadStream(archivo, { start: inicio, end: fin }).pipe(res);
        return;
      }
      res.writeHead(200, { ...cabeceras, 'Content-Length': st.size });
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(archivo).pipe(res);
    });
  };
}
