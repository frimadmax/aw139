/* AW139 CAT A Confined Area — tabelas do RFM e cálculo do perfil.
 * Curvas (Fig. 4D-4 a 4D-6A e 4D-9) em ca-data.js, lidas pelo mesmo motor do Short Field.
 * Tabelas Fig. 4D-7 e 4D-8 transcritas do RFM Rev 30, Suplemento 12, Parte D.
 */
(function (root) {
  'use strict';
  const E = root.SFEngine;
  const CONFIGS = {
    clean:   { label: 'Clean Air Intake', wat: '4D-4' },
    eapsOff: { label: 'EAPS OFF', wat: '4D-5' },
    eapsOn:  { label: 'EAPS ON',  wat: '4D-6' },
    ibf:     { label: 'IBF',      wat: '4D-6A' }
  };
  const DIST_FIG = '4D-9';
  // Fig. 4D-7: TDP (ft) | altura mínima (ft) | altura no fim do CTO (ft) | subida para trás (m) | deslocamento lateral máx. (m)
  const T4D7 = [
    [100, 15, 35, 36, 15], [120, 35, 55, 44, 16], [140, 55, 75, 51, 17], [160, 75, 95, 58, 18],
    [180, 95, 115, 65, 19], [200, 115, 135, 73, 20], [220, 135, 155, 80, 21], [240, 155, 175, 87, 22],
    [260, 175, 195, 94, 23], [280, 195, 215, 102, 24], [300, 215, 235, 109, 25], [320, 235, 255, 116, 26],
    [340, 255, 275, 124, 27], [360, 275, 295, 131, 28], [380, 295, 315, 138, 29], [400, 315, 335, 145, 30]
  ];
  // Fig. 4D-8: altura do obstáculo (ft) | distância mínima da borda traseira do heliponto 20 m x 20 m (m)
  const T4D8 = [
    [0, 15], [16, 21], [33, 27], [49, 33], [66, 39], [82, 45], [98, 51], [115, 57], [131, 63], [148, 69],
    [164, 75], [180, 81], [197, 87], [213, 92], [230, 98], [246, 104], [262, 110], [279, 116], [295, 122],
    [312, 128], [328, 134], [344, 140], [361, 146], [377, 152], [385, 155]
  ];
  const TDP_MIN = 100, TDP_MAX = 400, PA_MAX = 10000;

  function heights(tdp) {
    if (tdp < TDP_MIN || tdp > TDP_MAX) return null;
    for (let i = 0; i < T4D7.length - 1; i++) {
      const a = T4D7[i], b = T4D7[i + 1];
      if (tdp >= a[0] && tdp <= b[0]) {
        const t = (tdp - a[0]) / (b[0] - a[0]);
        const f = k => a[k] + t * (b[k] - a[k]);
        return { tdp, minH: f(1), endH: f(2), backup: f(3), lateral: f(4), exact: t === 0 || t === 1 };
      }
    }
    return null;
  }
  // Obstáculo atrás (Fig. 4D-8): linha de altura igual ou imediatamente acima (conservador).
  function obstacleBehind(hFt, distM) {
    const row = T4D8.find(r => r[0] >= hFt - 1e-9);
    if (!row) return { ok: false, out: true, msg: 'Obstáculo acima de 385 ft: fora da tabela 4D-8.' };
    return { ok: distM >= row[1], rowH: row[0], minDist: row[1] };
  }
  // Obstáculo à frente, dentro da distância CTO (Fig. 4D-1): TDP = HO + HC + 85 ft.
  function tdpForObstacle(hoFt, hcFt) {
    const req = Math.max(TDP_MIN, hoFt + hcFt + 85);
    return { req, possible: req <= TDP_MAX };
  }

  function compute(inp) {
    const cfg = CONFIGS[inp.config] || CONFIGS.clean;
    const out = { cfg, input: inp };
    out.wat = inp.pa > PA_MAX ? { ok: false, msg: 'Acima de 10000 ft Hp: limite do Confined Area (Supl. 12, 1D).' } : E.wat(cfg.wat, inp.pa, inp.oat, 0);
    if (out.wat.ok) out.wat.margin = out.wat.wMax - inp.gw;
    out.h = heights(inp.tdp);
    out.dist = E.cto(inp.pa, inp.oat, inp.gw, inp.hw, DIST_FIG);
    if (out.dist.ok && out.h) out.cto = Math.max(0, out.dist.dist - out.h.backup);
    if (inp.obsBehindH != null && inp.obsBehindD != null) out.behind = obstacleBehind(inp.obsBehindH, inp.obsBehindD);
    if (inp.obsAheadH != null) out.ahead = tdpForObstacle(inp.obsAheadH, inp.obsAheadHc != null ? inp.obsAheadHc : 0);
    return out;
  }

  root.BUEngine = { CONFIGS, DIST_FIG, T4C7: T4D7, T4C8: T4D8, heights, obstacleBehind, tdpForObstacle, compute, TDP_MIN };
})(typeof window !== 'undefined' ? window : globalThis);
