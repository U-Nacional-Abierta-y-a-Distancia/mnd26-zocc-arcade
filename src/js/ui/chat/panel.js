/**
 * Chat de EL JEFE: personaje flotante (arrastrable) y panel de conversación.
 *
 * Dos modos, que se eligen solos:
 *  - «ia»:    hay un servidor de IA → la respuesta llega en vivo (streaming).
 *  - «local»: no lo hay → respuestas predefinidas (`dominio/chat.js`).
 *
 * Seguridad: si el mensaje describe un peligro inmediato (gas, fuego, sismo…), SIEMPRE se responde al instante
 * con el protocolo local, sin esperar a la IA.
 *
 * @module ui/chat/panel
 */
import { CHAT, CLAVES } from '../../config.js';
import { RETRATO_JEFE } from '../../datos/ilustraciones.js';
import {
  contextoParaIA, esUrgente, responderLocal, respuestaUrgente,
} from '../../dominio/chat.js';
import { apodoActivo, S } from '../../estado/almacen.js';
import { $, $$, el, reducirMovimiento } from '../../util/dom.js';
import { formatoLigero } from '../../util/texto.js';
import { hacerArrastrable } from './arrastre.js';
import { preguntarIA, sondearIA } from './cliente-ia.js';

/** @typedef {import('./cliente-ia.js').MensajeChat} MensajeChat */

/** Ruta de la API: configurable con `<meta name="jefe-api" content="…">` (por si el servidor está en otro dominio). */
const rutaApi = () => ($('meta[name="jefe-api"]')?.getAttribute('content')) || CHAT.rutaApi;

/** Modo actual, o null si aún no se comprobó. @type {'ia' | 'local' | null} */
let modo = null;
/** Historial de la conversación (se conserva mientras dure la pestaña). @type {MensajeChat[]} */
let historial = [];
let ocupado = false;
let iniciado = false;

try {
  const guardado = JSON.parse(sessionStorage.getItem(CLAVES.chatHistorial) || '[]');
  if (Array.isArray(guardado)) historial = guardado;
} catch { /* sin historial */ }

function guardarHistorial() {
  try { sessionStorage.setItem(CLAVES.chatHistorial, JSON.stringify(historial.slice(-CHAT.maxMensajes))); } catch { /* ignorar */ }
}

/** Crea el personaje flotante, el panel y sus eventos. Se llama una vez al arrancar. */
export function iniciarChat() {
  /* ---------------------------------------------------------- elementos */
  const personaje = /** @type {HTMLButtonElement} */ (el('button', 'jefe-btn'));
  personaje.type = 'button';
  personaje.setAttribute('aria-expanded', 'false');
  personaje.setAttribute('aria-controls', 'jefePanel');
  personaje.setAttribute('aria-label', 'Abrir el chat con EL JEFE. Se puede arrastrar para moverlo');
  personaje.title = 'Toca para chatear · arrástrame para moverme';
  personaje.innerHTML = `<span class="jb-char"><img src="${RETRATO_JEFE}" alt="" width="600" height="760" draggable="false"></span><span class="jb-name">EL JEFE</span>`;

  const panel = el('section', 'jefe');
  panel.id = 'jefePanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat con EL JEFE');
  panel.hidden = true;

  const cabecera = el('header', 'jefe-head', `<span class="jefe-av"><img src="${RETRATO_JEFE}" alt="" width="600" height="760"></span><div><b>EL JEFE</b><small class="jefe-sub">Chat de apoyo</small></div>`);
  const reiniciar = /** @type {HTMLButtonElement} */ (el('button', 'jefe-x jefe-rs', '↺'));
  reiniciar.type = 'button';
  reiniciar.setAttribute('aria-label', 'Nueva conversación');
  reiniciar.title = 'Nueva conversación';
  const cerrar = /** @type {HTMLButtonElement} */ (el('button', 'jefe-x', '×'));
  cerrar.type = 'button';
  cerrar.setAttribute('aria-label', 'Cerrar el chat');
  cabecera.append(reiniciar, cerrar);

  const registro = el('div', 'jefe-log');
  registro.setAttribute('role', 'log');
  registro.setAttribute('aria-live', 'polite');

  const sugerencias = el('div', 'jefe-chips');
  ['¿Cuál es mi siguiente reto?', '¿Estoy listo para el fuego?', '¿Cómo voy?', 'Huelo gas, ¿qué hago?'].forEach((pregunta) => {
    const chip = /** @type {HTMLButtonElement} */ (el('button', 'jefe-chip', pregunta));
    chip.type = 'button';
    chip.onclick = () => preguntar(pregunta);
    sugerencias.appendChild(chip);
  });

  const formulario = el('form', 'jefe-form');
  const entrada = /** @type {HTMLInputElement} */ (el('input'));
  entrada.type = 'text';
  entrada.placeholder = 'Escribe tu pregunta';
  entrada.setAttribute('aria-label', 'Tu pregunta para EL JEFE');
  entrada.autocomplete = 'off';
  entrada.maxLength = CHAT.maxCaracteres;
  const enviar = /** @type {HTMLButtonElement} */ (el('button', 'btn sm', 'Enviar'));
  enviar.type = 'submit';
  formulario.append(entrada, enviar);

  const pie = el('p', 'jefe-foot', '');
  panel.append(cabecera, registro, sugerencias, formulario, pie);
  document.body.append(personaje, panel);

  /* ---------------------------------------------------------- conversación */
  /** Subtítulo y aviso al pie según el modo. */
  function rotular() {
    $('.jefe-sub', panel).textContent = modo === 'ia' ? 'Asistente con IA · respuestas en vivo' : 'Chat de apoyo · respuestas predefinidas';
    pie.innerHTML = `En una emergencia real no uses el chat: llama al <b>123</b>.${modo === 'ia' ? ' Tus preguntas se envían a un servicio de IA: no escribas datos personales.' : ''}`;
  }
  rotular();

  /** Añade un mensaje al registro. @param {'me' | 'bot'} quien @param {string} texto */
  function agregar(quien, texto) {
    const burbuja = el('div', `jm ${quien}`);
    if (quien === 'bot') burbuja.innerHTML = formatoLigero(texto); else burbuja.textContent = texto;
    registro.appendChild(burbuja);
    registro.scrollTop = registro.scrollHeight;
    return burbuja;
  }

  /** Indicador «escribiendo…». */
  function escribiendo() {
    const puntos = el('div', 'jm bot typing', '<i></i><i></i><i></i>');
    puntos.setAttribute('aria-label', 'EL JEFE está escribiendo');
    registro.appendChild(puntos);
    registro.scrollTop = registro.scrollHeight;
    return puntos;
  }

  function marcarOcupado(valor) {
    ocupado = valor;
    entrada.disabled = valor;
    enviar.disabled = valor;
    $$('.jefe-chip', sugerencias).forEach((chip) => { /** @type {HTMLButtonElement} */ (chip).disabled = valor; });
    registro.setAttribute('aria-busy', String(valor));
  }

  function saludar() {
    agregar('bot', `Hola, ${apodoActivo()}. Soy EL JEFE. ${modo === 'ia'
      ? 'Pregúntame lo que quieras sobre el juego, tus retos o cómo prepararte. '
      : 'Pregúntame por tu siguiente reto, tu progreso o cómo prepararte. '}Si hay una emergencia ahora, llama al 123.`);
  }

  /** Comprueba (una vez, o de nuevo si no había IA) qué modo usar. */
  async function averiguarModo() {
    if (modo === 'ia') return modo;
    modo = await sondearIA(rutaApi());
    rotular();
    return modo;
  }

  /** Atiende una pregunta de la persona. @param {string} texto */
  async function preguntar(texto) {
    const pregunta = String(texto).trim().slice(0, CHAT.maxCaracteres);
    if (!pregunta || ocupado) return;
    agregar('me', pregunta);

    if (esUrgente(pregunta)) { agregar('bot', respuestaUrgente(pregunta)); return; } // protocolo local, sin IA

    marcarOcupado(true);
    const puntos = escribiendo();
    let burbujaIA = null;

    /** Respuesta predefinida (modo local, o la IA falló). @param {boolean} avisarFallo */
    const responderEnLocal = (avisarFallo) => {
      setTimeout(() => {
        puntos.remove();
        if (burbujaIA) { burbujaIA.remove(); burbujaIA = null; }
        agregar('bot', responderLocal(pregunta, S) + (avisarFallo ? '\n\n(Respuesta predefinida: no pude conectar con la IA.)' : ''));
        marcarOcupado(false);
        entrada.focus();
      }, reducirMovimiento ? 0 : CHAT.esperaLocalMs);
    };

    if ((await averiguarModo()) !== 'ia') { responderEnLocal(false); return; }

    historial.push({ role: 'user', content: pregunta });
    historial = historial.slice(-CHAT.maxMensajes);
    try {
      const { texto: respuesta, error } = await preguntarIA(rutaApi(), historial, contextoParaIA(S), (acumulado) => {
        if (!burbujaIA) { puntos.remove(); burbujaIA = el('div', 'jm bot'); registro.appendChild(burbujaIA); }
        burbujaIA.innerHTML = formatoLigero(acumulado);
        registro.scrollTop = registro.scrollHeight;
      });
      if (!respuesta) { historial.pop(); guardarHistorial(); responderEnLocal(true); return; }
      if (error) burbujaIA.innerHTML = formatoLigero(`${respuesta}\n\n(La respuesta se interrumpió.)`);
      historial.push({ role: 'assistant', content: respuesta });
      guardarHistorial();
      marcarOcupado(false);
      entrada.focus();
    } catch {
      historial.pop(); // la pregunta sin respuesta no debe quedar en el historial
      guardarHistorial();
      responderEnLocal(true);
    }
  }

  /* ---------------------------------------------------------- abrir y cerrar */
  function abrirCerrar(abierto) {
    panel.hidden = !abierto;
    document.body.classList.toggle('jefe-open', abierto);
    personaje.setAttribute('aria-expanded', String(abierto));
    if (abierto) {
      if (!iniciado) {
        iniciado = true;
        if (historial.length) historial.forEach((m) => agregar(m.role === 'user' ? 'me' : 'bot', m.content)); // recupera la conversación
        else saludar();
      }
      averiguarModo().then(rotular);
      entrada.focus();
    } else {
      personaje.focus();
    }
  }

  const arrastre = hacerArrastrable(personaje, { clave: CLAVES.chatPosicion });
  personaje.onclick = () => { if (arrastre.fueArrastre()) return; abrirCerrar(panel.hidden); };
  cerrar.onclick = () => abrirCerrar(false);
  reiniciar.onclick = () => {
    if (ocupado) return;
    historial = [];
    guardarHistorial();
    registro.innerHTML = '';
    saludar();
    entrada.focus();
  };
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); abrirCerrar(false); } });
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = entrada.value;
    entrada.value = '';
    preguntar(valor);
  });
}
