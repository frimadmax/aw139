/* CAT B: tela de distâncias (decolagem, pouso até o toque e frenagem) pelas cartas vetoriais do RFM (cb-engine.js). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const E = window.CBEngine, C = window.CB_CHARTS;
  const KEY = 'aw139.catb.inputs';
  const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
  const up = v => Math.ceil(v - 1e-9);
  const fmt = n => Math.round(n).toLocaleString('pt-BR');
  let tab = 'to', last = null;

  function card(id, title, val, sub, cls) {
    const el = $(id); el.className = 'sf-res' + (cls ? ' ' + cls : '');
    el.innerHTML = `<h3>${title}</h3>${val != null ? `<p class="big">${val} <small>m</small></p>` : '<p class="big">—</p>'}${sub ? `<p class="sub">${sub}</p>` : ''}`;
  }
  const CARDS = [['cbTo', 'Take-off distance'], ['cbTd', 'Landing distance <small>até o toque</small>'], ['cbBr', 'Braking distance'], ['cbTot', 'Distância total']];

  function compute() {
    const pa = num($('cbPa').value), oat = num($('cbOat').value), gw = num($('cbGw').value);
    try { localStorage.setItem(KEY, JSON.stringify({ pa: $('cbPa').value, oat: $('cbOat').value, gw: $('cbGw').value })); } catch (e) {}
    const note = $('cbNotice'); note.hidden = true;
    if (pa == null || oat == null || gw == null) {
      CARDS.forEach(([id, t]) => card(id, t, null, 'Preencha altitude, OAT e peso.'));
      last = null; draw(); return;
    }
    const r = E.compute(gw, pa, oat); last = r;
    if (!r.ok) {
      CARDS.forEach(([id, t]) => card(id, t, null, null, 'is-bad'));
      note.hidden = false; note.textContent = r.msg; draw(); return;
    }
    const to = r.to, ld = r.ld, src = (x, k) => `Fig. ${x.fig} · ${r.set.supl}`;
    if (to.ok) card('cbTo', CARDS[0][1], fmt(up(to.to)), src(to)); else card('cbTo', CARDS[0][1], null, `Fig. ${to.fig}`, 'is-bad');
    if (ld.ok) {
      card('cbTd', CARDS[1][1], fmt(up(ld.td)), src(ld));
      card('cbBr', CARDS[2][1], fmt(up(ld.br)), src(ld));
    } else { card('cbTd', CARDS[1][1], null, `Fig. ${ld.fig}`, 'is-bad'); card('cbBr', CARDS[2][1], null, `Fig. ${ld.fig}`, 'is-bad'); }
    if (to.ok && ld.ok) card('cbTot', CARDS[3][1], fmt(up(to.to) + up(ld.td) + up(ld.br)), 'Decolagem + pouso até o toque + frenagem');
    else card('cbTot', CARDS[3][1], null, null, 'is-bad');
    const msgs = [to, ld].filter(x => !x.ok).map(x => `Fig. ${x.fig}: ${x.msg}`).concat(r.notes);
    if (msgs.length) { note.hidden = false; note.innerHTML = msgs.map(m => `<div>${m}</div>`).join(''); }
    draw();
  }

  function draw() {
    document.querySelectorAll('[data-cb]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.cb === tab)));
    const set = last && last.ok ? last.set : E.SETS[0], key = set[tab], ch = C[key];
    const res = last && last.ok ? last[tab] : null;
    const img = $('cbImg');
    if (img.getAttribute('src') !== ch.img.src) { img.src = ch.img.src; img.alt = `Figura ${ch.fig} do RFM`; }
    const [bx, by, bw, bh] = ch.img.box, svg = $('cbSvg');
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    if (res && res.ok) {
      for (const t of res.traces) s += `<polyline class="trace" points="${t.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
      for (const k of ['toDot', 'tdDot', 'brDot']) if (res[k]) s += `<circle class="dot" cx="${res[k][0].toFixed(2)}" cy="${res[k][1].toFixed(2)}" r="2.2"/>`;
    }
    svg.innerHTML = s;
    const what = tab === 'to' ? 'CAT B Take-Off Distance' : 'CAT B Landing Distance (até o toque e frenagem)';
    let cap = `<b>Fig. ${ch.fig}</b> ${what} · ${set.supl}, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`;
    if (res) cap += res.ok ? (tab === 'to' ? ` · leitura: <b>${fmt(up(res.to))} m</b>` : ` · leitura: toque <b>${fmt(up(res.td))} m</b>, frenagem <b>${fmt(up(res.br))} m</b>`) : ` · ${res.msg}`;
    $('cbCap').innerHTML = cap;
  }

  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s) { $('cbPa').value = s.pa ?? ''; $('cbOat').value = s.oat ?? ''; $('cbGw').value = s.gw ?? ''; }
  } catch (e) {}
  ['cbPa', 'cbOat', 'cbGw'].forEach(id => $(id).addEventListener('input', compute));
  document.querySelectorAll('[data-cb]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.cb; draw(); }));
  $('cbZoom').addEventListener('click', () => { const z = $('cbChart').classList.toggle('is-zoom'); $('cbZoom').textContent = z ? 'Reduzir' : 'Ampliar'; });
  compute();
})();
