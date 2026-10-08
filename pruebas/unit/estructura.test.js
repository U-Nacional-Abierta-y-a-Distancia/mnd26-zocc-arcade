/**
 * Comprueba la coherencia de los archivos del juego: que lo que declaran `index.html`, el service worker y los
 * `import` exista de verdad. Atrapa los errores típicos de reorganizar archivos (un nombre cambiado, un archivo
 * olvidado en la lista de la caché) sin necesidad de abrir el navegador.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');
const leer = (ruta) => fs.readFileSync(path.join(SRC, ruta), 'utf8');

/** Lista recursiva de archivos con una extensión, relativos a src/ y con «/». */
function listar(carpeta, extension) {
  const salida = [];
  for (const entrada of fs.readdirSync(path.join(SRC, carpeta), { withFileTypes: true })) {
    const ruta = `${carpeta}/${entrada.name}`;
    if (entrada.isDirectory()) salida.push(...listar(ruta, extension));
    else if (entrada.name.endsWith(extension)) salida.push(ruta);
  }
  return salida.sort();
}

const modulos = listar('js', '.js');
const hojas = listar('css', '.css');

test('index.html enlaza todas las hojas de estilo, en orden, y cada una existe', () => {
  const html = leer('index.html');
  const enlazadas = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h.startsWith('css/'));
  assert.deepEqual(enlazadas, hojas, 'las hojas deben estar enlazadas todas y en orden numérico (la cascada depende del orden)');
});

test('index.html carga un solo script (js/main.js) como módulo', () => {
  const scripts = [...leer('index.html').matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)];
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0][1], 'js/main.js');
  assert.match(scripts[0][0], /type="module"/);
});

test('Todos los import relativos apuntan a archivos que existen', () => {
  for (const modulo of modulos) {
    const codigo = leer(modulo);
    for (const m of codigo.matchAll(/(?:^|\n)\s*(?:import|export)\s[^'"\n]*?from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
      const destino = m[1] || m[2];
      const existe = fs.existsSync(path.join(SRC, path.dirname(modulo), destino));
      assert.ok(existe, `${modulo} importa «${destino}», que no existe`);
    }
  }
});

test('No hay módulos huérfanos: todos se alcanzan desde js/main.js', () => {
  const alcanzados = new Set();
  const visitar = (modulo) => {
    if (alcanzados.has(modulo)) return;
    alcanzados.add(modulo);
    for (const m of leer(modulo).matchAll(/from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
      visitar(path.posix.normalize(path.posix.join(path.posix.dirname(modulo), m[1] || m[2])));
    }
  };
  visitar('js/main.js');
  const huerfanos = modulos.filter((m) => !alcanzados.has(m));
  assert.deepEqual(huerfanos, [], 'código que nadie usa: bórralo o conéctalo');
});

test('Cada módulo empieza con un comentario de documentación que lo describe', () => {
  for (const modulo of modulos) {
    assert.match(leer(modulo).trimStart(), /^\/\*\*/, `${modulo} no tiene comentario de módulo al inicio`);
  }
});

test('El service worker precarga archivos que existen y no olvida ninguno de css/ ni js/', () => {
  const sw = leer('sw.js');
  const lista = sw.match(/const NUCLEO = \[([\s\S]*?)\];/)[1];
  const nucleo = [...lista.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((r) => r !== './');
  for (const archivo of nucleo) assert.ok(fs.existsSync(path.join(SRC, archivo)), `sw.js precarga «${archivo}», que no existe`);
  for (const archivo of [...modulos, ...hojas, 'index.html', 'manifest.webmanifest']) {
    assert.ok(nucleo.includes(archivo), `sw.js no precarga «${archivo}»: sin red el juego no abriría`);
  }
});

test('El manifest apunta a íconos que existen', () => {
  const manifiesto = JSON.parse(leer('manifest.webmanifest'));
  assert.ok(manifiesto.icons.length >= 2);
  for (const icono of manifiesto.icons) assert.ok(fs.existsSync(path.join(SRC, icono.src)), icono.src);
});

test('Las imágenes que citan los datos existen en assets/', () => {
  const rutas = new Set();
  for (const modulo of modulos.filter((m) => m.startsWith('js/datos/'))) {
    for (const m of leer(modulo).matchAll(/assets\/[\w.\-]+\.(?:webp|png|jpg)/g)) rutas.add(m[0]);
  }
  assert.ok(rutas.size > 10);
  for (const ruta of rutas) assert.ok(fs.existsSync(path.join(SRC, ruta)), `falta ${ruta}`);
});
