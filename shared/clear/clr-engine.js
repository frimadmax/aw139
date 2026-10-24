/* AW139 Clear Area — W.A.T. e RTO pelas cartas vetoriais do RFM Rev 30 (clw-data.js e clr-data.js).
 * W.A.T.: Supl. 50 Fig. 4-1 (Standard), 4-2 (EAPS OFF), 4-3 (EAPS ON), 4-9A (IBF), até 6800 kg.
 *   Aeronave 7000 kg: Supl. 90 Fig. 4-5 a 4-8 (linha MAX OAT ISA+20). Onde a carta do Supl. 90 não dá leitura
 *   (acima do topo dela ou acima de ISA+20), vale a carta do Supl. 50, limitada a 6800 kg.
 *   A leitura é a do SFEngine.wat (mesma rotina do Short Field, Back Up, Vertical, Confined e Offshore).
 * RTO: Supl. 50 Fig. 4-54, 4-56, 4-58, 4-68A até 6800 kg; acima de 6800 kg, Supl. 90 Fig. 4-92, 4-94, 4-96, 4-98.
 *   Hp (eixo de baixo do painel esquerdo) -> sobe até a linha de OAT -> direita até a curva de peso -> desce até a distância.
 *   Na mesma altura, a Reference Line do painel direito dá a correção em metros por kt de vento de proa.
 *   Vento de cauda: a carta não tem correção (nenhum crédito).
 */
(function (root) {
  'use strict';
  const WAT = { standard: ['4-1', 'S90-4-5'], eaps_off: ['4-2', 'S90-4-6'], eaps_on: ['4-3', 'S90-4-7'], ibf: ['4-9A', 'S90-4-8'] };
  const RTO = { standard: ['4-54', 'S90-4-92'], eaps_off: ['4-56', 'S90-4-94'], eaps_on: ['4-58', 'S90-4-96'], ibf: ['4-68A', 'S90-4-98'] };
  const supl = fig => (/^S90-/.test(fig) ? 'Supl. 90' : 'Supl. 50');
  const figName = fig => fig.replace(/^S90-/, '');
  const lin = (c, v) => c.a * v + c.b, inv = (c, v) => (v - c.b) / c.a;
  const EPS = 0.3;
  const fail = (fig, msg, extra) => Object.assign({ ok: false, fig, msg }, extra || {});

  // valor da polilinha na coordenada i = v (j = a outra coordenada); null fora da linha (com folga EPS)
  function on(pts, v, i, j) {
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      const lo = Math.min(a[i], b[i]) - EPS, hi = Math.max(a[i], b[i]) + EPS;
      if (v < lo || v > hi) continue;
      if (a[i] === b[i]) return a[j];
      const t = Math.max(0, Math.min(1, (v - a[i]) / (b[i] - a[i])));
      return a[j] + t * (b[j] - a[j]);
    }
    return null;
  }
  const yOn = (pts, x) => on(pts, x, 0, 1), xOn = (pts, y) => on(pts, y, 1, 0);

  // ---------- W.A.T. ----------
  function wat(cfg, ac, pa, oat, hw) {
    const [s50, s90] = WAT[cfg] || WAT.standard;
    const run = fig => {
      const r = root.SFEngine.wat(fig, pa, oat, hw || 0);
      const kg = r.ok ? (r.limitedBy6400 ? r.gwMax : Math.floor(Math.min(r.gwMax, r.wMax))) : null;
      return Object.assign({ fig, supl: supl(fig), name: figName(fig), ch: root.CLW_CHARTS[fig], kg }, r);
    };
    if (String(ac) !== '7000') return run(s50);
    const r = run(s90);
    if (r.ok) return r;
    const b = run(s50);
    if (!b.ok) return Object.assign(b, { msg: `${b.msg} (Fig. ${figName(s90)}: ${r.msg})` });
    return Object.assign(b, { fallback: true, note: `Fig. ${figName(s90)} (Supl. 90) sem leitura: ${r.msg} Vale a Fig. ${figName(s50)} do Supl. 50, até 6800 kg.` });
  }

  // ---------- RTO ----------
  function rtoFig(cfg, gw) { const [s50, s90] = RTO[cfg] || RTO.standard; return gw > 6800 + 1e-9 ? s90 : s50; }
  function rto(cfg, gw, pa, oat, hw, ac) {
    const fig = rtoFig(cfg, String(ac) === '6800' ? Math.min(gw, 6800) : gw), ch = root.CLR_CHARTS[fig];
    const base = { fig, supl: supl(fig), name: figName(fig), ch };
    const F = (msg, extra) => fail(fig, msg, Object.assign({}, base, extra));
    if (!ch) return F('Carta não encontrada.');
    if (String(ac) === '6800' && gw > 6800 + 1e-9) return F('Peso acima de 6800 kg: aeronave 6800 kg.');
    const gws = ch.gw.map(c => c.v), gMin = gws[0], gMax = gws[gws.length - 1];
    if (gw < gMin - 1e-9) return F(`Peso abaixo de ${gMin} kg: a Fig. ${base.name} começa em ${gMin} kg.`);
    if (gw > gMax + 1e-9) return F(`Peso acima de ${gMax} kg.`);
    const paHi = Math.round(lin(ch.pa, ch.L[0]) / 100) * 100, paLo = Math.round(lin(ch.pa, ch.L[1]) / 100) * 100;
    if (pa > paHi + 1e-9 || pa < paLo - 1e-9) return F(`Altitude fora da carta (${paLo} a ${paHi} ft Hp).`);
    const x0 = inv(ch.pa, pa);

    // família de OAT no x da altitude; a linha MAX OAT LIMIT entra como curva de valor ISA+35 (até 50 °C)
    const dev = ch.isaDev || 35, vLim = Math.min(50, 15 + dev - 1.98 * pa / 1000);
    if (oat > vLim + 1e-9) return F(`OAT acima do limite MAX OAT (ISA+${dev} = ${vLim.toFixed(1)} °C nesta altitude).`);
    // curva que sai pelo fundo do quadro antes da altitude: a leitura fica no fundo (todas as curvas de peso já estão no piso)
    const posAt = pts => {
      const y = yOn(pts, x0);
      if (y != null) return y;
      const end = pts[0][0] > x0 ? pts[0] : pts[pts.length - 1];
      return Math.abs(end[1] - ch.yBot) < 1 ? ch.yBot : null;
    };
    const fam = ch.oat.filter(c => c.v <= vLim + 1e-9).map(c => ({ v: c.v, pos: posAt(c.pts) }));
    if (ch.maxOat && vLim < 50 - 1e-9) {
      const p = yOn(ch.maxOat, x0);
      if (p != null) fam.push({ v: vLim, pos: p, lim: true });
    }
    fam.sort((a, b) => a.v - b.v);
    const known = fam.filter(e => e.pos != null);
    if (!known.length) return F('Fora da carta nesta altitude.');
    if (oat < fam[0].v - 1e-9) return F(`OAT abaixo da menor curva da carta (${fam[0].v} °C).`);
    let lo = null, hi = null;
    for (let i = 0; i < fam.length; i++) {
      if (fam[i].v <= oat + 1e-9) lo = fam[i];
      if (fam[i].v >= oat - 1e-9) { hi = fam[i]; break; }
    }
    if (!lo || !hi) return F('OAT fora das curvas da carta nesta altitude.');
    if (lo.pos == null || hi.pos == null) return F('Fora da carta: a leitura passa do topo do quadro nesta altitude e OAT.');
    const t = hi.v === lo.v ? 0 : (oat - lo.v) / (hi.v - lo.v);
    const Y = Math.min(ch.yBot, lo.pos + t * (hi.pos - lo.pos));

    // curva de peso na altura Y
    let gl = ch.gw[0], gh = ch.gw[ch.gw.length - 1];
    for (let i = 0; i < ch.gw.length; i++) {
      if (ch.gw[i].v <= gw + 1e-9) gl = ch.gw[i];
      if (ch.gw[i].v >= gw - 1e-9) { gh = ch.gw[i]; break; }
    }
    const xl = xOn(gl.pts, Y), xh = xOn(gh.pts, Y);
    if (xl == null || xh == null) return F('Fora da carta: a leitura sai do painel de peso.');
    const tg = gh.v === gl.v ? 0 : (gw - gl.v) / (gh.v - gl.v);
    const xC = xl + tg * (xh - xl);
    const dist0 = lin(ch.dist, xC);

    // correção de vento: Reference Line na mesma altura (m por kt; o sinal impresso varia entre as cartas)
    // acima do ponto em que a Reference Line sai pela borda direita do painel, vale o valor da borda
    // (o crédito real seria maior; fica o menor, a favor da segurança)
    const refTop = ch.ref.reduce((a, b) => (b[1] < a[1] ? b : a));
    let xR = xOn(ch.ref, Y);
    if (xR == null && Y < refTop[1]) xR = refTop[0];
    if (xR == null) return F('Fora da carta: a leitura sai da Reference Line.');
    const perKt = -Math.abs(lin(ch.corr, xR));
    const hwUse = Math.max(0, hw || 0);
    const corr = perKt * hwUse;
    const dist = dist0 + corr;
    const trace = [[x0, ch.yBot], [x0, Y], [xR, Y], [xR, ch.yBot]];
    const drop = [[xC, Y], [xC, ch.yBot]];
    return Object.assign(base, {
      ok: true, dist, dist0, perKt, corr, hw: hwUse, Y, x0, xC, xR, vLim,
      oatCurves: [lo.lim ? 'MAX OAT' : lo.v, hi.lim ? 'MAX OAT' : hi.v], gwCurves: [gl.v, gh.v],
      traces: [trace, drop], dots: [[x0, Y], [xC, Y], [xR, Y]]
    });
  }

  root.CLREngine = { WAT, RTO, wat, rto, rtoFig, figName, supl };
})(window);
