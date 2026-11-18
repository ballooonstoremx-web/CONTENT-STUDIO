# Centro de inteligencia de marketing (Fase 1) y edición (inicio de Fase 2)

Prioridad: **investigar → aprender → guardar ideas → decidir → crear**. Content HQ no genera publicaciones en lote: primero se decide qué merece producirse.

## Pantallas nuevas (grupo «Investigar»)

| Pantalla | Ruta | Qué hace |
|---|---|---|
| Inteligencia | `#intel` | Resumen: contenidos analizados, competencia, inspiraciones, ideas, prioridades y memoria (decisiones y aprendizajes). |
| Resultados IG | `#analisis` | Análisis de Instagram por formato, tema, tipo de hook, franja horaria y día. Incluye periodos equivalentes, las piezas con más alcance y la metodología. |
| Diagnóstico | `#diagnostico` | «Qué estoy haciendo bien / Qué debo mejorar». Cada hallazgo lleva evidencia enlazada, nivel de confianza y datos faltantes. Termina con tres acciones para la semana. |
| Competencia | `#competencia` | Cuentas en 3 categorías. Cada una tiene observaciones fechadas (enlace, hook, estilo, métricas públicas con su fuente e idea adaptable) y se puede importar desde Metricool. |
| Inspiración | `#inspiracion` | Tablero tipo Pinterest con miniatura propia, categoría, etiquetas y notas. Estados: Guardar, Investigar, Adaptar, Producir y Descartar. Importa enlaces o `saved_posts.json`. |
| Banco de ideas | `#banco` | Ideas con hook, objetivo, público, producto real, referencia, guion, tomas, CTA, estado y prioridad. Se pueden editar, combinar, descartar y aprobar, y también generar con evidencia. |
| Calendario | `#calendario` | Mes visual con miniaturas reales. En computadora se arrastra para cambiar la fecha; en iPhone se ve como agenda con selector de fecha. Tiene filtros, cuadrícula de Instagram, indicadores y meta mensual. |
| Ficha | `#ficha` | Vista previa de la publicación con las diapositivas reordenables. Muestra hook, guion, copy y CTA editables, el producto, la referencia, el porqué y la evidencia. Acciones: Guardar, Solicitar cambios, Aprobar y Volver a editar. |
| Editor | `#disenar` | Diseño por capas: textos, fotos reales y formas. Se pueden mover, redimensionar y cambiar tipografía, color, fondo y orden. Tiene vista final y descarga en JPG. |

Colecciones nuevas, que no modifican las existentes: `competitors`, `inspo`, `ideabank`, `metrics`, `learnings` y `plans`. IndexedDB pasó a la versión 4 y solo agrega almacenes. El respaldo exporta y restaura también estas colecciones.

## Metricool (solo lectura)

El Artifact usa el conector del propietario. Llama solo a `getBrandSettings` y a `getAnalyticsDataByMetrics`, y nunca a herramientas que programen o publiquen; una prueba lo verifica.

Métricas verificadas en la marca Balloon Store el 18 de noviembre de 2026:

- **Reels (IGRE):** alcance, reproducciones, me gusta, comentarios, guardados, compartidos, interacciones, tiempo medio de visualización, retención a 3 s y tasa de salto.
- **Publicaciones (IGPO):** alcance, vistas, me gusta, comentarios, guardados, compartidos, interacciones y seguidores ganados por pieza.
- **Evolución (IGEV):** seguidores, seguidores ganados y perdidos, cuentas que interactuaron y alcance diario.
- **Clics en enlaces del perfil (`IGAC12`):** Metricool devolvió 0 filas, así que ese dato aparece como faltante.
- **Mensajes directos y ventas por publicación:** Metricool no los relaciona con cada pieza. La app no afirma que una pieza haya vendido.
- **Competidores (`IGCO`, `IGCP`, `IGCR`):** el conector puede leerlos, pero la marca no tiene competidores dados de alta en Metricool, y el conector no puede darlos de alta. Para tener datos verificables, agrégalos en Metricool › Competidores y pulsa «Importar desde Metricool».

## Cómo se calcula cada indicador

- Interacción = (me gusta + comentarios + guardados + compartidos) ÷ alcance × 100.
- Guardados y compartidos = (guardados + compartidos) ÷ alcance × 100.
- Retención a 3 s y tasa de salto: valores de Metricool por Reel.
- Se usan medianas para que un solo pico no distorsione el resultado.
- Confianza: alta con 10 piezas o más, media con 4 a 9 y baja con menos de 4.
- Hook: la primera línea del copy. El texto en pantalla del video no está en Metricool.
- Tema: se detecta por palabras del copy, y una pieza puede contar en varios temas.
- Periodos equivalentes: la ventana elegida (30, 45, 60 o 90 días hasta hoy) frente a la ventana inmediatamente anterior del mismo largo.
- El diagnóstico marca el contenido de terceros (copy con «Crédito: @…») para no atribuir ese alcance a la producción propia.

## Generación con evidencia (Claude, sin costo extra)

«Generar con evidencia» usa solo las fuentes que se marcan: hallazgos de métricas, inspiraciones en Investigar, Adaptar o Producir, y observaciones de competencia.

- **Cantidad:** se pide de 1 a 5 ideas.
- **Restricciones al generar:** no se copia, se usan solo productos del catálogo, no se inventan precios ni existencias, se citan los ids de las fuentes y se indican los datos que faltan.
- **Estado:** las ideas se guardan como «Nueva». Nada pasa al calendario sin aprobación.
- **Generación mensual automática:** no existe. Se configuraría solo con autorización explícita.

## Edición: qué es real hoy y qué falta (Fase 2)

- **Carruseles y Stories:** editor por capas propio. La vista previa, la vista final y el JPG salen del mismo motor de dibujo (`renderDesign`), así que lo descargado coincide con lo visto. El proyecto editable se guarda en `items.design`, y cualquier edición retira la aprobación.
- **Canva:** el conector de Canva de este entorno no conectó (proxy 403), por eso no hay integración comprobada.
- **Claude Design:** no hay una integración verificable desde el Artifact.
- **Reels y MP4:** todavía sin implementar. La ficha muestra guion y portada, y el video final se arma en CapCut. Análisis de viabilidad para la Fase 2, pendiente de prototipo:
  - En el navegador, WebCodecs más un muxer MP4 de npm, servido por jsDelivr, permitiría unir clips, recortarlos, añadir textos y portada, y exportar MP4 sin servicio externo. Es viable en Chrome o Edge y en Safari reciente. En iPhone puede ser lento para 1080×1920. Mezclar el audio original es posible y la música con licencia queda fuera.
  - Un servicio de renderizado en la nube cuesta y requiere autorización.
  - Efectos avanzados, audio en tendencia y subtítulos automáticos seguirían en CapCut, que no tiene API pública de edición.
