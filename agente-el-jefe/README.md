# Agente EL JEFE — paquete corregido

Asistente de ayuda de «¿Y si pasa hoy?». Sustituye al paquete anterior; conserva el mismo `id`, así que **actualiza** el agente existente en lugar de crear otro.

## Archivos
| Archivo | Contenido |
|---|---|
| `instrucciones.md` | **Fuente única** de lo que sabe EL JEFE (se edita aquí) |
| `reglas-chat-web.md` | Reglas extra solo para el chat de la página web (se suman a las instrucciones en el servidor) |
| `construir.js` | Genera lo siguiente a partir de lo anterior: `npm run agente` |
| `declarativeAgent_0.json` | **Generado.** Nombre, descripción, iniciadores e instrucciones (≈6.700 de 8.000 caracteres) |
| `manifest.json` | Manifiesto 1.0.8 con descripción propia |
| `color.png` (192×192), `outline.png` (32×32) | Iconos con el emblema del juego |
| `EL-JEFE-agente.zip` | Los cuatro archivos anteriores, listos para cargar |

## Qué se corrigió (historial)
1. **Instrucciones cortadas:** el original se truncaba a 8.000 caracteres a media frase y perdía emergencias, instalación y preguntas frecuentes. Ahora caben completas y la sección de **emergencias reales** va al principio, con protocolo detallado.
2. **Identidad:** ya no dice «Eres Guardian». Es **EL JEFE**, el único agente con IA del juego.
3. **Descripción:** se quitó la frase genérica de la plantilla y la afirmación «usa el manual», que no era cierta porque el agente no tenía el manual cargado.
4. **Iconos:** reemplazados los de plantilla por el emblema del juego.
5. Se corrigió «Guardian» → «Guardián» y se añadieron los hábitos de Calor y Sismo del banco actual.

## Cómo actualizar el agente
1. Edita `instrucciones.md` y ejecuta `npm run agente` (desde la raíz del proyecto). También regenera `servidor-jefe/prompt-jefe.md`.
2. Sube `version` en `manifest.json` (Copilot exige una versión nueva para reconocer el cambio).
3. Vuelve a comprimir `declarativeAgent_0.json`, `manifest.json`, `color.png` y `outline.png` en `EL-JEFE-agente.zip`.
4. Cárgalo en Copilot: conserva el mismo `id`, así que **actualiza** el agente existente.

## Pendiente de tu lado
- **Cargar el manual como conocimiento.** Las instrucciones resumen el juego, pero el agente no lee el manual por sí solo. Si quieres que lo consulte, sube [`docs/MANUAL_DE_USUARIO.md`](../docs/MANUAL_DE_USUARIO.md) a SharePoint u OneDrive y añádelo como fuente de conocimiento del agente.
- Los iniciadores de conversación se conservaron sin cambios.
