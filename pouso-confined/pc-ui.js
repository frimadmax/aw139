/* AW139 CAT A Confined Area — pouso, interface */
(function () {
  'use strict';
  const P = window.PCEngine, V = window.VTEngine;
  const C = {}, BASE = {};
  [[window.CA_CHARTS, '../confined/'], [window.VT_P1, '../vertical/'], [window.VT_P2, '../vertical/'], [window.CL_CHARTS, '']].forEach(([set, base]) => {
    Object.keys(set || {}).forEach(k => { C[k] = set[k]; BASE[k] = base; });
  });
  const $ = id => document.getElementById(id);
  const KEY = 'aw139.pouso-confined.v1';
  const M2FT = 3.28084;
  const fmt = n => Math.round(n).toLocaleString('pt-BR');
  const f1 = v => v.toFixed(1).replace('.', ',');
  const floor10 = n => Math.floor(n / 10) * 10;
  const ceil1 = n => Math.ceil(n - 1e-9);
  let tab = 'wat', last = null;

  const fields = ['inPa', 'inOat', 'inGw', 'inLdp', 'inHw', 'inBlH', 'inBlC', 'inBlD', 'inApH', 'inApD'];
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s) return;
      fields.forEach(id => { if (s[id] != null) $(id).value = s[id]; });
      const r = document.querySelector(`input[name="config"][value="${s.config}"]`);
      if (r) r.checked = true;
      if (s.tab) tab = s.tab;
    } catch (e) { /* sem armazenamento */ }
  }
  function save(inp) {
    try {
      const s = { config: inp.config, tab };
      fields.forEach(id => { s[id] = $(id).value; });
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) { /* ignora */ }
  }
  const num = id => { const v = parseFloat(String($(id).value).replace(',', '.')); return Number.isFinite(v) ? v : null; };
  function readInput() {
    return {
      config: (document.querySelector('input[name="config"]:checked') || {}).value || 'clean',
      pa: num('inPa'), oat: num('inOat'), gw: num('inGw'), ldp: num('inLdp'), hw: num('inHw') || 0,
      obsH: num('inBlH'), obsHc: num('inBlC'), obsD: num('inBlD'), apH: num('inApH'), apD: num('inApD')
    };
  }
  const src = fig => `Fig. ${fig} · RFM ${C[fig].rfmPage}`;
  function errCard(el, title, srcText, msg) {
    el.className = 'sf-res is-bad';
    el.innerHTML = `<h3>${title}</h3><p class="err">${msg}</p><p class="src">${srcText}</p>`;
  }

  function render() {
    const inp = readInput();
    save(inp);
    const cfg = P.CONFIGS[inp.config];
    const cards = ['resWat', 'resLand', 'resBl'];
    if (['pa', 'oat', 'gw', 'ldp'].some(k => inp[k] == null)) {
      cards.forEach(id => { $(id).className = 'sf-res'; $(id).innerHTML = '<h3>—</h3><p class="sub">Preencha altitude, OAT, peso e LDP.</p>'; });
      return;
    }
    if (inp.hw < 0) { cards.forEach(id => errCard($(id), 'Vento', 'Supl. 12, Seção 1H', 'Vento de cauda: pouso proibido.')); return; }
    const out = P.compute(inp);
    last = out;

    const w = out.wat, elW = $('resWat');
    if (!w.ok) errCard(elW, 'Peso máx. W.A.T.', src(cfg.wat), w.msg);
    else {
      const wMax = floor10(w.wMax), margin = wMax - inp.gw;
      elW.className = 'sf-res ' + (margin >= 0 ? 'is-ok' : 'is-bad');
      elW.innerHTML = `<h3>Peso máx. W.A.T.</h3>
        <p class="big">${fmt(wMax)} <small>kg</small></p>
        <p class="sub">Sem crédito de vento${w.limitedBy6400 ? ' · limitado a 6400 kg' : ''}</p>
        <p class="sub">${margin >= 0 ? `Margem +${fmt(margin)} kg sobre o GW` : `<b>GW excede em ${fmt(-margin)} kg</b>`}</p>
        <p class="src">${src(cfg.wat)}</p>`;
    }

    const l = out.land, h = out.h, elL = $('resLand');
    if (!l) errCard(elL, 'Distância de pouso', 'Fig. 4H-3', 'LDP fora da faixa 100–400 ft ALS.');
    else {
      elL.className = 'sf-res';
      elL.innerHTML = `<h3>Pouso OEI do LDP</h3>
        <p class="big">${fmt(ceil1(l.dist))} <small>m</small></p>
        <p class="sub">${fmt(l.dist * M2FT)} ft do LDP ao ponto de pouso</p>
        <p class="sub">LDP ${inp.ldp} ft ALS${l.exact ? '' : ' (interpolado entre linhas)'}</p>
        <p class="src">Fig. 4H-3 · RFM S12-H25</p>`;
    }

    const b = out.bl, elB = $('resBl');
    if (!b.ok) errCard(elB, 'Arremetida OEI', src(P.BL_FIG), b.msg);
    else {
      elB.className = 'sf-res';
      elB.innerHTML = `<h3>Arremetida OEI</h3>
        <p class="big">${fmt(ceil1(b.dist))} <small>m</small></p>
        <p class="sub">${fmt(b.dist * M2FT)} ft a partir do LDP</p>
        ${h ? `<p class="sub">Altura mínima ${fmt(h.minH)} ft · no fim ${fmt(h.endH)} ft ALS</p>` : ''}
        ${b.notes.map(n => `<p class="note">${n}</p>`).join('')}
        <p class="src">${src(P.BL_FIG)} · alturas Fig. 3H-1</p>`;
    }

    const sb = $('obBalked');
    if (out.balked) {
      sb.hidden = false;
      const r = out.balked, hc = inp.obsHc != null ? inp.obsHc : 0;
      if (r.within) {
        const ok = r.possible && inp.ldp >= r.req;
        const where = inp.obsD != null && b.ok ? `dentro da arremetida (${fmt(inp.obsD)} m ≤ ${fmt(ceil1(b.dist))} m)` : 'dentro da arremetida (distância não informada)';
        sb.className = 'sf-status ' + (ok ? 'ok' : 'bad');
        sb.textContent = !r.possible ? `Obstáculo ${where}: LDP necessário ${fmt(r.req)} ft passa do máximo de 400 ft ALS.`
          : `Obstáculo ${where} (HO ${fmt(inp.obsH)} ft + HC ${fmt(hc)} ft + 85): LDP mínimo ${fmt(r.req)} ft. ` + (ok ? `LDP ${inp.ldp} ft atende.` : `LDP ${inp.ldp} ft é baixo.`);
      } else if (!r.ok) {
        sb.className = 'sf-status bad';
        sb.textContent = `Obstáculo depois da arremetida, D1 = ${fmt(Math.floor(r.d1))} m do fim. ${r.msg}`;
      } else {
        const top = h ? h.path1Top : 200;
        let t = `Obstáculo depois da arremetida, D1 = ${fmt(Math.floor(r.d1))} m (${fmt(r.d1Ft)} ft) do fim. PATH 1 ${f1(r.g1.grad)} ft/100 ft`;
        if (r.g2) t += ` até ${fmt(top)} ft ALS (${fmt(r.d1p)} ft), depois PATH 2 ${f1(r.g2.grad)} ft/100 ft`;
        t += `: altura no obstáculo ${fmt(Math.floor(r.h))} ft, exigida ${fmt(r.hReq)} ft (HO + HC). `;
        if (r.clears) t += `Passa ${fmt(Math.floor(r.clear))} ft acima do obstáculo: atende.`;
        else if (r.ldpReq) t += `Não atende com LDP ${inp.ldp} ft. LDP necessário: ${r.ldpReq} ft.`;
        else if (r.gw2 != null) t += `Nem com LDP 400 ft. Com LDP 400 ft atende com peso até ${fmt(floor10(r.gw2))} kg (distância de arremetida mantida do peso atual, conservador).`;
        else t += 'Nem com LDP 400 ft e 4400 kg.';
        if (r.hReq > 1000) t += ' Altura exigida acima de 1000 ft ALS, fim do PATH 2.';
        sb.className = 'sf-status ' + (r.clears ? 'ok' : 'bad');
        sb.textContent = t;
      }
    } else sb.hidden = true;

    const sp = $('obApproach');
    if (out.approach) {
      sp.hidden = false;
      const r = out.approach;
      if (r.out) { sp.className = 'sf-status bad'; sp.textContent = r.msg; }
      else {
        sp.className = 'sf-status ' + (r.ok ? 'ok' : 'bad');
        sp.textContent = `Obstáculo na aproximação com ${fmt(inp.apH)} ft (linha de ${r.rowH} ft na Fig. 4D-8): distância mínima ${r.minDist} m do heliponto. ` +
          (r.ok ? `Está a ${fmt(inp.apD)} m: fora da zona de obstáculo, OK.` : `Está a ${fmt(inp.apD)} m: dentro da zona, não atende.`);
      }
    } else sp.hidden = true;

    drawDiagram(inp, out);
    drawChart();
  }

  function drawDiagram(inp, out) {
    const svg = $('diagram');
    const h = out.h, land = out.land ? out.land.dist : null, bl = out.bl.ok ? out.bl.dist : null;
    const ldp = Math.max(100, Math.min(400, inp.ldp || 100));
    const back = 90;                                  // aproximação desenhada antes do LDP (m)
    const span = (back + Math.max(bl || 0, land || 0, 160)) * 1.08;
    const G = 178, XL = 20, XR = 620;
    const sx = m => XL + (XR - XL) * (m + back) / span;   // m a partir do LDP
    const sy = ft => G - 18 - ft / 400 * 128;
    const xL = sx(0), yL = sy(ldp);
    let s = `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#c8d3ff"/></marker></defs>`;
    s += `<line class="ground" x1="10" y1="${G}" x2="630" y2="${G}"/>`;
    s += `<path class="path-climb" stroke-dasharray="6 4" d="M${sx(-back)} ${Math.max(14, yL - 40)} L ${xL} ${yL}"/>`;
    s += `<circle cx="${xL}" cy="${yL}" r="4.5" fill="#5bc4f1"/>`;
    s += `<text class="tdp" x="${xL + 8}" y="${yL - 14}">LDP ${ldp} ft</text>`;
    if (land != null) {
      const xp = sx(land);
      s += `<rect class="pad" x="${xp - 16}" y="${G - 3}" width="32" height="6" rx="2"/>`;
      s += `<path class="path-rto" d="M${xL} ${yL} C ${xL + (xp - xL) * 0.5} ${yL + 10}, ${xp} ${G - 40}, ${xp} ${G - 6}"/>`;
      s += `<line class="dim" x1="${xL}" y1="${G + 22}" x2="${xp}" y2="${G + 22}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
      s += `<text class="rto" x="${Math.max(xL + 60, (xL + xp) / 2)}" y="${G + 44}" text-anchor="middle">Pouso ${fmt(ceil1(land))} m</text>`;
    }
    if (bl != null && h) {
      const xe = sx(bl), xm = xL + (xe - xL) * 0.4, yMin = sy(h.minH), yE = sy(h.endH);
      s += `<path class="path-cto" d="M${xL} ${yL} C ${xL + (xm - xL) * 0.5} ${yL}, ${xm - 30} ${yMin}, ${xm} ${yMin} S ${xe - 30} ${yE}, ${xe} ${yE}"/>`;
      s += `<circle cx="${xm}" cy="${yMin}" r="3" fill="#3ee08f"/>`;
      s += `<text class="cto sm" x="${xm}" y="${yMin + 20}" text-anchor="middle">mín. ${fmt(h.minH)} ft</text>`;
      s += `<text class="cto sm" x="${Math.min(626, xe)}" y="${yE - 10}" text-anchor="end">${fmt(h.endH)} ft</text>`;
      s += `<line class="dim" x1="${xL}" y1="${G + 62}" x2="${xe}" y2="${G + 62}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
      s += `<text class="cto" x="${(xL + xe) / 2}" y="${G + 82}" text-anchor="middle">Arremetida ${fmt(ceil1(bl))} m</text>`;
      const r = out.balked;
      if (r && inp.obsD != null) {
        const xo = sx(Math.min(inp.obsD, span - back - 10)), ho = Math.min(150, 10 + inp.obsH * 0.32);
        const bad = r.within ? (!r.possible || inp.ldp < r.req) : !r.clears;
        s += `<rect x="${xo - 5}" y="${G - ho}" width="10" height="${ho}" fill="${bad ? '#ff4d6d' : '#8fa3e6'}" opacity=".8"/>`;
        if (!r.within) s += `<path class="path-climb" stroke-dasharray="6 4" d="M${xe} ${yE} L ${xo + 5} ${Math.max(16, yE - 50)}"/><text class="sm" x="${xo - 10}" y="${Math.max(16, yE - 54)}" text-anchor="end">${r.g2 ? 'PATH 1 + 2' : 'PATH 1'}</text>`;
      }
    }
    if (out.approach && land != null && inp.apD != null) {
      const xo = Math.max(14, sx(land - inp.apD)), ho = Math.min(150, 10 + inp.apH * 0.32);
      s += `<rect x="${xo - 5}" y="${G - ho}" width="10" height="${ho}" fill="${out.approach.ok ? '#8fa3e6' : '#ff4d6d'}" opacity=".8"/>`;
    }
    svg.setAttribute('viewBox', '0 0 640 268');
    svg.innerHTML = s;
  }

  function tablesHtml(inp) {
    const t = inp.ldp, ha = inp.apH;
    const r3 = P.T4H3.map(r => `<tr class="${t != null && Math.abs(r[0] - t) < 10 ? 'hit' : ''}"><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    const rowH = ha != null ? (P.T4D8.find(r => r[0] >= ha - 1e-9) || [])[0] : null;
    const r8 = P.T4D8.map(r => `<tr class="${r[0] === rowH ? 'hit' : ''}"><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    return `<table class="sf-table"><caption><b>Fig. 4H-3</b> OEI Landing Distance from LDP · RFM S12-H25</caption>
      <thead><tr><th>LDP (ft ALS)</th><th>Distância de pouso (m)</th></tr></thead><tbody>${r3}</tbody></table>
      <table class="sf-table"><caption><b>Fig. 4D-8</b> Obstacle Zone (aproximação, Fig. 4H-2) · RFM S12-D36</caption>
      <thead><tr><th>Obstáculo (ft AGL)</th><th>Distância mín. do heliponto (m)</th></tr></thead><tbody>${r8}</tbody></table>`;
  }

  function drawChart() {
    if (!last) return;
    document.querySelectorAll('.sf-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    const isTab = tab === 'tab';
    $('chartWrap').hidden = isTab; $('chartTools').hidden = isTab; $('tableWrap').hidden = !isTab;
    $('chartWrap2').hidden = true;
    if (isTab) { $('chartCap').textContent = 'Linhas destacadas: valores usados no cálculo.'; $('tableWrap').innerHTML = tablesHtml(last.input); return; }
    if (tab === 'p1' || tab === 'p2') {
      const path = tab === 'p1' ? 1 : 2, figFn = path === 1 ? V.p1Fig : V.p2Fig;
      const inp = last.input;
      const g = V.gradForGw(inp.config, inp.pa, inp.oat, inp.hw, inp.gw, path);
      const i = Math.max(0, V.P1_GW.findIndex((w, k) => k < V.P1_GW.length - 1 && Math.max(4400, Math.min(6400, inp.gw)) <= V.P1_GW[k + 1]));
      const figs = [figFn(inp.config, i), figFn(inp.config, i + 1)];
      const charts = g.ok ? g.charts : figs.map(f => V.grad(f, inp.pa, inp.oat, inp.hw));
      const shown = charts.length > 1 ? figs : [figs[0]];
      const vals = charts.map(c => c.ok ? `${c.fig}: ${f1(c.grad)} ft` : `${c.fig}: ${c.msg}`).join(' · ');
      $('chartCap').innerHTML = `<b>PATH ${path}</b> ${shown.map(f => `Fig. ${f} (${C[f].gw} kg, RFM ${C[f].rfmPage})`).join(' e ')}. ${vals}` +
        (g.ok && charts.length > 1 ? `. Interpolado para ${fmt(g.gw)} kg: <b>${f1(g.grad)} ft/100 ft</b>.` : '') +
        (shown.includes('4A-13') ? ' <br>Fig. 4A-13: no PDF Rev 30 a página mostra por cima uma cópia da carta de 6000 kg; o app usa a carta de 6400 kg que está por baixo (ICN ...12324).' : '');
      paint('chartImg', 'chartSvg', shown[0], charts[0], 1);
      if (shown.length > 1) { $('chartWrap2').hidden = false; paint('chartImg2', 'chartSvg2', shown[1], charts[1], 1); }
      return;
    }
    const fig = tab === 'wat' ? last.cfg.wat : P.BL_FIG;
    const ch = C[fig], res = tab === 'wat' ? last.wat : last.bl;
    $('chartCap').innerHTML = `<b>Figure ${fig}</b> ${ch.title} · RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)` +
      (tab === 'bl' ? '. Vale também com IBF (texto da Seção 4H).' : '');
    paint('chartImg', 'chartSvg', fig, res, tab === 'wat' ? 1 : 2);
  }
  function paint(imgId, svgId, fig, res, dotIdx) {
    const ch = C[fig];
    const img = $(imgId), url = BASE[fig] + ch.img.src;
    if (img.getAttribute('src') !== url) { img.src = url; img.alt = `Figura ${fig} do RFM`; }
    const [bx, by, bw, bh] = ch.img.box;
    const svg = $(svgId);
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    if (res && res.ok && res.trace) {
      s += `<polyline class="trace" points="${res.trace.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      if (res.traceCorr) s += `<polyline class="trace2" points="${res.traceCorr.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      const p = res.trace[Math.min(dotIdx, res.trace.length - 1)];
      s += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="2.2"/>`;
    }
    svg.innerHTML = s;
  }

  function init() {
    load();
    document.querySelectorAll('.sf-config input, .sf-inputs input').forEach(el => el.addEventListener('input', render));
    document.querySelectorAll('.sf-tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; save(readInput()); drawChart(); }));
    $('zoomBtn').addEventListener('click', () => {
      const z = $('chart').classList.toggle('is-zoom'); $('chart2').classList.toggle('is-zoom', z);
      $('zoomBtn').textContent = z ? 'Reduzir' : 'Ampliar';
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
