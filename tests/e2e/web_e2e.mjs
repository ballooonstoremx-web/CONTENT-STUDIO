// End-to-end test of web/content-hq.html in a real Chromium.
// Usage: node tests/e2e/web_e2e.mjs <base_url> <fixtures_dir> <out_dir>
// Fixtures: photo.png (real image), clip.mp4 (real H.264 video).
// Runs two passes: local IndexedDB storage and a contract-shaped mock of the
// claude.ai runtime (db + assets + downloads) to exercise the hosted code path.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/opt/node22/lib/node_modules/playwright"); }
const [, , BASE, FIX, OUT] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
function fakeWeek(input, ver) {
  const re = /slot ([^ ]+) · [^·]+ · (reel|carrusel|story) · objetivo ([^ ]+)/g; let m; const out = [];
  while ((m = re.exec(input))) {
    const [, slot, type, objective] = m; const v = ver(slot);
    out.push({ slot, type, objective, title: `${type} ${slot}${v > 1 ? ` (v${v})` : ""}`, pillar: "Producto real", hook: "Hook de prueba corto", caption: "Copy de Instagram", caption_fb: "Copy de Facebook con enlace", cta: "Consulta el catálogo disponible en balloonstoreco.com", hashtags: ["#globos"],
      slides: type === "carrusel" ? [{ template: "portada", headline: "Portada QA", body: "" }, { template: "producto", headline: "Producto QA", body: "Detalle" }, { template: "cta", headline: "Cierre", body: "Catálogo" }] : [],
      shots: type === "reel" ? [{ duration: 3, text: "Toma 1", voice: "Voz 1", note: "", footage: "Video vertical del producto" }, { duration: 4, text: "Toma 2", voice: "Voz 2", note: "", footage: "Montaje real" }] : [],
      frames: type === "story" ? [{ text: "Story 1", sticker: "encuesta", note: "" }, { text: "Story 2", sticker: "", note: "" }] : [],
      materials: ["foto oficial"], needs: type === "reel" ? ["Video vertical del producto"] : [], verify: [] });
  }
  return { proposals: out };
}
const results = [];
const ok = (name, cond, detail = "") => { results.push({ name, pass: !!cond, detail }); if (!cond) console.error("FAIL", name, detail); else console.log("PASS", name); };

async function downloadVia(page, mode, captured, trigger) {
  if (mode === "local") {
    const [dl] = await Promise.all([page.waitForEvent("download"), trigger()]);
    const file = path.join(OUT, mode + "-" + dl.suggestedFilename());
    await dl.saveAs(file);
    return file;
  }
  const before = captured.length;
  await trigger();
  for (let i = 0; i < 100 && captured.length === before; i++) await page.waitForTimeout(100);
  const last = captured[captured.length - 1];
  const file = path.join(OUT, mode + "-" + last.filename);
  fs.writeFileSync(file, Buffer.from(last.data, "base64"));
  return file;
}

const MOCK = `(() => {
  const KEY = "__mockdb";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  const persist = d => localStorage.setItem(KEY, JSON.stringify(d));
  const col = name => {
    const api = {
      limit() { return api; },
      async get() { const d = load()[name] || {}; const docs = Object.entries(d).map(([id, v]) => ({ id, exists: true, data: () => JSON.parse(JSON.stringify(v)), metadata: {} })); return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: {} }; },
      doc(id) { return {
        id, path: name + "/" + id,
        async set(v) { if (v === null || typeof v !== "object") throw { code: "invalid_argument" }; const d = load(); d[name] = d[name] || {}; d[name][id] = JSON.parse(JSON.stringify(v)); persist(d); },
        async delete() { const d = load(); if (d[name]) delete d[name][id]; persist(d); },
        async get() { const v = (load()[name] || {})[id]; return { id, exists: !!v, data: () => v, metadata: {} }; } }; } };
    return api; };
  const db = { collection: col, doc: p => col(p.split("/")[0]).doc(p.split("/")[1]) };
  const toB64 = async blob => { const u8 = new Uint8Array(await blob.arrayBuffer()); let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const assets = {
    async upload(blob) { const id = await window.__assetUpload(await toB64(blob), blob.type); return { id, url: "/_blob/" + id, sizeBytes: blob.size, contentType: blob.type }; },
    async list() { return { assets: [], usage: {} }; },
    async delete(id) { await window.__assetDelete(id); return { deleted: true }; } };
  const downloads = { async save({ filename, data }) { const b = data instanceof Blob ? data : new Blob([data]); await window.__saveDownload(filename, await toB64(b)); return { status: "saved" }; } };
  window.__sampleCalls = [];
  window.__slotVer = {};
  function fakeWeek(input, ver) {
    const re = /slot ([^ ]+) · [^·]+ · (reel|carrusel|story) · objetivo ([^ ]+)/g; let m; const out = [];
    while ((m = re.exec(input))) {
      const [, slot, type, objective] = m; const v = ver(slot);
      out.push({ slot, type, objective, title: \`\${type} \${slot}\${v > 1 ? \` (v\${v})\` : ""}\`, pillar: "Producto real", hook: "Hook de prueba corto", caption: "Copy de Instagram", caption_fb: "Copy de Facebook con enlace", cta: "Consulta el catálogo disponible en balloonstoreco.com", hashtags: ["#globos"],
        slides: type === "carrusel" ? [{ template: "portada", headline: "Portada QA", body: "" }, { template: "producto", headline: "Producto QA", body: "Detalle" }, { template: "cta", headline: "Cierre", body: "Catálogo" }] : [],
        shots: type === "reel" ? [{ duration: 3, text: "Toma 1", voice: "Voz 1", note: "", footage: "Video vertical del producto" }, { duration: 4, text: "Toma 2", voice: "Voz 2", note: "", footage: "Montaje real" }] : [],
        frames: type === "story" ? [{ text: "Story 1", sticker: "encuesta", note: "" }, { text: "Story 2", sticker: "", note: "" }] : [],
        materials: ["foto oficial"], needs: type === "reel" ? ["Video vertical del producto"] : [], verify: [] });
    }
    return { proposals: out };
  }
  const sample = async (input, opts = {}) => { throw { code: "upstream_error", message: "text mode not used" }; };
  sample.limits = async () => ({ maxPromptBytes: 262144, images: { maxCount: 4, maxInputBytes: 20971520, mediaTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] } });
  sample.json = async (input, opts = {}) => {
    const imgs = opts.images ? [].concat(opts.images) : [];
    window.__sampleCalls.push({ input: String(input), images: imgs.length, imageTypes: imgs.map(b => b.type) });
    if (window.__sampleMode === "not_granted") throw { code: "not_granted", message: "declined" };
    if (String(input).includes("PIEZAS A PROPONER")) return fakeWeek(String(input), slot => (window.__slotVer[slot] = (window.__slotVer[slot] || 0) + 1));
    return JSON.parse(window.__aiFixture);
  };
  window.__mcpCalls = [];
  const mcp = { async listTools() { return { servers: [{ server: "Shopify", tools: [{ name: "search_products" }] }] }; },
    async callTool(server, tool, input) { window.__mcpCalls.push({ server, tool, input });
      return { content: [], payload: { data: { products: { edges: [
        { node: { handle: "numero-qa", title: '34 pulgadas Número QA 86 cm', vendor: "Anagram", productType: "Globo Metálico", status: "ACTIVE", priceRangeV2: { minVariantPrice: { amount: "47.0" } }, totalInventory: 9, variants: { edges: [{ node: { sku: "QA-002", price: "47.00", inventoryQuantity: 5 } }] } } },
        { node: { handle: "globo-nuevo-qa", title: "Globo Nuevo QA", vendor: "Anagram", productType: "Globo Metálico", status: "ACTIVE", variants: { edges: [{ node: { sku: "QA-NEW", price: "30.00", inventoryQuantity: 3 } }] } } },
        { node: { handle: "archivado-qa", title: "Archivado QA", status: "ARCHIVED", variants: { edges: [] } } }] } } } };
    } };
  const caps = { db, assets, downloads, sample, mcp };
  window.claude = { use: async n => (n in caps ? caps[n] : null) };
})();`;

async function run(mode) {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const captured = [];
  const assetsStore = new Map();
  const errors = [];
  if (mode === "cloud") {
    await context.exposeFunction("__assetUpload", (b64, type) => { const id = "a" + (assetsStore.size + 1).toString().padStart(31, "0"); assetsStore.set(id, { buf: Buffer.from(b64, "base64"), type }); return id; });
    await context.exposeFunction("__assetDelete", id => { assetsStore.delete(id); });
    await context.exposeFunction("__saveDownload", (filename, data) => { captured.push({ filename, data }); });
    await context.addInitScript(MOCK);
    await context.addInitScript(`window.__aiFixture = ${JSON.stringify(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "fixtures", "ai_reply.json"), "utf8"))};`);
    await context.route("**/_blob/*", route => { const id = route.request().url().split("/_blob/")[1]; const a = assetsStore.get(id); return a ? route.fulfill({ status: 200, body: a.buf, contentType: a.type }) : route.fulfill({ status: 404, body: "" }); });
  }
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const P = `[${mode}] `;
  await page.goto(BASE + "#panel");
  await page.waitForSelector("text=Panel de contenido");
  const info = await page.textContent("#storageInfo");
  ok(P + "storage backend", mode === "cloud" ? /Claude/.test(info) : /navegador/.test(info), info);

  // Seed examples -> dashboard
  await page.click("#seedBtn");
  await page.waitForSelector(".kanban .card");
  ok(P + "dashboard shows 4 status columns with items", (await page.$$(".kanban .col")).length === 4 && (await page.$$(".kanban .card")).length === 4);

  // Library upload with tags
  await page.goto(BASE + "#biblioteca");
  await page.setInputFiles("#filePick", [path.join(FIX, "photo.png"), path.join(FIX, "clip.mp4"), path.join(FIX, "logo.png")]);
  await page.waitForFunction(() => document.querySelectorAll(".mcard").length === 3, null, { timeout: 20000 });
  const cards = await page.$$(".mcard");
  for (const c of cards) {
    const name = await c.$eval("b", e => e.textContent);
    const tags = name.includes("logo") ? "logo" : name.includes("photo") ? "anagram, cumpleaños" : "montaje, látex sensacional";
    await c.$eval("[data-tags]", (e, v) => { e.value = v; e.dispatchEvent(new Event("change")); }, tags);
  }
  await page.waitForTimeout(400);
  await page.goto(BASE + "#panel");
  await page.waitForSelector("text=Panel de contenido");
  await page.goto(BASE + "#biblioteca");
  await page.waitForFunction(() => document.querySelectorAll(".mcard").length === 3);
  const optionTexts = await page.$$eval("#flt option", os => os.map(o => o.value));
  ok(P + "library upload + tags", optionTexts.includes("anagram") && optionTexts.includes("logo"), optionTexts.join(","));
  const videoMeta = await page.textContent(".media-grid");
  ok(P + "video duration probed", /Video · \d+\.\d s/.test(videoMeta));

  // Ideas
  await page.goto(BASE + "#ideas");
  await page.selectOption("#i_type", "todos");
  await page.click("#i_gen");
  const ideaCount = await page.$$eval("#i_list .idea", e => e.length);
  ok(P + "idea generator produces 6 ideas", ideaCount === 6);
  const types = await page.$$eval("#i_list .idea .chip:first-child", e => e.map(x => x.textContent));
  ok(P + "ideas cover reel/carrusel/stories", ["Reel", "Carrusel", "Stories"].every(t => types.includes(t)), types.join(","));
  await page.click("[data-save='0']");
  await page.waitForTimeout(200);

  // Hooks & copy on the example Reel
  await page.goto(BASE + "#copy");
  const reelId = await page.$$eval("#c_sel option", os => os.find(o => o.textContent.includes("Montaje en tiempo real")).value);
  await page.selectOption("#c_sel", reelId);
  await page.waitForSelector("#c_hooks .idea");
  ok(P + "10 hooks generated", (await page.$$("#c_hooks .idea")).length === 10);
  await page.click("[data-h='4']");
  await page.click("#c_s");
  await page.click("#c_c");
  const cap = await page.inputValue("#c_caption");
  ok(P + "copy generated with site + no price", cap.includes("balloonstoreco.com") && !/\$\s?\d/.test(cap));
  const dlCopy = await downloadVia(page, mode, captured, () => page.click("#c_dl"));
  ok(P + "copy .txt download", fs.readFileSync(dlCopy, "utf8").includes("HOOK"));

  // Carousel flow
  await page.goto(BASE + "#carrusel");
  await page.waitForSelector("#k_zip");
  ok(P + "carousel export blocked while product photo missing", await page.$eval("#k_zip", b => b.disabled) && (await page.textContent("#k_warn")).includes("Falta foto real"));
  const photoOpt = await page.$$eval(".slide:nth-child(3) [data-k='mediaId'] option", os => os.find(o => o.textContent.includes("photo")).value);
  await page.selectOption(".slide:nth-child(3) [data-k='mediaId']", photoOpt);
  await page.fill(".slide:nth-child(1) [data-k='headline']", "Checklist de cumpleaños QA");
  await page.waitForFunction(() => !document.querySelector("#k_zip").disabled);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, mode + "-carrusel.png") });
  const zipC = await downloadVia(page, mode, captured, () => page.click("#k_zip"));
  ok(P + "carousel ZIP downloaded", fs.statSync(zipC).size > 10000, zipC);

  // Reel flow with real media
  await page.goto(BASE + "#reel");
  await page.selectOption("#r_sel", reelId);
  await page.waitForSelector("#pickm .mcard");
  ok(P + "reel export blocked without real footage", await page.$eval("#r_zip", b => b.disabled));
  const picks = await page.$$("#pickm .mcard");
  for (const p of picks) await p.click();
  await page.waitForFunction(() => document.querySelectorAll("#shots .shot").length === 2);
  await page.fill("#shots .shot:nth-child(1) [data-k='text']", "Así se arma");
  await page.dispatchEvent("#shots .shot:nth-child(1) [data-k='text']", "change");
  await page.fill("#shots .shot:nth-child(1) [data-k='voice']", "Hoy armamos un arco con látex Sensacional");
  await page.dispatchEvent("#shots .shot:nth-child(1) [data-k='voice']", "change");
  await page.fill("#shots .shot:nth-child(2) [data-k='voice']", "Resultado final");
  await page.dispatchEvent("#shots .shot:nth-child(2) [data-k='voice']", "change");
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, mode + "-reel.png") });
  const zipR = await downloadVia(page, mode, captured, () => page.click("#r_zip"));
  ok(P + "reel ZIP downloaded", fs.statSync(zipR).size > 10000, zipR);

  // Calendar: give the generated idea a date
  await page.goto(BASE + "#calendario");
  const dateInput = await page.$("[data-date]");
  ok(P + "calendar lists unscheduled item", !!dateInput);
  const d = new Date(); const iso = d.toISOString().slice(0, 10);
  await dateInput.fill(iso);
  await dateInput.dispatchEvent("change");
  await page.waitForTimeout(400);
  ok(P + "calendar shows item on today", (await page.$$(".day.today .ev")).length >= 1);

  // Status change through editor
  await page.goto(BASE + "#panel");
  await page.click(".col:nth-child(1) .card");
  await page.selectOption("#e_status", "revision");
  await page.click("#editorForm button[value='ok']");
  await page.waitForTimeout(400);

  // Persistence after reload
  await page.reload();
  await page.waitForSelector("text=Panel de contenido");
  const counts = await page.$$eval(".stat b", b => b.map(x => +x.textContent));
  ok(P + "persistence: counts after reload", counts[4] === 3 && counts.slice(0, 4).reduce((a, b) => a + b, 0) === 5 && counts[2] === 2, counts.join(","));
  await page.goto(BASE + "#carrusel");
  await page.waitForSelector(".slide");
  const persistedHead = await page.inputValue(".slide:nth-child(1) [data-k='headline']");
  const persistedPhoto = await page.$eval(".slide:nth-child(3) [data-k='mediaId']", s => s.value);
  ok(P + "persistence: carousel edits + photo survive reload", persistedHead === "Checklist de cumpleaños QA" && !!persistedPhoto);
  await page.goto(BASE + "#reel");
  await page.selectOption("#r_sel", reelId);
  await page.waitForSelector("#shots .shot");
  ok(P + "persistence: reel shots survive reload", (await page.$$("#shots .shot")).length === 2 && (await page.inputValue("#shots .shot:nth-child(1) [data-k='voice']")).includes("arco"));
  await page.goto(BASE + "#biblioteca");
  await page.waitForFunction(() => document.querySelectorAll(".mcard img, .mcard video").length === 3, null, { timeout: 15000 });
  ok(P + "persistence: media files readable after reload", true);

  // Backup + restore
  await page.goto(BASE + "#respaldo");
  const bk = await downloadVia(page, mode, captured, () => page.click("#bk_json"));
  const bkj = JSON.parse(fs.readFileSync(bk, "utf8"));
  ok(P + "backup JSON has all items", bkj.items.length === 5 && bkj.media.length === 3);
  const bkz = await downloadVia(page, mode, captured, () => page.click("#bk_zip"));
  ok(P + "backup ZIP downloaded", fs.statSync(bkz).size > 10000);
  await page.setInputFiles("#bk_in", bk);
  await page.waitForTimeout(800);
  await page.goto(BASE + "#panel");
  ok(P + "restore is idempotent (no duplicates)", (await page.$$(".kanban .card")).length === 5);
  // ---- Hoy (daily home) ----
  await page.goto(BASE + "#hoy");
  await page.waitForSelector(".greet");
  ok(P + "hoy: greeting + 6 KPI rings", /Buen(os|as) (días|tardes|noches)/.test(await page.textContent(".greet")) && (await page.$$(".kpis .kpi")).length === 6);
  const todo = await page.$$eval("ol.todo li", l => l.map(x => x.textContent));
  ok(P + "hoy: attention list derived from data", todo.some(x => x.startsWith("Aprobar:")), todo.join(" | "));
  ok(P + "hoy: upcoming countdown with Mexican key dates", (await page.textContent(".soon")).includes("Fecha clave"));

  // ---- Campañas ----
  await page.goto(BASE + "#campanas");
  await page.fill("#cp_name", "Navidad QA");
  await page.fill("#cp_occ", "Navidad");
  await page.click("#cp_create");
  await page.waitForSelector(".countdown");
  ok(P + "campaign: countdown 14 days", (await page.textContent(".countdown b")).trim() === "14");
  await page.fill("#tk_text", "Pedir fotos reales de globos navideños");
  await page.click("#tk_form button");
  await page.waitForSelector("[data-tk]");
  await page.check("[data-tk]");
  await page.waitForSelector(".task.done");
  const linkVal = await page.$$eval("#lk_sel option", os => os.find(o => o.value && o.textContent.includes("Checklist")).value);
  await page.selectOption("#lk_sel", linkVal);
  await page.click("#lk_btn");
  await page.waitForSelector("[data-unlink]");
  ok(P + "campaign: runway with prep/publish bars + item dot", (await page.$$(".rw-row")).length === 1 && !!(await page.$(".rw-bar.prep")) && !!(await page.$(".rw-bar.pub")) && !!(await page.$(".rw-dot")));
  await page.screenshot({ path: path.join(OUT, mode + "-campanas.png"), fullPage: true });

  // ---- Estudio semanal ----
  await page.goto(BASE + "#estudio");
  await page.click("#sg_add");
  await page.waitForFunction(() => document.querySelectorAll(".scard").length === 5);
  await page.click(".scard:nth-child(1) [data-ep]");
  await page.waitForFunction(() => document.querySelector(".scard .ep").textContent.includes("Ep 2"));
  ok(P + "studio: series episode counter advances", true);
  await page.click("[data-step='2']");
  await page.waitForSelector(".week7");
  ok(P + "studio: episode scheduled in this week", (await page.textContent(".week7")).includes("Montaje en 60 segundos · Ep 1"));
  await page.click("[data-step='3']");
  await page.waitForSelector(".film-card");
  const film = await page.$("[data-film]:has-text('Ep 1')");
  ok(P + "studio: film mode card with script checklist", !!film && (await film.$$("[data-fc]")).length >= 5);
  await (await film.$("[data-fc]")).check();
  await page.waitForTimeout(300);
  await page.check("#filmMode");
  await page.waitForSelector("#stepBody.film");
  await page.screenshot({ path: path.join(OUT, mode + "-estudio.png") });

  // ---- Resultados ----
  await page.goto(BASE + "#resultados");
  await page.waitForSelector("[data-met]");
  for (const [k, v] of [["reach", "1000"], ["profile", "80"], ["clicks", "12"], ["dms", "3"], ["saves", "40"], ["shares", "10"]]) {
    const sel = `tbody tr:first-child [data-k='${k}']`;
    await page.fill(sel, v);
    await page.dispatchEvent(sel, "change");
    await page.waitForTimeout(150);
  }
  await page.waitForSelector(".leaktag");
  const leakStep = await page.$eval(".fstep.leak .eyebrow", e => e.textContent);
  ok(P + "results: biggest leak = profile visits (8%)", leakStep.includes("Visitas al perfil") && (await page.textContent(".insight")).includes("8.0%"), leakStep);
  ok(P + "results: conversion tiles", (await page.$$(".convs > div")).length === 3);
  const csv = await downloadVia(page, mode, captured, () => page.click("#csv"));
  const csvText = fs.readFileSync(csv, "utf8");
  ok(P + "results: CSV download", csvText.split("\n")[0].includes("reach") && csvText.includes("1000"));
  await page.screenshot({ path: path.join(OUT, mode + "-resultados.png"), fullPage: true });

  // ---- Persistence of new modules ----
  await page.reload();
  await page.goto(BASE + "#campanas");
  await page.waitForSelector(".countdown");
  ok(P + "persistence: campaign, done task and linked piece", !!(await page.$(".task.done")) && (await page.$$("[data-unlink]")).length === 1);
  await page.goto(BASE + "#estudio");
  await page.click("[data-step='1']");
  await page.waitForSelector(".scard");
  ok(P + "persistence: series + episode counter", (await page.$$(".scard")).length === 5 && (await page.textContent(".scard .ep")).includes("Ep 2"));
  await page.click("[data-step='3']");
  await page.waitForSelector(".film-card");
  ok(P + "persistence: film checklist state", (await page.$$(".fl.done")).length === 1);
  await page.goto(BASE + "#resultados");
  await page.waitForSelector(".leaktag");
  ok(P + "persistence: metrics", (await page.inputValue("tbody tr:first-child [data-k='reach']")) === "1000");
  await page.goto(BASE + "#respaldo");
  await page.waitForSelector("#bk_json");
  const bk2 = await downloadVia(page, mode, captured, () => page.click("#bk_json"));
  const bk2j = JSON.parse(fs.readFileSync(bk2, "utf8"));
  ok(P + "backup includes campaigns + series", bk2j.campaigns.length === 1 && bk2j.series.length === 5);

  // ---- Generar con IA ----
  const AI_FIXTURE = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "fixtures", "ai_reply.json"), "utf8");
  await page.goto(BASE + "#ia");
  await page.waitForSelector("#ai_product");
  await page.fill("#ai_product", "Estrella QA 45 cm (Anagram)");
  await page.fill("#ai_facts", "Medida: 45 cm. Forma: estrella. Material: foil metálico.");
  const aiPhoto = await page.$$eval("#ai_media option", os => os.find(o => o.textContent.includes("photo.png")).value);
  await page.selectOption("#ai_media", aiPhoto);
  await page.waitForSelector("#ai_thumb img");
  const prompt = await page.textContent("#ai_prompt");
  ok(P + "ai: prompt carries product, confirmed facts and brand rules", prompt.includes("Estrella QA 45 cm (Anagram)") && prompt.includes("Medida: 45 cm") && prompt.includes("No inventes") && prompt.includes("[confirmar con catálogo real]") && !/\$\s?\d/.test(prompt));
  if (mode === "local") {
    await page.waitForFunction(() => /claude\.ai/.test(document.querySelector("#ai_dhelp").textContent));
    ok(P + "ai: direct generation hidden outside claude.ai (assisted only)", await page.$eval("#ai_go", b => b.hidden));
    await page.fill("#ai_reply", "Aquí está tu JSON:\n```json\n" + AI_FIXTURE + "\n```");
    await page.click("#ai_import");
  } else {
    await page.waitForSelector("#ai_go:not([hidden])");
    await page.click("#ai_go");
  }
  await page.waitForFunction(() => document.querySelectorAll(".ai-prop").length === 3, null, { timeout: 15000 });
  ok(P + "ai: 3 proposals (reel, carrusel, stories) rendered", (await page.$$eval(".ai-prop > .row:first-child .chip:first-child", c => c.map(x => x.textContent))).sort().join(",") === "Carrusel,Reel,Stories");
  if (mode === "cloud") {
    const calls = await page.evaluate(() => window.__sampleCalls);
    ok(P + "ai: direct call sent prompt + 1 JPEG photo through sample.json", calls.length === 1 && calls[0].images === 1 && calls[0].imageTypes[0] === "image/jpeg" && calls[0].input.includes("Estrella QA"));
  }
  const flagged = await page.$$eval(".ai-prop .err", e => e.map(x => x.textContent));
  ok(P + "ai: brand check flags the invented price", flagged.length === 1 && flagged[0].includes("precio"), flagged.join("|"));
  await page.screenshot({ path: path.join(OUT, mode + "-ia.png"), fullPage: true });
  await page.click("#ai_saveall");
  await page.waitForFunction(() => document.querySelectorAll(".ai-prop [data-openp]").length === 3);
  const storyZip = await downloadVia(page, mode, captured, () => page.click(".ai-prop.t-story [data-storyzip]"));
  ok(P + "ai: Stories export ZIP with frames", fs.statSync(storyZip).size > 20000 && fs.readFileSync(storyZip).includes(Buffer.from("stories/01.png")));
  await page.click(".ai-prop.t-carrusel [data-openp]");
  await page.waitForSelector(".slide");
  const aiSlidePhoto = await page.$eval(".slide:nth-child(2) [data-k='mediaId']", s => s.value);
  ok(P + "ai: saved carousel uses the real photo on the product slide and can export", aiSlidePhoto === aiPhoto && !(await page.$eval("#k_zip", b => b.disabled)));
  const aiZip = await downloadVia(page, mode, captured, () => page.click("#k_zip"));
  ok(P + "ai: carousel from AI exports a ZIP", fs.statSync(aiZip).size > 10000);
  if (mode === "cloud") {
    await page.goto(BASE + "#ia");
    await page.evaluate(() => { window.__sampleMode = "not_granted"; });
    await page.waitForSelector("#ai_go:not([hidden])");
    await page.click("#ai_go");
    await page.waitForFunction(() => document.querySelector("#ai_go").hidden);
    ok(P + "ai: declined permission hides direct path and explains the assisted one", (await page.textContent("#ai_status")).includes("No diste permiso") && !!(await page.$("#ai_import")));
  }
  await page.reload();
  await page.goto(BASE + "#panel");
  await page.waitForSelector(".kanban");
  const aiCards = await page.$$eval(".kanban .col:nth-child(2) .card .t", c => c.map(x => x.textContent));
  ok(P + "ai: 3 AI drafts persist in Borradores after reload", ["Estrella QA: 4 montajes que sí se venden", "La estrella que cambia de color", "Encuesta: ¿estrella o corazón?"].every(t => aiCards.includes(t)), aiCards.join(" | "));
  await page.click(".kanban .card:has-text('Encuesta: ¿estrella o corazón?')");
  const notes = await page.inputValue("#e_notes");
  ok(P + "ai: draft notes keep source, flags and verification list", notes.includes("Propuesta generada con Claude") && notes.includes("menciona un precio"));
  await page.keyboard.press("Escape");

  // ---- Catálogo ----
  const photoB64 = fs.readFileSync(path.join(FIX, "photo.png")).toString("base64");
  const catFile = path.join(OUT, mode + "-catalog.json");
  const catProd = (id, title, handle, type, vendor, sku) => ({ id, title, handle, url: "https://balloonstoreco.com/products/" + handle, vendor, type, tags: ["QA"], skus: [{ sku, variant: "" }], description: "Producto de prueba.", images: [{ dataUrl: "data:image/png;base64," + photoB64, alt: title, width: 1080, height: 1350, sha256: "sha-" + handle }] });
  fs.writeFileSync(catFile, JSON.stringify({ app: "balloon-store-content-hq", kind: "catalog", fetchedAt: "2026-11-18", products: [
    catProd("shopify-1", "18\" Estrella QA 45 cm", "estrella-qa", "Globo Metálico", "Anagram", "QA-001"),
    catProd("shopify-2", "34\" Número QA 86 cm", "numero-qa", "Globo Metálico", "Anagram", "QA-002"),
    catProd("shopify-3", "9\" Látex QA 23 cm", "latex-qa", "Globo Látex", "Sensacional (Qualatex)", "QA-003")] }));
  await page.goto(BASE + "#catalogo");
  await page.setInputFiles("#cat_file", catFile);
  await page.waitForFunction(() => document.querySelectorAll(".cat-card img").length === 3, null, { timeout: 20000 });
  ok(P + "catalog: 3 verified products imported with official photo", (await page.$$(".cat-card")).length === 3);
  await page.fill("#cat_q", "QA-002");
  const visible = await page.$$eval(".cat-card:not([hidden]) b", e => e.map(x => x.textContent));
  ok(P + "catalog: search by SKU", visible.length === 1 && visible[0].includes("Número QA"), visible.join("|"));
  await page.setInputFiles("#cat_file", catFile);
  await page.waitForSelector(".toast:has-text('0 fotos nuevas')");
  ok(P + "catalog: re-import updates without duplicating photos", (await page.$$(".cat-card")).length === 3);
  await page.fill("#cat_q", "QA-002");
  await page.click(".cat-card:not([hidden]) [data-cat-lib]");
  await page.waitForSelector(".cat-card:not([hidden]) [data-cat-lib]:has-text('En Biblioteca')");
  await page.goto(BASE + "#hoy"); await page.goto(BASE + "#biblioteca");
  await page.waitForSelector(".mcard:has-text('numero-qa.jpg') img");
  ok(P + "catalog: official photo selectable in Biblioteca", true);
  if (mode === "cloud") {
    const db0 = JSON.parse(await page.evaluate(() => localStorage.getItem("__mockdb")));
    ok(P + "catalog: stored without price or inventory", !/price|inventory|precio/i.test(JSON.stringify(db0.catalog)));
    await page.goto(BASE + "#catalogo");
    await page.waitForSelector("#cat_live:not([hidden])");
    await page.fill("#live_q", "QA"); await page.click("#live_go");
    await page.waitForFunction(() => document.querySelectorAll("#live_out .idea").length === 2);
    const live = await page.textContent("#live_out");
    ok(P + "live Shopify: active results only, catalog match recognised", live.includes("En catálogo") && live.includes("Globo Nuevo QA") && !live.includes("Archivado"));
    const call = (await page.evaluate(() => window.__mcpCalls))[0];
    ok(P + "live Shopify: read-only search_products call", call.server === "Shopify" && call.tool === "search_products" && call.input.search_query === "QA");
    await page.click("#live_out [data-req]");
    await page.waitForSelector("#live_out .chip:has-text('Solicitado')");
    const db1 = JSON.parse(await page.evaluate(() => localStorage.getItem("__mockdb")));
    const req = Object.values(db1.requests || {});
    ok(P + "live Shopify: import request saved without price/stock", req.length === 1 && req[0].handle === "globo-nuevo-qa" && !/price|inventory/i.test(JSON.stringify(req)));
  }
  // Real video for one product, so its Reels count as ready
  await page.goto(BASE + "#hoy"); await page.goto(BASE + "#biblioteca");
  await page.waitForSelector(".mcard:has-text('clip.mp4') [data-tags]");
  await page.$eval(".mcard:has-text('clip.mp4') [data-tags]", e => { e.value = "estrella-qa, montaje"; e.dispatchEvent(new Event("change")); });
  await page.waitForTimeout(300);
  // IA picks a catalog product
  await page.goto(BASE + "#ia"); await page.waitForSelector("#ai_cat");
  await page.selectOption("#ai_cat", "shopify-1");
  await page.waitForFunction(() => document.querySelector("#ai_facts") && document.querySelector("#ai_facts").value.includes("QA-001"));
  ok(P + "ia: product from catalog fills name, SKU facts and official photo", (await page.inputValue("#ai_product")).includes("Estrella QA") && !!(await page.$("#ai_thumb img")));

  // ---- Fábrica semanal ----
  await page.goto(BASE + "#fabrica"); await page.waitForSelector(".fab-days");
  const slotTypes = await page.$$eval(".fab-slot b", e => e.map(x => x.textContent));
  ok(P + "fábrica: plan of 21 slots (7 Reels, 7 carruseles, 7 Stories)", slotTypes.length === 21 && ["Reel", "Carrusel", "Stories"].every(t => slotTypes.filter(x => x === t).length === 7));
  const weekPrompt = await page.textContent("#fab_prompt");
  ok(P + "fábrica: prompt uses real products, SKUs, library video and brand rules", weekPrompt.includes("QA-001") && weekPrompt.includes("clip.mp4") && weekPrompt.includes("No inventes") && (weekPrompt.match(/- slot /g) || []).length === 21 && !/\$\s?\d/.test(weekPrompt));
  const start = await page.inputValue("#fab_start");
  if (mode === "local") {
    await page.waitForFunction(() => /claude\.ai/.test(document.querySelector("#fab_help").textContent));
    await page.click("#fab_copy");
    await page.waitForTimeout(400);
    await page.reload(); await page.goto(BASE + "#hoy"); await page.goto(BASE + "#fabrica"); await page.waitForSelector("#fab_reply");
    await page.fill("#fab_reply", JSON.stringify(fakeWeek(weekPrompt, () => 1)));
    await page.click("#fab_import");
  } else {
    await page.waitForSelector("#fab_go:not([hidden])"); await page.click("#fab_go");
  }
  await page.waitForFunction(() => document.querySelectorAll(".pcard").length === 21, null, { timeout: 30000 });
  ok(P + "fábrica: 21 proposals on the batch board", true);
  const pmap = {}; for (const m of weekPrompt.matchAll(/\[(P\d+)\]\nProducto: (.+)/g)) pmap[m[1]] = m[2];
  const promptProd = Object.fromEntries([...weekPrompt.matchAll(/- slot ([^ ]+) · .*? · producto (P\d+)/g)].map(m => [m[1], pmap[m[2]]]));
  const boardProd = Object.fromEntries(await page.$$eval(".pcard", cs => cs.map(c => [c.dataset.slot, c.querySelector(".cat-meta").textContent])));
  ok(P + "fábrica: every piece keeps the product it was written for (after reload)", Object.keys(promptProd).length === 21 && Object.entries(promptProd).every(([k, v]) => boardProd[k] === v));
  const reelBadges = await page.$$eval(".pcard.t-reel .badge", e => e.map(x => x.textContent));
  ok(P + "fábrica: Reels without real video marked 'Falta grabación' (3 ready, 4 pending)", reelBadges.filter(x => x === "Material listo").length === 3 && reelBadges.filter(x => x === "Falta grabación").length === 4, reelBadges.join("|"));
  ok(P + "fábrica: carousels and Stories ready with official photo", (await page.$$(".pcard.t-carrusel .badge.ok, .pcard.t-story .badge.ok")).length === 14);
  // Regenerate one carousel
  const firstCar = await page.$eval(".pcard.t-carrusel", e => e.dataset.slot);
  await page.click(`.pcard[data-slot='${firstCar}'] [data-regen]`);
  await page.fill(`.pcard[data-slot='${firstCar}'] [data-note]`, "Más enfocado en XV años");
  await page.click(`.pcard[data-slot='${firstCar}'] [data-regengo]`);
  if (mode === "local") {
    await page.waitForSelector("#fab_ah:has-text('Regenerar 1 pieza')");
    const one = await page.textContent("#fab_prompt");
    ok(P + "fábrica: single-piece prompt carries the change request", (one.match(/- slot /g) || []).length === 1 && one.includes("Más enfocado en XV años"));
    await page.fill("#fab_reply", JSON.stringify(fakeWeek(one, () => 2)));
    await page.click("#fab_import");
  }
  await page.waitForSelector(`.pcard[data-slot='${firstCar}'] .ptitle:has-text('(v2)')`, { timeout: 15000 });
  ok(P + "fábrica: regenerated one piece in place", (await page.$$(".pcard")).length === 21);
  // Batch approval
  await page.click("#fb_ready");
  const readyLabel = await page.textContent("#fb_approve");
  ok(P + "fábrica: 'Solo las listas' selects 17", readyLabel.includes("(17)"), readyLabel);
  await page.check(".pcard.t-reel:has(.badge.pend) [data-sel]");
  await page.click("#fb_approve");
  await page.waitForFunction(() => document.querySelectorAll(".pcard.aprobada").length === 18, null, { timeout: 20000 });
  ok(P + "fábrica: 18 approved in one action", true);
  const weekZip = await downloadVia(page, mode, captured, () => page.click("#fb_zip"));
  const zb = fs.readFileSync(weekZip);
  ok(P + "fábrica: week ZIP separates listos/ and pendientes/ with summary", ["RESUMEN.csv", "listos/", "pendientes/", "PENDIENTE.txt", "slides/01.png", "stories/01.png", "instrucciones-capcut.md"].every(n => zb.includes(Buffer.from(n))));
  fs.copyFileSync(weekZip, path.join(OUT, mode + "-semana.zip"));
  await page.goto(BASE + "#calendario"); await page.waitForSelector(".cal");
  const evs = await page.$$eval(".cal .ev", e => e.map(x => x.textContent + "|" + x.className));
  ok(P + "calendar: approved pieces scheduled on their dates, pending one marked", evs.filter(x => x.includes(start)).length >= 3 && evs.some(x => x.includes(" pend")), String(evs.length));
  await page.goto(BASE + "#panel"); await page.waitForSelector(".kanban");
  const doneCol = await page.$$eval(".kanban .col:nth-child(4) .card .t", e => e.map(x => x.textContent));
  const draftMeta = await page.$$eval(".kanban .col:nth-child(1) .card .m, .kanban .col:nth-child(2) .card .m", e => e.map(x => x.textContent));
  ok(P + "tablero: ready pieces are Terminado; pending Reel is not", doneCol.filter(t => /^(carrusel|story|reel) \d{4}-/.test(t)).length === 17 && draftMeta.some(m => m.includes("Pendiente de material")));
  await page.reload();
  await page.goto(BASE + "#fabrica"); await page.waitForFunction(() => document.querySelectorAll(".pcard").length === 21, null, { timeout: 15000 });
  ok(P + "persistence: week board and approvals survive reload", (await page.$$(".pcard.aprobada")).length === 18);
  await page.screenshot({ path: path.join(OUT, mode + "-fabrica.png"), fullPage: true });
  // Results comparison
  await page.goto(BASE + "#resultados"); await page.waitForSelector("#cmp_by");
  await page.selectOption("tbody tr:has(input[data-k='reach'][value='1000']) [data-plat]", "Instagram");
  await page.waitForTimeout(300);
  await page.selectOption("#cmp_by", "platform");
  await page.waitForSelector("table.cmp td:has-text('Instagram')");
  ok(P + "results: comparison by platform with interaction rate", (await page.textContent("table.cmp")).includes("%"));

  await page.setViewportSize({ width: 390, height: 844 });
  for (const v of ["panel", "hoy", "campanas", "estudio", "resultados", "ia", "catalogo", "fabrica"]) {
    await page.goto(BASE + "#" + v);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(P + `no horizontal scroll at phone width (#${v})`, !overflow);
  }
  await page.goto(BASE + "#hoy");
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, mode + "-phone.png") });

  ok(P + "no page errors", errors.length === 0, errors.join(" | "));
  await browser.close();
  return { zipC, zipR, bkz };
}

const out = {};
for (const mode of ["local", "cloud"]) out[mode] = await run(mode);
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ results, files: out }, null, 2));
const failed = results.filter(r => !r.pass);
console.log(`${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
