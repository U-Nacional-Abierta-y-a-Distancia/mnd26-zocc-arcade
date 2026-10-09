/**
 * Catálogo de sonidos del juego. Cada sonido está descrito en este archivo (qué parte del juego lo usa, cuándo suena y
 * cómo se construye) y de aquí salen DOS cosas:
 *
 *  1. El juego los sintetiza al momento con Web Audio (`ui/sonido.js`): no depende de archivos.
 *  2. Los archivos de audio etiquetados de `assets/audio/*.wav` (`npm run audio` → `herramientas/generar-audio.js`),
 *     con su catálogo (`assets/audio/LEEME.md` y `catalogo.json`), para escucharlos, editarlos o sustituirlos por
 *     grabaciones propias.
 *
 * Cada sonido se compone de «capas» que suenan a la vez o escalonadas:
 *  - `tono`:  una nota o barrido de un oscilador (`tipo`: sine, triangle, sawtooth, square; `f0` → `f1` en Hz).
 *  - `soplo`: ruido filtrado (`tipo`: bandpass, highpass, lowpass; `f0` → `f1` frecuencia del filtro; `q`).
 *  Común: `t` (inicio, s), `dur` (s), `vol` (0-1), `ataque` (s).
 *
 * Para cambiar un sonido, edita sus capas aquí y ejecuta `npm run audio` para regenerar los archivos.
 *
 * @module datos/sonidos
 */

/**
 * @typedef {{k: 'tono', tipo?: string, f0: number, f1?: number, t?: number, dur?: number, vol?: number, ataque?: number}
 *         | {k: 'soplo', tipo?: string, f0: number, f1?: number, q?: number, t?: number, dur?: number, vol?: number, ataque?: number}} Capa
 */

/**
 * @typedef {Object} Sonido
 * @property {string}  id           Nombre con el que lo pide el código: `sonar('bien')`.
 * @property {string}  archivo      Nombre del archivo de audio (en `assets/audio/`).
 * @property {string}  parte        Parte del juego a la que pertenece.
 * @property {string}  momento      Cuándo suena.
 * @property {string}  descripcion  Cómo suena.
 * @property {Capa[]}  capas
 */

const tono = (f0, f1, dur, vol, extra = {}) => ({ k: /** @type {const} */ ('tono'), tipo: 'sine', f0, f1, dur, vol, ...extra });
const soplo = (f0, f1, dur, vol, extra = {}) => ({ k: /** @type {const} */ ('soplo'), tipo: 'bandpass', f0, f1, q: 1, dur, vol, ...extra });

/** Notas de un arpegio, una tras otra. @returns {Capa[]} */
const arpegio = (notas, tipo, paso, vol, t0 = 0) => notas.map((f, i) => tono(f, f, i === notas.length - 1 ? 0.45 : 0.16, vol, { tipo, t: t0 + i * paso }));

/** @type {Sonido[]} */
export const SONIDOS = [
  // ------------------------------------------------------------------ Retos: marcar
  {
    id: 'bien', archivo: '01-retos-marcar-habito-bueno.wav', parte: 'Retos · marcar', momento: 'Al marcar un hábito bueno',
    descripcion: 'Campanita corta que sube de tono: «bien hecho».',
    capas: [tono(660, 990, 0.12, 0.28), tono(1320, 1320, 0.14, 0.14, { t: 0.07 })],
  },
  {
    id: 'quitar', archivo: '02-retos-desmarcar.wav', parte: 'Retos · marcar', momento: 'Al desmarcar un hábito o un descuido',
    descripcion: 'Toque suave que baja un poco: deshacer.',
    capas: [tono(440, 320, 0.09, 0.16, { tipo: 'triangle' })],
  },
  {
    id: 'mal', archivo: '03-retos-reconocer-descuido.wav', parte: 'Retos · marcar', momento: 'Al reconocer un descuido («Lo hice hoy»)',
    descripcion: 'Golpe grave y áspero: el enemigo se fortalece.',
    capas: [tono(170, 70, 0.26, 0.2, { tipo: 'sawtooth' }), soplo(320, 320, 0.2, 0.12, { tipo: 'lowpass' })],
  },

  // ------------------------------------------------------------------ Combate: la señal de cada salvador
  {
    id: 'senal-gotas', archivo: '04-combate-senal-agua-gotas.wav', parte: 'Combate · señal del salvador', momento: 'Nivel Agua: el salvador lanza su señal',
    descripcion: 'Seis gotitas burbujeantes que suben de tono.',
    capas: [560, 700, 610, 780, 650, 820].map((f, i) => tono(f, f * 1.7, 0.09, 0.14, { t: i * 0.055 })),
  },
  {
    id: 'senal-rayo', archivo: '05-combate-senal-energia-rayo.wav', parte: 'Combate · señal del salvador', momento: 'Nivel Energía: el salvador lanza su señal',
    descripcion: 'Descarga eléctrica con chasquidos.',
    capas: [
      soplo(1500, 4200, 0.3, 0.22, { tipo: 'highpass' }),
      tono(1900, 180, 0.26, 0.12, { tipo: 'sawtooth' }),
      ...[0, 1, 2, 3].map((i) => soplo(2500 + i * 400, 2500 + i * 400, 0.04, 0.2, { q: 4, t: 0.05 + i * 0.06 })),
    ],
  },
  {
    id: 'senal-bruma', archivo: '06-combate-senal-calor-bruma.wav', parte: 'Combate · señal del salvador', momento: 'Nivel Calor: el salvador lanza su señal',
    descripcion: 'Soplo fresco que se expande, como una bruma.',
    capas: [soplo(400, 1900, 0.6, 0.2, { q: 0.8, ataque: 0.14 })],
  },
  {
    id: 'senal-espuma', archivo: '07-combate-senal-fuego-espuma.wav', parte: 'Combate · señal del salvador', momento: 'Nivel Fuego: el salvador lanza su señal',
    descripcion: 'Tres siseos de espuma de extintor.',
    capas: [0, 1, 2].map((i) => soplo(2600, 2600, 0.22, 0.16, { tipo: 'highpass', t: i * 0.1 })),
  },
  {
    id: 'senal-ondas', archivo: '08-combate-senal-sismo-ondas.wav', parte: 'Combate · señal del salvador', momento: 'Nivel Sismo: el salvador lanza su señal',
    descripcion: 'Retumbo grave de ondas de choque.',
    capas: [tono(75, 38, 0.65, 0.34), tono(110, 52, 0.5, 0.18, { tipo: 'triangle', t: 0.12 })],
  },

  // ------------------------------------------------------------------ Combate: impactos y caídas
  {
    id: 'impacto', archivo: '09-combate-impacto-en-enemigo.wav', parte: 'Combate · impactos y caídas', momento: 'La señal del salvador golpea al enemigo',
    descripcion: 'Golpe seco con un destello de ruido.',
    capas: [tono(190, 60, 0.18, 0.34), soplo(900, 900, 0.08, 0.22, { q: 1.5 })],
  },
  {
    id: 'enemigo-cae', archivo: '10-combate-enemigo-derrotado.wav', parte: 'Combate · impactos y caídas', momento: 'El enemigo cae (tercer hábito bueno)',
    descripcion: 'Desintegración que baja de tono y termina en tres notas brillantes.',
    capas: [
      tono(520, 55, 0.55, 0.18, { tipo: 'sawtooth' }),
      soplo(3200, 700, 0.5, 0.14, { tipo: 'highpass' }),
      ...arpegio([880, 1175, 1568], 'sine', 0.09, 0.12, 0.38),
    ],
  },
  {
    id: 'rafaga', archivo: '11-combate-ataque-del-enemigo.wav', parte: 'Combate · impactos y caídas', momento: 'El enemigo lanza su ráfaga de brasas (descuido)',
    descripcion: 'Crepitar de brasas con un zumbido que sube.',
    capas: [
      ...[1100, 1500, 950, 1700, 1250, 1400].map((f, i) => soplo(f, f, 0.05, 0.2, { q: 3, t: i * 0.05 })),
      tono(110, 190, 0.3, 0.1, { tipo: 'sawtooth' }),
    ],
  },
  {
    id: 'golpe', archivo: '12-combate-golpe-en-salvador.wav', parte: 'Combate · impactos y caídas', momento: 'La ráfaga golpea al salvador',
    descripcion: 'Golpe sordo y metálico.',
    capas: [tono(210, 70, 0.17, 0.2, { tipo: 'square' }), soplo(650, 650, 0.1, 0.2, { tipo: 'lowpass' })],
  },
  {
    id: 'salvador-cae', archivo: '13-combate-salvador-cae.wav', parte: 'Combate · impactos y caídas', momento: 'El salvador cae (tercer descuido)',
    descripcion: 'Tono largo que se apaga hacia lo grave.',
    capas: [tono(440, 70, 0.75, 0.24, { tipo: 'triangle' })],
  },

  // ------------------------------------------------------------------ Resultados
  {
    id: 'victoria', archivo: '14-resultado-victoria.wav', parte: 'Resultados de la jugada', momento: 'Se abre «¡Jugada completada!»',
    descripcion: 'Arpegio ascendente de cuatro notas.',
    capas: arpegio([523, 659, 784, 1047], 'triangle', 0.1, 0.22),
  },
  {
    id: 'insignia', archivo: '15-resultado-insignia-nueva.wav', parte: 'Resultados de la jugada', momento: 'Se abre «¡Jugada completada!» con una insignia nueva',
    descripcion: 'El arpegio de la victoria más un destello agudo final.',
    capas: [...arpegio([523, 659, 784, 1047], 'triangle', 0.1, 0.22), ...arpegio([1319, 1568, 2093], 'sine', 0.08, 0.12, 0.5)],
  },
  {
    id: 'derrota', archivo: '16-resultado-derrota.wav', parte: 'Resultados de la jugada', momento: 'Se abre «¡Tu salvador cayó!»',
    descripcion: 'Tres notas que descienden, serias pero no dramáticas.',
    capas: [tono(392, 392, 0.24, 0.2, { tipo: 'triangle' }), tono(330, 330, 0.24, 0.2, { tipo: 'triangle', t: 0.24 }), tono(262, 262, 0.5, 0.2, { tipo: 'triangle', t: 0.48 })],
  },

  // ------------------------------------------------------------------ Narrativa de EL JEFE
  {
    id: 'panel', archivo: '17-narrativa-abre-el-panel.wav', parte: 'Narrativa de EL JEFE', momento: 'Se abre el panel «¿Tu familia está lista?»',
    descripcion: 'Barrido ascendente tipo «encendido» de un visor.',
    capas: [tono(200, 900, 0.35, 0.1), soplo(300, 2400, 0.35, 0.1)],
  },
  {
    id: 'escena', archivo: '18-narrativa-cambio-de-escena.wav', parte: 'Narrativa de EL JEFE', momento: 'Al pasar de una escena a otra',
    descripcion: 'Dos notitas rápidas: «clic» de interfaz.',
    capas: [tono(740, 740, 0.07, 0.1), tono(988, 988, 0.09, 0.1, { t: 0.07 })],
  },
];

/** Los sonidos por id, para buscarlos rápido. @type {Record<string, Sonido>} */
export const SONIDO_POR_ID = Object.fromEntries(SONIDOS.map((s) => [s.id, s]));

/** Duración de un sonido en segundos (hasta que termina su última capa). @param {Sonido} sonido @returns {number} */
export const duracionDe = (sonido) => Math.max(...sonido.capas.map((c) => (c.t ?? 0) + (c.dur ?? 0.15)));
