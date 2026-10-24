/* ADC online: busca a carta do aeródromo no AISWEB (via worker intermediário) ou abre um PDF do DECEA,
 * lê pista, distâncias declaradas e taxiways (AdcDetect) e monta uma base no formato das bases offline.
 * Nada daqui vai para o cache offline: as bases online ficam só na memória da página. */
(function (root) {
  'use strict';
  const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/';
  const RENDER_SCALE = 3;                                    // carta renderizada a 3x (pontos -> pixels)
  const DEFAULT_WORKER = '';                                 // endereço do worker do AISWEB (workers.dev)
  const packs = {};                                          // bases online desta sessão, por ICAO
  let pdfjsPromise = null;

  function workerUrl() {
    let u = DEFAULT_WORKER;
    try { u = localStorage.getItem('aw139_aisweb_worker') || u; } catch { /* sem storage */ }
    return String(u || '').replace(/\/+$/, '');
  }

  function loadPdfjs() {
    if (!pdfjsPromise) {
      const base = root.AW139_PDFJS_BASE || PDFJS;
      pdfjsPromise = import(base + 'pdf.min.mjs').then(lib => {
        lib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs';
        return lib;
      }).catch(e => { pdfjsPromise = null; throw new Error('Não consegui carregar o leitor de PDF (precisa de internet).'); });
    }
    return pdfjsPromise;
  }

  // ---------- AISWEB ----------
  const textOf = (el, tag) => (el.getElementsByTagName(tag)[0]?.textContent || '').trim();
  async function fetchText(path) {
    const w = workerUrl();
    if (!w) throw new Error('Busca online ainda não configurada (falta o endereço do AISWEB).');
    const r = await fetch(w + path);
    if (!r.ok) throw new Error(`AISWEB respondeu ${r.status}.`);
    return r.text();
  }
  async function findAdc(icao) {
    const xml = new DOMParser().parseFromString(await fetchText(`/cartas?icao=${icao}`), 'application/xml');
    const items = [...xml.getElementsByTagName('item')].map(it => {
      const link = [...it.children].map(c => c.textContent.trim()).find(t => /^https?:\/\//i.test(t)) || '';
      return { tipo: textOf(it, 'tipo'), nome: textOf(it, 'nome'), dt: textOf(it, 'dt'), link };
    }).filter(it => it.link && (!it.tipo || /^ADC$/i.test(it.tipo)));
    if (!items.length) throw new Error(`Nenhuma carta ADC de ${icao} no AISWEB.`);
    // a mais recente; entre iguais, a de nome "ADC" puro (as outras páginas são complementares)
    items.sort((a, b) => String(b.dt).localeCompare(String(a.dt)) || a.nome.length - b.nome.length);
    return items[0];
  }
  async function fetchPdf(link) {
    const w = workerUrl();
    const r = await fetch(`${w}/pdf?url=${encodeURIComponent(link)}`);
    if (!r.ok) throw new Error(`Download da carta falhou (${r.status}).`);
    return new Uint8Array(await r.arrayBuffer());
  }

  // ---------- leitura do PDF ----------
  async function fromPdf(bytes, onStep = () => {}) {
    onStep('Abrindo o PDF');
    const lib = await loadPdfjs();
    const doc = await lib.getDocument({ data: bytes, verbosity: 0 }).promise;
    onStep('Lendo a carta');
    const p1page = await doc.getPage(1);
    const p1 = await root.PdfPaths.extract(p1page, lib);
    const p2 = doc.numPages > 1 ? await root.PdfPaths.extract(await doc.getPage(2), lib) : null;
    const res = root.AdcDetect.analyze(p1, p2);
    if (!res.ok) throw new Error(res.msg);
    onStep('Desenhando a carta');
    const vp = p1page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
    const c2d = canvas.getContext('2d');
    c2d.fillStyle = '#fff'; c2d.fillRect(0, 0, canvas.width, canvas.height);
    await p1page.render({ canvasContext: c2d, viewport: vp }).promise;
    const blob = await new Promise(ok => canvas.toBlob(ok, 'image/png'));
    const pack = root.AdcDetect.buildPack(res, RENDER_SCALE, canvas.width, canvas.height);
    pack.charts[0].chartDataUrl = URL.createObjectURL(blob);
    pack.charts[0].asset = pack.charts[0].chartDataUrl;
    doc.destroy();
    return pack;
  }

  function register(pack) {
    packs[pack.code] = pack;
    try {                                                    // só os números (sem a imagem), para o pouso OEI
      const lite = { code: pack.code, runways: pack.runways.map(r => ({ id: r.id, declaredDistances: r.declaredDistances })) };
      sessionStorage.setItem('aw139_online_adc_' + pack.code, JSON.stringify(lite));
    } catch { /* sem storage */ }
    return pack;
  }

  async function search(icao, onStep = () => {}) {
    icao = String(icao || '').trim().toUpperCase();
    if (!/^S[A-Z]{3}$/.test(icao)) throw new Error('Digite o ICAO brasileiro (ex.: SBCP).');
    if (!navigator.onLine) throw new Error('Sem internet: a busca de ADC é só online.');
    if (packs[icao]) return packs[icao];
    onStep('Procurando a carta no AISWEB');
    const item = await findAdc(icao);
    onStep('Baixando a carta');
    const pack = await fromPdf(await fetchPdf(item.link), onStep);
    if (pack.code !== icao) pack.warnings.push(`A carta baixada diz ${pack.code}, não ${icao}.`);
    pack.code = pack.id = icao;
    return register(pack);
  }

  async function openFile(file, onStep = () => {}) {
    const pack = await fromPdf(new Uint8Array(await file.arrayBuffer()), onStep);
    if (!/^S[A-Z]{3}$/.test(pack.code)) throw new Error('Não achei o ICAO na carta.');
    return register(pack);
  }

  // distâncias declaradas de uma base online (para o pouso OEI, mesmo após recarregar a página)
  function packFor(code) {
    if (packs[code]) return packs[code];
    try { const raw = sessionStorage.getItem('aw139_online_adc_' + code); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  root.OnlineAdc = { search, openFile, fromPdf, packFor, isOnline: code => !!packs[code], get: code => packs[code] || null, workerUrl };
})(typeof window !== 'undefined' ? window : globalThis);
