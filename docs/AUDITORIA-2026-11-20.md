# Auditoría, referencias y avances (20 nov 2026)

## Fase A · Referencias analizadas

**Enlaces que no se pudieron abrir.** Las páginas no se pudieron leer porque la red de esta sesión no tiene esos dominios permitidos. No se afirma nada sobre lo que prometen.

- instagram.com/p/DfoGhl4s1xb
- nonlinear.lorenhogue.com
- thestartupmom.com
- canva.link
- justyn.ai
- theaotp.com
- tododeia.com

**Lo que se analizó con tus capturas (observado, no anunciado):**

| Referencia | Qué se ve | Qué adoptamos (sin copiar diseño ni textos) |
|---|---|---|
| «AI Marketer» de @aluncreative (Reel publicitario: 5,699 me gusta, 9,543 comentarios y 5,006 compartidos en tu captura) | Asistente en 4 pasos: **Brand** (colores, fuentes, banco de imágenes, «tus palabras»), **Hooks** (seis hooks sobre una sola toma, en varios estilos de texto), **Week** (tablero de 7 días con formato por pieza) y **Everything** («one idea, every channel»: carrusel de 10, Reel y Story; «reel first, the rest comes from it»). Pide comentar «TEAM». | Pantalla **Estudio** (`#flujo`) con los mismos 4 pasos, construida sobre lo que ya existía: marca de `profile.json`, banco de imágenes de la Biblioteca, hooks del banco y del investigador semanal, tablero semanal y «Una idea → todos los formatos». |
| Campaña VALTRA de @alluredesignsstudio_ | Una idea → mood board en Pinterest → prompts en ChatGPT → imágenes con Higgsfield (Nano Banana, Seedream) → animación con Kling o Seedance → montaje en CapCut. | El flujo «una idea → campaña» sí. La generación de imágenes y video con IA **no**: es de pago y la regla de marca prohíbe sustituir productos reales con imágenes generadas. |
| Planner mensual de @clarmstrong (capturas del 18 nov) | Calendario con miniaturas, cuadrícula de Instagram, aprobación y referencia «Inspired by» con métricas. | Ya existía desde el sprint anterior (Calendario, Ficha, banco de ideas con evidencia). |

## Lo que ya existía y se reutilizó

- **Inteligencia y análisis:** Inteligencia, Resultados IG, Diagnóstico, Competencia, Inspiración (guardar, analizar y adaptar), Banco de ideas e Investigador semanal (Metricool solo lectura, historial).
- **Planeación y diseño:**
  - Calendario mensual con miniaturas.
  - Ficha de publicación.
  - Editor de diseño por capas para carruseles y Stories (lo que se ve es lo que se descarga).
  - Reel con tomas reales y paquete CapCut.
- **Skills y memoria:** skills propias y de terceros revisadas (`docs/SKILLS-TERCEROS.md`), memoria de decisiones (`docs/DECISIONES.md`).

## Lo que se mejoró en este sprint

1. **Estudio (`#flujo`)**, en 4 pasos:
   - Marca: colores, tipografías, banco de imágenes y tus palabras.
   - Hooks: un hook en 4 estilos sobre la misma foto.
   - Semana: tablero de 7 días con arrastrar y soltar.
   - Todo.
2. **«Una idea → todos los formatos»:** solo con ideas aprobadas, crea en borrador un Reel (guion por beats y tomas pendientes), un carrusel ya editable por capas, Stories con stickers sugeridos, copy de Instagram y Facebook, y un **email solo como borrador**: no se envía ni toca Omnisend. Funciona con Claude dentro del Artifact o con una plantilla sin IA.
3. **Editor de Reel (`#video`)**, un editor real y no un ZIP de instrucciones:
   - Vista previa de las tomas reales en un canvas, con recortes (inicio y duración), orden, subtítulos con estilo, hook en pantalla y portada en JPG.
   - **Exportación de video desde el navegador:** MP4 cuando el navegador lo permite (probado: MP4 H.264 + AAC, 1080×1920), si no WebM.
   - **Versiones:** v1, v2… con nota. Se puede restaurar cualquiera sin perder las demás.
   - **Corrección por instrucción:** Claude edita la línea de tiempo con las tomas existentes y guarda antes la versión anterior.
   - **Proyecto para render en la nube:** un JSON.
4. **Render en la nube con FFmpeg** (`scripts/render_reel.py`), gratis y sin depender de tus computadoras:
   - Convierte ese JSON y tus archivos en un MP4 1080×1920 H.264/AAC.
   - Las fotos de producto quedan completas sobre fondo beige, sin márgenes blancos.
   - Agrega subtítulos con saltos de línea y el hook en los primeros 2.5 s.
   - Probado con fotos reales del catálogo (Orbz y Látex Surtido Perla).
5. **Pruebas automáticas:** 47 en verde, que cubren editor, versiones, corrección, exportación, formatos, Estudio y render.

## Qué se instaló y probó

- **Skills:** las 8 de marketing (MIT) y 5 de Instagram Agent para Codex (MIT), más `skill-auditor`. Ver `docs/SKILLS-TERCEROS.md`.
- **Remotion 4.0.540:** evaluado en la nube (MP4 1080×1920, sin costo, licencia de evaluación). No se adopta como motor principal mientras no se confirme el tamaño del equipo. Se eligió **FFmpeg** porque es libre y no tiene esa condición.
- **Tarea programada de Claude Code (prueba única, 20 nov 02:35 UTC):** se ejecutó en la nube sin la app abierta y **guardó el informe en la base de la app** (`reports/rep-prueba-programada-20261120`). Lo que **falló** fue Metricool: la sesión programada no tenía el conector y respondió «No matching deferred tools found». La causa es que una tarea creada desde esta sesión no hereda conectores. Tu rutina de correo, creada desde claude.ai, sí trae Metricool entre sus conectores. Conclusión: la ejecución sin la app abierta funciona. Para que lea Metricool, la rutina semanal debe crearse desde claude.ai › Rutinas con el conector de Metricool activado.

## Pendiente

- **Ejecución recurrente real:** una tarea creada desde una sesión sin conectores no lleva Metricool. Para el investigador semanal automático, la rutina debe crearse desde claude.ai (Rutinas) con el conector de Metricool, o desde una sesión que lo tenga.
- **Material propio:** subir clips reales a la Biblioteca para producir Reels; la app no genera videos ficticios.
- **Competidores en Metricool:** darlos de alta para tener métricas de competencia verificables.
- **Referencias bloqueadas:** permitir sus dominios si quieres un análisis de las páginas además de las capturas.
- **Claude Video Vision:** requiere Node 24 y un backend de audio. Pendiente de tu autorización y de un MP4 propio.

## Lo que no se puede lograr gratis

- Generar imágenes o video con IA: Higgsfield, Kling, Seedance y Midjourney.
- Render en la nube con servicios dedicados: Shotstack (unos USD 0.20–0.30 por minuto), Creatomate (desde USD 41–54 al mes) y Remotion Lambda (licencia y AWS).
- Remotion en producción si Balloon Store tiene 4 personas o más (licencia de empresa).
- Métricas de cuentas ajenas sin Metricool. El scraping no es una fuente autorizada.

## Cómo usar cada función nueva

- **Estudio:** menú Planear › Estudio. Recorre Marca → Hooks → Semana → Todo. En «Todo», pulsa «Una idea → todos los formatos» en una idea aprobada.
- **Una idea → formatos:** también desde el Banco de ideas, con el botón «Todos los formatos» en ideas aprobadas. Revisa cada pieza en el Calendario o en su Ficha y apruébala ahí.
- **Editor de Reel:**
  1. En Crear › Reel, elige las tomas reales.
  2. Pulsa «Vista previa y video», o entra por Crear › Editor de Reel.
  3. Ajusta inicio y duración, subtítulos, estilo y portada.
  4. Pulsa «Guardar versión».
  5. «Exportar video» graba el resultado en tiempo real.
  6. Para una corrección, escribe la instrucción y pulsa «Aplicar corrección».
- **MP4 garantizado en la nube:** descarga «Proyecto para render en la nube» y pide a Claude Code: «renderiza este proyecto con scripts/render_reel.py». Comparte también tus archivos.

## Verificación del 24 nov 2026
- **Prueba programada.** Evidencia: transcripción de la sesión `session_01PpyLmiVuhGGG7FgJzLb3qZ` (origen `scheduled_trigger`, 02:35:03–02:35:26 UTC) y documento `reports/rep-prueba-programada-20261120` (versión 1, escrito 02:35:21 UTC).
  - Se ejecutó sin la app abierta.
  - **No tuvo Metricool:** `ToolSearch` respondió «No matching deferred tools found» dos veces y la tarea no lleva conectores (`mcp_connections: []`).
  - Sí guardó el informe, con ese error registrado.
  - La tarea ya no se repetirá (`ended_reason: run_once_fired`, desactivada).
  - **No se crearán más tareas programadas** hasta que la rutina se cree desde claude.ai › Rutinas con el conector de Metricool.
- **Error encontrado y corregido en el Editor de Reel.** Con proyectos de solo fotos, la exportación del navegador grababa menos de 1 segundo: Chrome deja de emitir cuadros de un canvas fuera del documento. Ahora el canvas se coloca en el documento, se envía cada cuadro y se agrega una pista de audio silenciosa. Resultado: 7.76 s, 450 cuadros, con audio. Una prueba automática cubre este caso.
- **Las fotos en el navegador ahora coinciden con el render en la nube:** producto completo sobre beige, sin márgenes, y hook con contorno legible.
- **Proyecto de ejemplo en Content HQ:** `items/reel-ejemplo-fotos-reales`, con 3 fotos reales de tu Biblioteca (Número 34" Rosa Gold, Estrella iridiscente pastel, Tie Dye Happy Birthday) y la versión v1 guardada.
