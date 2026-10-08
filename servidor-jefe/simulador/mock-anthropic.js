/*
 * Simulador de la API de Anthropic, SOLO para probar el servidor sin gastar créditos ni usar una clave real.
 *   node simulador/mock-anthropic.js          (escucha en el puerto 8199)
 *   ANTHROPIC_BASE_URL=http://localhost:8199 ANTHROPIC_API_KEY=prueba node server.js
 *
 * Palabras mágicas en el último mensaje del usuario:
 *   ERROR500 -> responde con un error 500      REFUSAL -> termina con stop_reason "refusal"
 *   LENTO    -> responde despacio (para ver el streaming)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.MOCK_PORT || 8199);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

http.createServer(async (req, res) => {
  if (!(req.method === 'POST' && req.url.startsWith('/v1/messages'))) { res.writeHead(404); return res.end(); }
  const partes = []; for await (const p of req) partes.push(p);
  const cuerpo = JSON.parse(Buffer.concat(partes).toString('utf8'));
  const ultimo = [...cuerpo.messages].reverse().find((m) => m.role === 'user');
  const texto = typeof ultimo?.content === 'string' ? ultimo.content : JSON.stringify(ultimo?.content);
  const sistema = Array.isArray(cuerpo.system) ? cuerpo.system : [];
  const resumen = {
    ruta: req.url,
    beta: req.headers['anthropic-beta'] || null,
    clave_recibida: Boolean(req.headers['x-api-key']),
    modelo: cuerpo.model,
    stream: cuerpo.stream,
    max_tokens: cuerpo.max_tokens,
    effort: cuerpo.output_config?.effort ?? null,
    fallbacks: cuerpo.fallbacks ?? null,
    bloques_system: sistema.length,
    cache_control_en_system0: Boolean(sistema[0]?.cache_control),
    chars_system0: sistema[0]?.text?.length ?? 0,
    contexto: sistema[1]?.text ?? null,
    mensajes: cuerpo.messages.map((m) => `${m.role}: ${String(m.content).slice(0, 60)}`),
  };
  fs.writeFileSync(path.join(aqui, 'ultima-peticion.json'), JSON.stringify(resumen, null, 2));
  console.log('[mock] petición:', resumen.modelo, 'mensajes=', resumen.mensajes.length, 'beta=', resumen.beta);

  if (texto.includes('ERROR500')) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ type: 'error', error: { type: 'api_error', message: 'fallo simulado' } }));
  }

  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  const ev = (nombre, datos) => res.write(`event: ${nombre}\ndata: ${JSON.stringify(datos)}\n\n`);
  ev('message_start', { type: 'message_start', message: { id: 'msg_mock', type: 'message', role: 'assistant', model: cuerpo.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 2400, output_tokens: 1, cache_creation_input_tokens: 1800, cache_read_input_tokens: 0 } } });

  const refusal = texto.includes('REFUSAL');
  if (!refusal) {
    ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    const linea1 = (resumen.contexto || '').split('\n').find((l) => l.includes('XP')) || '';
    const respuesta = `¡Claro! Esta es una respuesta **simulada** a «${texto.slice(0, 50)}». ${linea1.replace(/^- /, '')}\n- Primer paso de ejemplo\n- Segundo paso de ejemplo\n¿Te guío en el siguiente paso?`;
    const palabras = respuesta.split(/(?<=\s)/);
    for (const w of palabras) { ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: w } }); await espera(texto.includes('LENTO') ? 160 : 25); }
    ev('content_block_stop', { type: 'content_block_stop', index: 0 });
  }
  ev('message_delta', { type: 'message_delta', delta: { stop_reason: refusal ? 'refusal' : 'end_turn', stop_sequence: null, ...(refusal ? { stop_details: { type: 'refusal', category: 'general_harms', explanation: 'simulado' } } : {}) }, usage: { output_tokens: 48 } });
  ev('message_stop', { type: 'message_stop' });
  res.end();
}).listen(PORT, () => console.log(`Simulador de Anthropic en http://localhost:${PORT}`));
