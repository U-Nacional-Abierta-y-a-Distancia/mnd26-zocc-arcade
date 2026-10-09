/**
 * Audios incrustados en `nido.html`: el juego en un solo archivo lleva su música y su narración dentro, para sonar aunque
 * el archivo se envíe solo. Cada audio es un `<script type="text/plain" data-audio="musica/portada.mp3">` con su contenido en
 * base64 (así el navegador no lo interpreta como código). Con servidor no hay ninguno y se usan los archivos de `assets/audio/`.
 *
 * @module util/audio-incrustado
 */

const TIPOS = { mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav' };

/** Direcciones ya creadas: cada audio se decodifica una sola vez. @type {Map<string, string | null>} */
const direcciones = new Map();

/**
 * Dirección (blob:) de un audio incrustado, o null si la página no lo trae.
 * @param {string} ruta  Relativa a `assets/audio/`, p. ej. `musica/portada.mp3` o `narrador/narrador-01-pregunta.ogg`.
 * @returns {string | null}
 */
export function audioIncrustado(ruta) {
  if (direcciones.has(ruta)) return direcciones.get(ruta) ?? null;
  let direccion = null;
  try {
    const nodo = document.querySelector(`script[data-audio="${ruta}"]`);
    if (nodo && nodo.textContent) {
      const binario = atob(nodo.textContent.trim());
      const bytes = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
      const extension = ruta.slice(ruta.lastIndexOf('.') + 1);
      direccion = URL.createObjectURL(new Blob([bytes], { type: TIPOS[extension] ?? 'audio/mpeg' }));
    }
  } catch { /* si algo falla se usan los archivos sueltos */ }
  direcciones.set(ruta, direccion);
  return direccion;
}
