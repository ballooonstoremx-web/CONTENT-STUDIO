// Recorrido de la Fase 1: datos de métricas → diagnóstico → competencia → inspiración → idea → aprobar →
// calendario (arrastrar) → ficha → editor de diseño (mover, texto, fuente) → vista final y JPG → aprobar → persistencia.
// Usage: node tests/e2e/intel_e2e.mjs <base_url> <fixtures_dir> <out_dir>
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const [, , BASE, FIX, OUT] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
// Simulador de la capacidad «sample» (Claude) del runtime de claude.ai: devuelve respuestas fijas y registra los prompts.
await ctx.addInitScript(() => {
  window.__prompts = [];
  const smp = async () => ({ text: "Resumen de prueba" });
  smp.limits = async () => ({ images: true });
  smp.json = async (prompt, opts) => {
    window.__prompts.push({ prompt, images: !!(opts && opts.images && opts.images.length) });
    if (prompt.startsWith("Analiza una inspiración")) return { hook: "Mira cómo queda", estructura: "Resultado, proceso, cierre", tecnica: "Time-lapse", utilidad: "Enseña montaje", observaciones: ["Se ve una mesa decorada"], suposiciones: ["Probablemente usa música en tendencia"], confianza: "media", falta: "Métricas" };
    if (prompt.startsWith("Crea UNA idea")) return { hook: "Tu mesa en 3 pasos", objetivo: "educar", publico: "decoradoras", formato: "reel", producto_id: "no-existe", fotos_ids: [], tema: "Montaje", guion: "1. Resultado 2. Pasos", tomas: "Mesa vacía; mesa terminada", cta: "Guárdalo", por_que: "Tutorial útil", diferencia: "Usa nuestro producto", faltan: "Foto de mesa real" };
    if (prompt.startsWith("Edita la línea de tiempo")) { const m = prompt.match(/TOMAS: (\[.*\])/s); const t = JSON.parse(m[1]); return { shots: t.reverse().map(s => ({ mediaId: s.mediaId, in: s.in, dur: 1, text: "Corregido " + s.n })), hook: "Hook corregido", resumen: "Invertí el orden" }; }
    if (prompt.startsWith("Convierte UNA idea")) return { reel: { hook: "Reel de la idea", beats: [{ desc: "Resultado", texto_pantalla: "Mira", dur: 3 }, { desc: "Proceso", texto_pantalla: "Así", dur: 4 }] }, carrusel: { slides: [{ titulo: "Portada", texto: "" }, { titulo: "Paso 1", texto: "Uno" }, { titulo: "Paso 2", texto: "Dos" }, { titulo: "Guárdalo", texto: "balloonstoreco.com" }] }, story: { frames: [{ texto: "Hola", sticker: "" }, { texto: "¿Te gusta?", sticker: "Encuesta: Sí / No" }, { texto: "Ver más", sticker: "Enlace" }] }, copy: { instagram: "Copy IG", facebook: "Copy FB" }, email: { asunto: "Asunto de prueba", preheader: "Pre", cuerpo: "Cuerpo", cta: "Compra" } };
    if (prompt.includes("prepara la semana")) return { ideas: Array.from({ length: 5 }, (_, i) => ({ hook: "Idea semanal " + (i + 1), objetivo: "atraer", publico: "decoradoras", formato: "reel", producto_id: "", tema: "Tema", guion: "Guion", tomas: "Tomas", cta: "CTA", por_que: "Por qué", ref_urls: [] })), hooks: Array.from({ length: 10 }, (_, i) => ({ texto: "Hook " + (i + 1), tipo: "Pregunta", basado_en: "Referencia" })), plan_miercoles: { fecha: "", duracion_min: 90, bloques: [{ nombre: "Mesa", minutos: 30, tomas: [{ desc: "Toma 1", para: "Idea 1" }] }], materiales: ["Tripié"], notas: "Prueba" } };
    return {};
  };
  window.claude = { use: async n => (n === "sample" ? smp : null) };
});
const page = await ctx.newPage();
page.on("pageerror", e => errs.push(e.message));
await page.goto(BASE + "#respaldo"); await page.waitForSelector("#bk_in", { state: "attached" });
await page.setInputFiles("#bk_in", path.join(FIX, "seed.json")); await page.waitForTimeout(1200);
await page.goto(BASE + "#catalogo"); await page.waitForSelector("#cat_file", { state: "attached" });
await page.setInputFiles("#cat_file", path.join(FIX, "catalog.json")); await page.waitForTimeout(5000);
await page.goto(BASE + "#intel"); await page.waitForTimeout(600);
ok(/17/.test(await page.locator(".kpi").first().innerText()), "Inteligencia: 17 contenidos analizados");
await page.goto(BASE + "#analisis"); await page.waitForTimeout(600);
const at = await page.locator("main").innerText();
ok(/Por formato/.test(at) && /Hooks de Reels/.test(at) && /Cómo se calcula cada indicador/.test(at), "Mis resultados: formato, hooks y metodología");
await page.goto(BASE + "#diagnostico"); await page.waitForTimeout(600);
const dt = await page.locator("main").innerText();
ok(/Lo que estás haciendo bien/.test(dt) && /Tres acciones prioritarias/.test(dt) && /Datos faltantes/.test(dt), "Diagnóstico: hallazgos, acciones y datos faltantes");
ok(/contenido de otra cuenta/.test(dt), "Diagnóstico: advierte contenido de terceros");
ok(!/NaN|undefined/.test(dt), "Diagnóstico sin NaN ni undefined");
await page.locator("[data-learn]").first().click(); await page.waitForTimeout(300);
ok(await page.evaluate(() => S.learnings.length) === 1, "Aprendizaje guardado en memoria");
// competencia manual
await page.goto(BASE + "#competencia"); await page.waitForTimeout(400);
await page.click("#cp_add"); await page.fill("input[name=handle]", "@cuenta.prueba"); await page.fill("input[name=fol]", "1200"); await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(400);
await page.locator("[data-cobs]").first().click(); await page.fill("input[name=url]", "https://www.instagram.com/reel/PRUEBA/"); await page.fill("input[name=hook]", "Mira esto"); await page.fill("textarea[name=adapt]", "Mostrar el resultado primero"); await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(400);
ok(/Mira esto/.test(await page.locator("main").innerText()), "Competencia: observación con hook y enlace");
// Guardar inspiración: botón global, captura, sin duplicados, analizar, adaptar, búsqueda
await page.goto(BASE + "#hoy"); await page.waitForTimeout(400);
ok(await page.locator("#qsave").isVisible(), "Botón «+ Guardar inspiración» visible en el dashboard");
await page.click("#qsave"); await page.fill("input[name=url]", "https://www.instagram.com/decomesas/reel/INSP/?igsh=abc123");
ok(/Instagram · @decomesas · Reel/.test(await page.locator("#qs_det").innerText()), "Detecta plataforma, creador y tipo");
await page.selectOption("select[name=collection]", "Decoraciones"); await page.fill("input[name=tags]", "mesa, montaje"); await page.fill("textarea[name=notes]", "Referencia de mesa");
await page.setInputFiles("input[name=file]", path.join(FIX, "photo.png"));
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(1000);
ok(page.url().endsWith("#insp") && await page.locator("#ix_th img").count() === 1, "Guardada al instante con captura propia");
const n0 = await page.evaluate(() => S.inspo.length);
await page.click("#qsave"); await page.fill("input[name=url]", "https://instagram.com/reel/INSP?utm_source=ig_web_copy_link");
ok(/Ya guardaste este enlace/.test(await page.locator("#qs_det").innerText()), "Avisa de enlace duplicado antes de guardar");
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(600);
ok(await page.evaluate(() => S.inspo.length) === n0, "No crea duplicados");
await page.click("#ix_an"); await page.waitForTimeout(1200);
const ixt = await page.locator("main").innerText();
ok(/Observaciones/.test(ixt) && /Se ve una mesa decorada/.test(ixt) && /Suposiciones/.test(ixt) && /música en tendencia/.test(ixt), "Analizar con Claude separa observaciones y suposiciones");
ok(await page.evaluate(() => window.__prompts.some(p => p.prompt.startsWith("Analiza") && p.images)), "El análisis envía la captura");
await page.click("#ix_ad"); await page.waitForTimeout(1200);
const ad = await page.evaluate(() => S.ideabank.find(i => i.hook === "Tu mesa en 3 pasos"));
ok(ad && ad.status === "nueva" && ad.productId === "" && /no está en el catálogo/.test(ad.missing) && ad.refs[0].url.includes("INSP"), "Adaptar crea idea original en el banco, sin producto inventado");
await page.goto(BASE + "#inspiracion"); await page.waitForTimeout(500);
await page.fill("#in_q", "montaje"); await page.waitForTimeout(900);
ok(await page.locator(".pin").count() === 1, "Búsqueda por palabra/etiqueta");
await page.click("#in_clr"); await page.waitForTimeout(400); await page.selectOption("#in_cr", "@decomesas"); await page.waitForTimeout(400);
ok(await page.locator(".pin").count() === 1, "Filtro por creador");
await page.goto(BASE + "#guardar?u=" + encodeURIComponent("https://www.tiktok.com/@globos/video/123")); await page.waitForTimeout(800);
ok(/TikTok · @globos/.test(await page.locator("#qs_det").innerText()), "Enlace directo #guardar?u= abre el formulario prellenado");
await page.keyboard.press("Escape");
await page.evaluate(() => { S.inspId = S.inspo.find(x => /INSP/.test(x.url)).id; location.hash = "#insp" }); await page.waitForTimeout(600);
await page.click("#ix_manual"); await page.waitForTimeout(300);
await page.fill("input[name=hook]", "Hook de prueba"); await page.selectOption("select[name=format]", "carrusel");
const pid = await page.locator("select[name=productId] option").nth(1).getAttribute("value"); await page.selectOption("select[name=productId]", pid);
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(600);
await page.locator(".icard", { hasText: "Hook de prueba" }).locator("[data-bap]").click(); await page.waitForTimeout(300);
await page.locator(".icard", { hasText: "Hook de prueba" }).locator("[data-bpost]").click(); await page.waitForTimeout(300);
await page.evaluate(() => { const d = new Date(); document.querySelector("input[name=date]").value = isoD(new Date(d.getFullYear(), d.getMonth(), 10)) });
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(2500);
ok(page.url().endsWith("#ficha") && await page.locator(".strip .sl").count() === 3, "Ficha con 3 diapositivas");
const refOk = await page.locator("main a[href='https://www.instagram.com/decomesas/reel/INSP/']").count();
ok(refOk >= 1, "Ficha muestra la referencia original");
// calendario: arrastrar
await page.goto(BASE + "#calendario"); await page.waitForTimeout(1500);
const day = (n) => page.evaluate(n => { const d = new Date(); return isoD(new Date(d.getFullYear(), d.getMonth(), n)) }, n);
const d10 = await day(10), d12 = await day(12);
await page.locator(`.vday[data-day='${d10}'] .vpost`).first().dragTo(page.locator(`.vday[data-day='${d12}']`)); await page.waitForTimeout(1000);
ok(await page.locator(`.vday[data-day='${d12}'] .vpost`).count() === 1, "Calendario: arrastrar cambia la fecha");
await page.click("button[data-cm=grid]"); await page.waitForTimeout(800);
ok(await page.locator(".iggrid .cell").count() >= 1, "Cuadrícula de Instagram");
await page.click("button[data-cm=mes]"); await page.waitForTimeout(400);
await page.locator(`.vday[data-day='${d12}'] .vpost`).first().click(); await page.waitForTimeout(1200);
// ficha: reordenar diapositivas
const before = await page.evaluate(() => item(S.fichaId).design.slides.map(s => s.bg).join());
await page.locator("[data-mv='0:1']").click(); await page.waitForTimeout(800);
const after = await page.evaluate(() => item(S.fichaId).design.slides.map(s => s.bg).join());
ok(before !== after, "Ficha: cambiar orden de diapositivas");
await page.locator("[data-mv='1:-1']").click(); await page.waitForTimeout(800);
// editor
await page.click("#f_design"); await page.waitForTimeout(1500);
const box = page.locator(".lbox").nth(2); await box.scrollIntoViewIfNeeded(); await page.mouse.wheel(0, 200); await page.waitForTimeout(300);
const bb = await box.boundingBox(); const y0 = await page.evaluate(() => item(S.designId).design.slides[0].layers[2].y);
await page.mouse.move(bb.x + 20, bb.y + 10); await page.mouse.down(); await page.mouse.move(bb.x + 20, bb.y - 30, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(600);
ok(await page.evaluate(() => item(S.designId).design.slides[0].layers[2].y) < y0, "Editor: arrastrar mueve el texto");
await page.locator("#p_text").fill("Texto editado"); await page.selectOption("#p_font", "Bebas Neue"); await page.fill("#p_size", "90"); await page.locator("#p_size").dispatchEvent("change");
await page.waitForTimeout(1200);
await page.click("#e_final"); await page.waitForTimeout(2000);
ok(await page.locator("#fp_g img").count() === 3, "Vista final con 3 imágenes");
await page.keyboard.press("Escape");
const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#e_dl")]);
await dl.saveAs(path.join(OUT, "diseno.zip"));
await page.click("#e_back"); await page.waitForTimeout(1200);
await page.click("#f_ok"); await page.waitForTimeout(800);
await page.reload(); await page.waitForTimeout(1500);
const saved = await page.evaluate(() => { const i = S.items.find(x => x.ideaId); const t = i.design.slides[0].layers[2]; return { st: i.pubStatus, text: t.text, font: t.font, size: t.size } });
ok(saved.st === "aprobada" && saved.text === "Texto editado" && saved.font === "Bebas Neue" && saved.size === 90, "Persistencia: diseño editado y aprobado tras recargar");
// el editor dibuja lo mismo que exporta: compara la vista final con el JPG descargado
fs.writeFileSync(path.join(OUT, "saved.json"), JSON.stringify(saved));
// Investigador semanal: monitorear, investigar ahora (sin Metricool en esta vista), aprobar idea, historial
await page.goto(BASE + "#semanal"); await page.waitForTimeout(600);
await page.locator("[data-mon]").first().check(); await page.waitForTimeout(300);
await page.selectOption("#rs_day", "1"); await page.fill("#rs_hour", "08:30"); await page.locator("#rs_hour").dispatchEvent("change"); await page.waitForTimeout(300);
await page.click("#rs_go"); await page.waitForTimeout(2500);
const rt = await page.locator("main").innerText();
ok(/esta vista no puede consultarlo/.test(rt), "Informe: dice claramente que Metricool no estuvo disponible");
ok(/10 publicaciones de referencia/.test(rt) && /Solo hay \d+ referencia/.test(rt), "Informe: referencias con aviso cuando faltan datos (no las inventa)");
ok(await page.locator("[data-rapp]").count() === 5 && await page.locator(".hooks li").count() === 10, "Informe: 5 ideas y 10 hooks");
ok(/3 metas de la semana/.test(rt) && /Base: /.test(rt) && /Plan de grabación · miércoles/.test(rt), "Informe: metas con línea base y plan del miércoles");
ok(/no activada/.test(rt), "Programación: estado no activada, sin simular ejecuciones");
await page.locator("[data-rapp]").first().click(); await page.waitForTimeout(600);
ok(await page.evaluate(() => S.ideabank.some(i => i.source === "Investigador semanal" && i.status === "aprobada")), "Idea del informe aprobada y enviada al banco");
await page.click("#rs_go"); await page.waitForTimeout(2500); await page.reload(); await page.waitForTimeout(1500);
await page.goto(BASE + "#semanal"); await page.waitForTimeout(800);
ok(await page.locator("[data-rep]").count() === 2, "Historial: dos informes guardados tras recargar");
ok(await page.evaluate(() => S.settings.find(s => s.id === "researcher").hour) === "08:30", "Preferencia de horario guardada");
// Editor de Reel: material real, recortes, versiones, corrección por instrucción, exportación y proyecto de render
await page.goto(BASE + "#biblioteca"); await page.waitForTimeout(400);
await page.setInputFiles("#filePick", [path.join(FIX, "clip.mp4"), path.join(FIX, "photo.png")]); await page.waitForTimeout(3500);
const rid = await page.evaluate(async () => { const v = S.media.find(m => /clip\.mp4/.test(m.name)), p = S.media.find(m => /photo\.png/.test(m.name)); const it = newItem({ type: "reel", title: "Reel prueba", status: "borrador", hook: "Así se ve terminada", shots: [{ mediaId: v.id, in: 0.5, dur: 1.5, text: "Uno", voice: "", note: "" }, { mediaId: p.id, in: 0, dur: 1, text: "Dos", voice: "", note: "" }] }); await addItem(it); S.cur.reel = it.id; return it.id });
await page.goto(BASE + "#video"); await page.waitForTimeout(1500);
await page.fill("[data-vdur='0']", "1.2"); await page.locator("[data-vdur='0']").dispatchEvent("change"); await page.waitForTimeout(600);
ok(await page.evaluate(id => item(id).shots[0].dur, rid) === 1.2, "Editor de Reel: recorte guardado");
await page.fill("#v_note", "Primera versión"); await page.click("#v_save"); await page.waitForTimeout(600);
await page.fill("#v_ins", "invierte el orden y cambia los subtítulos"); await page.click("#v_ai"); await page.waitForTimeout(1200);
const afterAI = await page.evaluate(id => { const it = item(id); return { first: it.shots[0].text, hook: it.hook, versions: it.video.versions.map(v => v.note) } }, rid);
ok(afterAI.first === "Corregido 2" && afterAI.hook === "Hook corregido" && afterAI.versions.length === 3, "Corrección por instrucción aplicada y versión anterior conservada");
await page.locator("[data-vres='1']").click(); await page.waitForTimeout(800);
const restored = await page.evaluate(id => { const it = item(id); return { first: it.shots[0].text, n: it.video.versions.length } }, rid);
ok(restored.first === "Uno" && restored.n === 4, "Restaurar v1 sin perder las demás versiones");
const [dlv] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), page.click("#v_exp")]);
const vname = dlv.suggestedFilename(); await dlv.saveAs(path.join(OUT, vname));
ok(/\.(mp4|webm)$/.test(vname) && fs.statSync(path.join(OUT, vname)).size > 5000, "Exportación de video real desde el navegador: " + vname);
const [dlj] = await Promise.all([page.waitForEvent("download"), page.click("#v_json")]); await dlj.saveAs(path.join(OUT, "proyecto.json"));
const proj = JSON.parse(fs.readFileSync(path.join(OUT, "proyecto.json"), "utf8"));
ok(proj.format === "balloon-store-reel/1" && proj.shots.length === 2 && proj.shots[0].kind === "video", "Proyecto para render en la nube exportado");
// Una idea → todos los formatos, solo con idea aprobada
await page.evaluate(async () => { await saveDoc("ideabank", { id: "idea-pack", hook: "Idea para todo", objective: "educar", audience: "decoradoras", format: "reel", productId: "", topic: "Prueba", script: "Uno\nDos", shots: "", cta: "Guárdalo", why: "", evidence: "", missing: "", refs: [], status: "aprobada", priority: "media", createdAt: nowISO() }) });
await page.goto(BASE + "#banco"); await page.waitForTimeout(500);
await page.locator("[data-bpack='idea-pack']").click(); await page.waitForTimeout(300);
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(2500);
const pack = await page.evaluate(() => { const x = S.ideabank.find(i => i.id === "idea-pack"); const its = (x.pack && x.pack.items || []).map(item); return { st: x.status, types: its.map(i => i && i.type).sort().join(","), email: x.pack && x.pack.email.asunto, slides: its.find(i => i.type === "carrusel").design.slides.length, frames: its.find(i => i.type === "story").frames.length } });
ok(pack.types === "carrusel,reel,story" && pack.email === "Asunto de prueba" && pack.slides === 4 && pack.frames === 3 && pack.st === "produccion", "Una idea → Reel, carrusel editable, Stories, copy y email (borrador)");
ok(await page.evaluate(async () => { try { await ideaToEverything({ status: "nueva" }, today()); return false } catch (e) { return /aprueba/.test(e.message) } }), "No genera formatos de ideas sin aprobar");
// Estudio: Marca → Hooks → Semana → Todo
ok(page.url().endsWith("#flujo") && /Ideas aprobadas/.test(await page.locator("main").innerText()), "Tras crear los formatos se abre el paso 4 del Estudio");
await page.evaluate(() => { S.flowStep = 1; route() }); await page.waitForTimeout(600);
ok(/Tu marca/.test(await page.locator("main").innerText()), "Estudio paso 1: marca");
await page.click("#fl_next"); await page.waitForTimeout(1500);
ok(await page.locator("#fl_var figure").count() === 4, "Estudio paso 2: un hook en 4 estilos");
await page.click("#fl_next"); await page.waitForTimeout(800);
ok(await page.locator(".vday").count() === 7, "Estudio paso 3: tablero de la semana");
await page.click("#fl_next"); await page.waitForTimeout(600);
ok(/Email \(borrador, no se envía\)/.test(await page.locator("main").innerText()), "Estudio paso 4: formatos de la idea");
// iPhone: agenda y cambio de fecha
const ph = await b.newContext({ ...devices["iPhone 13"] }); const pp = await ph.newPage(); pp.on("pageerror", e => errs.push("iphone: " + e.message));
await pp.goto(BASE + "#respaldo"); await pp.waitForSelector("#bk_in", { state: "attached" }); await pp.setInputFiles("#bk_in", path.join(FIX, "seed.json")); await pp.waitForTimeout(800);
await pp.evaluate(async () => { const d = new Date(); const it = newItem({ type: "carrusel", title: "Prueba iPhone", status: "borrador", date: isoD(new Date(d.getFullYear(), d.getMonth(), 15)) }); await addItem(it) });
await pp.goto(BASE + "#calendario"); await pp.waitForTimeout(1000);
ok(await pp.locator(".agenda-day").count() === 1, "iPhone: calendario como agenda");
const d16 = await pp.evaluate(() => { const d = new Date(); return isoD(new Date(d.getFullYear(), d.getMonth(), 16)) });
await pp.locator("[data-date]").first().fill(d16); await pp.locator("[data-date]").first().dispatchEvent("change"); await pp.waitForTimeout(800);
ok(await pp.evaluate(d => S.items.find(i => i.title === "Prueba iPhone").date === d, d16), "iPhone: cambiar fecha desde la agenda");
for (const v of ["diagnostico", "inspiracion", "banco", "competencia", "analisis"]) { await pp.goto(BASE + "#" + v); await pp.waitForTimeout(600); const ow = await pp.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ow <= 1, `iPhone sin desbordamiento horizontal en #${v}`) }
ok(!errs.length, "Sin errores de página" + (errs.length ? ": " + errs.join(" | ") : ""));
await b.close();
process.exit(fails ? 1 : 0);
