/* AW139 CAT A Heliport Back Up e Confined Area — interface (mesma tela, textos por perfil) */
(function () {
  'use strict';
  const PROFILES = {
    backup: {
      charts: 'BU_CHARTS', key: 'aw139.backup.v1', sec: 'Supl. 12, Seção 1C', tdp: '85–400', recuo: 'back up', recuoCard: 'Alturas e back up',
      t7: ['4C-7', 'S12-C31', 'Typical Heights and Distances'], t8: ['4C-8', 'S12-C32', 'Minimum Distance for Obstacle in Back Up Profile'],
      ahead: ['4C-1', 70], hwOnWat: true
    },
    confined: {
      charts: 'CA_CHARTS', key: 'aw139.confined.v1', sec: 'Supl. 12, Seção 1D', tdp: '100–400', recuo: 'subida para trás', recuoCard: 'Alturas e recuo',
      t7: ['4D-7', 'S12-D35', 'Confined Area Typical Heights and Distances'], t8: ['4D-8', 'S12-D36', 'Minimum Distance for Obstacle Under Rearward Climb'],
      ahead: ['4D-1', 85], hwOnWat: false, after: true
    }
  };
  const me = document.currentScript;
  const P = PROFILES[(me && me.dataset.profile) || 'backup'];
  const S = window.SFEngine, B = window.BUEngine, C = window[P.charts];
  const $ = id => document.getElementById(id);
  const KEY = P.key;
  const M2FT = 3.28084;
  const fmt = n => Math.round(n).toLocaleString('pt-BR');
  const floor10 = n => Math.floor(n / 10) * 10;
  const ceil1 = n => Math.ceil(n - 1e-9);
  let tab = 'wat', last = null;

  const fields = ['inPa', 'inOat', 'inGw', 'inTdp', 'inHw', 'inObH', 'inObD', 'inAhH', 'inAhC', 'inAhD'].filter(id => $(id));
  // Confined Area: obstáculo depois do CTO com PATH 1/2 ou subida alternativa 60 KIAS (ca-after.js)
  const V = window.VTEngine, CX = Object.assign({}, window.VT_P1, window.VT_P2, window.CA_ALT);
  const XBASE = fig => (window.CA_ALT && window.CA_ALT[fig]) ? '' : '../vertical/';
  const climbOf = () => (document.querySelector('input[name="climb"]:checked') || {}).value || 'std';
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s) return;
      fields.forEach(id => { if (s[id] != null) $(id).value = s[id]; });
      const r = document.querySelector(`input[name="config"][value="${s.config}"]`);
      if (r) r.checked = true;
      const c = s.climb && document.querySelector(`input[name="climb"][value="${s.climb}"]`);
      if (c) c.checked = true;
      if (s.tab) tab = s.tab;
    } catch (e) { /* sem armazenamento */ }
  }
  function save(inp) {
    try {
      const s = { config: inp.config, tab, climb: inp.climb };
      fields.forEach(id => { s[id] = $(id).value; });
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) { /* ignora */ }
  }
  const num = id => { const v = parseFloat(String($(id).value).replace(',', '.')); return Number.isFinite(v) ? v : null; };
  function readInput() {
    return {
      config: (document.querySelector('input[name="config"]:checked') || {}).value || 'clean',
      pa: num('inPa'), oat: num('inOat'), gw: num('inGw'), tdp: num('inTdp'), hw: num('inHw') || 0,
      obsBehindH: num('inObH'), obsBehindD: num('inObD'), obsAheadH: num('inAhH'), obsAheadHc: num('inAhC'),
      obsAheadD: $('inAhD') ? num('inAhD') : null, climb: climbOf()
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
    const cfg = B.CONFIGS[inp.config];
    const cards = ['resWat', 'resCto', 'resHgt'];
    if (['pa', 'oat', 'gw', 'tdp'].some(k => inp[k] == null)) {
      cards.forEach(id => { $(id).className = 'sf-res'; $(id).innerHTML = '<h3>—</h3><p class="sub">Preencha altitude, OAT, peso e TDP.</p>'; });
      return;
    }
    if (inp.hw < 0) { cards.forEach(id => errCard($(id), 'Vento', P.sec, 'Vento de cauda: decolagem proibida.')); return; }
    const out = B.compute(inp);
    last = out;

    const w = out.wat, elW = $('resWat');
    if (!w.ok) errCard(elW, 'Peso máx. W.A.T.', src(cfg.wat), w.msg);
    else {
      const wMax = floor10(w.wMax), margin = wMax - inp.gw;
      elW.className = 'sf-res ' + (margin >= 0 ? 'is-ok' : 'is-bad');
      elW.innerHTML = `<h3>Peso máx. W.A.T.</h3>
        <p class="big">${fmt(wMax)} <small>kg</small></p>
        <p class="sub">Sem vento ${fmt(floor10(w.wBase))} kg${w.hw > 0 ? ` · vento ${w.hw} kt +${fmt(w.wMax - w.wBase)} kg` : ''}${w.limitedBy6400 ? ' · limitado a 6400 kg' : ''}</p>
        <p class="sub">${margin >= 0 ? `Margem +${fmt(margin)} kg sobre o GW` : `<b>GW excede em ${fmt(-margin)} kg</b>`}</p>
        ${P.hwOnWat && inp.hw > 20 ? '<p class="note">Vento acima de 20 kt: crédito limitado a 20 kt (fim da escala).</p>' : ''}
        ${!P.hwOnWat ? '<p class="note">Sem crédito de vento: esta carta W.A.T. não tem seção de vento.</p>' : ''}
        <p class="src">${src(cfg.wat)}</p>`;
    }

    const d = out.dist, h = out.h, elC = $('resCto');
    if (!h) errCard(elC, 'Distância CTO', `Fig. ${P.t7[0]}`, `TDP fora da faixa ${P.tdp} ft ATS.`);
    else if (!d.ok) errCard(elC, 'Distância CTO', src(B.DIST_FIG), d.msg);
    else {
      const cto = ceil1(out.cto);
      elC.className = 'sf-res';
      elC.innerHTML = `<h3>Distância CTO (OEI)</h3>
        <p class="big">${fmt(cto)} <small>m</small></p>
        <p class="sub">${fmt(cto * M2FT)} ft a partir do ponto de decolagem</p>
        <p class="sub">Do TDP ${fmt(ceil1(d.dist))} m${d.hw > 0 ? ` (sem vento ${fmt(ceil1(d.dist0))} m, ${d.corrPerKt.toFixed(1).replace('.', ',')} m/kt × ${d.hw} kt)` : ''} − ${P.recuo} ${fmt(Math.floor(h.backup))} m</p>
        ${d.notes.map(n => `<p class="note">${n}</p>`).join('')}
        <p class="src">${src(B.DIST_FIG)} e Fig. ${P.t7[0]}</p>`;
    }
    const elH = $('resHgt');
    if (!h) errCard(elH, 'Alturas', `Fig. ${P.t7[0]}`, `TDP fora da faixa ${P.tdp} ft ATS.`);
    else {
      elH.className = 'sf-res';
      elH.innerHTML = `<h3>${P.recuoCard}</h3>
        <p class="big">${fmt(Math.floor(h.backup))} <small>m de recuo</small></p>
        ${h.lateral != null ? `<p class="sub">Deslocamento lateral máx. ${fmt(h.lateral)} m (ponta de pá externa)</p>` : ''}
        <p class="sub">Altura mínima no CTO ${fmt(h.minH)} ft · no fim do CTO ${fmt(h.endH)} ft</p>
        <p class="sub">TDP ${inp.tdp} ft ATS${h.exact ? '' : ' (interpolado entre linhas)'}</p>
        <p class="src">Fig. ${P.t7[0]} · RFM ${P.t7[1]}</p>`;
    }

    const sb = $('obBehind'), sa = $('obAhead');
    if (out.behind) {
      sb.hidden = false;
      const r = out.behind;
      if (r.out) { sb.className = 'sf-status bad'; sb.textContent = r.msg; }
      else {
        sb.className = 'sf-status ' + (r.ok ? 'ok' : 'bad');
        sb.textContent = `Obstáculo atrás com ${fmt(inp.obsBehindH)} ft (linha de ${r.rowH} ft na Fig. ${P.t8[0]}): distância mínima ${r.minDist} m da borda traseira. ` +
          (r.ok ? `Está a ${fmt(inp.obsBehindD)} m: OK.` : `Está a ${fmt(inp.obsBehindD)} m: dentro da zona, não atende.`);
      }
    } else sb.hidden = true;
    const isAfter = P.after && out.ahead && inp.obsAheadD != null && d.ok && h && out.cto != null && inp.obsAheadD > out.cto;
    if (isAfter) {
      sa.hidden = false;
      const r = window.CAAfter.obstacleAfter(inp, d.dist);
      out.after = r;
      const f1 = v => v.toFixed(1).replace('.', ',');
      const D1 = `D1 = ${fmt(Math.floor(r.d1))} m (${fmt(r.d1 * M2FT)} ft) do fim do CTO`;
      if (!r.ok) { sa.className = 'sf-status bad'; sa.textContent = `Obstáculo depois do CTO, ${D1}. ${r.msg}`; }
      else {
        let t = `Obstáculo depois do CTO, ${D1}. `;
        if (r.alt) t += `Subida 60 KIAS ${f1(r.g1.grad)} ft/100 ft`;
        else {
          t += `PATH 1 ${f1(r.g1.grad)} ft/100 ft`;
          if (r.g2) t += ` até ${fmt(r.top)} ft ATS (${fmt(r.d1p)} ft), depois PATH 2 ${f1(r.g2.grad)} ft/100 ft`;
        }
        t += `: altura no obstáculo ${fmt(Math.floor(r.h))} ft, exigida ${fmt(r.hReq)} ft (HO + HC). `;
        if (r.clears) t += `Passa ${fmt(Math.floor(r.clear))} ft acima do obstáculo: atende.`;
        else if (r.tdpReq) t += `Não atende com TDP ${inp.tdp} ft. TDP necessário: ${r.tdpReq} ft.`;
        else if (r.gw2 != null) t += `Nem com TDP 400 ft. Com TDP 400 ft atende com peso até ${fmt(floor10(r.gw2))} kg (distância do TDP mantida do peso atual, conservador).`;
        else t += 'Nem com TDP 400 ft e 4400 kg.';
        if (r.aboveTop) t += ' Altura exigida acima de 1000 ft ATS, fim das cartas.';
        sa.className = 'sf-status ' + (r.clears ? 'ok' : 'bad');
        sa.textContent = t;
      }
    } else if (out.ahead) {
      sa.hidden = false;
      const r = out.ahead, hc = inp.obsAheadHc != null ? inp.obsAheadHc : 0;
      const ok = r.possible && inp.tdp >= r.req;
      sa.className = 'sf-status ' + (ok ? 'ok' : 'bad');
      sa.textContent = !r.possible ? `Obstáculo à frente: TDP necessário ${fmt(r.req)} ft passa do máximo de 400 ft.`
        : `Obstáculo à frente (HO ${fmt(inp.obsAheadH)} ft + HC ${fmt(hc)} ft + ${P.ahead[1]}): TDP mínimo ${fmt(r.req)} ft. ` + (ok ? `TDP ${inp.tdp} ft atende.` : `TDP ${inp.tdp} ft é baixo.`);
    } else sa.hidden = true;

    drawDiagram(inp, out);
    drawChart();
  }

  function drawDiagram(inp, out) {
    const svg = $('diagram');
    const h = out.h, d = out.dist.ok ? out.dist.dist : null;
    const back = h ? h.backup : 70;
    const cto = out.cto != null ? out.cto : null;
    const span = Math.max(back + (cto || 0), 260) * 1.1;
    const G = 178, XL = 30, XR = 610;
    const sx = m => XL + (XR - XL) * m / span;      // m a partir do ponto mais atrás (TDP)
    const xTdp = sx(0), xPad = sx(back);
    const t0 = B.TDP_MIN || 85;
    const tdp = Math.max(t0, Math.min(400, inp.tdp || t0));
    const hT = 40 + (tdp - t0) / (400 - t0) * 96, yT = G - hT;
    const yMin = h ? G - hT * (h.minH / tdp) : G - 10;
    let s = `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#c8d3ff"/></marker></defs>`;
    s += `<line class="ground" x1="10" y1="${G}" x2="630" y2="${G}"/>`;
    s += `<rect class="pad" x="${xPad - 16}" y="${G - 3}" width="32" height="6" rx="2"/>`;
    s += `<path class="path-climb" d="M${xPad} ${G - 4} C ${xPad} ${G - hT * 0.6}, ${xTdp + (xPad - xTdp) * 0.2} ${yT}, ${xTdp} ${yT}"/>`;
    s += `<circle cx="${xTdp}" cy="${yT}" r="4.5" fill="#5bc4f1"/>`;
    s += `<text class="tdp" x="${xTdp + 10}" y="${yT - 12}">TDP ${tdp} ft</text>`;
    s += `<path class="path-rto" d="M${xTdp} ${yT} C ${xTdp + (xPad - xTdp) * 0.5} ${yT}, ${xPad} ${G - hT * 0.4}, ${xPad} ${G - 6}"/>`;
    if (cto != null) {
      const xe = sx(back + cto), yE = h ? G - hT * (h.endH / tdp) : yT;
      const xm = xTdp + (xe - xTdp) * 0.45;
      s += `<path class="path-cto" d="M${xTdp} ${yT} C ${xTdp + (xm - xTdp) * 0.6} ${yT}, ${xm - 30} ${yMin}, ${xm} ${yMin} S ${xe - 20} ${yE}, ${xe} ${yE}"/>`;
      s += `<circle cx="${xm}" cy="${yMin}" r="3" fill="#3ee08f"/>`;
      if (h) s += `<text class="cto sm" x="${xm + 8}" y="${yMin - 10}">mín. ${fmt(h.minH)} ft</text><text class="cto sm" x="${Math.min(626, xe)}" y="${yE - 10}" text-anchor="end">${fmt(h.endH)} ft</text>`;
      s += `<line class="dim" x1="${xPad}" y1="${G + 22}" x2="${xe}" y2="${G + 22}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
      s += `<text class="cto" x="${(xPad + xe) / 2}" y="${G + 44}" text-anchor="middle">CTO ${fmt(ceil1(cto))} m</text>`;
    }
    s += `<line class="dim" x1="${xTdp}" y1="${G + 62}" x2="${xPad}" y2="${G + 62}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
    s += `<text class="rto" x="${Math.max(130, (xTdp + xPad) / 2)}" y="${G + 82}" text-anchor="middle">${P.recuo} ${fmt(Math.floor(back))} m</text>`;
    svg.setAttribute('viewBox', '0 0 640 268');
    svg.innerHTML = s;
  }

  function tablesHtml(inp) {
    const t = inp.tdp, hb = inp.obsBehindH;
    const step = B.T4C7[1][0] - B.T4C7[0][0];
    const r7 = B.T4C7.map(r => `<tr class="${t != null && Math.abs(r[0] - t) < step / 2 ? 'hit' : ''}">${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
    const lat = B.T4C7[0].length > 4 ? '<th>Lateral (m)</th>' : '';
    const rowH = hb != null ? (B.T4C8.find(r => r[0] >= hb - 1e-9) || [])[0] : null;
    const r8 = B.T4C8.map(r => `<tr class="${r[0] === rowH ? 'hit' : ''}"><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    return `<table class="sf-table"><caption><b>Fig. ${P.t7[0]}</b> ${P.t7[2]} · RFM ${P.t7[1]}</caption>
      <thead><tr><th>TDP (ft)</th><th>Alt. mín. (ft)</th><th>Fim CTO (ft)</th><th>Recuo (m)</th>${lat}</tr></thead><tbody>${r7}</tbody></table>
      <table class="sf-table"><caption><b>Fig. ${P.t8[0]}</b> ${P.t8[2]} · RFM ${P.t8[1]}</caption>
      <thead><tr><th>Obstáculo (ft AGL)</th><th>Distância mín. atrás (m)</th></tr></thead><tbody>${r8}</tbody></table>`;
  }

  function drawChart() {
    if (!last) return;
    document.querySelectorAll('.sf-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    const isTab = tab === 'tab';
    $('chartWrap').hidden = isTab; $('chartTools').hidden = isTab; $('tableWrap').hidden = !isTab;
    if (isTab) { $('chartCap').textContent = 'Linhas destacadas: valores usados no cálculo.'; $('tableWrap').innerHTML = tablesHtml(last.input); return; }
    if ($('chartWrap2')) $('chartWrap2').hidden = true;
    if (P.after && (tab === 'p1' || tab === 'p2' || tab === 'alt')) {
      const path = { p1: 1, p2: 2, alt: 3 }[tab], figFn = { 1: V.p1Fig, 2: V.p2Fig, 3: V.altFig }[path];
      const inp = last.input;
      const g = V.gradForGw(inp.config, inp.pa, inp.oat, inp.hw, inp.gw, path);
      const i = Math.max(0, V.P1_GW.findIndex((w, k) => k < V.P1_GW.length - 1 && Math.max(4400, Math.min(6400, inp.gw)) <= V.P1_GW[k + 1]));
      const figs = [figFn(inp.config, i), figFn(inp.config, i + 1)];
      const charts = g.ok ? g.charts : figs.map(f => V.grad(f, inp.pa, inp.oat, inp.hw));
      const shown = charts.length > 1 ? figs : [figs[0]];
      const f1 = v => v.toFixed(1).replace('.', ',');
      const name = path === 3 ? 'Subida alternativa 60 KIAS' : `PATH ${path}`;
      $('chartCap').innerHTML = `<b>${name}</b> ${shown.map(f => `Fig. ${f} (${CX[f].gw} kg, RFM ${CX[f].rfmPage})`).join(' e ')}. ` +
        charts.map(c => c.ok ? `${c.fig}: ${f1(c.grad)} ft` : `${c.fig}: ${c.msg}`).join(' · ') +
        (g.ok && charts.length > 1 ? `. Interpolado para ${fmt(g.gw)} kg: <b>${f1(g.grad)} ft/100 ft</b>.` : '') +
        (shown.includes('4A-13') ? ' <br>Fig. 4A-13: no PDF Rev 30 a página mostra por cima uma cópia da carta de 6000 kg; o app usa a carta de 6400 kg que está por baixo (ICN ...12324).' : '') +
        (shown.some(f => f === '4D-13' || f === '4D-14') ? ' <br>Nesta carta os rótulos −10 e −20 aparecem trocados no PDF; o app segue a ordem das curvas (mais frio à direita).' : '');
      paintX('chartImg', 'chartSvg', shown[0], charts[0]);
      if (shown.length > 1) { $('chartWrap2').hidden = false; paintX('chartImg2', 'chartSvg2', shown[1], charts[1]); }
      return;
    }
    const fig = tab === 'wat' ? last.cfg.wat : B.DIST_FIG;
    const ch = C[fig], res = tab === 'wat' ? last.wat : last.dist;
    $('chartCap').innerHTML = `<b>Figure ${fig}</b> ${ch.title} · RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`;
    const img = $('chartImg');
    if (img.getAttribute('src') !== ch.img.src) { img.src = ch.img.src; img.alt = `Figura ${fig} do RFM`; }
    const [bx, by, bw, bh] = ch.img.box;
    const svg = $('chartSvg');
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    if (res && res.ok && res.trace) {
      s += `<polyline class="trace" points="${res.trace.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      if (res.traceCorr) s += `<polyline class="trace2" points="${res.traceCorr.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      const p = res.trace[Math.min(tab === 'wat' ? 1 : 2, res.trace.length - 1)];
      s += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="2.2"/>`;
    }
    svg.innerHTML = s;
  }

  function paintX(imgId, svgId, fig, res) {
    const ch = CX[fig], img = $(imgId), url = XBASE(fig) + ch.img.src;
    if (img.getAttribute('src') !== url) { img.src = url; img.alt = `Figura ${fig} do RFM`; }
    const [bx, by, bw, bh] = ch.img.box, svg = $(svgId);
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    if (res && res.ok && res.trace) {
      s += `<polyline class="trace" points="${res.trace.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      const p = res.trace[Math.min(1, res.trace.length - 1)];
      s += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="2.2"/>`;
    }
    svg.innerHTML = s;
  }

  function init() {
    load();
    document.querySelectorAll('.sf-config input, .sf-inputs input').forEach(el => el.addEventListener('input', render));
    document.querySelectorAll('input[name="climb"]').forEach(el => el.addEventListener('change', render));
    document.querySelectorAll('.sf-tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; save(readInput()); drawChart(); }));
    $('zoomBtn').addEventListener('click', () => {
      const z = $('chart').classList.toggle('is-zoom');
      if ($('chart2')) $('chart2').classList.toggle('is-zoom', z);
      $('zoomBtn').textContent = z ? 'Reduzir' : 'Ampliar';
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
