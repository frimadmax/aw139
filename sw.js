const CACHE_NAME = 'aw139-companion-root-v44';
const PRECACHE = [
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
  "./rto/sw.js",
  "./dropdown/graphData.js",
  "./shared/home.js",
  "./shared/module-bridge.js",
  "./shared/module-layout.css",
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
  "./wat/sw.js",
  "./wat/test_overlay_case.png"
];

// Arquivos sem os quais o app não abre: se um deles falhar, a instalação falha e a versão anterior continua.
const CORE = /(\/|\.(html|js|css|json|svg|webmanifest))$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Sem repetidos: cache.addAll rejeita a lista inteira se houver URL duplicada.
    const urls = [...new Set(PRECACHE)];
    const results = await Promise.allSettled(urls.map(async (url) => {
      // cache:'reload' ignora o cache HTTP do navegador, para não gravar cópias antigas na versão nova.
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (!response.ok) throw new Error(url + ' ' + response.status);
      await cache.put(url, response);
    }));
    // Imagens e PDFs que falharem são baixados depois, no primeiro uso com internet.
    const coreFailed = results.some((r, i) => r.status === 'rejected' && CORE.test(urls[i]));
    if (coreFailed) throw new Error('Falha ao baixar arquivos essenciais do app');
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
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
