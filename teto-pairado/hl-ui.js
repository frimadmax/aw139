/* AW139 Hover — abas Hover Ceiling / Height Loss e interface do Height Loss */
(function () {
  'use strict';
  const H = window.HLEngine, C = window.HL_CHARTS;
  const $ = id => document.getElementById(id);
  const KEY = 'aw139.hover.v1';
  const fields = ['hlPa', 'hlOat', 'hlGw', 'hlHw', 'hlH', 'hlClr'];
  const fmt = n => Math.round(n).toLocaleString('en-US');
  let pane = 'hc';
  const num = id => { const v = parseFloat(String($(id).value).replace(',', '.')); return Number.isFinite(v) ? v : null; };
  function save() {
    try { const s = { pane }; fields.forEach(id => { s[id] = $(id).value; }); localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignora */ }
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!s) return;
      fields.forEach(id => { if (s[id] != null) $(id).value = s[id]; });
      if (s.pane) pane = s.pane;
    } catch (e) { /* sem armazenamento */ }
  }
  function showPane() {
    document.querySelectorAll('.hv-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.pane === pane)));
    document.querySelectorAll('.hv-pane').forEach(el => { el.hidden = el.dataset.pane !== pane; });
  }
  function render() {
    save();
    const inp = { pa: num('hlPa'), oat: num('hlOat'), gw: num('hlGw'), hw: num('hlHw') || 0, hoverH: num('hlH'), clear: num('hlClr') };
    const el = $('hlRes'), fly = $('hlFly');
    if (['pa', 'oat', 'gw'].some(k => inp[k] == null)) { el.className = 'sf-res'; el.innerHTML = '<h3>—</h3><p class="sub">Fill in altitude, OAT and weight.</p>'; fly.hidden = true; return; }
    if (inp.hw < 0) { el.className = 'sf-res is-bad'; el.innerHTML = '<h3>Height loss</h3><p class="err">Tailwind: no credit in the chart.</p>'; fly.hidden = true; return; }
    const r = H.compute(inp);
    const fig = r.fig || H.figFor(inp.gw > H.GW_MAX ? 6400 : inp.gw), ch = C[fig];
    const src = `Fig. ${fig.replace('S50-', 'Suppl. 50, ')} · RFM ${ch.rfmPage}`;
    if (!r.ok) { el.className = 'sf-res is-bad'; el.innerHTML = `<h3>Height loss</h3><p class="err">${r.msg}</p><p class="src">${src}</p>`; fly.hidden = true; }
    else {
      el.className = 'sf-res';
      el.innerHTML = `<h3>Height loss (OEI flyaway)</h3>
        <p class="big">${fmt(Math.ceil(r.hl - 1e-9))} <small>ft</small></p>
        <p class="sub">${fmt(Math.ceil(r.hlM - 1e-9))} m · no clearance included</p>
        ${r.hw > 0 ? `<p class="sub">Headwind ${r.hw} kt</p>` : ''}
        ${r.notes.map(n => `<p class="note">${n}</p>`).join('')}
        <p class="src">${src}</p>`;
      if (r.req != null) {
        fly.hidden = false; fly.className = 'sf-status ' + (r.flyaway ? 'ok' : 'bad');
        fly.textContent = `Required hover height: ${fmt(Math.ceil(r.req - 1e-9))} ft (height loss + ${fmt(r.clr)} ft clearance). ` +
          (r.flyaway ? `Hover at ${fmt(inp.hoverH)} ft: flyaway capability exists.` : `Hover at ${fmt(inp.hoverH)} ft: no flyaway capability, follow the landing/ditching procedure.`);
      } else fly.hidden = true;
    }
    $('hlCap').innerHTML = `<b>Figure ${fig.replace('S50-', '')}</b> ${ch.title}${fig.startsWith('S50') ? ' · Supplement 50' : ' · Section 4'} · RFM ${ch.rfmPage} (PDF page ${ch.page})`;
    const img = $('hlImg');
    if (img.getAttribute('src') !== ch.img.src) { img.src = ch.img.src; img.alt = `RFM figure ${fig}`; }
    const [bx, by, bw, bh] = ch.img.box, svg = $('hlSvg');
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    if (r.ok) {
      s += `<polyline class="trace" points="${r.trace.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      const p = r.trace[3]; s += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="2.2"/>`;
    }
    svg.innerHTML = s;
  }
  function init() {
    load(); showPane();
    document.querySelectorAll('.hv-tabs button').forEach(b => b.addEventListener('click', () => { pane = b.dataset.pane; showPane(); save(); }));
    fields.forEach(id => $(id).addEventListener('input', render));
    $('hlZoom').addEventListener('click', () => { const z = $('hlChart').classList.toggle('is-zoom'); $('hlZoom').textContent = z ? 'Reduce' : 'Zoom'; });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
