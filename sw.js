const CACHE_NAME = 'aw139-companion-root-v74-offline-bar';
const PRECACHE = [
  "./shared/offline-status.js",
  "./dropdown/assets/dropdown-enhanced-7000.png",
  "./dropdown/assets/dropdown-offshore-6400.png",
  "./dropdown/assets/dropdown-offshore-6800.png",
  "./adc/",
  "./cata/",
  "./decolagem-offshore/",
  "./dropdown/",
  "./pouso-offshore/",
  "./rto/",
  "./wat/",
  "./dropdown/index.html",
  "./dropdown/app.js",
  "./dropdown/styles.css",
  "./dropdown/ddv7-fullscreen-fix.js",
  "./dropdown/ddv7-patch.js",
  "./dropdown/final-ui.js",
  "./assets/ubuntu.css",
  "./assets/fonts/ubuntu-400-latin-ext.woff2",
  "./assets/fonts/ubuntu-400-latin.woff2",
  "./assets/fonts/ubuntu-500-latin-ext.woff2",
  "./assets/fonts/ubuntu-500-latin.woff2",
  "./assets/fonts/ubuntu-500i-latin-ext.woff2",
  "./assets/fonts/ubuntu-500i-latin.woff2",
  "./assets/fonts/ubuntu-700-latin-ext.woff2",
  "./assets/fonts/ubuntu-700-latin.woff2",
  "./",
  "./README.md",
  "./adc/app.js",
  "./adc/app.js.bak",
  "./adc/base_pack_template_v3.json",
  "./adc/base_pack_template_v4.json",
  "./adc/base_pack_template_v5.json",
  "./adc/index.html",
  "./adc/theme.css",
  "./adc/sbcb_builtin_pack_v3.json",
  "./adc/sbcb_builtin_pack_v4.json",
  "./adc/sbcb_builtin_pack_v5.json",
  "./adc/sbcb_chart_p1.png",
  "./adc/sbcb_chart_p2.png",
  "./adc/sbfs_builtin_pack_v3.json",
  "./adc/sbfs_builtin_pack_v4.json",
  "./adc/sbfs_builtin_pack_v5.json",
  "./adc/sbfs_chart_p1.png",
  "./adc/sbfs_chart_p2.png",
  "./adc/sbgl_builtin_pack_v3.json",
  "./adc/sbgl_builtin_pack_v4.json",
  "./adc/sbgl_builtin_pack_v5.json",
  "./adc/sbgl_chart_p1.png",
  "./adc/sbgl_chart_p2.png",
  "./adc/sbjr_builtin_pack_v3.json",
  "./adc/sbjr_builtin_pack_v4.json",
  "./adc/sbjr_builtin_pack_v5.json",
  "./adc/sbjr_chart_p1.png",
  "./adc/sbjr_chart_p2.png",
  "./adc/sbme_builtin_pack_v3.json",
  "./adc/sbme_builtin_pack_v4.json",
  "./adc/sbme_builtin_pack_v5.json",
  "./adc/sbme_chart_p1.png",
  "./adc/sbme_chart_p2.png",
  "./adc/sbmi_builtin_pack_v3.json",
  "./adc/sbmi_builtin_pack_v4.json",
  "./adc/sbmi_builtin_pack_v5.json",
  "./adc/sbmi_chart_p1.png",
  "./adc/sbmi_chart_p2.png",
  "./adc/sbnf_builtin_pack_v3.json",
  "./adc/sbnf_builtin_pack_v4.json",
  "./adc/sbnf_builtin_pack_v5.json",
  "./adc/sbnf_chart_p1.png",
  "./adc/sbnf_chart_p2.png",
  "./adc/sbrj_builtin_pack_v3.json",
  "./adc/sbrj_builtin_pack_v4.json",
  "./adc/sbrj_builtin_pack_v5.json",
  "./adc/sbrj_chart_p1.png",
  "./adc/sbrj_chart_p2.png",
  "./adc/sbvt_builtin_pack_v3.json",
  "./adc/sbvt_builtin_pack_v4.json",
  "./adc/sbvt_builtin_pack_v5.json",
  "./adc/sbvt_chart_p1.png",
  "./adc/sbvt_chart_p2.png",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-32.png",
  "./assets/icon-512.png",
  "./assets/icon-source.png",
  "./assets/icon.svg",
  "./assets/icons.svg",
  "./cata/app.js",
  "./cata/index.html",
  "./cata/styles.css",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./pouso-offshore/index.html",
  "./pouso-offshore/app.js",
  "./pouso-offshore/styles.css",
  "./decolagem-offshore/index.html",
  "./decolagem-offshore/app.js",
  "./decolagem-offshore/styles.css",
  "./rto/README.md",
  "./rto/app.js",
  "./rto/assets/icon-180.png",
  "./rto/assets/icon-192.png",
  "./rto/assets/icon-32.png",
  "./rto/assets/icon-512.png",
  "./rto/assets/icon-source.png",
  "./rto/assets/icon.svg",
  "./rto/data/figure_4_54_engine_data.json",
  "./rto/data/figure_4_54_vector_geometry.json",
  "./rto/data/figure_4_54_vector_linework.json",
  "./rto/data/figure_4_56_engine_data.json",
  "./rto/data/figure_4_58_engine_data.json",
  "./rto/data/figure_4_68a_engine_data.json",
  "./rto/data/figure_4_92_engine_data.json",
  "./rto/data/figure_4_94_engine_data.json",
  "./rto/data/figure_4_94_reference.json",
  "./rto/data/figure_4_96_engine_data.json",
  "./rto/data/figure_4_96_reference.json",
  "./rto/data/figure_4_98_engine_data.json",
  "./rto/data/figure_4_98_reference.json",
  "./rto/docs/figure_4_58_center_right_corrected_reference_v17.png",
  "./rto/docs/figure_4_58_left_semantic_corrected_v15.png",
  "./rto/docs/figure_4_94_combined_fresh_v46.png",
  "./rto/docs/figure_4_94_semantic_fresh_v46.png",
  "./rto/docs/figure_4_94_vector_only_fresh_v46.png",
  "./rto/docs/figure_4_96_combined_fresh_v54.png",
  "./rto/docs/figure_4_96_semantic_audit_sheet_v56.png",
  "./rto/docs/figure_4_96_semantic_fresh_v54.png",
  "./rto/docs/figure_4_96_vector_precise_v55.png",
  "./rto/docs/figure_4_98_center_semantic_audit_v62.png",
  "./rto/docs/figure_4_98_left_semantic_audit_v62.png",
  "./rto/docs/figure_4_98_right_semantic_audit_v62.png",
  "./rto/docs/figure_4_98_semantic_audit_sheet_v62.png",
  "./rto/docs/figure_4_98_vector_exact_v62.png",
  "./rto/docs/page_s50_108a_figure_4_68a.png",
  "./rto/docs/page_s50_85_figure_4_54.png",
  "./rto/docs/page_s50_89_figure_4_56.png",
  "./rto/docs/page_s50_93_figure_4_58.png",
  "./rto/docs/page_s90_123_figure_4_92.png",
  "./rto/docs/page_s90_127_figure_4_94.png",
  "./rto/docs/page_s90_131_figure_4_96.png",
  "./rto/docs/page_s90_135_figure_4_98.png",
  "./rto/index.html",
  "./rto/manifest.webmanifest",
  "./rto/styles.css",
  "./dropdown/graphData.js",
  "./shared/home.js",
  "./shared/module-bridge.js",
  "./shared/module-layout.css",
  "./shared/omni-theme.css",
  "./shared/embedded-app.js",
  "./shared/embedded-app.css",
  "./shared/embedded-skin.css",
  "./shared/landing-oei.js",
  "./cat-a/",
  "./cat-a/index.html",
  "./backup/",
  "./backup/index.html",
  "./backup/bu-data.js",
  "./backup/bu-engine.js",
  "./backup/bu-ui.js",
  "./backup/charts/4C-3.webp",
  "./backup/charts/4C-4.webp",
  "./backup/charts/4C-5.webp",
  "./backup/charts/4C-5A.webp",
  "./backup/charts/4C-6.webp",
  "./confined/",
  "./confined/index.html",
  "./confined/ca-data.js",
  "./confined/ca-alt-data.js",
  "./confined/ca-after.js",
  "./confined/charts/4D-10.webp",
  "./confined/charts/4D-11.webp",
  "./confined/charts/4D-12.webp",
  "./confined/charts/4D-13.webp",
  "./confined/charts/4D-14.webp",
  "./confined/charts/4D-15.webp",
  "./confined/charts/4D-16.webp",
  "./confined/charts/4D-17.webp",
  "./confined/charts/4D-18.webp",
  "./confined/charts/4D-19.webp",
  "./confined/charts/4D-20.webp",
  "./confined/charts/4D-21.webp",
  "./confined/charts/4D-22.webp",
  "./confined/charts/4D-23.webp",
  "./confined/charts/4D-24.webp",
  "./confined/charts/4D-25.webp",
  "./confined/charts/4D-26.webp",
  "./confined/charts/4D-27.webp",
  "./confined/charts/4D-28.webp",
  "./confined/charts/4D-29.webp",
  "./confined/charts/4D-30.webp",
  "./confined/charts/4D-31.webp",
  "./confined/charts/4D-32.webp",
  "./confined/charts/4D-33.webp",
  "./confined/ca-engine.js",
  "./confined/charts/4D-4.webp",
  "./confined/charts/4D-5.webp",
  "./confined/charts/4D-6.webp",
  "./confined/charts/4D-6A.webp",
  "./confined/charts/4D-9.webp",
  "./vertical/",
  "./vertical/index.html",
  "./vertical/vt-data.js",
  "./vertical/vt-engine.js",
  "./vertical/vt-ui.js",
  "./vertical/charts/4A-3.webp",
  "./vertical/charts/4A-4.webp",
  "./vertical/charts/4A-5.webp",
  "./vertical/charts/4A-5A.webp",
  "./vertical/charts/4A-6.webp",
  "./vertical/vt-p1.js",
  "./vertical/vt-p2.js",
  "./pouso-confined/",
  "./pouso-confined/index.html",
  "./pouso-confined/cl-data.js",
  "./pouso-confined/pc-engine.js",
  "./pouso-confined/pc-ui.js",
  "./pouso-confined/charts/4H-4.webp",
  "./vertical/charts/4K-5.webp",
  "./vertical/charts/4K-6.webp",
  "./vertical/charts/4K-7.webp",
  "./vertical/charts/4K-8.webp",
  "./vertical/charts/4K-9.webp",
  "./vertical/charts/4K-10.webp",
  "./vertical/charts/4K-11.webp",
  "./vertical/charts/4K-12.webp",
  "./vertical/charts/4K-13.webp",
  "./vertical/charts/4K-14.webp",
  "./vertical/charts/4K-15.webp",
  "./vertical/charts/4K-16.webp",
  "./vertical/charts/4K-17.webp",
  "./vertical/charts/4K-18.webp",
  "./vertical/charts/4K-19.webp",
  "./vertical/charts/4K-20.webp",
  "./vertical/charts/4K-21.webp",
  "./vertical/charts/4K-22.webp",
  "./vertical/charts/4K-23.webp",
  "./vertical/charts/4K-24.webp",
  "./vertical/charts/4K-25.webp",
  "./vertical/charts/4K-26.webp",
  "./vertical/charts/4K-27.webp",
  "./vertical/charts/4K-28.webp",
  "./vertical/charts/4A-8.webp",
  "./vertical/charts/4A-9.webp",
  "./vertical/charts/4A-10.webp",
  "./vertical/charts/4A-11.webp",
  "./vertical/charts/4A-12.webp",
  "./vertical/charts/4A-13.webp",
  "./vertical/charts/4A-14.webp",
  "./vertical/charts/4A-15.webp",
  "./vertical/charts/4A-16.webp",
  "./vertical/charts/4A-17.webp",
  "./vertical/charts/4A-18.webp",
  "./vertical/charts/4A-19.webp",
  "./vertical/charts/4A-20.webp",
  "./vertical/charts/4A-21.webp",
  "./vertical/charts/4A-22.webp",
  "./vertical/charts/4A-23.webp",
  "./vertical/charts/4A-24.webp",
  "./vertical/charts/4A-25.webp",
  "./vertical/charts/4A-26.webp",
  "./vertical/charts/4A-27.webp",
  "./vertical/charts/4A-28.webp",
  "./vertical/charts/4A-29.webp",
  "./vertical/charts/4A-30.webp",
  "./vertical/charts/4A-31.webp",
  "./shortfield/",
  "./shortfield/index.html",
  "./shortfield/sf.css",
  "./shortfield/sf-data.js",
  "./shortfield/sf-engine.js",
  "./shortfield/sf-ui.js",
  "./shortfield/charts/4B-1.webp",
  "./shortfield/charts/4B-2.webp",
  "./shortfield/charts/4B-3.webp",
  "./shortfield/charts/4B-3A.webp",
  "./shortfield/charts/4B-4.webp",
  "./shortfield/charts/4B-5.webp",
  "./shortfield/charts/4B-6.webp",
  "./shortfield/charts/4B-6A.webp",
  "./shortfield/charts/4B-7.webp",
  "./shared/tiles.css",
  "./catb/",
  "./catb/index.html",
  "./catb/app-data.js",
  "./power-check/",
  "./power-check/index.html",
  "./power-check/app-data.js",
  "./ndl/",
  "./ndl/index.html",
  "./ndl/app-data.js",
  "./roc/",
  "./roc/index.html",
  "./roc/app-data.js",
  "./consumo/",
  "./consumo/index.html",
  "./consumo/app-data.js",
  "./teto-pairado/",
  "./teto-pairado/index.html",
  "./teto-pairado/app-data.js",
  "./teto-pairado/hl-data.js",
  "./teto-pairado/hl-engine.js",
  "./teto-pairado/hl-ui.js",
  "./teto-pairado/charts/4-43.webp",
  "./teto-pairado/charts/S50-4-37.webp",
  "./limitacoes/",
  "./limitacoes/index.html",
  "./limitacoes/app-data.js",
  "./shared/offshore-calc.js",
  "./shared/pwa.css",
  "./shared/pwa.js",
  "./styles.css",
  "./sw.js",
  "./wat/README.md",
  "./wat/app.js",
  "./wat/assets/icon-180.png",
  "./wat/assets/icon-192.png",
  "./wat/assets/icon-32.png",
  "./wat/assets/icon-512.png",
  "./wat/assets/icon-source.png",
  "./wat/assets/icon.svg",
  "./wat/assets/offshore_standard_chart_clip.png",
  "./wat/data/chart-schema.json",
  "./wat/data/clear-eapsoff-exact.json",
  "./wat/data/clear-eapson-exact.json",
  "./wat/data/clear-standard-exact.json",
  "./wat/data/confined-eapsoff-6400-exact.json",
  "./wat/data/confined-eapsoff-exact.json",
  "./wat/data/confined-eapson-6400-exact.json",
  "./wat/data/confined-eapson-exact.json",
  "./wat/data/confined-ibf-6400-exact.json",
  "./wat/data/confined-standard-6400-exact.json",
  "./wat/data/confined-standard-exact.json",
  "./wat/data/eaps-off-exact.json",
  "./wat/data/ibf-cleararea-exact.json",
  "./wat/data/ibf-confined-exact.json",
  "./wat/data/ibf-installed-exact.json",
  "./wat/data/sup90-clear-eapsoff-exact.json",
  "./wat/data/sup90-clear-eapson-exact.json",
  "./wat/data/sup90-clear-ibf-exact.json",
  "./wat/data/sup90-clear-standard-exact.json",
  "./wat/data/sup90-cleararea-stageA.json",
  "./wat/data/sup90-cleararea-stageB.json",
  "./wat/docs/Confined 6400 charts.pdf",
  "./wat/docs/WAC charts 6800.pdf",
  "./wat/docs/WAT enhanced.pdf",
  "./wat/docs/page-01.png",
  "./wat/docs/page-02.png",
  "./wat/docs/page-03.png",
  "./wat/docs/page-04.png",
  "./wat/docs/page-05.png",
  "./wat/docs/page-06.png",
  "./wat/docs/page-07.png",
  "./wat/docs/page-08.png",
  "./wat/docs/page-09.png",
  "./wat/docs/page-10.png",
  "./wat/docs/page-11.png",
  "./wat/docs/page-12.png",
  "./wat/docs/page-13.png",
  "./wat/docs/page-14.png",
  "./wat/docs/page-15.png",
  "./wat/docs/page-16.png",
  "./wat/docs/page-17.png",
  "./wat/docs/page-18.png",
  "./wat/docs/page-19.png",
  "./wat/docs/page-20.png",
  "./wat/docs/page-21.png",
  "./wat/docs/page-22.png",
  "./wat/docs/page-23.png",
  "./wat/docs/page-24.png",
  "./wat/docs/page-25.png",
  "./wat/docs/page-26.png",
  "./wat/docs/page-27.png",
  "./wat/docs/page-28.png",
  "./wat/docs/page-29.png",
  "./wat/docs/page-30.png",
  "./wat/docs/page-31.png",
  "./wat/docs/page-32.png",
  "./wat/docs/page-33.png",
  "./wat/docs/wat7000.pdf",
  "./wat/index.html",
  "./wat/manifest.webmanifest",
  "./wat/styles.css",
  "./wat/test_overlay_case.png"
];

// Arquivos sem os quais o app não abre: se um deles falhar, a instalação falha e a versão anterior continua.
const CORE = /(\/|\.(html|js|css|json|svg|webmanifest))$/i;

// Progresso do download offline, mostrado na tela inicial (shared/offline-status.js).
const progress = { state: 'idle', done: 0, failed: 0, total: 0 };
const precacheUrls = () => [...new Set(PRECACHE)];
async function broadcast() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  const msg = Object.assign({ type: 'offline-status', version: CACHE_NAME }, progress);
  clients.forEach((c) => c.postMessage(msg));
}
let lastBroadcast = 0;
function tick(force) {
  const now = Date.now();
  if (force || now - lastBroadcast > 150) { lastBroadcast = now; broadcast(); }
}
// Baixa a lista (ou só o que falta) para o cache desta versão, contando o progresso.
async function fill(urls) {
  const cache = await caches.open(CACHE_NAME);
  progress.state = 'downloading'; progress.total = precacheUrls().length;
  progress.done = progress.total - urls.length; progress.failed = 0; tick(true);
  const results = await Promise.allSettled(urls.map(async (url) => {
    try {
      // cache:'reload' ignora o cache HTTP do navegador, para não gravar cópias antigas na versão nova.
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (!response.ok) throw new Error(url + ' ' + response.status);
      await cache.put(url, response);
      progress.done++;
    } catch (e) { progress.failed++; throw e; } finally { tick(); }
  }));
  progress.state = progress.failed ? 'partial' : 'ready'; tick(true);
  return results;
}
async function status() {
  if (progress.state === 'downloading') return;
  const cache = await caches.open(CACHE_NAME);
  const have = new Set((await cache.keys()).map((r) => r.url));
  const urls = precacheUrls();
  const missing = urls.filter((u) => !have.has(new URL(u, self.registration.scope).href));
  progress.total = urls.length; progress.done = urls.length - missing.length; progress.failed = missing.length;
  progress.state = missing.length ? 'partial' : 'ready';
  return missing;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const urls = precacheUrls();
    const results = await fill(urls);
    // Imagens e PDFs que falharem são baixados depois (botão na tela inicial ou no primeiro uso com internet).
    const coreFailed = results.some((r, i) => r.status === 'rejected' && CORE.test(urls[i]));
    if (coreFailed) throw new Error('Falha ao baixar arquivos essenciais do app');
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Apaga só versões antigas deste site (inclusive os caches dos antigos service workers de /wat/ e /rto/).
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k.startsWith('aw139-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  if (type === 'OFFLINE_STATUS') event.waitUntil(status().then(() => broadcast()));
  if (type === 'OFFLINE_FILL') event.waitUntil(status().then((missing) => missing && missing.length ? fill(missing) : broadcast()));
});

// HTML, JS, CSS, JSON e SVG: rede primeiro (com limite de tempo) e cache como reserva offline.
// Imagens e PDFs pesados: cache primeiro.
const NETWORK_FIRST = /\.(html|js|css|json|svg|webmanifest)$/i;
const NETWORK_TIMEOUT_MS = 3500;

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
}

async function networkFirst(request) {
  // Pela URL: um Request de navegação não aceita opções extras.
  const network = fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' }).then((fresh) => {
    if (fresh.ok) putInCache(request, fresh.clone());
    return fresh;
  });
  network.catch(() => {});
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, null));
  let fresh = null;
  try {
    fresh = await Promise.race([network, timeout]);
    if (fresh && fresh.ok) return fresh;
  } catch (_) {}
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    return fresh || await network;
  } catch (error) {
    if (request.mode === 'navigate') {
      const offline = await caches.match('./offline.html', { ignoreSearch: true });
      if (offline) return offline;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const fresh = await fetch(request);
  putInCache(request, fresh.clone());
  return fresh;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const isNetworkFirst = request.mode === 'navigate' || url.pathname.endsWith('/') || NETWORK_FIRST.test(url.pathname);
  event.respondWith(isNetworkFirst ? networkFirst(request) : cacheFirst(request));
});
