/* AW139 CAT A Short Field — motor de cálculo.
 * Lê as curvas vetoriais extraídas do RFM Rev 30, Suplemento 12 (sf-data.js)
 * e reproduz a leitura gráfica: mesmas curvas, mesma interpolação linear entre
 * curvas vizinhas. Cada resultado traz o "trace" (pontos do caminho de leitura)
 * para desenhar sobre a imagem da carta.
 */
(function (root) {
  'use strict';

  const CONFIGS = {
    clean:   { label: 'Clean (sem filtro)', wat: '4B-1',  rto: '4B-4',  cto: '4B-7' },
    eapsOff: { label: 'EAPS OFF',           wat: '4B-2',  rto: '4B-5',  cto: '4B-7' },
    eapsOn:  { label: 'EAPS ON',            wat: '4B-3',  rto: '4B-6',  cto: '4B-7' },
    ibf:     { label: 'IBF instalado',      wat: '4B-3A', rto: '4B-6A', cto: '4B-7' }
  };
  const TDP_MIN = 35, TDP_MAX = 400, GW_MAX = 6400, GW_MIN_CHART = 4400;

  // ---------- geometria ----------
  const EPS = 0.05; // tolerância em pontos PDF (~0,02 mm na carta)
  function xAtY(pts, y) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      if (y1 === y2) continue;
      if (y >= Math.min(y1, y2) - EPS && y <= Math.max(y1, y2) + EPS) return x1 + (y - y1) / (y2 - y1) * (x2 - x1);
    }
    return null;
  }
  function yAtX(pts, x) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      if (x1 === x2) continue;
      if (x >= Math.min(x1, x2) - EPS && x <= Math.max(x1, x2) + EPS) return y1 + (x - x1) / (x2 - x1) * (y2 - y1);
    }
    return null;
  }
  const lin = (c, v) => c.a * v + c.b;          // coordenada -> valor
  const inv = (c, v) => (v - c.b) / c.a;        // valor -> coordenada
  // cartas: Short Field (SF_CHARTS) e Back Up (BU_CHARTS) usam o mesmo formato
  const chart = fig => ['SF_CHARTS', 'BU_CHARTS', 'CA_CHARTS', 'VT_CHARTS', 'VT_P1', 'VT_P2', 'CL_CHARTS', 'CA_ALT'].map(k => root[k] && root[k][fig]).find(Boolean);
  const isaMaxOat = paFt => Math.min(50, 50 - 1.98 * paFt / 1000); // ISA+35 (linha MAX OAT LIMIT)

  // Interpola numa família {v, pos}; devolve pos para o valor pedido ou null.
  function interp(list, v) {
    const s = list.filter(e => e.pos != null).sort((a, b) => a.v - b.v);
    if (!s.length) return null;
    if (v < s[0].v - 1e-9 || v > s[s.length - 1].v + 1e-9) return null;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      if (v >= a.v - 1e-9 && v <= b.v + 1e-9) {
        const t = b.v === a.v ? 0 : (v - a.v) / (b.v - a.v);
        return { pos: a.pos + t * (b.pos - a.pos), lo: a, hi: b, t };
      }
    }
    return { pos: s[0].pos, lo: s[0], hi: s[0], t: 0 };
  }

  // Família de OAT na posição de altitude, incluindo a linha MAX OAT (ISA+35) como curva de valor variável.
  function oatFamily(ch, posAt, paFt) {
    const vLim = isaMaxOat(paFt);
    const fam = ch.oat.filter(c => c.v <= vLim + 1e-9).map(c => ({ v: c.v, pos: posAt(c.pts) }));
    if (paFt >= 0) {
      const p = ch.maxOat ? posAt(ch.maxOat) : null;
      if (p != null) fam.push({ v: vLim, pos: p, isLimit: true });
    }
    return { fam, vLim };
  }

  function fail(msg, extra) { return Object.assign({ ok: false, msg }, extra || {}); }

  // ---------- W.A.T. (Fig. 4B-1, 4B-2, 4B-3, 4B-3A) ----------
  function wat(fig, paFt, oat, hwKt) {
    const ch = chart(fig);
    let y = inv(ch.pa, paFt);
    const top = Math.min(...ch.oat.map(c => Math.min(...c.pts.map(p => p[1]))));
    const bottom = Math.max(...ch.oat.map(c => Math.max(...c.pts.map(p => p[1]))));
    const paTop = Math.round(lin(ch.pa, top) / 100) * 100;
    if (y < top - 0.2) return fail(`Altitude acima do limite da carta (${paTop} ft).`);
    if (y > bottom + 0.1) return fail('Altitude abaixo do limite da carta.');
    y = Math.min(bottom, Math.max(top, y));
    const { fam, vLim } = oatFamily(ch, pts => xAtY(pts, y), paFt);
    if (oat > vLim + 1e-9) return fail(`OAT acima do limite MAX OAT (ISA+35 = ${vLim.toFixed(1)} °C nesta altitude).`);
    const r = interp(fam, oat);
    if (!r) return fail('Fora da carta (limite de Hd ou temperatura fora das curvas).');
    let x = r.pos;
    if (ch.hd) {
      const xh = xAtY(ch.hd, y);
      if (xh != null && x < xh - 0.05) return fail('Fora da carta: limite de Hd excedido.');
    }
    const xMax = inv(ch.w, GW_MAX);
    x = Math.min(x, xMax);
    const wBase = lin(ch.w, x);
    const xLeft = ch.guides.length ? Math.min(...ch.guides.map(g => g.pts[0][0])) : inv(ch.w, 4200);
    const trace = [[xLeft, y], [x, y], [x, ch.y0kt]];

    // crédito de vento de proa (seção inferior da carta)
    // cartas sem seção de vento (Confined Area): sem crédito
    const hw = ch.hw ? Math.max(0, Math.min(20, hwKt || 0)) : 0;
    let wHw = wBase, xH = x;
    if (hw > 0) {
      const yH = inv(ch.hw, hw);
      const guides = ch.guides
        .map(g => ({ v: g.v, pts: g.pts, top: xAtY(g.pts, ch.y0kt), at: xAtY(g.pts, yH) }))
        .filter(g => g.top != null && g.at != null)
        .sort((a, b) => a.top - b.top);
      guides.push({ v: GW_MAX, pts: [[xMax, ch.y0kt], [xMax, yH + 50]], top: xMax, at: xMax });
      let lo = null, hi = null;
      for (let i = 0; i < guides.length - 1; i++) {
        if (x >= guides[i].top - 1e-6 && x <= guides[i + 1].top + 1e-6) { lo = guides[i]; hi = guides[i + 1]; break; }
      }
      if (!lo) { lo = hi = guides[0]; }
      const t = hi.top === lo.top ? 0 : (x - lo.top) / (hi.top - lo.top);
      xH = Math.min(xMax, lo.at + t * (hi.at - lo.at));
      wHw = lin(ch.w, xH);
      // trajeto paralelo às guias, do 0 kt até o vento informado
      for (let k = 1; k <= 16; k++) {
        const yy = ch.y0kt + (yH - ch.y0kt) * k / 16;
        const a = xAtY(lo.pts, yy), b = xAtY(hi.pts, yy);
        if (a != null && b != null) trace.push([Math.min(xMax, a + t * (b - a)), yy]);
      }
      trace.push([xH, yH], [xH, inv(ch.hw, 20) + 4]);
    } else {
      trace.push([x, ch.hw ? inv(ch.hw, 20) + 4 : ch.y0kt + 4]);
    }
    return {
      ok: true, fig, wBase, wMax: wHw, hw, vLim,
      limitedBy6400: wHw >= GW_MAX - 0.5,
      curves: [r.lo.v, r.hi.v], trace
    };
  }
  // ---------- RTO (Fig. 4B-4, 4B-5, 4B-6, 4B-6A) ----------
  function rto(fig, paFt, oat, gwKg, tdpFt) {
    const ch = chart(fig);
    let x = inv(ch.pa, paFt);
    const left = Math.min(...ch.oat.map(c => Math.min(...c.pts.map(p => p[0]))));
    if (x < left - 0.1) return fail('Altitude acima do limite da carta.');
    if (x > ch.divider + 0.1) return fail('Altitude abaixo do limite da carta.');
    x = Math.min(ch.divider, Math.max(left, x));
    const { fam, vLim } = oatFamily(ch, pts => yAtX(pts, x), paFt);
    if (oat > vLim + 1e-9) return fail(`OAT acima do limite MAX OAT (ISA+35 = ${vLim.toFixed(1)} °C nesta altitude).`);
    const r = interp(fam, oat);
    if (!r) return fail('Temperatura fora das curvas da carta.');
    const Y = r.pos;
    const notes = [];
    let gw = gwKg;
    if (gw > GW_MAX) return fail('Peso acima de 6400 kg (máximo do Suplemento 12).');
    if (gw < GW_MIN_CHART) { notes.push(`Peso abaixo de ${GW_MIN_CHART} kg: usada a curva de ${GW_MIN_CHART} kg (conservador).`); gw = GW_MIN_CHART; }
    const g = interp(ch.gw.map(c => ({ v: c.v, pos: xAtY(c.pts, Y) })), gw);
    if (!g) return fail('Peso fora das curvas da carta.');
    const X = g.pos;
    if (tdpFt < TDP_MIN || tdpFt > TDP_MAX) return fail('TDP fora da faixa 35–400 ft.');
    const t = interp(ch.tdp.map(c => ({ v: c.v, pos: yAtX(c.pts, X) })), tdpFt);
    if (!t) return fail('TDP fora das curvas da carta.');
    const D = lin(ch.dist, t.pos);
    const distAxisX = ch.divider + 3.5;
    return {
      ok: true, fig, dist: D, vLim, notes,
      trace: [[x, Math.max(...ch.gw.flatMap(c => c.pts.map(p => p[1])))], [x, Y], [X, Y], [X, t.pos], [distAxisX, t.pos]]
    };
  }

  // ---------- CTO (Fig. 4B-7) ----------
  function cto(paFt, oat, gwKg, hwKt, fig = '4B-7') {
    const ch = chart(fig);
    let x = inv(ch.pa, paFt);
    const xs = ch.oat.flatMap(c => c.pts.map(p => p[0]));
    if (x < Math.min(...xs) - 0.1) return fail('Altitude acima do limite da carta.');
    if (x > Math.max(...xs) + 0.1) return fail('Altitude abaixo do limite da carta.');
    x = Math.min(Math.max(...xs), Math.max(Math.min(...xs), x));
    const { fam, vLim } = oatFamily(ch, pts => yAtX(pts, x), paFt);
    if (oat > vLim + 1e-9) return fail(`OAT acima do limite MAX OAT (ISA+35 = ${vLim.toFixed(1)} °C nesta altitude).`);
    const r = interp(fam, oat);
    if (!r) return fail('Temperatura fora das curvas da carta.');
    const Y = r.pos;
    const notes = [];
    let gw = gwKg;
    if (gw > GW_MAX) return fail('Peso acima de 6400 kg (máximo do Suplemento 12).');
    if (gw < GW_MIN_CHART) { notes.push(`Peso abaixo de ${GW_MIN_CHART} kg: usada a curva de ${GW_MIN_CHART} kg (conservador).`); gw = GW_MIN_CHART; }
    const g = interp(ch.gw.map(c => ({ v: c.v, pos: xAtY(c.pts, Y) })), gw);
    if (!g) return fail('Peso fora das curvas da carta.');
    const D0 = lin(ch.dist, g.pos);
    const xr = ch.ref ? xAtY(ch.ref, Y) : null;
    const corrPerKt = xr == null ? 0 : lin(ch.corr, xr);   // m por kt (negativo)
    const hw = Math.max(0, hwKt || 0);
    const corr = corrPerKt * hw;
    const bottom = Math.max(...ch.gw.flatMap(c => c.pts.map(p => p[1]))) + 6;
    const trace = [[x, bottom], [x, Y], [g.pos, Y], [g.pos, bottom]];
    const traceCorr = xr == null ? null : [[g.pos, Y], [xr, Y], [xr, bottom]];
    return {
      ok: true, fig, dist0: D0, corrPerKt, hw, corr, dist: Math.max(0, D0 + corr), vLim, notes, trace, traceCorr
    };
  }

  function compute(inp) {
    const cfg = CONFIGS[inp.config] || CONFIGS.clean;
    const out = { cfg, input: inp };
    out.wat = wat(cfg.wat, inp.pa, inp.oat, inp.hw);
    out.rto = rto(cfg.rto, inp.pa, inp.oat, inp.gw, inp.tdp);
    out.cto = cto(inp.pa, inp.oat, inp.gw, inp.hw);
    if (out.wat.ok) out.wat.margin = out.wat.wMax - inp.gw;
    return out;
  }

  root.SFEngine = { CONFIGS, wat, rto, cto, compute, isaMaxOat, geo: { xAtY, yAtX, interp, oatFamily, lin, inv, chart } };
})(typeof window !== 'undefined' ? window : globalThis);
