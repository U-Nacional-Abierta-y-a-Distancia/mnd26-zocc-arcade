/**
 * Exporta los enemigos en pixel art a archivos PNG con fondo transparente.
 *
 * Los enemigos no son archivos de imagen: el juego los dibuja desde los datos de `src/js/datos/sprites.js`.
 * Este script los convierte en PNG para que el equipo de diseño pueda verlos, editarlos o usarlos en otros medios.
 *
 *   npm run sprites                  → diseno/enemigos/*.png (cada píxel se amplía 32 veces)
 *   node herramientas/exportar-sprites.js [escala]
 *
 * No necesita dependencias: codifica el PNG con `zlib`.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { ANCHO_MITAD, PALETA, SPRITES } from '../src/js/datos/sprites.js';
import { ENEMIGOS } from '../src/js/datos/agentes.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = path.join(raiz, 'diseno', 'enemigos');
const escala = Math.max(1, Number(process.argv[2]) || 32);

/** Qué se exporta: cada enemigo (con su nombre visible). */
const PERSONAJES = [
  ...Object.values(ENEMIGOS).map((e) => ({ sprite: e.sprite, nombre: e.nombre })),
];

const CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = tabla[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function trozo(tipo, datos) {
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const largo = Buffer.alloc(4); largo.writeUInt32BE(datos.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

/** Codifica píxeles RGBA (ancho × alto × 4) como PNG. */
function codificarPng(ancho, alto, rgba) {
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(ancho, 0); cabecera.writeUInt32BE(alto, 4);
  cabecera[8] = 8; cabecera[9] = 6; // 8 bits por canal, RGBA
  const filas = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y += 1) {
    rgba.copy(filas, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', cabecera), trozo('IDAT', zlib.deflateSync(filas, { level: 9 })), trozo('IEND', Buffer.alloc(0)),
  ]);
}

/** Dibuja un sprite (mitad izquierda + espejo) ampliado `escala` veces. */
function dibujar(filas) {
  const ancho = ANCHO_MITAD * 2 * escala;
  const alto = filas.length * escala;
  const rgba = Buffer.alloc(ancho * alto * 4); // transparente
  const pintar = (px, py, hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    for (let dy = 0; dy < escala; dy += 1) {
      for (let dx = 0; dx < escala; dx += 1) {
        const o = ((py * escala + dy) * ancho + px * escala + dx) * 4;
        rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = 255;
      }
    }
  };
  filas.forEach((fila, y) => {
    for (let x = 0; x < ANCHO_MITAD; x += 1) {
      const c = fila.charAt(x);
      if (!c || c === '.') continue;
      pintar(x, y, PALETA[c]);
      pintar(ANCHO_MITAD * 2 - 1 - x, y, PALETA[c]);
    }
  });
  return { ancho, alto, rgba };
}

fs.mkdirSync(destino, { recursive: true });
for (const { sprite, nombre } of PERSONAJES) {
  const { ancho, alto, rgba } = dibujar(SPRITES[sprite]);
  const archivo = path.join(destino, `${sprite}.png`);
  fs.writeFileSync(archivo, codificarPng(ancho, alto, rgba));
  console.log(`${nombre.padEnd(18)} → diseno/enemigos/${sprite}.png (${ancho}×${alto})`);
}
