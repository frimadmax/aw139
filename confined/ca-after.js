/* AW139 CAT A Confined Area — obstáculo depois da distância CTO (Fig. 4D-1 e Seção 4D).
 * Subida padrão: PATH 1 (Fig. 4A-8 a 4A-31) até 200 ft ATS ou TDP + 100 ft, depois PATH 2 (Fig. 4K-5 a 4K-28) até 1000 ft ATS.
 * Subida alternativa 60 KIAS: um gradiente só (Fig. 4D-10 a 4D-33) do fim do CTO até 1000 ft ATS.
 * A distância do obstáculo (DO) é medida do ponto de decolagem; CTO = distância do TDP (Fig. 4D-9) − subida para trás (Fig. 4D-7).
 */
(function (root) {
  'use strict';
  const B = root.BUEngine, VT = root.VTEngine, M2FT = 3.28084;
  const TDP_MIN = 100, TDP_MAX = 400;
  // inp: config, pa, oat, hw, gw, tdp, obsAheadH, obsAheadHc, obsAheadD, climb ('std' | 'alt'); distM: distância do TDP (Fig. 4D-9)
  function obstacleAfter(inp, distM) {
    const alt = inp.climb === 'alt';
    const hReq = inp.obsAheadH + (inp.obsAheadHc || 0);
    const at = (tdp, gw) => {
      const h = B.heights(tdp), cto = Math.max(0, distM - h.backup), d1 = inp.obsAheadD - cto;
      if (d1 < 0) return { ok: true, inside: true, cto, d1 };
      return Object.assign({ cto, d1, d1Ft: d1 * M2FT, endH: h.endH, top: Math.max(200, tdp + 100) },
        VT.heightAt(inp, gw, h.endH, d1 * M2FT, Math.max(200, tdp + 100), alt));
    };
    const out = Object.assign({ after: true, alt, hReq }, at(inp.tdp, inp.gw));
    out.aboveTop = hReq > 1000;
    if (!out.ok) return out;
    out.clear = out.h - inp.obsAheadH;
    out.clears = out.h >= hReq - 1e-9;
    if (out.clears) return out;
    const ok = (t, w) => { const r = at(t, w); return r.ok && (r.inside ? t >= hReq + 85 : r.h >= hReq - 1e-9); };
    if (ok(TDP_MAX, inp.gw)) {
      let lo = Math.max(TDP_MIN, inp.tdp), hi = TDP_MAX;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (ok(m, inp.gw)) hi = m; else lo = m; }
      out.tdpReq = Math.ceil(hi - 1e-6);
      return out;
    }
    if (!ok(TDP_MAX, 4400)) { out.gw2 = null; return out; }
    let lo = 4400, hi = Math.max(4400, Math.min(6400, inp.gw));
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (ok(TDP_MAX, m)) lo = m; else hi = m; }
    out.gw2 = lo;
    return out;
  }
  root.CAAfter = { obstacleAfter };
})(typeof window !== 'undefined' ? window : globalThis);
