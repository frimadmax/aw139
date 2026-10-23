/* AW139 CAT A Heliport/Helideck Vertical — interface */
(function () {
  'use strict';
  const V = window.VTEngine, C = window.VT_CHARTS;
  const $ = id => document.getElementById(id);
  const KEY = 'aw139.vertical.v1';
  const M2FT = 3.28084;
  const fmt = n => Math.round(n).toLocaleString('pt-BR');
  const floor10 = n => Math.floor(n / 10) * 10;
  const ceil1 = n => Math.ceil(n - 1e-9);
  let tab = 'wat', last = null;

  const fields = ['inPa', 'inOat', 'inGw', 'inTdp', 'inHw', 'inAhH', 'inAhC', 'inAhD'];
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
      pa: num('inPa'), oat: num('inOat'), gw: num('inGw'), tdp: num('inTdp'), hw: num('inHw') || 0,
      obsAheadH: num('inAhH'), obsAheadHc: num('inAhC'), obsAheadD: num('inAhD')
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
    const cfg = V.CONFIGS[inp.config];
    const cards = ['resWat', 'resCto', 'resHgt'];
    if (['pa', 'oat', 'gw', 'tdp'].some(k => inp[k] == null)) {
      cards.forEach(id => { $(id).className = 'sf-res'; $(id).innerHTML = '<h3>—</h3><p class="sub">Preencha altitude, OAT, peso e TDP.</p>'; });
      return;
    }
    if (inp.hw < 0) { cards.forEach(id => errCard($(id), 'Vento', 'Supl. 12, Seção 1A', 'Vento de cauda: decolagem proibida.')); return; }
    const out = V.compute(inp);
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
        ${inp.hw > 20 ? '<p class="note">Vento acima de 20 kt: crédito limitado a 20 kt (fim da escala).</p>' : ''}
        <p class="src">${src(cfg.wat)}</p>`;
    }

    const d = out.dist, elC = $('resCto');
    if (!d.ok) errCard(elC, 'Distância CTO', src(V.CTO_FIG), d.msg);
    else {
      const cto = ceil1(d.dist);
      elC.className = 'sf-res';
      elC.innerHTML = `<h3>Distância CTO (OEI)</h3>
        <p class="big">${fmt(cto)} <small>m</small></p>
        <p class="sub">${fmt(d.dist * M2FT)} ft a partir do ponto de decolagem</p>
        ${d.hw > 0 ? `<p class="sub">Sem vento ${fmt(ceil1(d.dist0))} m, ${d.corrPerKt.toFixed(1).replace('.', ',')} m/kt × ${d.hw} kt</p>` : ''}
        ${d.notes.map(n => `<p class="note">${n}</p>`).join('')}
        <p class="src">${src(V.CTO_FIG)}</p>`;
    }
    const h = out.h, elH = $('resHgt');
    if (!h) errCard(elH, 'Alturas', 'Fig. 4A-7', 'TDP fora da faixa 35–70 ft ATS.');
    else {
      elH.className = 'sf-res';
      elH.innerHTML = `<h3>Alturas no CTO</h3>
        <p class="big">${fmt(h.minH)} <small>ft mínima</small></p>
        <p class="sub">No fim do CTO ${fmt(h.endH)} ft ATS</p>
        <p class="sub">${inp.tdp > V.TDP_MIN ? 'TDPE' : 'TDP'} ${inp.tdp} ft ATS${h.exact ? '' : ' (interpolado entre linhas)'}</p>
        <p class="src">Fig. 4A-7 · RFM S12-A35</p>`;
    }

    const sAlt = $('obAlt');
    if (h && inp.tdp > V.TDP_MIN && !out.tdpeAltOk) {
      sAlt.hidden = false; sAlt.className = 'sf-status bad';
      sAlt.textContent = `TDPE acima de 35 ft só até 7000 ft Hp ou Hd. Aqui: Hp ${fmt(inp.pa)} ft, Hd estimada ${fmt(out.hd)} ft.`;
    } else sAlt.hidden = true;

    const sa = $('obAhead');
    if (out.ahead) {
      sa.hidden = false;
      const r = out.ahead, hc = inp.obsAheadHc != null ? inp.obsAheadHc : 0;
      if (r.after) {
        sa.className = 'sf-status bad';
        sa.textContent = `Obstáculo a ${fmt(inp.obsAheadD)} m, depois do fim do CTO (D1 = ${fmt(Math.floor(r.d1))} m). A verificação usa o gradiente PATH 1 (Fig. 4A-8 a 4A-31), ainda não disponível no app: calcule pelo RFM.`;
      } else {
        const ok = r.possible && inp.tdp >= r.req;
        sa.className = 'sf-status ' + (ok ? 'ok' : 'bad');
        const where = inp.obsAheadD != null && d.ok ? `dentro do CTO (${fmt(inp.obsAheadD)} m ≤ ${fmt(ceil1(d.dist))} m)` : 'dentro do CTO (distância não informada)';
        sa.textContent = !r.possible ? `Obstáculo ${where}: TDPE necessário ${fmt(r.req)} ft passa do máximo de 70 ft. O RFM manda adotar o Back Up.`
          : `Obstáculo ${where} (HO ${fmt(inp.obsAheadH)} ft + HC ${fmt(hc)} ft + 20): TDPE mínimo ${fmt(r.req)} ft. ` + (ok ? `TDP ${inp.tdp} ft atende.` : `TDP ${inp.tdp} ft é baixo.`);
      }
    } else sa.hidden = true;

    drawDiagram(inp, out);
    drawChart();
  }

  function drawDiagram(inp, out) {
    const svg = $('diagram');
    const h = out.h, cto = out.dist.ok ? out.dist.dist : null;
    const span = Math.max(cto || 0, 250) * 1.12;
    const G = 178, XL = 60, XR = 610;
    const sx = m => XL + (XR - XL) * m / span;
    const xPad = sx(0);
    const tdp = Math.max(35, Math.min(70, inp.tdp || 35));
    const sy = ft => G - 30 - (ft - 15) / (70 - 15) * 110;   // 15 ft → 30 px, 70 ft → 140 px
    const yT = sy(tdp);
    const yMin = h ? sy(h.minH) : G - 30;
    let s = `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#c8d3ff"/></marker></defs>`;
    s += `<line class="ground" x1="10" y1="${G}" x2="630" y2="${G}"/>`;
    s += `<rect class="pad" x="${xPad - 16}" y="${G - 3}" width="32" height="6" rx="2"/>`;
    s += `<line class="path-climb" x1="${xPad}" y1="${G - 4}" x2="${xPad}" y2="${yT}"/>`;
    s += `<path class="path-rto" d="M${xPad - 8} ${yT + 6} L ${xPad - 8} ${G - 6}"/>`;
    s += `<circle cx="${xPad}" cy="${yT}" r="4.5" fill="#5bc4f1"/>`;
    s += `<text class="tdp" x="${xPad - 10}" y="${yT - 14}">${inp.tdp > V.TDP_MIN ? 'TDPE' : 'TDP'} ${tdp} ft</text>`;
    if (cto != null) {
      const xe = sx(cto), xm = xPad + (xe - xPad) * 0.4;
      s += `<path class="path-cto" d="M${xPad} ${yT} C ${xPad + (xm - xPad) * 0.5} ${yT}, ${xm - 30} ${yMin}, ${xm} ${yMin} S ${xe - 30} ${yT}, ${xe} ${yT}"/>`;
      s += `<circle cx="${xm}" cy="${yMin}" r="3" fill="#3ee08f"/>`;
      if (h) s += `<text class="cto sm" x="${xm}" y="${yMin + 24}" text-anchor="middle">mín. ${fmt(h.minH)} ft</text><text class="cto sm" x="${Math.min(626, xe)}" y="${yT - 10}" text-anchor="end">${fmt(h.endH)} ft</text>`;
      s += `<line class="dim" x1="${xPad}" y1="${G + 22}" x2="${xe}" y2="${G + 22}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
      s += `<text class="cto" x="${(xPad + xe) / 2}" y="${G + 46}" text-anchor="middle">CTO ${fmt(ceil1(cto))} m</text>`;
      const r = out.ahead, D = inp.obsAheadD;
      if (r && D != null && inp.obsAheadH != null) {
        const xo = sx(Math.min(D, span / 1.02)), ho = Math.min(150, 12 + inp.obsAheadH * 0.9);
        s += `<rect x="${xo - 5}" y="${G - ho}" width="10" height="${ho}" fill="${r.after || !r.possible || inp.tdp < r.req ? '#ff4d6d' : '#8fa3e6'}" opacity=".8"/>`;
      }
    }
    svg.setAttribute('viewBox', '0 0 640 236');
    svg.innerHTML = s;
  }

  function tableHtml(inp) {
    const t = inp.tdp;
    const rows = V.T4A7.map(r => `<tr class="${t != null && Math.abs(r[0] - t) < 2.5 ? 'hit' : ''}">${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
    return `<table class="sf-table"><caption><b>Fig. 4A-7</b> Vertical Procedure. Typical Height AGL/ATS for CTO OEI · RFM S12-A35</caption>
      <thead><tr><th>TDPE (ft)</th><th>Alt. mín. (ft)</th><th>Fim CTO (ft)</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function drawChart() {
    if (!last) return;
    document.querySelectorAll('.sf-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    const isTab = tab === 'tab';
    $('chartWrap').hidden = isTab; $('chartTools').hidden = isTab; $('tableWrap').hidden = !isTab;
    if (isTab) { $('chartCap').textContent = 'Linha destacada: valores usados no cálculo.'; $('tableWrap').innerHTML = tableHtml(last.input); return; }
    const fig = tab === 'wat' ? last.cfg.wat : V.CTO_FIG;
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

  function init() {
    load();
    document.querySelectorAll('.sf-config input, .sf-inputs input').forEach(el => el.addEventListener('input', render));
    document.querySelectorAll('.sf-tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; save(readInput()); drawChart(); }));
    $('zoomBtn').addEventListener('click', () => {
      const z = $('chart').classList.toggle('is-zoom');
      $('zoomBtn').textContent = z ? 'Reduzir' : 'Ampliar';
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
