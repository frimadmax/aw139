/* AW139 CAT A Heliport/Helideck Vertical — tabela do RFM e cálculo do perfil.
 * Curvas (Fig. 4A-3 a 4A-5A e 4A-6) em vt-data.js, lidas pelo mesmo motor do Short Field.
 * Tabela Fig. 4A-7 e regras do TDPE transcritas do RFM Rev 30, Suplemento 12, Parte A.
 */
(function (root) {
  'use strict';
  const E = root.SFEngine;
  const CONFIGS = {
    clean:   { label: 'Clean',    wat: '4A-3' },
    eapsOff: { label: 'EAPS OFF', wat: '4A-4' },
    eapsOn:  { label: 'EAPS ON',  wat: '4A-5' },
    ibf:     { label: 'IBF',      wat: '4A-5A' }
  };
  const CTO_FIG = '4A-6';
  // Fig. 4A-7: TDPE (ft) | altura mínima (ft) | altura no fim do CTO (ft)
  const T4A7 = [[35, 15, 35], [40, 20, 40], [45, 25, 45], [50, 30, 50], [55, 35, 55], [60, 40, 60], [65, 45, 65], [70, 50, 70]];
  const TDP_MIN = 35, TDP_MAX = 70, PA_MAX = 14000, TDPE_ALT_MAX = 7000;
  const isaT = paFt => 15 - 1.98 * paFt / 1000;
  const hdFt = (paFt, oat) => paFt + 118.8 * (oat - isaT(paFt));   // altitude densidade aproximada

  function heights(tdp) {
    if (tdp < TDP_MIN || tdp > TDP_MAX) return null;
    for (let i = 0; i < T4A7.length - 1; i++) {
      const a = T4A7[i], b = T4A7[i + 1];
      if (tdp >= a[0] && tdp <= b[0]) {
        const t = (tdp - a[0]) / (b[0] - a[0]);
        const f = k => a[k] + t * (b[k] - a[k]);
        return { tdp, minH: f(1), endH: f(2), exact: t === 0 || t === 1 };
      }
    }
    return null;
  }
  // Obstáculo à frente (Fig. 4A-1): dentro da distância CTO, TDPE = HO + HC + 20 ft (35 a 70 ft).
  // Depois da distância CTO o RFM usa o gradiente PATH 1 (Fig. 4A-8 a 4A-31).
  function obstacleAhead(hoFt, hcFt, doM, ctoM) {
    if (ctoM != null && doM != null && doM > ctoM) return { after: true, d1: doM - ctoM };
    const req = Math.max(TDP_MIN, hoFt + hcFt + 20);
    return { after: false, req, possible: req <= TDP_MAX };
  }

  function compute(inp) {
    const cfg = CONFIGS[inp.config] || CONFIGS.clean;
    const out = { cfg, input: inp };
    out.wat = inp.pa > PA_MAX ? { ok: false, msg: 'Acima de 14000 ft Hp: limite CAT A (Supl. 12, 1A).' } : E.wat(cfg.wat, inp.pa, inp.oat, inp.hw);
    if (out.wat.ok) out.wat.margin = out.wat.wMax - inp.gw;
    out.h = heights(inp.tdp);
    out.hd = hdFt(inp.pa, inp.oat);
    out.tdpeAltOk = !(inp.tdp > TDP_MIN) || (inp.pa <= TDPE_ALT_MAX && out.hd <= TDPE_ALT_MAX);
    out.dist = E.cto(inp.pa, inp.oat, inp.gw, inp.hw, CTO_FIG);
    if (out.dist.ok) out.cto = out.dist.dist;
    if (inp.obsAheadH != null) out.ahead = obstacleAhead(inp.obsAheadH, inp.obsAheadHc != null ? inp.obsAheadHc : 0, inp.obsAheadD, out.cto);
    return out;
  }

  root.VTEngine = { CONFIGS, CTO_FIG, T4A7, TDP_MIN, TDP_MAX, TDPE_ALT_MAX, heights, obstacleAhead, hdFt, compute };
})(typeof window !== 'undefined' ? window : globalThis);
