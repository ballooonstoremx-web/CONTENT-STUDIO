# Skills y herramientas de terceros: auditoría e instalación selectiva (20 nov 2026)

Proceso seguido, descrito en `skills/skill-auditor/SKILL.md`:

1. Clonar cada repositorio original en una carpeta temporal fuera del proyecto.
2. Ejecutar la revisión estática `python3 -I scripts/audit_skill.py`, que no ejecuta el código revisado.
3. Leer a mano los archivos señalados.
4. Comparar con lo que ya existe y clasificar.

Solo se copió lo que pasó la revisión y aporta una función nueva. Los originales quedan sin cambios, con licencia, commit y SHA-256 en `skills/third_party/manifest.json`. `tests/test_third_party.py` falla si alguien los modifica.

**Fuentes no consultables:** tododeia.com está bloqueado en la red de esta sesión. Por eso no se pudo verificar la ficha original de Matriz Viral, Brand Voice DNA ni Creative Architect.

## Tabla final

| Herramienta | Enlace original | Licencia | Clasificación | Instalación | Función | Resultado de la prueba | Uso desde Claude Code / Codex |
|---|---|---|---|---|---|---|---|
| Instagram Agent (13 skills) | [Jakeschincariol/instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill) @ d03c56b | MIT | Ya instalada (Claude) y adaptada | En Claude Code ya está como plugin de la organización (`instagram-agent:*`). Para Codex se copiaron 5 que no duplican nuestras skills: `ig-human`, `ig-caption`, `ig-viral`, `ig-profile`, `ig-reply`. Las 26 fórmulas y el puntuador de `ig-reel` pasaron a `reel-scriptwriter`. | Fórmulas de hook, revisión de copy, limpieza de señales de IA, swipe file por múltiplo, perfil, respuestas | Pruebas 1 y 2: las fórmulas sirven. El puntuador **no sirve en español**: sus diccionarios de tensión y especificidad están en inglés (máximo 36.3/100 con hooks válidos). Solo conviene usarlo para la longitud. | Claude: `/instagram-agent:ig-caption`. Codex: «usa la skill ig-caption». `voice.md` = `brand/BRAND-BRAIN.md` |
| Corey Haines Marketing Skills (8) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) @ 154fc7d | MIT | Instalada como nueva skill | `product-marketing`, `content-strategy`, `copywriting`, `copy-editing`, `cro`, `ab-testing` para Claude y Codex. `seo-audit` y `emails` solo para Codex, porque Claude ya tiene `marketing:seo-audit` y `marketing:email-sequence`. En la v2 cambiaron de nombre: product-marketing-context → product-marketing, page-cro → cro, email-sequence → emails, ab-test-setup → ab-testing. | Posicionamiento, estrategia, copy de páginas, edición, conversión, pruebas A/B, SEO y correos | Las 8 no tienen código. Claude Code las detectó al instante. Leen `.agents/product-marketing.md`, que solo apunta a `brand/`, así que no hay una segunda copia de la marca. | Claude: `/copywriting`, `/cro`… Codex: «usa la skill cro con brand/profile.json» |
| Claude Video Vision | [jordanrendric/claude-video-vision](https://github.com/jordanrendric/claude-video-vision) @ 4a4f990 | MIT | Necesita conexión externa | No instalada | Extrae fotogramas y audio de un MP4 para que Claude lo «vea» | Prueba 1 hecha con tus 5 capturas. El análisis del video completo quedó bloqueado por cuatro motivos: no hay MP4 autorizado; el servidor MCP se instala solo con `npx` al primer uso; pide Node 24 (aquí hay 22); y el audio requiere Gemini u OpenAI (clave de API) o Whisper local. | Requisitos para instalarla: tu autorización, un MP4 propio y el backend `local` (Whisper, sin costo) |
| Last 30 Days | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) @ 2623916 | MIT | Necesita conexión externa; no recomendable por ahora | No instalada | Tendencias de los últimos 30 días en Reddit, X, YouTube y otras fuentes | No probada. Tiene 559 archivos de código, `allowed-tools: Bash` sin límites, escribe en tu carpeta personal, espera más de 20 claves de API y usa dominios no permitidos en esta sesión. | — |
| Matriz Viral | tododeia.com (bloqueado) | Sin verificar | Sin verificar | No instalada | — | No se encontró un repositorio público | — |
| Content Researcher Writer | [content-research-writer](https://skills.sh/composiohq/awesome-claude-skills/content-research-writer) (ComposioHQ) | **Sin licencia** en el repositorio | Adaptar a la skill existente | No copiada: no se puede redistribuir | Investigar y redactar | Su función ya la cubren `content-researcher`, `content-strategy` y `copywriting` | `content-researcher` |
| Brand Voice DNA | tododeia.com (bloqueado) | Sin verificar | Ya cubierta | — | Voz de marca | Fuente única: `brand/BRAND-BRAIN.md` y `brand/profile.json` | Skill `brand-brain` |
| Competencia con Metricool | Conector de Metricool (claude.ai) | Servicio de la dueña | Ya instalada y funcional (solo lectura) | Conector existente y Artifact | Métricas propias y de competidores | Prueba 3 hecha con datos en vivo. Competidores: Metricool devuelve 0 filas porque no hay ninguno dado de alta. | Content HQ › Competencia / Semanal |
| Video Editor Architect | [Hainrixz/video-editor-architect](https://github.com/Hainrixz/video-editor-architect) @ 9989115 | MIT (Remotion con su propia licencia) | Requiere entorno de render; adaptar ideas | No instalada | Aprende un estilo de edición y genera `final-vN.mp4` | No probada completa. Está pensada para macOS o Windows con Apple Vision, whisper.cpp y Node 24, y trae `postinstall` y `.claude/settings.json`. **Se adoptan dos ideas**: el perfil de estilo y las versiones v1, v2… | — |
| Motion Architect | [Hainrixz/motion-architect](https://github.com/Hainrixz/motion-architect) @ c9d93d1 | MIT | Requiere entorno de render; no por ahora | No instalada | Motion graphics con Remotion | No probada. Usa `install.sh` y claves de Gemini, Groq u OpenAI. | — |
| Remotion Skills | [remotion-dev/skills](https://github.com/remotion-dev/skills) @ 6f55706 | El repositorio de skills **no trae licencia**; Remotion usa la Remotion License | Requiere entorno de render | No copiadas. Instalador oficial cuando se apruebe: `npx skills add remotion-dev/skills` | Buenas prácticas para crear y renderizar con Remotion | **Prueba 5 hecha:** Remotion 4.0.540 en la nube, instalado con `--ignore-scripts`, renderizó un MP4 H.264 de 1080×1920, 30 fps y 5 s en 26.6 s, sin costo (licencia de evaluación). | Solo después de confirmar la licencia (gratis hasta 3 empleados) |
| Creative Architect | tododeia.com (bloqueado) | Sin verificar | Sin verificar | No instalada | — | No se encontró un repositorio público | — |
| Programación de investigaciones | Tareas programadas de Claude Code (claude.ai/code) | Servicio de tu plan | Disponible; requiere autorización | No activada | Ejecutar el investigador semanal sin tener la app abierta | Ruta comprobada a mano: Metricool → informe en la base de la app | Pídelo: «activa el investigador semanal los lunes 8:00» |
| Revisión de skills y conectores | [Hainrixz/cyber-neo](https://github.com/Hainrixz/cyber-neo) (MIT) evaluado; **skill-auditor** propio creado | MIT / propio | Nueva skill propia | `skills/skill-auditor` y `scripts/audit_skill.py`, sin dependencias | Revisión estática antes de instalar | cyber-neo no se instaló porque concede `Bash(python3 *)`, demasiado amplio. El auditor propio revisó 10 repositorios y tiene su prueba. | Claude: `/skill-auditor`. Codex: «sigue skills/skill-auditor» |
| Verificación automatizada del código | GitHub Actions | — | Instalada | `.github/workflows/tests.yml` (solo lectura del repositorio) | Corre las pruebas en cada PR | Suite local en verde | Automático en PR |
| Persistencia del contexto | [Hainrixz/aprende-skill](https://github.com/Hainrixz/aprende-skill) (MIT) evaluado; **DECISIONES.md** creado | MIT / propio | Adaptado | `docs/DECISIONES.md`, `CLAUDE.md` (→ `AGENTS.md`) y `.agents/product-marketing.md` | Decisiones aprobadas compartidas entre Claude, Codex y ChatGPT | aprende-skill no se instaló porque sus hooks corren en cada sesión y escriben en tu carpeta personal | Se lee siempre vía AGENTS.md |

## Resultados de las pruebas obligatorias

**1. Analizar un Reel de referencia real.** Reel [instagram.com/reel/Df2dfn_JWSG](https://www.instagram.com/reel/Df2dfn_JWSG/) de @clarmstrong, analizado con las 5 capturas que enviaste el 18 nov.
- **Observaciones** (se ven en las capturas):
  - Abre con la burbuja «Reply to Cyd's comment».
  - Texto en pantalla: «Watch Claude build my monthly social plan».
  - Muestra un monitor con un calendario mensual con miniaturas, la cuadrícula de Instagram y botones de aprobar.
  - Subtítulos quemados: «it writes the caption for you in your brand voice».
  - El copy es una lista de beneficios y cierra con «link in bio».
  - Métricas públicas al momento de la captura: 310 me gusta, 18 comentarios, 8 reposts, 348 compartidos y 907 guardados.
- **Estructura:** responde un comentario → demostración grabada de la pantalla con el teléfono → beneficios → CTA al enlace.
- **Fórmula:** «Cold Open Demo» (n.º 18), clasificada a mano. El clasificador automático no reconoció la frase.
- **Suposiciones** (no comprobables):
  - que tener 2.9 veces más guardados que me gusta indique contenido útil o lead magnet;
  - que responder un comentario ayude a la distribución.
- **Bloqueo:** el análisis del video completo con Claude Video Vision requiere el MP4 y tu autorización.

**2. Tres hooks distintos basados en el análisis** (mecánica: demostración de algo útil):

| Fórmula | Hook |
|---|---|
| Cold Open Demo | «Mira cómo planeo los globos de un evento completo en una sola hoja.» |
| The Steal | «Róbate esta lista de compras para tu próximo arco de 3 metros.» |
| The Callout | «Decoradora: esta es la lista que siempre se te olvida antes de un evento.» |

`hookscore.py` les dio 36.3, 25.9 y 25.9. Es una limitación del puntuador en español, no del hook. La referencia válida es la retención a 3 s en Metricool.

**3. Evaluar un contenido publicado con métricas verificables.** Reel del 2 oct 2026, [DeAMNq9ivC8](https://www.instagram.com/reel/DeAMNq9ivC8/), consultado en vivo en Metricool el 20 nov 2026 (solo lectura).

| Métrica | Este Reel | Mediana de 52 Reels | Lectura |
|---|---|---|---|
| Alcance | 4,541 | 322.5 | 14× la mediana; 2.º Reel de la cuenta |
| Retención a 3 s | 60.6 % | 40.65 % | Muy por encima |
| Salto | 39.4 % | 59.35 % | Muy por debajo |
| Interacción (179 ÷ alcance) | 3.9 % | 1.96 % | 2× la mediana |
| Guardados + compartidos (58 + 31) | 1.96 % del alcance | 0.56 % | 3.5× la mediana |
| Tiempo medio | 9.0 s | — | — |

No hay datos de ventas ni de mensajes ligados a esta pieza.

**4. Adaptar una idea al catálogo real.** Producto [9" Globo Látex Surtido Perla Sensacional Qualatex 23 cm (Bolsa 50 pzas)](https://balloonstoreco.com/products/9-surtido-perla-sensacional-50pzas), `shopify-8086474883129`, SKU 74495, tomado de `catalog/catalog.json` (solo lectura).
- **Formato:** Reel.
- **Hook:** «Róbate esta lista de compras para tu próximo arco de 3 metros.»
- **Guion:**
  1. Arco terminado.
  2. La bolsa de látex perla y la lista en pantalla.
  3. Armado en time-lapse.
  4. CTA «Guárdalo y pide tu surtido por WhatsApp».
- **Dato por confirmar:** cuántas bolsas lleva un arco de 3 m (no está en la ficha). El hook no promete cifras que no estén en la ficha.

**5. Render MP4.** Remotion 4.0.540 en el entorno de la nube con su licencia de evaluación: MP4 H.264 de 1080×1920, 30 fps y 5 s, en 26.6 s, sin costo. El archivo de prueba no se sube a Git (regla del proyecto); está en la carpeta temporal de la sesión.

## Qué no se hizo
- No se instaló nada en tus computadoras.
- No se conectaron cuentas ni se pidieron claves.
- No se activaron servicios de pago ni tareas programadas.
- No se modificó Shopify, no se publicó contenido y no se tocó el repositorio Balloon Store Designer.

## Verificación de duplicados (24 nov 2026)

- **Nombres:** ninguno se repite. Claude Code ve 14 skills del repositorio y Codex 21. Las 14 compartidas son las mismas carpetas, enlazadas para ambos agentes. Las 7 que solo ve Codex (`ig-*`, `seo-audit`, `emails`) no están enlazadas para Claude, porque Claude ya las tiene en plugins de la organización (`instagram-agent:*`, `marketing:seo-audit`, `marketing:email-sequence`).
- **Funciones** (dónde podría haber cruce y cuál manda):

| Posible cruce | Decisión |
|---|---|
| `content-strategy` (Corey) frente a `content-researcher` (propia) | `content-strategy` es para sitio, blog y SEO, y su propia descripción remite «social» a otra skill. Las ideas para Instagram y Facebook de Balloon Store las hace `content-researcher`. |
| `ig-viral` (Codex) frente al Investigador semanal | El Investigador usa Metricool; `ig-viral` solo ordena un swipe file que capturas tú a mano. No calcula lo mismo ni reemplaza al Investigador. |
| `ig-caption` / `ig-human` frente a `reel-scriptwriter` y `carousel-designer` | Complementarias: las propias escriben el copy y las de Instagram lo revisan (corte antes del «más», hashtags, frases de IA). |
| `ab-testing` frente a `results-analyst` | `ab-testing` diseña experimentos y `results-analyst` lee resultados publicados. |
| `product-marketing` frente a `brand-brain` | Una sola fuente de marca. `.agents/product-marketing.md` solo apunta a `brand/` y una prueba falla si se convierte en copia. |
| Plugins `social-media-skills:*` (hook-writer, caption-writer, reels-script) en Claude | No los instaló este proyecto: son de la organización. Para Balloon Store usa las skills del repositorio, porque leen `brand/BRAND-BRAIN.md`. |

- **Funciones de la app:** las skills son instrucciones para los agentes; ninguna reemplaza ni duplica código de Content HQ.
