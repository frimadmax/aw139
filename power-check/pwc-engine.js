/* AW139 Power Assurance Check (NR 102%) — leitura das cartas do RFM.
 * Supl. 12 Fig. 4K-2 (sem IBF/EAPS) e Fig. 4K-3 (EAPS ON); Supl. 86 Fig. 4-1A (IBF).
 * Leitura: TQ (topo) -> desce até a linha de Hp -> direita até a OAT no painel ITT e no painel NG -> sobe.
 */
(function (root) {
  'use strict';
  const C = root.PWC_CHARTS;
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
  const range = list => [Math.min(...list.map(c => c.v)), Math.max(...list.map(c => c.v))];

  // config: 'NONE' | 'EAPS' | 'IBF'; tq em %, pa em ft, oat em °C
  function read(config, tq, pa, oat) {
    const ch = C[config];
    if (!ch) return fail('Configuração sem carta.');
    const out = { fig: ch.fig, rfmPage: ch.rfmPage };
    const tqMin = Math.round(lin(ch.tq, Math.min(...ch.hp[0].pts.map(p => p[0]))));
    const tqMax = Math.round(lin(ch.tq, Math.max(...ch.hp[0].pts.map(p => p[0]))));
    if (tq < tqMin - 1e-9 || tq > tqMax + 1e-9) return fail(`TQ fora da carta (${tqMin} a ${tqMax} %).`, out);
    const [pMin, pMax] = range(ch.hp), [oMin, oMax] = range(ch.oatItt);
    if (pa < pMin - 1e-9 || pa > pMax + 1e-9) return fail(`Altitude fora da carta (${pMin} a ${pMax} ft).`, out);
    if (oat < oMin - 1e-9 || oat > oMax + 1e-9) return fail(`OAT fora da carta (${oMin} a ${oMax} °C).`, out);
    const x = inv(ch.tq, tq);
    const Y = interp(ch.hp.map(c => ({ v: c.v, pos: yAtX(c.pts, x) })), pa);
    if (Y == null) return fail('Leitura fora das linhas de altitude.', out);
    const Xi = interp(ch.oatItt.map(c => ({ v: c.v, pos: xAtY(c.pts, Y) })), oat);
    const Xn = interp(ch.oatNg.map(c => ({ v: c.v, pos: xAtY(c.pts, Y) })), oat);
    if (Xi == null || Xn == null) return fail('Leitura acima do fim das curvas de OAT (fora da carta).', out);
    const top = Math.min(...ch.oatItt.flatMap(c => c.pts.map(p => p[1])));
    return Object.assign(out, {
      ok: true, itt: lin(ch.itt, Xi), ng: lin(ch.ng, Xn),
      pts: { x, Y, Xi, Xn, top: top - 2 },
    });
  }
  root.PWCEngine = { read, lin, inv };
})(typeof window !== 'undefined' ? window : globalThis);
