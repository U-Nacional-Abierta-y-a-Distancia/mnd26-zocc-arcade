# Servidor de EL JEFE — conecta el chat con una IA

El chat de la página ahora **conversa en vivo con Claude**. La página nunca ve la clave de la API: llama a este servidor y el servidor llama a Claude.

```
Página (src/)  ──POST /api/jefe──▶  servidor (lib/)  ──▶  API de Claude
   ▲  respuesta en streaming (NDJSON)   │   la clave vive solo aquí (variable de entorno)
   └────────────────────────────────────┘
```

Si el servidor no está o no tiene clave, el chat **sigue funcionando** con las respuestas predefinidas de antes y lo indica en la cabecera («Chat de apoyo · respuestas predefinidas»).

## Puesta en marcha (5 minutos)

Requisitos: **Node.js 20.6 o superior** y una clave de API de Anthropic.

```bash
cd servidor-jefe
npm install
cp .env.example .env        # en Windows: copy .env.example .env
# edita .env y pega tu ANTHROPIC_API_KEY
npm run dev                  # abre http://localhost:3000
```

El mismo servidor entrega el juego (carpeta `../src`) y el chat, así que no hay configuración de dominios para probar.

## Probar sin gastar créditos

`simulador/mock-anthropic.js` simula la API. Desde la carpeta raíz del proyecto, en dos terminales:

```bash
npm run dev:simulador     # simula la API de Anthropic en :8199
npm run dev:web:ia        # el juego en http://localhost:3100, conectado al simulador
```

Y para las pruebas automáticas (no necesitan ni simulador ni clave): `npm run test:servidor`.

Palabras mágicas en el mensaje: `ERROR500` (fallo del servicio), `REFUSAL` (rechazo de seguridad), `LENTO` (respuesta pausada para ver el streaming).

## Cómo está hecho

`server.js` solo arranca; las piezas están en `lib/` (`config`, `app`, `chat`, `validacion`, `limite`, `estaticos`, `http`) y reciben sus dependencias por parámetro, por eso las pruebas levantan un servidor real con un cliente de Claude falso. Ver [docs/ARQUITECTURA.md](../docs/ARQUITECTURA.md#servidor-servidor-jefe).

## Qué hace el servidor

- **Streaming:** el texto aparece mientras se genera.
- **Contexto del juego:** envía a la IA solo **números** (XP, insignia, racha, jugadas, hábitos por nivel). **No** envía el nickname ni datos personales.
- **Instrucciones:** `prompt-jefe.md` (las del agente EL JEFE más reglas del chat web; **es un archivo generado**, ver Mantenimiento), con protocolo de emergencias real. Va en un bloque con `cache_control` y el estado del jugador va después, para que la parte fija pueda cachearse.
- **Seguridad:** valida roles y longitudes (máx. 12 mensajes de 800 caracteres), limita el uso por IP (20/min y 300/día, configurable), no registra el contenido de las conversaciones, y si un clasificador de seguridad rechaza una petición reintenta del lado del servidor (`fallbacks: "default"`) y, si aun así falla, muestra un mensaje seguro con el 123.
- **Peligro inmediato:** si la persona escribe algo como «huelo gas» o «está temblando», el chat responde **al instante con el protocolo local**, sin esperar a la IA.
- **Registro:** cada petición imprime modelo, tokens y `caché_leída`/`caché_escrita` (nada de contenido).

## Modelo y costos

Por defecto usa **`claude-opus-5-5`** con esfuerzo `low` (un asistente de ayuda no necesita razonar mucho). Estimación orientativa: **1 a 2 centavos de dólar por mensaje** (unos 2.300 tokens de entrada y algunos cientos de salida). Mídelo con los registros antes de abrirlo al público.

Si prefieres abaratar, cámbialo en `.env`; es decisión tuya:

| `JEFE_MODELO` | Entrada / salida por millón de tokens |
|---|---|
| `claude-opus-5-5` (por defecto) | $4 / $20 |
| `claude-sonnet-5-5` | $2 / $10 |
| `claude-haiku-4-5` | $1 / $5 |

**Caché del prompt:** el prompt fijo mide unos 2.000 tokens. Si `caché_leída` se queda en 0 en los registros, el prefijo es más corto que el mínimo cacheable del modelo; no es un error, solo no hay ahorro.

## Publicarlo

1. Sube `servidor-jefe/` y `src/` a cualquier hosting con Node (Render, Railway, Fly.io, una VPS…).
2. Define `ANTHROPIC_API_KEY` como **variable de entorno** del hosting. Nunca la pongas en el código ni en el navegador.
3. Sirve todo por **HTTPS** (necesario también para instalar la app en el celular).
4. Si estás detrás de un proxy o balanceador, define `JEFE_PROXY=1`.
5. Si la página queda en un dominio y el servidor en otro: define `JEFE_ORIGEN=https://tu-pagina.com` y cambia en `src/index.html` `<meta name="jefe-api" content="https://tu-servidor.com/api/jefe">`.

## Mantenimiento

- `prompt-jefe.md` se **genera** desde `agente-el-jefe/instrucciones.md` y `reglas-chat-web.md`. No lo edites a mano: cambia esos archivos y ejecuta `npm run agente` (desde la raíz). Hace lo mismo con el agente de Copilot, así los dos nunca se desfasan.
- El límite de uso está en memoria: con varias instancias del servidor, cada una cuenta aparte. Para algo más robusto, usa Redis o el límite de tu proveedor.
- Antes de publicar para el público general, revisa el aviso de privacidad: las preguntas viajan a un servicio de IA (la página ya lo advierte).
- Este chat es independiente del agente de Microsoft 365 Copilot («EL JEFE» en `agente-el-jefe/`). Si prefieres usar ese agente en la página, hace falta publicarlo en un canal de Copilot Studio y cambiar solo esta capa.

## Variables de entorno

Están comentadas en `.env.example`. `npm run dev` (dentro de esta carpeta) las lee de `.env`; `npm start` usa las del entorno.
