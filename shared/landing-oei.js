// Landing Distance OEI + Braking Distance (Clear Area) para o módulo Cat A.
// Dados e interpolação copiados da aba "LANDING OEI" do MENU-AW139.html.
(function(){
'use strict';
// ---------------------------------------------------------------
// LANDING DISTANCE OEI & BRAKING DISTANCE — DATASET
// Fonte: AW139 RFM-4D, extraído visualmente de:
//   Supl 12 (Fig 4J-2/1 Landing OEI, 4J-2/2 Braking) — 4400 a 6400 kg
//   Supl 50 (Fig 4-60 Landing OEI, 4-61 Braking)      — 6400 a 6800 kg
//   Supl 90 (Fig 4-100 Landing OEI, 4-101 Braking)    — 6800 a 7000 kg
// Valores por leitura visual das curvas — aproximação de engenharia,
// não substitui o RFM oficial para operação real.
// ---------------------------------------------------------------

const LDG_DATASET = {
  weights: [4400, 4600, 4800, 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600, 6800, 7000],

  maxOatLimit: [
    { altitude: -2000, oat: 51 },
    { altitude: 0,     oat: 50 },
    { altitude: 2000,  oat: 45 },
    { altitude: 4000,  oat: 39 },
    { altitude: 6000,  oat: 33 },
    { altitude: 8000,  oat: 27 },
    { altitude: 10000, oat: 21 },
    { altitude: 12000, oat: 15 },
    { altitude: 14000, oat: 9  }
  ],

  braking: {
    4600: { 0: { '0': 14, '30': 22 }, 8000: { '0': 24 } },
    5000: { 0: { '0': 16, '30': 26 }, 8000: { '0': 28 } },
    5400: { 0: { '0': 18, '30': 30 }, 8000: { '0': 32 } },
    5800: { 0: { '0': 21, '30': 35 }, 8000: { '0': 38 } },
    6200: { 0: { '0': 24, '30': 39 }, 8000: { '0': 44 } },
    6400: { 0: { '0': 26, '30': 42, '50': 54 }, 4000: { '0': 36, '30': 58 }, 8000: { '0': 48 } },
    6600: { 0: { '0': 28, '30': 45, '50': 58 }, 4000: { '0': 39, '30': 63 }, 8000: { '0': 52 } },
    6800: { 0: { '0': 30, '30': 48, '50': 62 }, 4000: { '0': 42, '30': 68 }, 8000: { '0': 56 } },
    7000: { 0: { '0': 33, '30': 53, '50': 68 }, 4000: { '0': 46, '30': 75 }, 8000: { '0': 60 } }
  },

  landingOEI: {
    4400: { 0: { '0': 150, '30': 195 }, 8000: { '0': 220 } },
    4800: { 0: { '0': 165, '30': 215 }, 8000: { '0': 240 } },
    5200: { 0: { '0': 180, '30': 232 }, 8000: { '0': 260 } },
    5600: { 0: { '0': 195, '30': 250 }, 8000: { '0': 280 } },
    6000: { 0: { '0': 210, '30': 268 }, 8000: { '0': 300 } },
    6400: { 0: { '0': 210, '30': 270, '50': 315 }, 4000: { '0': 260, '30': 335 }, 8000: { '0': 305 } },
    6800: { 0: { '0': 230, '30': 290, '50': 340 }, 4000: { '0': 280, '30': 360 }, 8000: { '0': 325 } },
    7000: { 0: { '0': 240, '30': 305, '50': 355 }, 4000: { '0': 295, '30': 378 }, 8000: { '0': 345 } }
  }
};

function ldgClamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function ldgLerp(x, x0, x1, y0, y1){
  if (x1 === x0) return y0;
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}
function ldgNeighbors(arr, v){
  if (v <= arr[0]) return [arr[0], arr[0]];
  if (v >= arr[arr.length-1]) return [arr[arr.length-1], arr[arr.length-1]];
  for (let i=0; i<arr.length-1; i++){
    if (v >= arr[i] && v <= arr[i+1]) return [arr[i], arr[i+1]];
  }
  return [arr[0], arr[arr.length-1]];
}

function ldgValueAtWeightAltitude(table, weight, altitude){
  const wData = table[weight];
  if (!wData) return null;
  const altKeys = Object.keys(wData).map(Number).sort((a,b)=>a-b);
  if (altKeys.length === 0) return null;
  const [a0, a1] = ldgNeighbors(altKeys, altitude);

  function valueAtOat(altKey, oat){
    const m = wData[altKey];
    const oatKeys = Object.keys(m).map(Number).sort((a,b)=>a-b);
    if (oatKeys.length === 1) return m[oatKeys[0]];
    const [o0, o1] = ldgNeighbors(oatKeys, oat);
    if (o0 === o1) return m[o0];
    return ldgLerp(oat, o0, o1, m[o0], m[o1]);
  }

  return { a0, a1, valueAtOat };
}

function ldgInterpolate3D(table, weights, weight, altitude, oat){
  const wKeys = weights.filter(w => table[w]).sort((a,b)=>a-b);
  if (wKeys.length === 0) return null;
  const [w0, w1] = ldgNeighbors(wKeys, weight);

  function valueAtWeight(w){
    const res = ldgValueAtWeightAltitude(table, w, altitude);
    if (!res) return null;
    const { a0, a1, valueAtOat } = res;
    if (a0 === a1) return valueAtOat(a0, oat);
    const v0 = valueAtOat(a0, oat);
    const v1 = valueAtOat(a1, oat);
    return ldgLerp(altitude, a0, a1, v0, v1);
  }

  const vw0 = valueAtWeight(w0);
  const vw1 = valueAtWeight(w1);
  if (vw0 === null) return vw1;
  if (vw1 === null) return vw0;
  if (w0 === w1) return vw0;
  return ldgLerp(weight, w0, w1, vw0, vw1);
}

function ldgGetMaxOatLimit(altitude){
  const pts = LDG_DATASET.maxOatLimit.slice().sort((a,b)=>a.altitude-b.altitude);
  const alts = pts.map(p=>p.altitude);
  const [a0, a1] = ldgNeighbors(alts, altitude);
  if (a0 === a1){
    return pts.find(p=>p.altitude===a0).oat;
  }
  const p0 = pts.find(p=>p.altitude===a0);
  const p1 = pts.find(p=>p.altitude===a1);
  return ldgLerp(altitude, a0, a1, p0.oat, p1.oat);
}

function calcLdgAndBraking(weight, altitude, oat){
  const w = ldgClamp(weight, LDG_DATASET.weights[0], LDG_DATASET.weights[LDG_DATASET.weights.length-1]);
  const maxOat = ldgGetMaxOatLimit(altitude);
  const exceedsLimit = oat > maxOat;
  const landingOEI = ldgInterpolate3D(LDG_DATASET.landingOEI, LDG_DATASET.weights, w, altitude, oat);
  const braking = ldgInterpolate3D(LDG_DATASET.braking, LDG_DATASET.weights, w, altitude, oat);
  return {
    landingOEI: landingOEI !== null ? Math.round(landingOEI) : null,
    braking: braking !== null ? Math.round(braking) : null,
    maxOat: Math.round(maxOat * 10) / 10,
    exceedsLimit
  };
}


const $ = (id) => document.getElementById(id);
const els = {
  weight: $('ldgWeight'), pa: $('ldgPa'), oat: $('ldgOat'),
  pullBtn: $('ldgPullBtn'),
  landing: $('ldgLanding'), braking: $('ldgBraking'), total: $('ldgTotal'),
  band: $('ldgBand'), chip: $('ldgChip'), notice: $('ldgNotice')
};
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
    [els.landing, els.braking, els.total].forEach(setPending);
    els.chip.className = 'status-chip warn';
    els.chip.textContent = 'Aguardando dados';
    els.band.textContent = currentLda ? `LDA ${currentLdaLabel}: ${fmt(currentLda)} m` : '—';
    return;
  }

  const r = calcLdgAndBraking(w, pa, oat);
  els.landing.textContent = r.landingOEI !== null ? `${fmt(r.landingOEI)} m` : '—';
  els.braking.textContent = r.braking !== null ? `${fmt(r.braking)} m` : '—';
  const total = (r.landingOEI !== null && r.braking !== null) ? r.landingOEI + r.braking : null;
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
    els.chip.textContent = total !== null ? 'Sem LDA' : 'Fora da tabela';
    els.band.textContent = 'Selecione base e cabeceira para comparar com a LDA.';
  }

  if (r.exceedsLimit) {
    els.notice.hidden = false;
    els.notice.textContent = `OAT acima do MAX OAT LIMIT (${r.maxOat} °C) para esta altitude. Resultado fora do envelope certificado.`;
  }
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
