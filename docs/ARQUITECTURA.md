# Arquitectura

Este documento explica **cómo está organizado el código y por qué**. Para agregar cosas, ve a [CONTRIBUIR.md](CONTRIBUIR.md).

## Principios

1. **Sin dependencias ni compilación.** El juego son módulos ES nativos, CSS y HTML. Se abre con cualquier servidor de archivos y se depura en el navegador sin herramientas.
2. **Las reglas no conocen el navegador.** Todo lo que decide el juego (XP, insignias, rachas, jugadas, ranking, respuestas del chat) está en `js/dominio/`, sin DOM ni almacenamiento, y se prueba en Node.
3. **El estado manda.** Cualquier cambio guarda y vuelve a pintar todo desde el estado; las secciones no guardan datos propios.
4. **Lo que se guarda no se renombra.** Los campos persistidos están en los dispositivos de las personas (ver [Qué se guarda](#qué-se-guarda)).
5. **La clave de la IA nunca llega a la página.** Solo la conoce el servidor (`servidor-jefe/`).

## Capas del juego (`src/js/`)

Las dependencias van **solo hacia abajo**; una capa nunca importa de una que está encima.

```
        main.js                    arranque: cablea todo
           │
          ui/                      DOM: pinta, anima y atiende clics
           │
        estado/                    qué se guarda y dónde (localStorage)
           │
       dominio/                    reglas puras, sin DOM ni almacenamiento
           │
   datos/   util/   config.js      contenido, utilidades y constantes
```

| Capa | Archivos | Responsabilidad |
|---|---|---|
| `config.js` | 1 | Todo número que afecte a las reglas (6 hábitos por jugada, XP, tiempos de la presentación, claves de almacenamiento…). |
| `datos/` | `niveles`, `habitos`, `insignias`, `agentes`, `mochila`, `ilustraciones`, `sprites` | **Contenido**: textos, hábitos, escalera de insignias, personajes. Cambiarlo no toca la lógica. |
| `util/` | `fecha`, `texto`, `dom` | Funciones pequeñas y genéricas. `fecha` y `texto` no usan DOM. |
| `dominio/` | `progreso`, `familia`, `ranking`, `chat` | Las reglas del juego. Reciben el estado de **un** jugador como parámetro. |
| `estado/` | `almacen` | Lee y escribe `localStorage`; sabe quién es el jugador activo y migra datos antiguos. |
| `ui/` | una por sección o ventana, más `chat/` | Pinta cada sección, la ventana de jugada completada, animación de combate, navegación, instalación. |
| `main.js` | 1 | Orden de arranque. |

### Mapa de `ui/`

| Módulo | Qué hace |
|---|---|
| `render.js` | `renderTodo()`: repinta cada sección desde el estado. |
| `navegacion.js` | Portada ↔ juego, secciones, menú hamburguesa. |
| `retos.js` | Tarjetas de nivel: arena, vida del enemigo, lista de 6 hábitos. **Aquí se marca un hábito.** |
| `combate.js`, `particulas.js` | Animación de la señal que lanza el salvador; partículas de la portada. |
| `ventanas.js` | Ventana «¡Jugada N completada!»: tu insignia, lo que falta para la siguiente y los 6 hábitos nuevos. |
| `insignias.js` | Dibuja el escudo de una insignia (SVG) en tres tamaños; lo usan la ventana, los niveles, la cabecera y el ranking. |
| `mochila.js`, `ranking.js`, `familia.js`, `tarjetas.js`, `kpis.js` | Una sección cada uno. `ranking.js` incluye la escalera de insignias. |
| `identidad.js` | Ventana del nickname y cambio de jugador. |
| `presentacion.js` | Las dos pantallas iniciales (5 s + 7 s). |
| `instalacion.js` | PWA, fila «Llévalo en tu bolsillo» (el botón del APK es solo visual) y registro del service worker. |
| `avisos.js`, `sprites.js` | Aviso breve y confeti; dibujo de los sprites en `<canvas>`. |
| `chat/panel.js`, `chat/arrastre.js`, `chat/cliente-ia.js` | EL JEFE: panel de conversación, personaje arrastrable y cliente del servidor. |

## Flujo de un hábito marcado

```
clic en la casilla (ui/retos.js → alMarcar)
  └─ registrarMarca(estado, nivel, id, marcado)       dominio/progreso.js  ← la regla central
  │     ├─ actualiza days[hoy] y rd[nivel].done
  │     ├─ si completa los 6 → { completa: true, jugada: { insignia, nueva, siguientes, … } }
  │     └─ si el XP sube de insignia → insigniaNueva (también sin cerrar una jugada)
  └─ programar(jugada) y arma la jugada siguiente      ui/ventanas.js, ui/retos.js
  └─ guardar()                                         estado/almacen.js
  └─ renderTodo()                                      ui/render.js
  └─ lanzarSenal(…)                                    ui/combate.js
  └─ tras 1,9 s: mostrarPendiente() abre la ventana de la insignia   ui/ventanas.js
```

`registrarMarca` **no toca la interfaz**: devuelve lo que hay que celebrar y la capa `ui` decide cómo mostrarlo. Por eso se puede probar completamente en Node (`pruebas/unit/progreso.test.js`).

### Vocabulario

- **Nivel:** uno de los cinco temas.
- **Insignia:** peldaño de la escalera (`datos/insignias.js`). Se gana con la XP: 10 por hábito, 60 por jugada completa. Como la XP no se pierde al repetir hábitos, la repetición sube de insignia.
- **Jugada:** los 6 hábitos de un nivel que se muestran a la vez. **Ronda:** número de la jugada en curso (1, 2, 3…). El banco tiene 18 hábitos = 3 jugadas; la ronda 4 vuelve a ser la 1 (*repaso*).

## Qué se guarda

`localStorage`, clave **`ysph-v2`**: una sola raíz para toda la familia.

```jsonc
{
  "famName": "Los Salazar",            // opcional
  "active": "Mama",                    // nickname del jugador activo
  "members": {
    "Mama": {
      "days": { "2026-10-07": ["a1", "a2"] },   // hábitos marcados por día (AAAA-MM-DD, hora local)
      "kit":  ["k1"],                            // ítems de la mochila guardados
      "fam":  3,                                 // personas en casa
      "rd":   { "agua": { "r": 2, "c": 1, "done": ["a7"] } },  // jugada por nivel: ronda, completadas, marcados
      "nudge": { "from": "Papa", "at": 1760000000000 },        // ánimo pendiente
      "joined": 1760000000000
    }
  }
}
```

- Los nombres están en inglés abreviado por herencia de versiones anteriores. **No los renombres** sin escribir una migración en `estado/almacen.js`.
- `arcade-habitos-v1` es el formato antiguo de un solo jugador; se migra al primer nickname que se inscriba.
- Otras claves: `ysph-splash` y `ysph-jefe-hist` (sessionStorage: presentación vista, historial del chat) y `ysph-jefe-pos` (posición del personaje flotante). Todas están en `config.js`.

## CSS (`src/css/`)

Quince archivos numerados, cargados en ese orden desde `index.html` (**la cascada depende del orden**: no los reordenes). `00-tokens.css` define todas las variables de diseño: paleta de un solo acento cian sobre negro, y el naranja **solo** para los enemigos. Los demás se agrupan por pantalla (portada, juego, ventanas, familia, chat…).

## PWA y modo sin conexión

- `manifest.webmanifest`: nombre, íconos 192/512 (normal y *maskable*) y colores.
- `sw.js`: *service worker* de **red primero con respaldo en caché**. Precarga la lista `NUCLEO` al instalarse; no intercepta `/api/` (el chat). Si agregas archivos a `css/` o `js/`, **súbelos a la lista y aumenta `VERSION`**; la prueba `estructura.test.js` falla si se olvida alguno.

## El chat de EL JEFE

```
Página ── GET /api/jefe/salud ─▶ ¿hay IA?  ── no ─▶ respuestas predefinidas (dominio/chat.js)
   │                                  │ sí
   │ ¿el mensaje describe peligro inmediato? ── sí ─▶ protocolo local al instante (no espera a la IA)
   │                                  │ no
   └──── POST /api/jefe ─▶ servidor-jefe ─▶ Claude   (respuesta en streaming, línea a línea)
```

- La página envía solo la conversación y un **resumen numérico** del juego (`contextoParaIA`): nunca el nickname.
- El servidor valida todo, aplica un límite de uso por IP y usa las instrucciones de `servidor-jefe/prompt-jefe.md` (generado). Detalles en [servidor-jefe/README.md](../servidor-jefe/README.md).
- Si la IA falla o no responde a tiempo, el chat vuelve en silencio a las respuestas predefinidas.

## Servidor (`servidor-jefe/`)

```
server.js            arranque (lee el entorno, crea el cliente de Claude, escucha)
lib/config.js        variables de entorno → objeto de configuración
lib/app.js           ensambla el servidor HTTP y las rutas
lib/chat.js          el chat: valida → pide a Claude → emite NDJSON
lib/validacion.js    cuerpo, mensajes y contexto del jugador (nada de lo que llega se da por bueno)
lib/limite.js        límite de uso por IP, en memoria
lib/estaticos.js     entrega los archivos del juego (sin salir de la carpeta)
lib/http.js          JSON, IP del cliente y cabeceras de seguridad
simulador/           simula la API de Anthropic para probar sin gastar créditos
pruebas/             pruebas con un cliente de Claude falso
```

Todo se inyecta (configuración, cliente, límite, registro) para que las pruebas levanten un servidor real **sin red ni clave**.

## Pruebas

| Qué | Dónde | Cómo |
|---|---|---|
| Reglas del juego, familia, chat local, almacenamiento (con un `localStorage` falso) | `pruebas/unit/` | `npm run test:juego` |
| Coherencia de archivos: enlaces de `index.html`, imports, caché del service worker, imágenes, módulos huérfanos | `pruebas/unit/estructura.test.js` | incluida |
| Que el agente y el prompt estén sincronizados con `instrucciones.md` | `pruebas/unit/agente.test.js` | incluida |
| Servidor: validación, límite, streaming, errores, rutas, seguridad de archivos | `servidor-jefe/pruebas/` | `npm run test:servidor` |
| Recorrido completo en el navegador (presentación, nickname, hábitos, ventanas, familia, menú, chat, arrastre) | `pruebas/e2e/comportamiento.js` | ver el encabezado del archivo |
| «Instantánea» del HTML y estilos de cada pantalla, para comprobar que una refactorización no cambió nada visible | `pruebas/e2e/instantanea.js` | ver el encabezado del archivo |
