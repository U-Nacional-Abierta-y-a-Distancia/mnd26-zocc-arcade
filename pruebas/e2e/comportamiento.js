/**
 * Prueba de comportamiento (humo) del juego en el navegador.
 *
 * Comprueba lo que la instantánea (`instantanea.js`) no ve: interacciones y flujos.
 * Se ejecuta DENTRO de la página, con el servidor en modo desarrollo (`npm run dev:web`).
 *
 *   localStorage.clear(); sessionStorage.clear(); location.reload();   // estado limpio (con la presentación visible)
 *   const m = await import('/__pruebas/e2e/comportamiento.js');
 *   console.table(await m.ejecutar());                                  // chat en modo local
 *
 * Para probar también el chat con IA (streaming) hay que levantar el simulador de la API y un servidor con «clave»:
 *   npm run dev:simulador            (terminal 1: simula la API de Anthropic en :8199)
 *   npm run dev:web:ia               (terminal 2: servidor en :3100 que usa el simulador)
 * y abrir http://localhost:3100 y ejecutar `m.ejecutar({ conIA: true })`.
 *
 * @module pruebas/e2e/comportamiento
 */

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const visible = (e) => !!e && getComputedStyle(e).display !== 'none' && !e.hidden;

/** Registra un resultado. */
function crearRegistro() {
  const filas = [];
  return {
    filas,
    ok: (prueba, condicion, detalle = '') => filas.push({ prueba, resultado: condicion ? 'OK' : 'FALLA', detalle: String(detalle).slice(0, 140) }),
  };
}

async function esperarLibre(maxMs = 8000) {
  const t0 = performance.now();
  while ($('.jefe-log')?.getAttribute('aria-busy') === 'true' && performance.now() - t0 < maxMs) await esperar(100);
}

function preguntarAlJefe(texto) {
  const campo = $('.jefe-form input');
  campo.value = texto;
  $('.jefe-form').dispatchEvent(new Event('submit', { cancelable: true }));
}
const ultimoDelBot = () => [...$$('.jm.bot:not(.typing)')].pop();

/** Ejecuta todas las pruebas y devuelve la tabla de resultados. */
export async function ejecutar({ conIA = false } = {}) {
  const { ok, filas } = crearRegistro();

  /* ---------- 1. Presentación inicial ---------- */
  const hayPresentacion = !!$('#splash');
  if (hayPresentacion) {
    ok('Presentación: se muestra la escena 1 con el logo y la barra', visible($('#sp1')) && !!$('#sp1 .sp-logo'));
    $('.splash-skip').click();
    await esperar(800);
    ok('Presentación: «Saltar» la quita y recuerda que ya se vio', !$('#splash') && sessionStorage.getItem('ysph-splash') === '1');
  } else {
    ok('Presentación: omitida (ya vista en esta sesión)', true);
  }

  /* ---------- 2. Entrar, nickname y persistencia ---------- */
  $('.cta-top [data-go="retos"]').click();
  await esperar(150);
  ok('Nickname: se pide al entrar por primera vez', !!$('.modal #nkIn'));
  const formulario = $('.modal form');
  const probarApodo = async (valor) => {
    $('#nkIn').value = valor;
    formulario.dispatchEvent(new Event('submit', { cancelable: true }));
    await esperar(50);
    return $('.nk-err')?.textContent || '';
  };
  ok('Nickname: rechaza espacios', (await probarApodo('a b')).includes('sin espacios'));
  ok('Nickname: rechaza uno demasiado corto', (await probarApodo('x')).includes('2 a 16'));
  await probarApodo('Mama');
  await esperar(300);
  ok('Nickname: «Mama» entra al juego y se ve Retos', !$('#v-retos').hidden && !$('.modal'));
  const guardado = JSON.parse(localStorage.getItem('ysph-v2') || 'null');
  ok('Almacenamiento: forma estable {famName, active, members}', guardado && guardado.active === 'Mama' && guardado.members?.Mama && 'famName' in guardado, JSON.stringify(Object.keys(guardado || {})));

  /* ---------- 3. Marcar hábitos y completar una jugada ---------- */
  const casillas = () => $$('#z-agua .reto input');
  casillas()[0].click();
  await esperar(120);
  ok('Retos: marcar un hábito baja la vida del enemigo (5/6)', $('#z-agua .hp-row span:last-child').textContent === '5/6');
  ok('Retos: la casilla queda marcada y se guarda en el día', casillas()[0].checked && Object.keys(JSON.parse(localStorage.getItem('ysph-v2')).members.Mama.days).length === 1);
  casillas()[0].click();
  await esperar(120);
  ok('Retos: se puede desmarcar (vuelve a 6/6)', $('#z-agua .hp-row span:last-child').textContent === '6/6' && !casillas()[0].checked);
  for (const c of casillas()) { c.click(); await esperar(40); }
  ok('Retos: al marcar los 6 aún no hay ventana (se deja caer al enemigo)', !$('.modal'));
  await esperar(2600);
  const v1 = $('.modal');
  ok('Ventanas: al completar los 6 sale «¡Jugada 1 completada!» con 6 hábitos nuevos', v1 && /Jugada 1 completada/.test(v1.textContent) && $$('.rlist li', v1).length === 6);
  ok('Ventanas: muestra la insignia ganada (Semilla) con su escudo y su lema', !!$('.ins-grande', v1) && /Nueva insignia: Semilla/.test(v1.textContent), $('.ins-texto', v1)?.textContent);
  ok('Ventanas: no queda nada de la historia (capítulos, partes)', !/[Cc]ap[ií]tulo|Parte \d/.test(v1.textContent));
  ok('Ventanas: el foco queda dentro de la ventana', v1.contains(document.activeElement));
  ok('Ventanas: ofrece empezar la jugada 2 y ver las insignias', !![...v1.querySelectorAll('button')].find((b) => /Empezar la jugada 2/.test(b.textContent)) && !![...v1.querySelectorAll('button')].find((b) => /Ver mis insignias/.test(b.textContent)));
  v1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await esperar(150);
  ok('Ventanas: Esc la cierra', !$('.modal'));
  ok('Retos: la tarjeta de cada nivel muestra tu insignia y cuánto falta', $$('.lvl-ins .ins').length === 5 && /Explorador/.test($('#z-agua .lvl-ins').textContent), $('#z-agua .lvl-ins')?.textContent);
  ok('Retos: empieza la jugada 2 con otros hábitos y vida 6/6', /Jugada 2/.test($('#z-agua .lvl').textContent) && $('#z-agua .hp-row span:last-child').textContent === '6/6');
  ok('Estado: la jugada completada queda registrada (c=1, r=2)', (() => { const j = JSON.parse(localStorage.getItem('ysph-v2')).members.Mama.rd.agua; return j.c === 1 && j.r === 2; })());

  /* ---------- 4. Mochila ---------- */
  $('#appMenuBtn').click(); await esperar(80);
  $('#tabs [data-go="mochila"]').click(); await esperar(200);
  $$('#kitList input').slice(0, 4).forEach((c) => c.click());
  $('#famPlus').click();
  await esperar(100);
  ok('Mochila: 4 de 16 ítems = 25 % y 4 personas', $('#packPct').textContent === '25%' && $('#famN').textContent === '4', `${$('#packPct').textContent} / ${$('#famN').textContent}`);

  /* ---------- 5. Familia: inscribir, jugar como, ánimo ---------- */
  $('#appMenuBtn').click(); await esperar(80);
  $('#tabs [data-go="familia"]').click(); await esperar(200);
  const inscribir = async (apodo) => { $('#famAdd').value = apodo; $('#famAdd').closest('form').dispatchEvent(new Event('submit', { cancelable: true })); await esperar(80); };
  await inscribir('Juan');
  await inscribir('mama');
  ok('Familia: rechaza un apodo repetido (sin distinguir mayúsculas)', $('#famAdd').closest('form').querySelector('.nk-err').textContent.includes('ya está inscrito'));
  const filaJuan = () => $$('.fam-row').find((f) => f.textContent.includes('Juan'));
  ok('Familia: quien aún no empezó «Necesita ayuda»', /Necesita ayuda/.test(filaJuan().textContent) && /Aún no ha empezado/.test(filaJuan().textContent));
  const animo = $$('button', filaJuan()).find((b) => b.textContent === 'Dar ánimo');
  animo.click(); await esperar(100);
  ok('Familia: «Dar ánimo» avisa y deja el ánimo guardado', $('#toast').textContent.includes('Ánimo enviado a Juan') && !!JSON.parse(localStorage.getItem('ysph-v2')).members.Juan.nudge);
  $$('button', filaJuan()).find((b) => b.textContent.startsWith('Jugar como')).click();
  await esperar(300);
  ok('Familia: «Jugar como Juan» cambia de jugador y entrega el ánimo', $('.xp-chip').title.startsWith('Juan') && $('#toast').textContent.includes('Mama te mandó ánimo'), $('#toast').textContent);
  ok('Familia: el nuevo jugador empieza su propia jugada 1', /Jugada 1/.test($('#z-agua .lvl').textContent) && $('#z-agua .reto input:checked') === null);

  /* ---------- 6. Menú hamburguesa ---------- */
  const menu = $('#tabs');
  $('#appMenuBtn').click(); await esperar(100);
  ok('Menú: se abre con el botón y marca la sección actual', visible(menu) && !!$('[aria-current="page"]', menu));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await esperar(80);
  ok('Menú: Esc lo cierra', !visible(menu));
  $('#appMenuBtn').click(); await esperar(80);
  $('h1', $('#v-familia')).click(); await esperar(80);
  ok('Menú: clic fuera lo cierra', !visible(menu));

  /* ---------- 7. Reinicio del progreso (solo del jugador activo) ---------- */
  $('#appMenuBtn').click(); await esperar(80); $('#tabs [data-go="ranking"]').click(); await esperar(200);
  ok('Ranking: la escalera muestra las 6 insignias (ganadas + apagadas) y la actual en grande', $$('#ladder .ins').length === 6 && !!$('#rkBadge .ins-grande') && $$('#ladder li.got').length + $$('#ladder .ins-off').length === 6, $('#rkName').textContent);
  ok('Menú: cinco secciones y sin Historia', $$('#tabs button').length === 5 && !$('#tabs [data-go="historia"]') && !$('#v-historia'), $$('#tabs button').length);
  $('#resetAll').click(); $('#resetAll').click(); await esperar(150);
  ok('Reinicio: pide confirmar con un segundo toque y avisa', $('#resetNote').textContent === 'Progreso reiniciado.');
  ok('Reinicio: no borra a los demás integrantes', Object.keys(JSON.parse(localStorage.getItem('ysph-v2')).members).length === 2);

  /* ---------- 8. Chat de EL JEFE ---------- */
  const personaje = $('.jefe-btn');
  ok('Chat: el personaje flotante muestra la imagen y el nombre', !!$('img', personaje) && personaje.textContent.includes('EL JEFE'));
  personaje.click(); await esperar(900);
  ok('Chat: se abre el panel y se oculta el personaje', !$('.jefe').hidden && !visible(personaje));
  const subtitulo = $('.jefe-sub').textContent;
  ok(`Chat: modo ${conIA ? 'IA' : 'local'} detectado (${subtitulo})`, conIA ? subtitulo.includes('IA') : subtitulo.includes('predefinidas'));

  preguntarAlJefe('Huelo gas, ¿qué hago?'); await esperar(100);
  ok('Chat: peligro inmediato se responde AL INSTANTE con el protocolo (sin esperar)', /Si huele a gas/.test(ultimoDelBot()?.textContent || '') && $('.jefe-log').getAttribute('aria-busy') !== 'true');

  if (!conIA) {
    preguntarAlJefe('¿Cómo voy?'); await esperar(900); await esperarLibre();
    ok('Chat local: responde con el progreso del jugador', /Llevas \d+ XP/.test(ultimoDelBot()?.textContent || ''), ultimoDelBot()?.textContent);
    ok('Chat local: la frase del progreso está bien redactada (insignia, racha y jugadas)', /insignia \S+, racha de \d+ días? y \d+ jugadas/.test(ultimoDelBot()?.textContent || ''), ultimoDelBot()?.textContent);
    preguntarAlJefe('¿Estoy listo para el fuego?'); await esperar(900); await esperarLibre();
    ok('Chat local: responde por la preparación para el fuego', /preparación para el fuego/.test(ultimoDelBot()?.textContent || ''));
  } else {
    preguntarAlJefe('¿Cuál es mi siguiente reto? LENTO');
    const largos = []; const t0 = performance.now();
    while (performance.now() - t0 < 2600) { largos.push(ultimoDelBot()?.textContent.length || 0); await esperar(300); }
    await esperarLibre(12000);
    const creciente = largos.filter((n, i) => i && n > largos[i - 1]).length >= 2;
    ok('Chat IA: la respuesta aparece por partes (streaming)', creciente, largos.join(','));
    const r = ultimoDelBot();
    ok('Chat IA: formatea negritas y viñetas de forma segura', !!r.querySelector('b') && r.textContent.includes('•') && !r.innerHTML.includes('<script'));
    preguntarAlJefe('hola ERROR500'); await esperar(1500); await esperarLibre();
    ok('Chat IA: si el servicio falla, responde con lo predefinido y lo avisa', /Respuesta predefinida/.test(ultimoDelBot().textContent));
    preguntarAlJefe('REFUSAL prueba'); await esperar(1500); await esperarLibre();
    ok('Chat IA: un rechazo de seguridad no deja el mensaje en blanco (da el 123)', /123/.test(ultimoDelBot().textContent));
    const historial = JSON.parse(sessionStorage.getItem('ysph-jefe-hist') || '[]');
    ok('Chat IA: el historial guarda solo los intercambios completados', historial.length >= 2 && historial.every((m) => m.content), `${historial.length} mensajes`);
  }

  $('.jefe-rs').click(); await esperar(100);
  ok('Chat: «Nueva conversación» vacía el historial y saluda', $$('.jm').length === 1 && JSON.parse(sessionStorage.getItem('ysph-jefe-hist') || '[]').length === 0);
  $('.jefe-x:not(.jefe-rs)').click(); await esperar(100);
  ok('Chat: se cierra y vuelve el personaje', $('.jefe').hidden && visible(personaje));

  /* ---------- 9. Personaje arrastrable ---------- */
  const pos = () => { const r = personaje.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; };
  const ev = (tipo, x, y) => personaje.dispatchEvent(new PointerEvent(tipo, { pointerId: 9, pointerType: 'mouse', button: 0, clientX: x, clientY: y, bubbles: true }));
  const r0 = personaje.getBoundingClientRect();
  ev('pointerdown', r0.left + 30, r0.top + 30); ev('pointermove', r0.left - 200, r0.top - 150); ev('pointerup', r0.left - 200, r0.top - 150); personaje.click(); await esperar(100);
  ok('Arrastre: se mueve con el puntero y NO abre el chat', pos()[0] < r0.left - 100 && $('.jefe').hidden, pos().join(','));
  ok('Arrastre: guarda la posición', !!localStorage.getItem('ysph-jefe-pos'));
  const r1 = personaje.getBoundingClientRect();
  ev('pointerdown', r1.left + 30, r1.top + 30); ev('pointermove', r1.left - 9999, r1.top - 9999); ev('pointerup', 0, 0); await esperar(100);
  ok('Arrastre: nunca se sale de la pantalla (margen de 8 px)', pos()[0] >= 8 && pos()[1] >= 8, pos().join(','));
  personaje.focus(); personaje.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  ok('Arrastre: las flechas del teclado lo mueven', pos()[0] === 28, pos().join(','));
  const r2 = personaje.getBoundingClientRect(); ev('pointerdown', r2.left + 30, r2.top + 30); ev('pointerup', r2.left + 30, r2.top + 30); personaje.click(); await esperar(100);
  ok('Arrastre: un toque simple (sin mover) sí abre el chat', !$('.jefe').hidden);
  $('.jefe-x:not(.jefe-rs)').click();

  const falla = filas.filter((f) => f.resultado === 'FALLA');
  filas.push({ prueba: `RESUMEN: ${filas.length - falla.length} de ${filas.length} correctas`, resultado: falla.length ? 'FALLA' : 'OK', detalle: falla.map((f) => f.prueba).join(' | ').slice(0, 140) });
  return filas;
}
