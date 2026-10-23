/* AW139 CAT A Confined Area — pouso (RFM Rev 30, Suplemento 12, Parte H).
 * W.A.T.: Fig. 4D-4 a 4D-6A (ca-data.js). Pouso arremetido (balked): Fig. 4H-4 (cl-data.js).
 * Distância de pouso OEI do LDP: tabela Fig. 4H-3. Zona de obstáculo na aproximação: Fig. 4D-8.
 * Depois da distância de arremetida: PATH 1 (Fig. 4A-8 a 4A-31) e PATH 2 (Fig. 4K-5 a 4K-28).
 */
(function (root) {
  'use strict';
  const E = root.SFEngine, VT = root.VTEngine, CA = root.BUEngine;
  const CONFIGS = {
    clean:   { label: 'Clean',    wat: '4D-4' },
    eapsOff: { label: 'EAPS OFF', wat: '4D-5' },
    eapsOn:  { label: 'EAPS ON',  wat: '4D-6' },
    ibf:     { label: 'IBF',      wat: '4D-6A' }
  };
  const BL_FIG = '4H-4';
  // Fig. 4H-3: LDP (ft ALS) | distância de pouso OEI do LDP (m)
  const T4H3 = [[100, 36], [120, 44], [140, 51], [160, 58], [180, 66], [200, 73], [220, 80], [240, 87],
    [260, 94], [280, 102], [300, 109], [320, 116], [340, 123], [360, 131], [380, 138], [400, 145]];
  const LDP_MIN = 100, LDP_MAX = 400, PA_MAX = 10000, M2FT = 3.28084;

  function landDist(ldp) {
    if (ldp < LDP_MIN || ldp > LDP_MAX) return null;
    for (let i = 0; i < T4H3.length - 1; i++) {
      const a = T4H3[i], b = T4H3[i + 1];
      if (ldp >= a[0] && ldp <= b[0]) {
        const t = (ldp - a[0]) / (b[0] - a[0]);
        return { dist: a[1] + t * (b[1] - a[1]), exact: t === 0 || t === 1 };
      }
    }
    return null;
  }
  // Alturas no pouso arremetido (Fig. 3H-1): mínima LDP − 85 ft (15 ft com LDP 100), fim da distância LDP − 65 ft.
  const heights = ldp => ({ minH: ldp - 85, endH: ldp - 65, path1Top: Math.max(200, ldp + 100) });

  // Obstáculo no perfil de arremetida (Fig. 4H-1), distância medida do LDP.
  function obstacleBalked(inp, blM) {
    const hReq = inp.obsH + (inp.obsHc || 0);
    if (blM == null || inp.obsD == null || inp.obsD <= blM) {
      const req = Math.max(LDP_MIN, hReq + 85);
      return { within: true, hReq, req, possible: req <= LDP_MAX };
    }
    const d1Ft = (inp.obsD - blM) * M2FT;
    const at = (ldp, gw) => VT.heightAt(inp, gw, heights(ldp).endH, d1Ft, heights(ldp).path1Top);
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
    out.wat = inp.pa > PA_MAX ? { ok: false, msg: 'Acima de 10000 ft Hp: limite do pouso CAT A (Supl. 12, 1H).' } : E.wat(cfg.wat, inp.pa, inp.oat, 0);
    if (out.wat.ok) out.wat.margin = out.wat.wMax - inp.gw;
    out.land = landDist(inp.ldp);
    out.h = inp.ldp >= LDP_MIN && inp.ldp <= LDP_MAX ? heights(inp.ldp) : null;
    out.bl = E.cto(inp.pa, inp.oat, inp.gw, 0, BL_FIG);
    if (inp.obsH != null) out.balked = obstacleBalked(inp, out.bl.ok ? out.bl.dist : null);
    if (inp.apH != null && inp.apD != null) out.approach = CA.obstacleBehind(inp.apH, inp.apD);
    return out;
  }

  root.PCEngine = { CONFIGS, BL_FIG, T4H3, T4D8: CA.T4C8, LDP_MIN, LDP_MAX, landDist, heights, obstacleBalked, compute };
})(typeof window !== 'undefined' ? window : globalThis);
