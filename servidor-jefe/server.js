/**
 * Punto de entrada del servidor de EL JEFE.
 *
 * La página nunca ve la clave de la API: llama a este servidor y este llama a Claude. La clave se toma de la
 * variable de entorno `ANTHROPIC_API_KEY`, que lee el SDK por su cuenta; aquí nunca se lee ni se muestra.
 *
 * Uso:  node server.js [--dev]      (`--dev` publica también las pruebas del navegador en /__pruebas/)
 * Piezas: ver `lib/` (config, límite de uso, validación, chat, archivos, ensamblado).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { crearServidor } from './lib/app.js';
import { hayClave, leerConfig } from './lib/config.js';

const carpeta = path.dirname(fileURLToPath(import.meta.url));
const config = leerConfig(process.env, process.argv, carpeta);
const prompt = fs.readFileSync(path.join(carpeta, 'prompt-jefe.md'), 'utf8');

let cliente = null;
const servidor = crearServidor({
  config,
  prompt,
  cliente: () => (cliente ??= new Anthropic(config.urlApi ? { baseURL: config.urlApi } : undefined)),
  hayClave: () => hayClave(),
});

servidor.listen(config.puerto, () => {
  console.log(`EL JEFE: http://localhost:${config.puerto}  |  modelo ${config.modelo}  |  IA ${hayClave() ? 'activa' : 'SIN CLAVE (el chat usará respuestas predefinidas)'}`);
});
