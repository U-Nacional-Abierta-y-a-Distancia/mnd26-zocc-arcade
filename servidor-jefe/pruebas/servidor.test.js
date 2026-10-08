/**
 * Pruebas del servidor completo con un cliente de Claude FALSO: sin red, sin clave y sin gastar créditos.
 * Cada prueba levanta un servidor real en un puerto libre y le habla por HTTP.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { crearServidor } from '../lib/app.js';
import { SIN_RESPUESTA } from '../lib/chat.js';
import { leerConfig } from '../lib/config.js';

const silencio = { log() {}, error() {} };

/** Cliente falso: devuelve trozos de texto y registra la petición recibida. */
function clienteFalso({ trozos = ['Hola ', 'jugador'], stop = 'end_turn', fallar = null } = {}) {
  const falso = {
    peticiones: [],
    beta: {
      messages: {
        stream(peticion) {
          falso.peticiones.push(peticion);
          return {
            abort() {},
            async *[Symbol.asyncIterator]() {
              if (fallar) throw fallar;
              for (const x of trozos) yield { type: 'content_block_delta', delta: { type: 'text_delta', text: x } };
            },
            async finalMessage() { return { stop_reason: stop, usage: { input_tokens: 10, output_tokens: 5 } }; },
          };
        },
      },
    },
  };
  return falso;
}

/** Levanta el servidor y ejecuta `prueba(base)`; siempre lo cierra. */
async function conServidor(opciones, prueba) {
  const dirWeb = fs.mkdtempSync(path.join(os.tmpdir(), 'ysph-web-'));
  fs.writeFileSync(path.join(dirWeb, 'index.html'), '<h1>Juego</h1>');
  fs.writeFileSync(path.join(dirWeb, 'app.js'), 'export {}');
  const config = { ...leerConfig({}, [], dirWeb), dirWeb, ...(opciones.config || {}) };
  const servidor = crearServidor({
    config,
    prompt: 'PROMPT FIJO',
    cliente: () => opciones.cliente,
    hayClave: () => opciones.clave ?? true,
    permitido: opciones.permitido,
    registro: silencio,
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  try { await prueba(base, dirWeb); } finally {
    servidor.closeAllConnections?.();
    await new Promise((r) => servidor.close(r));
    fs.rmSync(dirWeb, { recursive: true, force: true });
  }
}

const post = (base, cuerpo) => fetch(`${base}/api/jefe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo) });
const lineas = async (resp) => (await resp.text()).trim().split('\n').map((l) => JSON.parse(l));
const pregunta = { messages: [{ role: 'user', content: '¿Cómo voy?' }], contexto: { xp: 50, insignia: 0 } };

test('Salud: informa si hay clave, sin revelarla', async () => {
  await conServidor({ cliente: clienteFalso(), clave: true }, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/jefe/salud`)).json(), { ia: true });
  });
  await conServidor({ cliente: clienteFalso(), clave: false }, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/jefe/salud`)).json(), { ia: false });
  });
});

test('Chat: devuelve la respuesta en streaming NDJSON y termina con «fin»', async () => {
  const cliente = clienteFalso();
  await conServidor({ cliente }, async (base) => {
    const resp = await post(base, pregunta);
    assert.equal(resp.status, 200);
    assert.match(resp.headers.get('content-type'), /x-ndjson/);
    assert.deepEqual(await lineas(resp), [{ t: 'delta', x: 'Hola ' }, { t: 'delta', x: 'jugador' }, { t: 'fin' }]);
  });
});

test('Chat: la petición a Claude lleva el prompt con caché, el estado del jugador y la configuración', async () => {
  const cliente = clienteFalso();
  await conServidor({ cliente }, async (base) => {
    await (await post(base, pregunta)).text();
    const p = cliente.peticiones[0];
    assert.equal(p.model, 'claude-opus-5-5');
    assert.deepEqual(p.output_config, { effort: 'low' });
    assert.deepEqual(p.betas, ['server-side-fallback-2026-07-01']);
    assert.equal(p.fallbacks, 'default');
    assert.equal(p.system[0].text, 'PROMPT FIJO');
    assert.deepEqual(p.system[0].cache_control, { type: 'ephemeral' }, 'lo fijo, primero y cacheable');
    assert.match(p.system[1].text, /XP: 50/, 'lo variable, después');
    assert.equal(p.system[1].cache_control, undefined);
    assert.deepEqual(p.messages, [{ role: 'user', content: '¿Cómo voy?' }]);
  });
});

test('Chat: sin el reintento de seguridad la petición no lleva betas ni fallbacks', async () => {
  const cliente = clienteFalso();
  await conServidor({ cliente, config: { reintentoSeguridad: false } }, async (base) => {
    await (await post(base, pregunta)).text();
    assert.equal('betas' in cliente.peticiones[0], false);
    assert.equal('fallbacks' in cliente.peticiones[0], false);
  });
});

test('Chat: un rechazo de seguridad se muestra como mensaje seguro con el 123, no en blanco', async () => {
  await conServidor({ cliente: clienteFalso({ trozos: [], stop: 'refusal' }) }, async (base) => {
    const eventos = await lineas(await post(base, pregunta));
    assert.deepEqual(eventos, [{ t: 'delta', x: SIN_RESPUESTA }, { t: 'fin' }]);
    assert.match(SIN_RESPUESTA, /123/);
  });
});

test('Chat: un fallo del servicio de IA llega como evento de error (el servidor sigue vivo)', async () => {
  await conServidor({ cliente: clienteFalso({ fallar: new Error('boom') }) }, async (base) => {
    assert.deepEqual(await lineas(await post(base, pregunta)), [{ t: 'error', m: 'servicio' }]);
    assert.equal((await fetch(`${base}/api/jefe/salud`)).status, 200);
  });
});

test('Chat: sin clave responde 503; con límite excedido, 429; con cuerpo malo, 400; demasiado grande, 413', async () => {
  await conServidor({ cliente: clienteFalso(), clave: false }, async (base) => {
    const r = await post(base, pregunta);
    assert.equal(r.status, 503);
    assert.deepEqual(await r.json(), { error: 'sin_clave' });
  });
  await conServidor({ cliente: clienteFalso(), permitido: () => false }, async (base) => {
    assert.equal((await post(base, pregunta)).status, 429);
  });
  await conServidor({ cliente: clienteFalso() }, async (base) => {
    assert.equal((await post(base, '{no es json')).status, 400);
    const r = await post(base, { messages: [{ role: 'assistant', content: 'hola' }] });
    assert.equal(r.status, 400);
    assert.deepEqual(await r.json(), { error: 'mensajes' });
    assert.equal((await post(base, { messages: [{ role: 'user', content: 'x'.repeat(30_000) }] })).status, 413, 'cuerpo demasiado grande');
  });
});

test('Rutas: /api/ desconocida → 404 JSON; métodos no admitidos → 405', async () => {
  await conServidor({ cliente: clienteFalso() }, async (base) => {
    const r = await fetch(`${base}/api/otra`);
    assert.equal(r.status, 404);
    assert.deepEqual(await r.json(), { error: 'no_existe' });
    assert.equal((await fetch(`${base}/`, { method: 'DELETE' })).status, 405);
  });
});

test('Archivos: sirve index.html, tipos correctos y 404; las cabeceras de seguridad van en todo', async () => {
  await conServidor({ cliente: clienteFalso() }, async (base) => {
    const raiz = await fetch(`${base}/`);
    assert.equal(raiz.status, 200);
    assert.match(raiz.headers.get('content-type'), /text\/html/);
    assert.equal(raiz.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(await raiz.text(), '<h1>Juego</h1>');
    assert.match((await fetch(`${base}/app.js`)).headers.get('content-type'), /text\/javascript/);
    assert.equal((await fetch(`${base}/no-existe.png`)).status, 404);
  });
});

test('Archivos: no permite salir de la carpeta del juego (../ y rutas codificadas)', async () => {
  await conServidor({ cliente: clienteFalso() }, async (base) => {
    // `fetch` normaliza «../»; por eso se usa una petición cruda para enviar la ruta tal cual.
    const { hostname, port } = new URL(base);
    const crudo = (ruta) => new Promise((resolve, reject) => {
      import('node:net').then(({ default: net }) => {
        const s = net.connect(Number(port), hostname, () => s.write(`GET ${ruta} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
        let datos = '';
        s.on('data', (d) => { datos += d; });
        s.on('end', () => resolve(datos.split(' ')[1]));
        s.on('error', reject);
      });
    });
    for (const ruta of ['/../package.json', '/%2e%2e/package.json', '/..%2fpackage.json', '/%2e%2e%2f%2e%2e%2fetc/passwd']) {
      const estado = await crudo(ruta);
      assert.ok(['403', '404'].includes(estado), `${ruta} → ${estado}`);
    }
  });
});

test('Archivos de pruebas: solo se publican con --dev', async () => {
  const pruebas = fs.mkdtempSync(path.join(os.tmpdir(), 'ysph-pruebas-'));
  fs.writeFileSync(path.join(pruebas, 'a.js'), 'export {}');
  try {
    await conServidor({ cliente: clienteFalso() }, async (base) => {
      assert.equal((await fetch(`${base}/__pruebas/a.js`)).status, 404);
    });
    await conServidor({ cliente: clienteFalso(), config: { rutasExtra: { '/__pruebas/': pruebas } } }, async (base) => {
      assert.equal((await fetch(`${base}/__pruebas/a.js`)).status, 200);
    });
  } finally { fs.rmSync(pruebas, { recursive: true, force: true }); }
});

test('CORS: solo se abre al dominio configurado', async () => {
  await conServidor({ cliente: clienteFalso() }, async (base) => {
    assert.equal((await fetch(`${base}/api/jefe/salud`)).headers.get('access-control-allow-origin'), null);
  });
  await conServidor({ cliente: clienteFalso(), config: { origenCors: 'https://mi-pagina.co' } }, async (base) => {
    const r = await fetch(`${base}/api/jefe/salud`);
    assert.equal(r.headers.get('access-control-allow-origin'), 'https://mi-pagina.co');
    assert.equal((await fetch(`${base}/api/jefe`, { method: 'OPTIONS' })).status, 204);
  });
});
