![UNAD, Universidad Nacional Abierta y a Distancia, y Segundas Olimpiadas Unadistas 2026](assets/encabezado.png)

# NIDO · ¿Y si pasa hoy? — juego serio de ARCADE

**ARCADE** es el equipo que diseña el juego. **«NIDO»** (eslogan: **¿Y si pasa hoy?**) es una app web interactiva y responsive (también instalable como PWA) con la que las familias de la **Zona Occidente y Dosquebradas** crean hábitos diarios frente al fenómeno de **El Niño** y otros desastres. Su nombre es un acrónimo: **N**os **I**nformamos, **D**ecidimos y **O**rganizamos en familia. Proyecto del semillero para las Olimpiadas Unadistas.

> Maratón de Innovación en Narrativas Digitales · Segundas Olimpiadas Unadistas 2026 · Fase zonal


| Campo                                            | Respuesta                                                                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Equipo                                           | ARCADE                                                                                                                                        |
| Zona / Centro(s)                                 | ZOCC                                                                                                                                          |
| Tipo de producto (Tabla 1 del documento técnico) | Web Interactiva                                                                                                                               |
| Integrantes (solo nombres completos)             | Jaime Jose García Villa, Natalia Elizabeth Perez Cabrera, Henry Leonardo Borrero Lopez, Valentina Rengifo Correa, Nelson Augusto Serna Porras |
| Enlace al demo web (si aplica)                   |                                                                                                                                               |


**No escriba aquí cédulas, teléfonos ni correos.** Este repositorio se hace público el viernes 9 de octubre a las 12:00 m.

## ¿De qué trata? (máximo 5 líneas)

- **5 niveles:** Agua, Energía, Calor, Fuego y Sismo. Cada jugada muestra **6 tarjetas: 3 hábitos buenos y 3 descuidos**, en una carrera entre la vida del enemigo del nivel y la de tu salvador.
- Cada hábito bueno marcado hiere al enemigo y suma **20 XP**; con 3 gana tu salvador y una ventana te muestra tu **insignia**. Si reconoces 3 descuidos primero, el salvador cae y la jugada se repite, sin perder XP; reconocerlos con honestidad también suma un poco.
- **Insignias:** como las de los exploradores. La escalera (Aspirante → Semilla → Explorador → Guardián → Centinela → Leyenda) se sube con la XP, así que **repetir los hábitos** te lleva más arriba.
- **Familia:** cada integrante juega con su *nickname* y el ranking familiar muestra quién lidera y quién necesita ayuda; se puede enviar ánimo.
- **EL JEFE:** narra el caso hipotético «¿Tu familia está lista?» con voz y, desde un personaje flotante, abre un chat de apoyo. Conversa con IA si hay un servidor conectado; si no, responde con frases predefinidas. Las emergencias siempre se responden en el momento, sin esperar a la IA.



## Qué hay en cada carpeta


| Carpeta / archivo                 | Contenido                                                                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[nido.html](nido.html)`          | **El juego completo en un solo archivo, con la música y la narración de EL JEFE incluidas (38 MB).** Se abre con doble clic; no necesita instalar nada ni la carpeta `src/`.            |
| `[src/](src)`                     | **El juego** (HTML + CSS + JavaScript sin dependencias ni paso de compilación) con sus imágenes y la narración de EL JEFE. Se puede publicar tal cual en cualquier hosting de archivos. |
| `[servidor-jefe/](servidor-jefe)` | Servidor Node que entrega el juego y conecta el chat de EL JEFE con Claude sin exponer la clave. Opcional. Su personalidad y reglas están en `prompt-jefe.md`.                          |
| `[docs/](docs)`                   | Manual de usuario.                                                                                                                                                                      |




## Comandos

Requisitos: **Node.js 20.6 o superior** (solo para el servidor; el juego en sí no instala nada).


| Comando                               | Qué hace                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `cd servidor-jefe && npm install`     | Una sola vez: instala la librería de Claude que usa el servidor.                                          |
| `npm start`                           | Juego + chat en `http://localhost:3000` (el puerto se cambia con la variable `PORT`).                     |
| `ANTHROPIC_API_KEY=<clave> npm start` | Igual, con EL JEFE conversando con IA. Sin clave, el juego funciona completo con respuestas predefinidas. |




## Pendientes conocidos

- **Contenido por verificar** antes de un uso público: las cifras de la portada (63 %, 1.092 ha), la fecha de la Circular de MinAmbiente, la cifra de la OMM y los consejos de seguridad con la gestión del riesgo municipal.
- **Ranking entre dispositivos:** hoy la familia comparte un dispositivo (todo se guarda en `localStorage`). Sincronizar requiere un servidor con base de datos.
- **APK de Android:** propuesta futura (podría generarse con PWABuilder, Bubblewrap o Capacitor a partir de la PWA ya incluida).
- **Herramienta de IA usada en la construcción:** Claude Code (Anthropic), para programar, probar y documentar el juego.



## Cómo ver o probar el producto

- **Demo web:** si su producto se ve en el navegador (web, scrollytelling, WebGL), ponga los archivos en la carpeta `docs/`, con un `index.html` en `docs/`. Quedará en `https://u-nacional-abierta-y-a-distancia.github.io/<nombre-de-este-repositorio>/`.
- **Archivos pesados** (video del pitch, builds, audio): van en el Release **entrega-zonal** (botón *Releases*, a la derecha).
- Instrucciones para ejecutarlo:
  1. **Más simple:** abra `nido.html` con doble clic: suena la música y EL JEFE narra con su voz. El chat de EL JEFE usa respuestas predefinidas. En algunos navegadores el sonido empieza con el primer toque en la pantalla.
  2. **Con servidor:** `cd servidor-jefe && npm install`, luego `npm start` en esta carpeta y abra `http://localhost:3000`. Permite instalarlo como app y conectar la IA.



## Créditos de recursos de terceros


| Recurso                                     | Autor               | Licencia o autorización                          |
| ------------------------------------------- | ------------------- | ------------------------------------------------ |
| Tipografía Orbitron                         | Matt McInerney      | SIL Open Font License 1.1 (Google Fonts)         |
| Tipografía Poppins                          | Indian Type Foundry | SIL Open Font License 1.1 (Google Fonts)         |
| `@anthropic-ai/sdk` (servidor)              | Anthropic           | MIT                                              |
| Logos de UNAD y de las Olimpiadas Unadistas | UNAD                | Proporcionados por la organización de la maratón |


Los efectos de sonido se sintetizan en el propio juego. La música de fondo son tres pistas en `src/assets/audio/musica/` (portada, retos y narrativa). **Por confirmar por el equipo antes de publicar:** autoría y licencia de la música de fondo, y autoría y herramienta de las ilustraciones (EL JEFE, salvadores y enemigos) y de la voz de la narración (`src/assets/audio/narrador/`).

## Derechos

Todos los derechos reservados a sus autores. Publicado por la Universidad Nacional Abierta y a Distancia (UNAD) con autorización de los autores, conforme a la sección 7 del formato de identificación de la maratón.