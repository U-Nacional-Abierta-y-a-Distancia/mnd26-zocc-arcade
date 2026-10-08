![UNAD, Universidad Nacional Abierta y a Distancia, y Segundas Olimpiadas Unadistas 2026](assets/encabezado.png)

# ¿Y si pasa hoy? — juego serio de ARCADE

**ARCADE** es el equipo que diseña el juego. **«¿Y si pasa hoy?»** es una app web interactiva y responsive (también instalable como PWA) con la que las familias de la **Zona Occidente y Dosquebradas** crean hábitos diarios frente al fenómeno de **El Niño** y otros desastres. Proyecto del semillero para las Olimpiadas Unadistas.

> Maratón de Innovación en Narrativas Digitales · Segundas Olimpiadas Unadistas 2026 · Fase zonal


| Campo                                            | Respuesta                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Equipo                                           | ARCADE                                                                                                           |
| Zona / Centro(s)                                 | ZOCC                                                                                                             |
| Tipo de producto (Tabla 1 del documento técnico) | Web Interactiva                                                                                                  |
| Integrantes (solo nombres completos)             | Jaime Jose García Villa, Natalia elizabeth Perez Cabrera, Henry Leonardo Borrero Lopez, Valentina Rengifo Correa |
| Enlace al demo web (si aplica)                   |                                                                                                                  |


**No escriba aquí cédulas, teléfonos ni correos.** Este repositorio se hace público el viernes 9 de octubre a las 12:00 m.

## ¿De qué trata? (máximo 5 líneas)

- **5 niveles:** Agua, Energía, Calor, Fuego y Sismo. Cada uno muestra **6 hábitos** a la vez (una *jugada*).
- Cada hábito marcado le quita vida al enemigo del nivel y suma **XP**; con el sexto, una ventana te muestra tu **insignia** y llegan **6 hábitos nuevos** (cada nivel tiene un banco de 18 que se repite).
- **Insignias:** como las de los exploradores. La escalera (Aspirante → Semilla → Explorador → Guardián → Centinela → Leyenda) se sube con la XP, así que **repetir los hábitos** te lleva más arriba. **Familia:** cada integrante juega con su *nickname* y el ranking familiar muestra quién lidera y quién necesita ayuda.
- **EL JEFE:** personaje flotante que abre un chat de apoyo. Conversa con IA si hay un servidor conectado; si no, responde con frases predefinidas. Las emergencias siempre se responden en el momento, sin esperar a la IA.

## Qué hay en cada carpeta


| Carpeta                             | Contenido                                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `[src/](src)`                       | **El juego** (HTML + CSS + JavaScript sin dependencias ni paso de compilación). Se puede publicar tal cual en cualquier hosting de archivos. |
| `[servidor-jefe/](servidor-jefe)`   | Servidor Node que conecta el chat de EL JEFE con Claude sin exponer la clave. Opcional.                                                      |
| `[agente-el-jefe/](agente-el-jefe)` | Fuente única de las instrucciones de EL JEFE y paquete del agente de Microsoft 365 Copilot.                                                  |
| `[pruebas/](pruebas)`               | Pruebas unitarias (`unit/`, en Node) y pruebas en el navegador (`e2e/`).                                                                     |
| `[docs/](docs)`                     | Manual de usuario, arquitectura y guía para contribuir.                                                                                      |




## Comandos


| Comando                                        | Qué hace                                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev:web`                              | Servidor de desarrollo en `http://localhost:3000` (juego + chat; incluye `/__pruebas/`).        |
| `npm start`                                    | Igual, sin las rutas de pruebas (para publicar).                                                |
| `npm test`                                     | Todas las pruebas unitarias y del servidor (sin red, sin clave, sin gastar créditos).           |
| `npm run dev:simulador` + `npm run dev:web:ia` | Prueba el chat con IA contra un **simulador** de la API (puerto 3100).                          |
| `npm run agente`                               | Regenera el agente de Copilot y el prompt del servidor desde `agente-el-jefe/instrucciones.md`. |




## Para quien va a tocar el código

1. Lee docs/ARQUITECTURA.md: cómo está organizado, el flujo de un hábito marcado y el formato de lo que se guarda.
2. Lee docs/CONTRIBUIR.md: cómo agregar un hábito, un nivel o una sección, y cómo verificar que nada se rompió.

## Pendientes conocidos

- **Contenido por verificar** antes de un uso público: las cifras de la portada (63 %, 1.092 ha), la fecha de la Circular de MinAmbiente, la cifra de la OMM y los consejos de seguridad con la gestión del riesgo municipal.
- **Ranking entre dispositivos:** hoy la familia comparte un dispositivo (todo se guarda en `localStorage`). Sincronizar requiere un servidor con base de datos.
- **APK de Android:** propuesta futura (podría generarse con PWABuilder, Bubblewrap o Capacitor a partir de la PWA ya incluida).
- Declarar en la entrega final la herramienta de IA usada en la construcción.

## Cómo ver o probar el producto

- **Demo web:** si su producto se ve en el navegador (web, scrollytelling, WebGL), ponga los archivos en la carpeta `docs/`, con un `index.html` en `docs/`. Quedará en `https://u-nacional-abierta-y-a-distancia.github.io/<nombre-de-este-repositorio>/`.
- **Archivos pesados** (video del pitch, builds, audio): van en el Release **entrega-zonal** (botón *Releases*, a la derecha).
- Instrucciones para ejecutarlo (si aplica):



## Créditos de recursos de terceros


| Recurso | Autor | Licencia o autorización |
| ------- | ----- | ----------------------- |
|         |       |                         |




## Derechos

Todos los derechos reservados a sus autores. Publicado por la Universidad Nacional Abierta y a Distancia (UNAD) con autorización de los autores, conforme a la sección 7 del formato de identificación de la maratón.