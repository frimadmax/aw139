/* AW139 CAT A Heliport (ground level e elevado) — pouso (RFM Rev 30, Suplemento 12, Parte G).
 * W.A.T.: Fig. 4A-3 a 4A-5A (vertical/vt-data.js). Arremetida (balked): Fig. 4G-2 (hb-data.js), vale para todos os pesos.
 * Distância de pouso OEI: 160 m do ponto a 50 ft ALS ao ponto de pouso (Seção 4G).
 * Alturas (Fig. 3G-1): mínima LDP − 35 ft (15 ft com LDP 50), fim da arremetida LDP − 15 ft (35 ft),
 * PATH 1 até 200 ft ou LDP + 150 ft ALS, PATH 2 até 1000 ft ALS.
 */
(function (root) {
  'use strict';
  const E = root.SFEngine, VT = root.VTEngine;
  const CONFIGS = {
    clean:   { label: 'Clean Air Intake', wat: '4A-3' },
    eapsOff: { label: 'EAPS OFF', wat: '4A-4' },
    eapsOn:  { label: 'EAPS ON',  wat: '4A-5' },
    ibf:     { label: 'IBF',      wat: '4A-5A' }
  };
  const BL_FIG = '4G-2';
  const LDP_MIN = 50, LDP_MAX = 400, PA_MAX = 14000, LAND_M = 160, M2FT = 3.28084, EPS = 0.05;
  const lin = (c, v) => c.a * v + c.b, inv = (c, v) => (v - c.b) / c.a;
  const isaMaxOat = pa => 50 - 1.98 * pa / 1000;   // ISA+35 (MAX OAT LIMIT)
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
  function interp(list, v) {
    const s = list.filter(e => e.pos != null).sort((a, b) => a.v - b.v);
    if (!s.length || v < s[0].v - 1e-9 || v > s[s.length - 1].v + 1e-9) return null;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      if (v <= b.v + 1e-9) { const t = b.v === a.v ? 0 : (v - a.v) / (b.v - a.v); return a.pos + t * (b.pos - a.pos); }
    }
    return s[0].pos;
  }
  const fail = msg => ({ ok: false, msg, notes: [] });

  // Fig. 4G-2: Hp -> linha de OAT -> direita até a curva -> desce até a distância.
  function balked(pa, oat) {
    const ch = root.HB_CHARTS[BL_FIG];
    if (pa < -1e-9) return fail('Altitude abaixo de 0 ft: fora da Fig. 4G-2 (eixo de 0 a 14000 ft).');
    if (pa > PA_MAX + 1e-9) return fail('Acima de 14000 ft Hp: fora da carta.');
    const vLim = isaMaxOat(pa);
    if (oat > vLim + 1e-9) return fail(`OAT acima do MAX OAT LIMIT (ISA+35 = ${vLim.toFixed(1).replace('.', ',')} °C nesta altitude).`);
    const x = inv(ch.pa, pa);
    const fam = ch.oat.filter(c => c.v <= vLim + 1e-9).map(c => ({ v: c.v, pos: yAtX(c.pts, x) }));
    const pm = yAtX(ch.maxOat, x);
    if (pm != null) fam.push({ v: vLim, pos: pm });
    const Y = interp(fam, oat);
    if (Y == null) return fail('Fora da carta: nesta altitude a linha dessa OAT já saiu pelo topo da Fig. 4G-2.');
    const curve = ch.curve.slice().sort((a, b) => a[1] - b[1]);
    const X = xAtY(curve, Y);
    if (X == null) return fail('Leitura fora da curva da carta.');
    const bottom = Math.max(...ch.oat.flatMap(c => c.pts.map(p => p[1])));
    return { ok: true, fig: BL_FIG, dist: lin(ch.dist, X), notes: [], trace: [[x, bottom + 4], [x, Y], [X, Y], [X, bottom + 4]] };
  }

  const heights = ldp => ({ minH: ldp - 35, endH: ldp - 15, path1Top: Math.max(200, ldp + 150) });

  // Obstáculo no perfil de arremetida (Fig. 4G-1), distância medida do LDP.
  function obstacleBalked(inp, blM) {
    const hReq = inp.obsH + (inp.obsHc || 0);
    if (blM == null || inp.obsD == null || inp.obsD <= blM) {
      const req = Math.max(LDP_MIN, hReq + 35);
      return { within: true, hReq, req, possible: req <= LDP_MAX };
    }
    const d1Ft = (inp.obsD - blM) * M2FT;
    const at = (ldp, gw) => VT.heightAt(inp, gw, heights(ldp).endH, d1Ft, heights(ldp).path1Top, false);
    const out = Object.assign({ within: false, hReq, d1: inp.obsD - blM, d1Ft }, at(inp.ldp, inp.gw));
    if (!out.ok) return out;
    out.clear = out.h - inp.obsH;
    out.clears = out.h >= hReq - 1e-9;
    if (out.clears) return out;
    const top = at(LDP_MAX, inp.gw);
    if (top.ok && top.h >= hReq) {
      let lo = Math.max(LDP_MIN, inp.ldp), hi = LDP_MAX;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; const r = at(m, inp.gw); if (r.ok && r.h >= hReq) hi = m; else lo = m; }
      out.ldpReq = Math.ceil(hi - 1e-6);
      return out;
    }
    const w0 = at(LDP_MAX, 4400);
    if (!w0.ok || w0.h < hReq) { out.gw2 = null; return out; }
    let lo = 4400, hi = Math.max(4400, Math.min(6400, inp.gw));
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; const r = at(LDP_MAX, m); if (r.ok && r.h >= hReq) lo = m; else hi = m; }
    out.gw2 = lo;
    return out;
  }

  function compute(inp) {
    const cfg = CONFIGS[inp.config] || CONFIGS.clean;
    const out = { cfg, input: inp };
    out.wat = inp.pa > PA_MAX ? { ok: false, msg: 'Acima de 14000 ft Hp: limite do pouso CAT A (Supl. 12, 1G).' } : E.wat(cfg.wat, inp.pa, inp.oat, inp.hw);
    out.h = inp.ldp >= LDP_MIN && inp.ldp <= LDP_MAX ? heights(inp.ldp) : null;
    out.bl = balked(inp.pa, inp.oat);
    if (inp.obsH != null) out.balked = obstacleBalked(inp, out.bl.ok ? out.bl.dist : null);
    return out;
  }

  root.HBEngine = { CONFIGS, BL_FIG, LDP_MIN, LDP_MAX, LAND_M, heights, balked, obstacleBalked, compute };
})(typeof window !== 'undefined' ? window : globalThis);
