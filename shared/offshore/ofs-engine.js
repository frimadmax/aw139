/* AW139 Offshore — W.A.T. e Drop Down pelas cartas vetoriais do RFM Rev 30 (ofw-data.js e ofd-data.js).
 * W.A.T.: Supl. 50 Fig. 4-7 (Clean Air Intake), 4-8 (EAPS OFF), 4-9 (EAPS ON), 4-9C (IBF), até 6800 kg.
 *   São as mesmas curvas das Fig. 4E-1 a 4E-3A do Supl. 12 (conferido: diferença máxima de 0,6 kg), só que liberadas até 6800 kg.
 *   A leitura é a do SFEngine.wat (mesma rotina do Short Field, Back Up, Vertical e Confined).
 * Drop Down: Supl. 12 Fig. 4E-7 (CTO) e 4I-1 (Balked) até 6400 kg; Supl. 50 Fig. 4-74 até 6800 kg.
 *   Hp (eixo de baixo) -> sobe até a linha de OAT -> direita até a linha de peso -> desce até o drop down (ft).
 *   Vento: tabela "Wind Effect" da carta, -5 ft a cada 5 kt de proa (até 40 kt), só os degraus da tabela.
 *   Perfil descendente: +15 ft (nota da carta).
 */
(function (root) {
  'use strict';
  const WAT = { standard: '4-7', eaps_off: '4-8', eaps_on: '4-9', ibf: '4-9C' };
  const GW_MIN = 4400, GW_MAX = 6800, HP_MIN = -1000, HP_MAX = 5000;
  const isaMaxOat = pa => Math.min(50, 50 - 1.98 * pa / 1000);
  const lin = (c, v) => c.a * v + c.b, inv = (c, v) => (v - c.b) / c.a;
  const fail = (fig, msg) => ({ ok: false, fig, msg });
  // Polilinhas: valor no trecho que contém a coordenada; fora da linha, prolonga o trecho da ponta (as linhas são quase retas).
  function along(pts, v, i, j) {
    const n = pts.length;
    let k = 0;
    if (v <= Math.min(pts[0][i], pts[n - 1][i])) k = pts[0][i] < pts[n - 1][i] ? 0 : n - 2;
    else if (v >= Math.max(pts[0][i], pts[n - 1][i])) k = pts[0][i] < pts[n - 1][i] ? n - 2 : 0;
    else for (k = 0; k < n - 2; k++) if ((v - pts[k][i]) * (v - pts[k + 1][i]) <= 0) break;
    const a = pts[k], b = pts[k + 1];
    return a[j] + (v - a[i]) * (b[j] - a[j]) / (b[i] - a[i]);
  }
  const yOn = (pts, x) => along(pts, x, 0, 1), xOn = (pts, y) => along(pts, y, 1, 0);
  function interp(list, v) {
    const s = list.slice().sort((a, b) => a.v - b.v);
    if (!s.length || v < s[0].v - 1e-9 || v > s[s.length - 1].v + 1e-9) return null;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      if (v <= b.v + 1e-9) {
        if (Math.abs(v - a.v) < 1e-9) return a.pos;
        if (Math.abs(v - b.v) < 1e-9) return b.pos;
        if (a.pos == null || b.pos == null) return null;
        return a.pos + (v - a.v) / (b.v - a.v) * (b.pos - a.pos);
      }
    }
    return s[s.length - 1].pos;
  }

  function wat(cfg, pa, oat, hw) {
    const fig = WAT[cfg] || WAT.standard;
    const r = root.SFEngine.wat(fig, pa, oat, hw || 0);
    // peso máximo em kg inteiros, para baixo; encostado na linha de 6800 kg vale 6800
    const kg = r.ok ? (r.limitedBy6400 ? r.gwMax : Math.floor(Math.min(r.gwMax, r.wMax))) : null;
    return Object.assign({ fig, supl: 'Supl. 50', ch: root.OFW_CHARTS[fig], kg }, r);
  }

  const ddFig = (gw, phase) => (gw > 6400 + 1e-9 ? '4-74' : phase === 'landing' ? '4I-1' : '4E-7');
  const windCorr = hw => (hw >= 5 ? -5 * Math.floor(Math.min(40, hw) / 5) : 0);

  function dd(gw, pa, oat, hw, opts) {
    const o = opts || {};
    const fig = ddFig(gw, o.phase), ch = root.OFD_CHARTS[fig];
    if (!ch) return fail(fig, 'Carta não encontrada.');
    if (!(gw >= GW_MIN - 1e-9)) return fail(fig, 'Peso abaixo de 4400 kg: fora das cartas do RFM.');
    if (gw > GW_MAX + 1e-9) return fail(fig, 'Peso acima de 6800 kg: o procedimento offshore vai até 6800 kg.');
    if (pa < HP_MIN - 1e-9 || pa > HP_MAX + 1e-9) return fail(fig, `Altitude fora da carta (${HP_MIN} a ${HP_MAX} ft Hp).`);
    const vLim = isaMaxOat(pa);
    if (oat > vLim + 1e-9) return fail(fig, `OAT acima do limite ISA+35 (${vLim.toFixed(1).replace('.', ',')} °C nesta altitude).`);
    const x = inv(ch.pa, pa);
    // Abaixo da moldura (frio e baixo) a leitura segue a linha prolongada: o drop down dá 0 ft ou a leitura é recusada.
    const inY = y => y >= ch.yTop - 0.3;
    const fam = ch.oat.map(c => { const y = yOn(c.pts, x); return { v: c.v, pos: inY(y) ? y : null }; });
    if (ch.isaLim && vLim < 50) {
      // linha OAT LIMIT ISA+35: vale vLim nesta altitude
      const y = yOn(ch.isaLim, x);
      fam.splice(0, fam.length, ...fam.filter(f => f.v < vLim - 1e-9), { v: vLim, pos: inY(y) ? y : null });
    }
    const Y = interp(fam, oat);
    if (Y == null) return fail(fig, 'Fora da carta com essa altitude e OAT.');
    const xR0 = inv(ch.dd, 0), notes = [];
    const curves = ch.gw.map(c => ({ v: c.v, pos: xOn(c.pts, Y) }));
    if (gw < Math.min(...ch.gw.map(c => c.v)) - 1e-9) return fail(fig, `Peso abaixo da menor curva da carta (${Math.min(...ch.gw.map(c => c.v))} kg).`);
    const X = interp(curves, gw);
    const xRmax = inv(ch.dd, 150);
    if (X == null) return fail(fig, 'Fora da carta.');
    if (Y > ch.yBot + 0.3 && X > xR0 + 0.3) return fail(fig, 'Fora da carta: a leitura passa da borda de baixo.');
    if (X > xRmax + 0.3) return fail(fig, 'Leitura passa da escala de drop down da carta (150 ft).');
    let base = lin(ch.dd, X);
    // As linhas de peso nascem no eixo de 0 ft: abaixo disso o drop down é nulo.
    if (base < 0) { notes.push(`Fig. ${fig}: a leitura fica antes do início da linha de peso; drop down 0 ft.`); base = 0; }
    const wind = windCorr(hw || 0), desc = o.descending ? 15 : 0;
    const final = Math.max(0, base + wind + desc);
    const xb = Math.max(xR0, X);
    return { ok: true, fig, ch, base, wind, desc, final, notes, trace: [[x, ch.yBot], [x, Y], [xb, Y], [xb, ch.yBot]] };
  }

  root.OFSEngine = { WAT, wat, dd, ddFig, windCorr, isaMaxOat };
})(typeof window !== 'undefined' ? window : globalThis);
