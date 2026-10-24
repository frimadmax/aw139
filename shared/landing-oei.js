// Landing Distance OEI, Braking e Balked Landing (CAT A Clear Area) para o módulo Cat A.
// Leitura direta das cartas do RFM Rev 30 (cata/cl-data.js + cata/cl-engine.js):
//   até 6400 kg Supl. 12 Fig. 4J-2/1, 4J-2/2, 4J-1; até 6800 kg Supl. 50 Fig. 4-60/61/62; até 7000 kg Supl. 90 Fig. 4-100/101/102.
(function(){
'use strict';
const $ = (id) => document.getElementById(id);
const els = {
  weight: $('ldgWeight'), pa: $('ldgPa'), oat: $('ldgOat'),
  pullBtn: $('ldgPullBtn'),
  landing: $('ldgLanding'), braking: $('ldgBraking'), total: $('ldgTotal'),
  band: $('ldgBand'), chip: $('ldgChip'), notice: $('ldgNotice'),
  balked: $('ldgBalked'), src: $('ldgSrc')
};
let last = null, tab = 'land';
if (!els.weight) return;

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.').replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};
const fmt = (n) => Math.round(n).toLocaleString('pt-BR');

let currentLda = null;
let currentLdaLabel = '';

async function refreshLda(){
  currentLda = null; currentLdaLabel = '';
  const base = $('baseSelect')?.value;
  const dep = $('departureEndSelect')?.value || '';
  if (base && dep.includes('::')) {
    const [rwyId, end] = dep.split('::');
    try {
      const res = await fetch(`../adc/${base.toLowerCase()}_builtin_pack_v5.json`);
      const pack = await res.json();
      const rwy = (pack.runways || []).find((r) => r.id === rwyId);
      const lda = rwy?.declaredDistances?.[end]?.lda;
      if (Number.isFinite(lda)) { currentLda = lda; currentLdaLabel = `${base} ${end}`; }
    } catch (_) { /* sem pacote: segue sem comparação de pista */ }
  }
  compute();
}

function setPending(el){ el.textContent = '—'; }

function compute(){
  const kgPerUnit = ($('weightUnitBtn')?.textContent || 'kg').trim().startsWith('lb') ? 1 / 2.20462262 : 1;
  const w = num(els.weight.value) * kgPerUnit;
  const pa = num(els.pa.value);
  const oat = num(els.oat.value);
  els.notice.hidden = true;

  if (![w, pa, oat].every(Number.isFinite)) {
    [els.landing, els.braking, els.total, els.balked].forEach(setPending); last = null;
    els.chip.className = 'status-chip warn';
    els.chip.textContent = 'Aguardando dados';
    els.band.textContent = currentLda ? `LDA ${currentLdaLabel}: ${fmt(currentLda)} m` : '—';
    drawChart(); return;
  }

  const r = window.CLEngine.compute(w, pa, oat);
  last = r;
  const show = (el, x) => { el.textContent = x && x.ok ? `${fmt(x.dist)} m` : '—'; };
  if (!r.ok) {
    [els.landing, els.braking, els.total, els.balked].forEach(setPending);
    els.chip.className = 'status-chip bad'; els.chip.textContent = 'Fora da carta';
    els.band.textContent = '—';
    els.notice.hidden = false; els.notice.textContent = r.msg;
    drawChart(); return;
  }
  show(els.landing, r.land); show(els.braking, r.brake); show(els.balked, r.balked);
  const total = r.total != null ? Math.round(r.land.dist) + Math.round(r.brake.dist) : null;
  els.total.textContent = total !== null ? `${fmt(total)} m` : '—';

  if (total !== null && currentLda) {
    const margin = currentLda - total;
    const ok = margin >= 0;
    els.chip.className = 'status-chip ' + (ok ? 'ok' : 'bad');
    els.chip.textContent = ok ? 'Pista suficiente' : 'Pista insuficiente';
    els.band.textContent = `LDA ${currentLdaLabel}: ${fmt(currentLda)} m · ` +
      (ok ? `+${fmt(margin)} m de margem` : `${fmt(margin)} m de déficit`);
  } else {
    els.chip.className = 'status-chip warn';
    els.chip.textContent = total !== null ? 'Sem LDA' : 'Fora da carta';
    els.band.textContent = total !== null ? 'Selecione base e cabeceira para comparar com a LDA.' : '—';
  }
  const msgs = [r.land, r.brake, r.balked].filter(x => !x.ok).map(x => `Fig. ${x.fig}: ${x.msg}`).concat(r.notes);
  if (msgs.length) { els.notice.hidden = false; els.notice.innerHTML = msgs.map(m => `<div>${m}</div>`).join(''); }
  els.src.innerHTML = `${r.set.supl}, ${r.set === window.CLEngine.SETS[0] ? 'Parte J' : 'Clear Area'} · Fig. ${[r.land, r.brake, r.balked].map(x => x.fig).join(', ')} · Clean / EAPS OFF / EAPS ON / IBF · 2.5 min OEI · 300 A · V<sub>LDP</sub> 50 KIAS · RoD &lt; 350 ft/min · GS<sub>max</sub> 30 kt`;
  drawChart();
}

const CAPS = { land: 'Landing Distance OEI, do LDP até o toque', brake: 'Braking Distance, do toque até parar', balked: 'Balked Landing Distance, do LDP até 35 ft a V<sub>BLSS</sub>' };
function drawChart(){
  document.querySelectorAll('.ldg-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.ldg === tab)));
  const set = last && last.ok ? last.set : window.CLEngine.SETS[0];
  const key = set[tab], ch = window.CL_LDG[key], res = last && last.ok ? last[tab] : null;
  const img = $('ldgImg'), url = ch.img.src;
  if (img.getAttribute('src') !== url) { img.src = url; img.alt = `Figura ${ch.fig} do RFM`; }
  const [bx, by, bw, bh] = ch.img.box, svg = $('ldgSvg');
  svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
  let s = '';
  if (res && res.ok) {
    s += `<polyline class="trace" points="${res.trace.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
    s += `<circle class="dot" cx="${res.trace[2][0]}" cy="${res.trace[2][1]}" r="2.2"/>`;
  }
  svg.innerHTML = s;
  $('ldgCap').innerHTML = `<b>Fig. ${ch.fig}</b> ${CAPS[tab]} · ${set.supl}, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)` +
    (res ? (res.ok ? ` · leitura: <b>${fmt(res.dist)} m</b>` : ` · ${res.msg}`) : '');
}

function pullFromCatA(){
  const w = $('actualWeight')?.value;
  const pa = num($('calcPaDisplay')?.textContent);
  const oat = $('oat')?.value;
  if (w) els.weight.value = w;
  if (Number.isFinite(pa)) els.pa.value = String(pa);
  if (oat) els.oat.value = oat;
  refreshLda();
}

[els.weight, els.pa, els.oat].forEach((el) => el.addEventListener('input', compute));
els.pullBtn.addEventListener('click', pullFromCatA);
document.querySelectorAll('.ldg-tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.ldg; drawChart(); }));
$('ldgZoom').addEventListener('click', () => { const z = $('ldgChart').classList.toggle('is-zoom'); $('ldgZoom').textContent = z ? 'Reduzir' : 'Ampliar'; });
$('runBtn')?.addEventListener('click', () => setTimeout(pullFromCatA, 400));
$('resetBtn')?.addEventListener('click', () => {
  els.weight.value = ''; els.pa.value = ''; els.oat.value = '';
  setTimeout(refreshLda, 100);
});
['baseSelect', 'departureEndSelect'].forEach((id) => $(id)?.addEventListener('change', refreshLda));
const depSel = $('departureEndSelect');
if (depSel) new MutationObserver(() => refreshLda()).observe(depSel, { childList: true });
setTimeout(refreshLda, 1500);
compute();
})();
