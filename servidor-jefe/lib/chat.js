/**
 * El chat de EL JEFE: recibe la conversación de la página, la valida, la envía a Claude y devuelve la respuesta
 * en streaming (NDJSON, una línea JSON por evento):
 *
 *   {"t":"delta","x":"texto…"}   trozo de la respuesta (puede haber muchos)
 *   {"t":"fin"}                  terminó bien
 *   {"t":"error","m":"motivo"}   falló a mitad: clave | limite_ia | peticion | conexion | servicio
 *
 * Errores antes de empezar el streaming (JSON normal): 503 sin_clave, 429 limite, 400 cuerpo|mensajes.
 * @module lib/chat
 */
import Anthropic from '@anthropic-ai/sdk';
import { responderJson } from './http.js';
import { leerCuerpo, limpiarMensajes, textoContexto } from './validacion.js';

/** Texto que se muestra si un clasificador de seguridad rechaza la respuesta (nunca dejar la burbuja en blanco). */
export const SIN_RESPUESTA = 'No puedo ayudarte con eso por este medio. Si estás en peligro, ponte a salvo y llama al 123.';

/**
 * Traduce un error de la API a un motivo corto que entiende la página.
 * @param {unknown} e
 * @returns {'clave'|'limite_ia'|'peticion'|'conexion'|'servicio'}
 */
export function motivoDeError(e) {
  if (e instanceof Anthropic.AuthenticationError) return 'clave';
  if (e instanceof Anthropic.RateLimitError) return 'limite_ia';
  if (e instanceof Anthropic.BadRequestError) return 'peticion';
  if (e instanceof Anthropic.APIConnectionError) return 'conexion';
  return 'servicio';
}

/**
 * Arma la petición a Claude. El ORDEN importa para la caché de prompts: primero lo fijo (instrucciones, con
 * `cache_control`), después lo que cambia en cada petición (estado del jugador).
 * @param {import('./config.js').Config} config
 * @param {string} prompt     Instrucciones fijas (`prompt-jefe.md`).
 * @param {{role:string, content:string}[]} mensajes
 * @param {unknown} contexto  Resumen numérico del juego enviado por la página.
 */
export function armarPeticion(config, prompt, mensajes, contexto) {
  return {
    model: config.modelo,
    max_tokens: config.maxTokens,
    system: [
      { type: 'text', text: prompt, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: textoContexto(contexto) },
    ],
    messages: mensajes,
    output_config: { effort: config.esfuerzo },
    ...(config.reintentoSeguridad ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
  };
}

/**
 * @param {Object} deps
 * @param {import('./config.js').Config} deps.config
 * @param {string} deps.prompt                      Instrucciones fijas.
 * @param {() => {beta: {messages: {stream: Function}}}} deps.cliente  Cliente de la API (perezoso; en pruebas, uno falso).
 * @param {() => boolean} deps.hayClave
 * @param {(ip: string) => boolean} deps.permitido  Límite de uso.
 * @param {{log: Function, error: Function}} [deps.registro]  Por defecto, la consola. Nunca se registra el contenido de las conversaciones.
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, ip: string) => Promise<void>}
 */
export function crearManejadorChat({ config, prompt, cliente, hayClave, permitido, registro = console }) {
  return async function chat(req, res, ip) {
    if (!hayClave()) return responderJson(res, 503, { error: 'sin_clave' });
    if (!permitido(ip)) return responderJson(res, 429, { error: 'limite' });

    let datos;
    try { datos = JSON.parse(await leerCuerpo(req)); } catch (e) {
      if (e?.message === 'grande') { // se corta la conexión después de responder, para no seguir recibiendo
        res.setHeader('Connection', 'close');
        res.on('finish', () => req.destroy());
        return responderJson(res, 413, { error: 'cuerpo' });
      }
      return responderJson(res, 400, { error: 'cuerpo' });
    }
    const mensajes = limpiarMensajes(datos?.messages);
    if (!mensajes) return responderJson(res, 400, { error: 'mensajes' });

    res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
    const enviar = (evento) => res.write(JSON.stringify(evento) + '\n');
    const inicio = Date.now();

    try {
      const flujo = cliente().beta.messages.stream(armarPeticion(config, prompt, mensajes, datos?.contexto));
      res.on('close', () => { if (!res.writableEnded) flujo.abort(); }); // la persona cerró el chat o la pestaña

      for await (const ev of flujo) {
        if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') enviar({ t: 'delta', x: ev.delta.text });
      }
      const final = await flujo.finalMessage();
      if (final.stop_reason === 'refusal') enviar({ t: 'delta', x: SIN_RESPUESTA });
      const u = final.usage || {};
      registro.log(`[jefe] ${config.modelo} ${Date.now() - inicio}ms entrada=${u.input_tokens} salida=${u.output_tokens} caché_leída=${u.cache_read_input_tokens ?? 0} caché_escrita=${u.cache_creation_input_tokens ?? 0} motivo=${final.stop_reason}`);
      enviar({ t: 'fin' });
    } catch (e) {
      if (e instanceof Anthropic.APIUserAbortError) { if (!res.writableEnded) res.end(); return; } // cerró el chat: no es un fallo
      const motivo = motivoDeError(e);
      registro.error(`[jefe] error (${motivo}): ${e?.status ?? ''} ${e?.message ?? e}`.slice(0, 300));
      if (!res.writableEnded) enviar({ t: 'error', m: motivo });
    } finally {
      if (!res.writableEnded) res.end();
    }
  };
}
