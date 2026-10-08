# Guía para contribuir

Antes de empezar lee [ARQUITECTURA.md](ARQUITECTURA.md) (10 minutos). Aquí están las tareas más comunes.

## Preparar el entorno

```bash
cd servidor-jefe && npm install && cd ..
npm run dev:web        # http://localhost:3000
npm test               # debe quedar todo en verde antes de cualquier cambio
```

## Convenciones

- **Idioma:** nombres de funciones, variables y comentarios en **español** (igual que el resto del código). Los campos que se guardan en el dispositivo (`days`, `kit`, `rd`…) son la excepción: no se renombran.
- **Cada módulo empieza con un comentario `/** … @module */`** que dice qué hace. La prueba `estructura.test.js` lo exige.
- **Documenta con JSDoc** lo que se exporta (qué recibe, qué devuelve y por qué existe, no solo cómo).
- **Las reglas van en `dominio/`**, sin tocar el DOM. Si una regla necesita un número, ponlo en `config.js`.
- **Todo cambio de estado termina con `guardar()` y `renderTodo()`.** No pintes desde un manejador de eventos sin pasar por ahí.
- **Sin dependencias nuevas** en el juego. En el servidor, solo si hay una razón fuerte.

## Agregar o cambiar un hábito

1. Edita `src/js/datos/habitos.js`. Cada nivel debe seguir teniendo **18** hábitos (3 jugadas de 6), con ids únicos (`a1`, `e7`…).
2. `npm test` (la prueba de datos verifica 18 por nivel e ids únicos).

## Agregar un nivel

Un sexto nivel toca varios sitios; hazlo en este orden:

1. `datos/niveles.js`: agrega el nivel (id, textos, salvador, enemigo) y su banco en `datos/habitos.js`.
2. `datos/agentes.js` y `datos/sprites.js`: el salvador y el enemigo.
4. `ui/combate.js`: la señal que lanza el salvador.
5. Textos que cuentan niveles: grep de «5 niveles» y «cinco» en `index.html`, `docs/` y `agente-el-jefe/instrucciones.md`; y `servidor-jefe/lib/validacion.js` (lista `NIVELES`).
6. `npm test`, `npm run agente`, y recorre el juego en el navegador.

## Cambiar la escalera de insignias

Es un solo archivo: `src/js/datos/insignias.js` (nombre, XP necesaria, lema, metal y símbolo de cada una). Una jugada completa son 60 XP, así que conviene que cada umbral sea un buen número de jugadas.

- **Nueva insignia o cambio de umbral:** edita `INSIGNIAS` (ordenadas por XP). Si estrenas un `metal`, agrega su clase `.ins-<metal>` en `css/09-insignias.css`; si estrenas un `simbolo`, agrégalo a `SIMBOLOS`. `insignias.test.js` verifica que todo tenga con qué dibujarse.
- Actualiza los textos que citan la escalera: `agente-el-jefe/instrucciones.md` (luego `npm run agente`), `docs/MANUAL_DE_USUARIO.md` y la lista de nombres en `servidor-jefe/lib/validacion.js`.

## Agregar una sección a la zona de juego

1. En `index.html`: una `<section id="v-…">` y su botón en el menú (`#tabs`, con `data-go="…"`).
2. Un módulo en `ui/` con una función `renderX()` que pinte **solo desde el estado**.
3. Llama a `renderX()` desde `renderTodo()` en `ui/render.js`.
4. Si es la primera vez que se usa un estilo nuevo, agrégalo al archivo CSS de su pantalla (o crea el siguiente número y enlázalo en `index.html`).
5. **Service worker:** agrega los archivos nuevos a `NUCLEO` en `sw.js` y sube `VERSION`.

## Cambiar lo que sabe o responde EL JEFE

- **Lo que sabe del juego** → edita `agente-el-jefe/instrucciones.md` (máximo ~7.700 caracteres: es el límite de Copilot).
- **Cómo responde en la página web** (longitud, formato, defensas) → `agente-el-jefe/reglas-chat-web.md`.
- Después: `npm run agente`. Regenera `declarativeAgent_0.json` y `servidor-jefe/prompt-jefe.md` (**no los edites a mano**; `agente.test.js` falla si quedan desactualizados).
- Para actualizar el agente de Copilot: sube el `manifest.version` en `agente-el-jefe/manifest.json`, vuelve a comprimir `declarativeAgent_0.json`, `manifest.json`, `color.png` y `outline.png` en `EL-JEFE-agente.zip`, y cárgalo en Copilot (conserva el mismo `id`, así que **actualiza** el agente existente).
- Las **respuestas predefinidas** (sin IA) están en `src/js/dominio/chat.js`.

## Cambiar los tiempos de la presentación o de las animaciones

Están en `config.js` → `TIEMPOS` (en milisegundos). No los repitas en CSS: la presentación lee estos valores.

## Verificar que no rompiste nada

1. **`npm test`**: reglas, datos, estructura de archivos, agente y servidor. Rápido (menos de 3 s) y sin red.
2. **Recorrido en el navegador:** `npm run dev:web`, abre la página y ejecuta la prueba de comportamiento (instrucciones en el encabezado de `pruebas/e2e/comportamiento.js`). Para el chat con IA sin gastar créditos: `npm run dev:simulador` y `npm run dev:web:ia`.
3. **Si hiciste una refactorización visual**, captura una *instantánea* antes y compárala después (`pruebas/e2e/instantanea.js`): detecta cualquier diferencia de HTML o de estilos.
4. Revisa a mano en **móvil** (ancho 375 px) y en escritorio.

## Seguridad: reglas que no se negocian

- **Nunca** pongas una clave de API en `src/`, en un `.env` que se suba, ni en el historial. Va en variables de entorno del servidor.
- Lo que llega de la página al servidor **no se da por bueno**: pasa por `lib/validacion.js`. Al prompt solo entran números acotados del estado del jugador, nunca texto escrito por la persona fuera de la conversación.
- Ante peligro inmediato (gas, fuego, sismo) el chat responde **en local** y al instante: no lo cambies para que dependa de la IA.
- No inventes funciones en los textos: el APK, la sincronización entre dispositivos y la nube **no existen** todavía.

## Publicar

Ver [servidor-jefe/README.md](../servidor-jefe/README.md#publicarlo). Resumen: HTTPS, `ANTHROPIC_API_KEY` como variable de entorno del hosting, `JEFE_PROXY=1` si hay proxy, y `npm start` (sin `--dev`).
