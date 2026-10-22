/* AW139 CAT A Short Field — interface */
(function () {
  'use strict';
  const E = window.SFEngine, C = window.SF_CHARTS;
  const $ = id => document.getElementById(id);
  const KEY = 'aw139.shortfield.v1';
  const M2FT = 3.28084;
  const fmt = n => Math.round(n).toLocaleString('pt-BR');
  const floor10 = n => Math.floor(n / 10) * 10;
  const ceil1 = n => Math.ceil(n - 1e-9);
  let tab = 'wat', last = null;

  const fields = ['inPa', 'inOat', 'inGw', 'inTdp', 'inHw', 'inField'];
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
      pa: num('inPa'), oat: num('inOat'), gw: num('inGw'), tdp: num('inTdp'), hw: num('inHw') || 0, field: num('inField')
    };
  }

  function src(fig) { const ch = C[fig]; return `Fig. ${fig} · RFM ${ch.rfmPage}`; }
  function errCard(el, title, fig, msg) {
    el.className = 'sf-res is-bad';
    el.innerHTML = `<h3>${title}</h3><p class="err">${msg}</p><p class="src">${src(fig)}</p>`;
  }

  function render() {
    const inp = readInput();
    save(inp);
    const missing = ['pa', 'oat', 'gw', 'tdp'].filter(k => inp[k] == null);
    const cfg = E.CONFIGS[inp.config];
    if (missing.length) {
      ['resWat', 'resRto', 'resCto'].forEach(id => { $(id).className = 'sf-res'; $(id).innerHTML = '<h3>—</h3><p class="sub">Preencha altitude, OAT, peso e TDP.</p>'; });
      return;
    }
    if (inp.hw < 0) {
      ['resWat', 'resRto', 'resCto'].forEach(id => errCard($(id), 'Vento', cfg.wat, 'Vento de cauda: decolagem proibida (Supl. 12, 1B).'));
      return;
    }
    const out = E.compute(inp);
    last = out;

    // W.A.T.
    const w = out.wat, elW = $('resWat');
    if (!w.ok) errCard(elW, 'Peso máx. W.A.T.', cfg.wat, w.msg);
    else {
      const wMax = floor10(w.wMax), margin = wMax - inp.gw;
      elW.className = 'sf-res ' + (margin >= 0 ? 'is-ok' : 'is-bad');
      const credit = w.wMax - w.wBase;
      elW.innerHTML = `<h3>Peso máx. W.A.T.</h3>
        <p class="big">${fmt(wMax)} <small>kg</small></p>
        <p class="sub">Sem vento ${fmt(floor10(w.wBase))} kg${w.hw > 0 ? ` · vento ${w.hw} kt +${fmt(credit)} kg` : ''}${w.limitedBy6400 ? ' · limitado a 6400 kg' : ''}</p>
        <p class="sub">${margin >= 0 ? `Margem +${fmt(margin)} kg sobre o GW` : `<b>GW excede em ${fmt(-margin)} kg</b>`}</p>
        ${inp.hw > 20 ? '<p class="note">Vento acima de 20 kt: crédito limitado a 20 kt (fim da escala).</p>' : ''}
        <p class="src">${src(cfg.wat)}</p>`;
    }
    // RTO
    const r = out.rto, elR = $('resRto');
    if (!r.ok) errCard(elR, 'Distância RTO', cfg.rto, r.msg);
    else {
      const d = ceil1(r.dist);
      elR.className = 'sf-res';
      elR.innerHTML = `<h3>Distância RTO</h3>
        <p class="big">${fmt(d)} <small>m</small></p>
        <p class="sub">${fmt(d * M2FT)} ft · TDP ${inp.tdp} ft</p>
        ${r.notes.map(n => `<p class="note">${n}</p>`).join('')}
        <p class="src">${src(cfg.rto)}</p>`;
    }
    // CTO
    const c = out.cto, elC = $('resCto');
    if (!c.ok) errCard(elC, 'Distância CTO', '4B-7', c.msg);
    else {
      const d = ceil1(c.dist);
      elC.className = 'sf-res';
      elC.innerHTML = `<h3>Distância CTO (OEI)</h3>
        <p class="big">${fmt(d)} <small>m</small></p>
        <p class="sub">${fmt(d * M2FT)} ft · sem vento ${fmt(ceil1(c.dist0))} m</p>
        ${c.hw > 0 ? `<p class="sub">Correção ${c.corrPerKt.toFixed(1).replace('.', ',')} m/kt × ${c.hw} kt = ${fmt(c.corr)} m</p>` : ''}
        ${c.notes.map(n => `<p class="note">${n}</p>`).join('')}
        <p class="src">${src('4B-7')}</p>`;
    }
    // pista disponível
    const st = $('fieldStatus');
    if (inp.field != null && inp.field > 0 && r.ok) {
      const d = ceil1(r.dist), ok = inp.field >= d;
      st.hidden = false; st.className = 'sf-status ' + (ok ? 'ok' : 'bad');
      st.textContent = ok ? `Pista disponível ${fmt(inp.field)} m ≥ RTO ${fmt(d)} m (sobra ${fmt(inp.field - d)} m).`
                          : `Pista disponível ${fmt(inp.field)} m é menor que o RTO de ${fmt(d)} m (faltam ${fmt(d - inp.field)} m).`;
    } else st.hidden = true;

    drawDiagram(inp, out);
    drawChart();
  }

  // ---------- diagrama do perfil ----------
  function drawDiagram(inp, out) {
    const svg = $('diagram');
    const rto = out.rto.ok ? out.rto.dist : null, cto = out.cto.ok ? out.cto.dist : null;
    const field = inp.field > 0 ? inp.field : null;
    const span = Math.max(rto || 0, cto || 0, field || 0, 200) * 1.08;
    const X0 = 80, X1 = 600, G = 178;
    const sx = m => X0 + (X1 - X0) * m / span;
    const tdp = Math.max(35, Math.min(400, inp.tdp || 35));
    const hT = 34 + (tdp - 35) / 365 * 104;     // altura do TDP no desenho
    const yT = G - hT;
    let s = '';
    s += `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#c8d3ff"/></marker></defs>`;
    if (field) s += `<rect class="field" x="${X0}" y="${G - 3}" width="${sx(field) - X0}" height="6" rx="2"/><text class="sm" x="${sx(field)}" y="${G - 8}" text-anchor="end">pista ${fmt(field)} m</text>`;
    s += `<line class="ground" x1="20" y1="${G}" x2="630" y2="${G}"/>`;
    s += `<rect class="pad" x="${X0 - 14}" y="${G - 2}" width="28" height="4" rx="2"/>`;
    // subida vertical até o TDP
    s += `<path class="path-climb" d="M${X0} ${G - 4} L${X0} ${yT}"/>`;
    s += `<circle cx="${X0}" cy="${yT}" r="4.5" fill="#5bc4f1"/>`;
    s += `<text class="tdp" x="${X0 + 10}" y="${yT - 10}">TDP ${tdp} ft</text>`;
    // CTO: perda até TDP-20 ft e subida até a altura do TDP no fim da distância
    if (cto != null) {
      const xe = sx(cto), dip = Math.min(14, hT * 0.3);
      s += `<path class="path-cto" d="M${X0} ${yT} C ${X0 + (xe - X0) * 0.25} ${yT + dip}, ${X0 + (xe - X0) * 0.55} ${yT + dip}, ${xe} ${yT}"/>`;
      s += `<path class="path-cto" d="M${xe} ${yT} L${Math.min(630, xe + 40)} ${yT - 22}" opacity=".55"/>`;
      s += `<text class="cto sm" x="${Math.min(632, xe + 44)}" y="${yT - 28}" text-anchor="end">V<tspan font-size="11" dy="3">TOSS</tspan><tspan dy="-3"> 40 KIAS</tspan></text>`;
      s += `<line class="dim" x1="${X0}" y1="${G + 18}" x2="${xe}" y2="${G + 18}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
      s += `<text class="cto" x="${(X0 + xe) / 2}" y="${G + 38}" text-anchor="middle">CTO ${fmt(ceil1(cto))} m</text>`;
    }
    // RTO: descida e parada na pista
    if (rto != null) {
      const xe = sx(rto);
      s += `<path class="path-rto" d="M${X0} ${yT} C ${X0 + (xe - X0) * 0.35} ${yT + hT * 0.2}, ${X0 + (xe - X0) * 0.6} ${G - 4}, ${xe} ${G - 4}"/>`;
      s += `<line x1="${xe}" y1="${G - 14}" x2="${xe}" y2="${G + 4}" stroke="#ffb020" stroke-width="2"/>`;
      s += `<line class="dim" x1="${X0}" y1="${G + 52}" x2="${xe}" y2="${G + 52}" marker-end="url(#ar)" marker-start="url(#ar)"/>`;
      s += `<text class="rto" x="${(X0 + xe) / 2}" y="${G + 74}" text-anchor="middle">RTO ${fmt(ceil1(rto))} m</text>`;
    }
    svg.innerHTML = s;
  }

  // ---------- carta com a leitura ----------
  function drawChart() {
    if (!last) return;
    const cfg = last.cfg;
    const fig = tab === 'wat' ? cfg.wat : tab === 'rto' ? cfg.rto : '4B-7';
    const ch = C[fig], res = last[tab];
    document.querySelectorAll('.sf-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $('chartCap').innerHTML = `<b>Figure ${fig}</b> ${ch.title} · RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`;
    const img = $('chartImg');
    if (img.getAttribute('src') !== ch.img.src) { img.src = ch.img.src; img.alt = `Figura ${fig} do RFM`; }
    const [bx, by, bw, bh] = ch.img.box;
    const svg = $('chartSvg');
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    if (res && res.ok && res.trace) {
      const pts = res.trace.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ');
      s += `<polyline class="trace" points="${pts}"/>`;
      if (res.traceCorr) s += `<polyline class="trace2" points="${res.traceCorr.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      const k = tab === 'wat' ? 1 : 2;
      const p = res.trace[Math.min(k, res.trace.length - 1)];
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
