/* AW139 Pouso Offshore — Balked Landing Distance OEI pelas cartas do RFM Rev 30 (dados vetoriais em obl-data.js).
 * Até 6400 kg: Supl. 12 Parte I, Fig. 4I-2 (Clean), 4I-4 (EAPS OFF), 4I-6 (EAPS ON), 4I-8 (IBF).
 * 6400 a 6800 kg: Supl. 50, Fig. 4-75, 4-77, 4-79, 4-100. Supl. 90 não tem procedimento offshore (máx. 6800 kg).
 * Leitura: OAT (eixo de baixo) -> sobe até a linha de Hp -> direita até a curva de peso -> desce até a distância.
 * Vento: tabela "Wind Effect" da carta (-15 m a cada 5 kt de proa, até 40 kt; já fatorada em 50 %).
 */
(function (root) {
  'use strict';
  const EPS = 0.05;
  const SETS = [
    { max: 6400, supl: 'Supl. 12', part: 'Parte I', figs: { standard: '4I-2', eaps_off: '4I-4', eaps_on: '4I-6', ibf: '4I-8' } },
    { max: 6800, supl: 'Supl. 50', part: 'Offshore', figs: { standard: '4-75', eaps_off: '4-77', eaps_on: '4-79', ibf: '4-100' } }
  ];
  const HP_MIN = -1000, HP_MAX = 5000;
  const isaMaxOat = pa => Math.min(50, 50 - 1.98 * pa / 1000);   // ISA+35, limitado a +50 °C
  const lin = (c, v) => c.a * v + c.b, inv = (c, v) => (v - c.b) / c.a;
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
    const s = list.slice().sort((a, b) => a.v - b.v);
    if (!s.length || v < s[0].v - 1e-9 || v > s[s.length - 1].v + 1e-9) return null;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      if (v <= b.v + 1e-9) {
        if (a.pos == null || b.pos == null) return v === a.v ? a.pos : v === b.v ? b.pos : null;
        const t = b.v === a.v ? 0 : (v - a.v) / (b.v - a.v); return a.pos + t * (b.pos - a.pos);
      }
    }
    return s[0].pos;
  }
  const fail = (fig, msg) => ({ ok: false, fig, msg });
  const setFor = gw => SETS.find(s => gw <= s.max + 1e-9);
  // Correção de vento da tabela da carta: só os degraus de 5 kt da tabela (sem interpolar para cima: conservador).
  const windCorr = hw => (hw >= 5 ? -15 * Math.floor(Math.min(40, hw) / 5) : 0);

  function read(fig, gw, pa, oat, hw) {
    const ch = root.OBL_CHARTS[fig];
    if (!ch) return fail(fig, 'Carta não encontrada.');
    const [lx0, , lx1, yBot] = ch.frameL, [rx0, yTop, rx1] = ch.frameR;
    const [gMin, gMax] = ch.gwRange;
    if (gw < gMin - 1e-9 || gw > gMax + 1e-9) return fail(fig, `Peso fora da carta (${gMin} a ${gMax} kg).`);
    if (pa < HP_MIN - 1e-9 || pa > HP_MAX + 1e-9) return fail(fig, `Altitude fora da carta (${HP_MIN} a ${HP_MAX} ft Hp).`);
    const vLim = isaMaxOat(pa);
    if (oat > vLim + 1e-9) return fail(fig, `OAT acima do limite ISA+35 (${vLim.toFixed(1).replace('.', ',')} °C nesta altitude).`);
    const x = inv(ch.oatAx, oat);
    if (x < lx0 - 0.3 || x > lx1 + 0.3) return fail(fig, 'OAT fora da carta (-40 a +50 °C).');
    const Y = interp(ch.hp.map(c => ({ v: c.v, pos: yAtX(c.pts, x) })), pa);
    if (Y == null) return fail(fig, 'Fora da carta com essa altitude e OAT.');
    const notes = [];
    const curves = ch.gw.map(c => {
      let X = xAtY(c.pts, Y), start = false;
      if (X == null) {
        // Acima do início da curva: usa o início (distância maior que a real, a favor da segurança).
        const hi = c.pts.reduce((m, p) => (p[1] < m[1] ? p : m));
        if (Y < hi[1]) { X = hi[0]; start = true; }
      }
      return { v: c.v, pos: X, start };
    });
    const X = interp(curves, gw);
    if (X == null) return fail(fig, 'Leitura passa do fim das curvas de peso da carta (distância acima da escala).');
    const k = curves.findIndex(c => c.v >= gw - 1e-9);
    if (k >= 0 && (curves[k].start || (k > 0 && curves[k].v > gw + 1e-9 && curves[k - 1].start)))
      notes.push(`Fig. ${fig}: a leitura fica acima do início da curva de peso; usado o início da curva (distância maior, a favor da segurança).`);
    const dist0 = Math.max(0, lin(ch.dist, X));
    const corr = windCorr(hw || 0);
    const dist = Math.max(0, dist0 + corr);
    return { ok: true, fig, dist0, corr, dist, notes, trace: [[x, yBot], [x, Y], [X, Y], [X, yBot]] };
  }

  function compute(gw, pa, oat, hw, cfg) {
    if (!(gw >= 4400 - 1e-9)) return { ok: false, msg: 'Peso abaixo de 4400 kg: fora das cartas do RFM.' };
    const set = setFor(gw);
    if (!set) return { ok: false, msg: 'Peso acima de 6800 kg: o procedimento offshore vai até 6800 kg (Supl. 50; o Supl. 90 não tem cartas offshore).' };
    const fig = set.figs[cfg] || set.figs.standard;
    const r = read(fig, gw, pa, oat, hw);
    return Object.assign({ set }, r, { ok: r.ok });
  }

  root.OBLEngine = { SETS, read, compute, windCorr, isaMaxOat };
})(typeof window !== 'undefined' ? window : globalThis);
