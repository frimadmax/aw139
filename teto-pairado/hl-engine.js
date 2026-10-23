/* AW139 Height Loss after Engine Failure in Hover (flyaway) — motor de cálculo.
 * RFM Rev 30: Seção 4 Fig. 4-43 (até 6400 kg) e Suplemento 50 Fig. 4-37 (6400 a 6800 kg).
 * Leitura: Hp -> linha de OAT -> curva de peso -> curva de vento (0 a 40 kt, já fatorado 50%) -> perda de altura.
 */
(function (root) {
  'use strict';
  const C = root.HL_CHARTS;
  const GW_MIN = 4400, GW_BASIC = 6400, GW_MAX = 6800, HW_MAX = 40, CLEAR_MIN = 15;
  const EPS = 0.05;
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
  const lin = (c, v) => c.a * v + c.b, inv = (c, v) => (v - c.b) / c.a;
  const isaMaxOat = pa => Math.min(50, 50 - 1.98 * pa / 1000);   // ISA+35 (MAX OAT LIMIT)
  function interp(list, v) {
    const s = list.filter(e => e.pos != null).sort((a, b) => a.v - b.v);
    if (!s.length || v < s[0].v - 1e-9 || v > s[s.length - 1].v + 1e-9) return null;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      if (v <= b.v + 1e-9) { const t = b.v === a.v ? 0 : (v - a.v) / (b.v - a.v); return a.pos + t * (b.pos - a.pos); }
    }
    return s[0].pos;
  }
  const fail = (msg, extra) => Object.assign({ ok: false, msg }, extra || {});
  const figFor = gw => gw > GW_BASIC + 1e-9 ? 'S50-4-37' : '4-43';

  function compute(inp) {
    const { pa, oat } = inp;
    let gw = inp.gw, hw = Math.max(0, inp.hw || 0);
    const notes = [];
    if (gw > GW_MAX + 1e-9) return fail('Weight above 6800 kg: no flyaway chart (Basic RFM up to 6400 kg, Supplement 50 up to 6800 kg).');
    const fig = figFor(gw), ch = C[fig];
    const gMin = Math.min(...ch.gw.map(c => c.v));
    if (gw < gMin) { notes.push(`Weight below ${gMin} kg: the ${gMin} kg curve is used (conservative).`); gw = gMin; }
    if (hw > HW_MAX) { notes.push(`Headwind above ${HW_MAX} kt: credit limited to ${HW_MAX} kt (end of the chart).`); hw = HW_MAX; }
    const vLim = isaMaxOat(pa);
    if (oat > vLim + 1e-9) return fail(`OAT above MAX OAT LIMIT (ISA+35 = ${vLim.toFixed(1)} °C at this altitude).`, { fig });
    const xs = ch.oat.flatMap(c => c.pts.map(p => p[0]));
    const x = inv(ch.pa, pa);
    if (x < Math.min(...xs) - 0.1) return fail(`Pressure altitude above the chart (${Math.round(lin(ch.pa, Math.min(...xs)) / 100) * 100} ft).`, { fig });
    if (x > Math.max(...xs) + 0.1) return fail('Pressure altitude below the chart.', { fig });
    const fam = ch.oat.filter(c => c.v <= vLim + 1e-9).map(c => ({ v: c.v, pos: yAtX(c.pts, x) }));
    if (pa >= 0) { const p = yAtX(ch.maxOat, x); if (p != null) fam.push({ v: vLim, pos: p }); }
    const Y = interp(fam, oat);
    if (Y == null) return fail('Temperature outside the chart lines.', { fig });
    const X = interp(ch.gw.map(c => ({ v: c.v, pos: xAtY(c.pts, Y) })), gw);
    if (X == null) return fail('Weight outside the chart curves (off the right edge: height loss above the scale).', { fig });
    const W = interp(ch.wind.map(c => ({ v: c.v, pos: yAtX(c.pts, X) })), hw);
    if (W == null) return fail('Height loss above the top of the chart scale.', { fig });
    const hl = lin(ch.hl, W);
    const bottom = Math.max(...ch.oat.flatMap(c => c.pts.map(p => p[1]))) + 4;
    const trace = [[x, bottom], [x, Y], [X, Y], [X, W], [Math.max(...ch.wind.flatMap(c => c.pts.map(p => p[0]))) + 4, W]];
    const out = { ok: true, fig, hl, hlM: hl * 0.3048, gw, hw, notes, trace };
    if (inp.hoverH != null) {
      const clr = Math.max(CLEAR_MIN, inp.clear != null ? inp.clear : CLEAR_MIN);
      out.req = hl + clr; out.clr = clr; out.flyaway = inp.hoverH >= out.req - 1e-9;
    }
    return out;
  }
  root.HLEngine = { compute, figFor, GW_MAX, HW_MAX, CLEAR_MIN };
})(typeof window !== 'undefined' ? window : globalThis);
