/**
 * Cliente de la IA de EL JEFE: habla con el servidor intermedio (`servidor-jefe`). La clave de la API NUNCA está
 * en la página; solo el servidor la tiene.
 *
 * Protocolo (NDJSON, una línea JSON por evento):
 *   GET  {api}/salud  →  { ia: boolean }
 *   POST {api}        →  {t:'delta', x:'texto…'} … {t:'fin'}   (o {t:'error', m:'motivo'})
 *
 * @module ui/chat/cliente-ia
 */
import { CHAT } from '../../config.js';

/** @typedef {{role: 'user' | 'assistant', content: string}} MensajeChat */

/**
 * ¿Hay un servidor de IA disponible?
 * @param {string} api Ruta base de la API.
 * @returns {Promise<'ia' | 'local'>} 'local' = usar respuestas predefinidas.
 */
export async function sondearIA(api) {
  if (location.protocol === 'file:') return 'local';
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), CHAT.tiempoSondeoMs);
  try {
    const respuesta = await fetch(`${api}/salud`, { signal: control.signal, cache: 'no-store' });
    const datos = respuesta.ok ? await respuesta.json() : { ia: false };
    return datos && datos.ia ? 'ia' : 'local';
  } catch {
    return 'local';
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Hace una pregunta a la IA y entrega el texto a medida que llega.
 * @param {string} api
 * @param {MensajeChat[]} mensajes  Historial, terminando en la pregunta.
 * @param {object} contexto         Resumen numérico del juego (ver `contextoParaIA`).
 * @param {(textoAcumulado: string) => void} alTexto  Se llama con cada fragmento, con TODO el texto hasta ahora.
 * @returns {Promise<{texto: string, error: boolean}>} `error` indica que el servidor avisó de un fallo a mitad.
 * @throws Si no hay conexión, el servidor responde con error o se agota el tiempo.
 */
export async function preguntarIA(api, mensajes, contexto, alTexto) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), CHAT.tiempoLimiteIaMs);
  try {
    const respuesta = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: mensajes, contexto }),
      signal: control.signal,
    });
    if (!respuesta.ok || !respuesta.body) throw new Error(`http ${respuesta.status}`);

    const lector = respuesta.body.getReader();
    const decodificador = new TextDecoder();
    let pendiente = '';
    let texto = '';
    let error = false;
    for (;;) {
      const { value, done } = await lector.read();
      if (value) {
        pendiente += decodificador.decode(value, { stream: true });
        let salto;
        while ((salto = pendiente.indexOf('\n')) > -1) {
          const linea = pendiente.slice(0, salto);
          pendiente = pendiente.slice(salto + 1);
          if (!linea.trim()) continue;
          let evento;
          try { evento = JSON.parse(linea); } catch { continue; }
          if (evento.t === 'delta') { texto += evento.x; alTexto(texto); }
          else if (evento.t === 'error') error = true;
        }
      }
      if (done) return { texto, error };
    }
  } finally {
    clearTimeout(temporizador);
  }
}
