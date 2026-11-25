# Decisiones aprobadas y reglas vigentes

Memoria compartida para Claude Code, Codex y ChatGPT. Cada decisión la tomó la dueña o salió
de una instrucción suya en una fecha concreta. **Agrega entradas nuevas arriba y no reescribas
las anteriores:** si una decisión cambia, registra la nueva y marca la anterior como «sustituida».
En la app, la colección `learnings` («Memoria» en Inteligencia) guarda los aprendizajes de datos.
Este archivo guarda las decisiones de trabajo.

| Fecha | Decisión | Origen |
|---|---|---|
| 2026-11-20 | Instalar solo skills revisadas con `skill-auditor` que aporten una función nueva. Se copian sin modificar, con licencia y suma de verificación. | Indicación de la dueña |
| 2026-11-20 | Una sola fuente de marca para todas las herramientas: `brand/BRAND-BRAIN.md`, `brand/profile.json` y `catalog/catalog.json`. | Indicación de la dueña |
| 2026-11-20 | No instalar herramientas en las computadoras de la dueña. Se trabaja en el entorno de la nube. | Indicación de la dueña |
| 2026-11-19 | El investigador semanal no se programa solo. Para activarlo se necesita autorización expresa de una tarea programada de Claude Code. | Indicación de la dueña |
| 2026-11-18 | Investigar antes de producir. No generar publicaciones en lote: la dueña elige qué ideas se producen. | Indicación de la dueña |
| 2026-11-18 | Metricool es el sistema de programación. Content HQ investiga, diseña y aprueba. No conectar Planoly ni comprar herramientas nuevas. | Indicación de la dueña |
| 2026-11-18 | Las métricas se muestran solo con su fuente y su fecha. Nunca se afirma que una publicación generó ventas sin evidencia. | Indicación de la dueña |
| 2026-11-17 | Solo borradores. No publicar, programar, enviar mensajes a clientes ni modificar Shopify, Zoho, Omnisend o Meta Ads. | Indicación de la dueña |
| 2026-11-17 | El PR #2 de CONTENT-STUDIO no se fusiona sin aprobación. | Indicación de la dueña |
| 2026-11-17 | Usar solo fotos reales de productos; las imágenes generadas nunca sustituyen un producto. | `brand/BRAND-BRAIN.md` |

## Reglas para herramientas de video
- Remotion es gratuito para personas y para empresas de hasta 3 personas. Con 4 o más se necesita licencia de empresa. Antes de usarlo en producción hay que confirmar el tamaño del equipo.
- El render en la nube con servicios de pago (Shotstack, Creatomate, Remotion Lambda) requiere autorización de costo.
- No descargar ni republicar videos ajenos sin autorización.

## Aprobaciones y piezas incompletas (25 nov 2026, decisión de la dueña)

- **Aprobar es solo de la dueña.** Claude no cambia ideas ni piezas reales a «Aprobada» sin su confirmación.
- **Pruebas:** se hacen en una copia local o con el modo de prueba (`?prueba=1`).
  - En modo de prueba, «Aprobar» guarda una aprobación técnica separada (`testApproval`). Nunca escribe `approvedAt`.
  - El registro queda como «prueba técnica», no como «decisión».
  - El Banco de ideas muestra «Aprobación técnica de prueba · no es tu aprobación».
- **Piezas incompletas:** si una pieza tiene material pendiente (`pending`), se muestra como «Incompleta · falta material», con la lista exacta de fotos que faltan. No se puede aprobar ni marcar como publicada hasta completarla.
  - Solo se usan productos y fotos reales de Balloon Store. No se inventan fotos ni montajes.
- **Navegación:** cada pieza con referencia tiene el botón «Ver inspiración original», que abre la ficha dentro de Content HQ, y conserva el enlace a la publicación original.
