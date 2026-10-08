/**
 * Prueba de regresión visual y de estructura («instantánea»).
 *
 * Recorre el juego con un guion fijo y guarda, de cada pantalla y ventana, el HTML y una firma de los
 * estilos calculados de todos sus elementos. Sirve para comprobar que una refactorización NO cambió nada
 * de lo que ve la persona: se captura una línea base antes y se compara después.
 *
 * Cómo usarla (desde la consola del navegador, con el servidor en modo desarrollo: `npm run dev:web`):
 *
 *   // 1. Partir de un estado limpio
 *   localStorage.clear(); sessionStorage.setItem('ysph-splash', '1'); location.reload();
 *
 *   // 2. Capturar y guardar como línea base (antes de refactorizar)
 *   const m = await import('/__pruebas/e2e/instantanea.js');
 *   localStorage.setItem('__snap_base', JSON.stringify(await m.capturar()));
 *
 *   // 3. Tras refactorizar: repetir el paso 1, capturar y comparar
 *   const base = JSON.parse(localStorage.getItem('__snap_base'));
 *   console.log(m.comparar(base, await m.capturar()));
 *
 * Nota: usa `localStorage.clear()` solo en tu navegador de pruebas; borra el progreso guardado.
 */

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** Propiedades de estilo que forman la «firma» de cada elemento (se omiten las animadas: transform, filter). */
const PROPIEDADES = [
  'display', 'position', 'width', 'height',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'borderRightWidth', 'borderRightColor',
  'borderBottomWidth', 'borderBottomColor', 'borderLeftWidth', 'borderLeftColor',
  'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textTransform',
  'lineHeight', 'textAlign', 'boxShadow', 'gridTemplateColumns', 'flexDirection', 'justifyContent',
  'alignItems', 'gap', 'zIndex', 'overflowX', 'overflowY', 'clipPath', 'visibility', 'cursor', 'borderRadius',
];

/** Quita de la firma lo que cambia solo (tamaños fraccionarios): redondea los números. */
function redondear(valor) {
  return String(valor).replace(/-?\d+\.\d+/g, (n) => String(Math.round(parseFloat(n))));
}

/** Firma de estilos de todos los elementos de un contenedor. @returns {Record<string,string>} */
function firmarEstilos(raiz) {
  const firmas = {};
  let i = -1;
  raiz.querySelectorAll('*').forEach((nodo) => {
    if (nodo.classList.contains('fxp') || nodo.closest('#descarga')) return; // pasajeras / dependiente de la red
    i += 1;
    const cs = getComputedStyle(nodo);
    const clase = typeof nodo.className === 'string' ? nodo.className : '';
    firmas[`${i} ${nodo.tagName.toLowerCase()}.${clase}`] = PROPIEDADES.map((p) => redondear(cs[p])).join('|');
  });
  return firmas;
}

/** HTML estable: sin atributos que dependen del instante o del tamaño de la ventana. */
function htmlEstable(nodo) {
  const copia = /** @type {HTMLElement} */ (nodo.cloneNode(true));
  copia.querySelectorAll('.fxp, #descarga').forEach((p) => p.remove()); // partículas de combate (pasajeras) y la fila de descarga (depende de la red)
  return copia.outerHTML.replace(/\s+/g, ' ');
}

function foto(nombre, nodo, salida) {
  if (!nodo) { salida[nombre] = { html: '(no existe)', estilos: {} }; return; }
  salida[nombre] = { html: htmlEstable(nodo), estilos: firmarEstilos(nodo) };
}

function botonPorTexto(raiz, ...textos) {
  const botones = [...raiz.querySelectorAll('button')];
  for (const t of textos) {
    const b = botones.find((x) => x.textContent.trim().startsWith(t));
    if (b) return b;
  }
  return null;
}

/** Cierra en cadena las ventanas emergentes pendientes, fotografiando cada una. */
async function recorrerVentanas(prefijo, salida) {
  let n = 0;
  while (document.querySelector('.modal') && n < 8) {
    n += 1;
    const ventana = document.querySelector('.modal');
    foto(`${prefijo}-ventana-${n}`, ventana, salida);
    const boton = botonPorTexto(ventana, 'Continuar', 'Empezar', 'Ir al nivel', 'Cerrar') || ventana.querySelector('button');
    boton.click();
    await esperar(160);
  }
}

/** Marca (hace clic en) los primeros `cantidad` hábitos sin marcar de un nivel. */
async function marcarHabitos(nivel, cantidad) {
  for (let i = 0; i < cantidad; i += 1) {
    const casilla = [...document.querySelectorAll(`#z-${nivel} .reto input`)].find((c) => !c.checked);
    if (!casilla) break;
    casilla.click();
    await esperar(60);
  }
}

/** Abre una sección desde el menú hamburguesa, como lo haría una persona. */
async function irA(vista) {
  document.querySelector('#appMenuBtn').click();
  await esperar(80);
  document.querySelector(`#tabs [data-go="${vista}"]`).click();
  await esperar(250);
}

/**
 * Ejecuta el guion completo y devuelve la instantánea.
 * @returns {Promise<Record<string,{html:string,estilos:Record<string,string>}>>}
 */
export async function capturar() {
  const salida = {};
  await document.fonts.ready; // con la tipografía sin cargar, los textos miden distinto
  await esperar(800);         // deja que terminen las animaciones de entrada

  // Los acordeones se abren: el contenido de un <details> cerrado no se mide de forma estable.
  document.querySelectorAll('#mas details').forEach((d) => { d.open = true; });
  await esperar(300);
  foto('portada', document.querySelector('#home'), salida);

  // Entrar con un nickname
  document.querySelector('.cta-top [data-go="retos"]').click();
  await esperar(150);
  foto('ventana-nickname', document.querySelector('.modal'), salida);
  const form = document.querySelector('.modal form');
  form.querySelector('#nkIn').value = 'Prueba';
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  await esperar(300);
  foto('retos-inicial', document.querySelector('#v-retos'), salida);

  // Nivel Agua: 3 hábitos (parcial) y luego la jugada completa (capítulo + nueva jugada)
  await marcarHabitos('agua', 3);
  await esperar(2300); // deja terminar la animación de combate y los parpadeos
  foto('retos-parcial', document.querySelector('#v-retos'), salida);
  await marcarHabitos('agua', 3);
  await esperar(2500); // combate + espera antes de las ventanas
  await recorrerVentanas('agua', salida);
  foto('retos-tras-jugada', document.querySelector('#v-retos'), salida);

  // Nivel Energía parcial y mochila
  await marcarHabitos('energia', 2);
  await esperar(2300); // deja terminar la animación de combate y los parpadeos
  await irA('mochila');
  [...document.querySelectorAll('#kitList input')].slice(0, 5).forEach((c) => c.click());
  document.querySelector('#famPlus').click();
  await esperar(150);
  foto('mochila', document.querySelector('#v-mochila'), salida);

  // Familia: inscribir a dos integrantes
  await irA('familia');
  for (const apodo of ['Juan', 'Sofi']) {
    const campo = document.querySelector('#famAdd');
    campo.value = apodo;
    campo.closest('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await esperar(80);
  }
  await esperar(1500); // el aviso (toast) desaparece
  foto('familia', document.querySelector('#v-familia'), salida);

  await irA('agentes');
  foto('agentes', document.querySelector('#v-agentes'), salida);
  await irA('ranking');
  foto('ranking', document.querySelector('#v-ranking'), salida);

  // Menú abierto
  document.querySelector('#appMenuBtn').click();
  await esperar(300);
  foto('menu', document.querySelector('#tabs'), salida);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await esperar(80);

  // Chat (modo local: el servidor de pruebas no tiene clave)
  document.querySelector('.jefe-btn').click();
  await esperar(900);
  const entrada = document.querySelector('.jefe-form input');
  entrada.value = '¿Cómo voy?';
  document.querySelector('.jefe-form').dispatchEvent(new Event('submit', { cancelable: true }));
  await esperar(1200);
  foto('chat', document.querySelector('.jefe'), salida);
  document.querySelector('.jefe-x:not(.jefe-rs)').click();
  await esperar(100);

  salida.__meta = { ancho: innerWidth, alto: innerHeight };
  return salida;
}

/**
 * Compara dos instantáneas.
 * @returns {{iguales:boolean, resumen:string[], diferencias:string[]}}
 */
export function comparar(base, nueva) {
  const diferencias = [];
  const resumen = [];
  const nombres = new Set([...Object.keys(base), ...Object.keys(nueva)]);
  nombres.delete('__meta');
  for (const nombre of nombres) {
    const a = base[nombre]; const b = nueva[nombre];
    if (!a || !b) { diferencias.push(`${nombre}: falta en ${a ? 'la nueva' : 'la base'}`); continue; }
    let malo = 0;
    if (a.html !== b.html) {
      let i = 0; while (i < a.html.length && a.html[i] === b.html[i]) i += 1;
      diferencias.push(`[HTML] ${nombre} difiere en el carácter ${i}:\n   base:  …${a.html.slice(Math.max(0, i - 40), i + 80)}\n   nueva: …${b.html.slice(Math.max(0, i - 40), i + 80)}`);
      malo += 1;
    }
    const claves = new Set([...Object.keys(a.estilos), ...Object.keys(b.estilos)]);
    let estilosMalos = 0;
    for (const k of claves) {
      if (a.estilos[k] !== b.estilos[k]) {
        estilosMalos += 1;
        if (estilosMalos <= 3) {
          const va = (a.estilos[k] || '').split('|'); const vb = (b.estilos[k] || '').split('|');
          const dif = PROPIEDADES.map((p, i) => (va[i] !== vb[i] ? `${p}: ${va[i]} → ${vb[i]}` : null)).filter(Boolean).slice(0, 4);
          diferencias.push(`[ESTILO] ${nombre} · ${k}: ${dif.join('; ') || 'elemento distinto'}`);
        }
      }
    }
    if (estilosMalos > 3) diferencias.push(`[ESTILO] ${nombre}: ${estilosMalos - 3} elementos más con estilos distintos`);
    malo += estilosMalos;
    resumen.push(`${malo ? 'DIFERENTE' : 'igual    '}  ${nombre}  (${Object.keys(b.estilos).length} elementos)`);
  }
  return { iguales: diferencias.length === 0, resumen, diferencias: diferencias.slice(0, 40) };
}
