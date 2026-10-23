/* AW139 CAT A Heliport Back Up — tabelas do RFM e cálculo do perfil.
 * Curvas (Fig. 4C-3 a 4C-6) em bu-data.js, lidas pelo mesmo motor do Short Field.
 * Tabelas Fig. 4C-7 e 4C-8 transcritas do RFM Rev 30, Suplemento 12, Parte C.
 */
(function (root) {
  'use strict';
  const E = root.SFEngine;
  const CONFIGS = {
    clean:   { label: 'Clean Air Intake', wat: '4C-3' },
    eapsOff: { label: 'EAPS OFF', wat: '4C-4' },
    eapsOn:  { label: 'EAPS ON',  wat: '4C-5' },
    ibf:     { label: 'IBF',      wat: '4C-5A' }
  };
  const DIST_FIG = '4C-6';
  // Fig. 4C-7: TDP (ft) | altura mínima (ft) | altura no fim do CTO (ft) | distância de back up (m)
  const T4C7 = [
    [85, 15, 35, 71], [100, 30, 50, 84], [115, 45, 65, 96], [130, 60, 80, 109], [145, 75, 95, 121],
    [160, 90, 110, 134], [175, 105, 125, 147], [190, 120, 140, 159], [205, 135, 155, 172], [220, 150, 170, 184],
    [235, 165, 185, 197], [250, 180, 200, 209], [265, 195, 215, 222], [280, 210, 230, 234], [295, 225, 245, 247],
    [310, 240, 260, 260], [325, 255, 275, 272], [340, 270, 290, 285], [355, 285, 305, 297], [370, 300, 320, 310],
    [385, 315, 335, 322], [400, 330, 350, 335]
  ];
  // Fig. 4C-8: altura do obstáculo (ft) | distância mínima atrás da borda traseira do heliponto 15 m x 15 m (m)
  const T4C8 = [
    [0, 50], [15, 71], [30, 92], [45, 118], [60, 134], [75, 153], [90, 166], [105, 178], [120, 191], [135, 203],
    [150, 216], [165, 228], [180, 241], [195, 253], [210, 266], [225, 279], [240, 291], [255, 304], [270, 316],
    [285, 329], [300, 341], [315, 354]
  ];
  const TDP_MIN = 85, TDP_MAX = 400;

  function heights(tdp) {
    if (tdp < TDP_MIN || tdp > TDP_MAX) return null;
    for (let i = 0; i < T4C7.length - 1; i++) {
      const a = T4C7[i], b = T4C7[i + 1];
      if (tdp >= a[0] && tdp <= b[0]) {
        const t = (tdp - a[0]) / (b[0] - a[0]);
        const f = k => a[k] + t * (b[k] - a[k]);
        return { tdp, minH: f(1), endH: f(2), backup: f(3), exact: t === 0 || t === 1 };
      }
    }
    return null;
  }

  // Obstáculo atrás (Fig. 4C-8): usa a linha de altura igual ou imediatamente acima (conservador).
  function obstacleBehind(hFt, distM) {
    const row = T4C8.find(r => r[0] >= hFt - 1e-9);
    if (!row) return { ok: false, out: true, msg: 'Obstáculo acima de 315 ft: fora da tabela 4C-8.' };
    return { ok: distM >= row[1], rowH: row[0], minDist: row[1] };
  }
  // Obstáculo à frente, dentro da distância CTO (Fig. 4C-1): TDPE = HO + HC + 70 ft.
  function tdpForObstacle(hoFt, hcFt) {
    const req = Math.max(TDP_MIN, hoFt + hcFt + 70);
    return { req, possible: req <= TDP_MAX };
  }

  function compute(inp) {
    const cfg = CONFIGS[inp.config] || CONFIGS.clean;
    const out = { cfg, input: inp };
    out.wat = E.wat(cfg.wat, inp.pa, inp.oat, inp.hw);
    if (out.wat.ok) out.wat.margin = out.wat.wMax - inp.gw;
    out.h = heights(inp.tdp);
    out.dist = E.cto(inp.pa, inp.oat, inp.gw, inp.hw, DIST_FIG);
    if (out.dist.ok && out.h) out.cto = Math.max(0, out.dist.dist - out.h.backup);
    if (inp.obsBehindH != null && inp.obsBehindD != null) out.behind = obstacleBehind(inp.obsBehindH, inp.obsBehindD);
    if (inp.obsAheadH != null) out.ahead = tdpForObstacle(inp.obsAheadH, inp.obsAheadHc != null ? inp.obsAheadHc : 0);
    return out;
  }

  root.BUEngine = { CONFIGS, DIST_FIG, T4C7, T4C8, heights, obstacleBehind, tdpForObstacle, compute };
})(typeof window !== 'undefined' ? window : globalThis);
