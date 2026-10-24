/* AW139 Enhanced Offshore (Supl. 97) — W.A.T. e Drop Down pelas cartas vetoriais do RFM Rev 30 (ew-data.js e edd-data.js).
 * W.A.T.: Fig. 4-1 (Clean Air Intake), 4-3 (EAPS OFF), 4-5 (EAPS ON), 4-7 (IBF), até 7000 kg, Hp -1000 a 1000 ft.
 *   A carta não tem painel de vento. A leitura é a do SFEngine.wat (mesma rotina do Offshore e do Clear Area).
 *   Conferida contra as tabelas do próprio RFM (Fig. 4-2, 4-4, 4-6, 4-8): diferença de até 1 kg.
 * Drop Down: Fig. 4-10 (vale para todas as configurações), 6000 a 7000 kg.
 *   Hp (eixo de baixo) -> sobe até a linha de OAT -> direita até a borda do painel do meio ->
 *   acompanha as curvas-guia até o vento de proa (até 40 kt) -> direita até a curva de peso -> desce até a perda de altura (ft).
 *   Conferido contra as tabelas de vento zero do RFM (Fig. 4-11 e 4-12). Acima de 150 ft (fim da escala da carta) vale a tabela, sem crédito de vento.
 */
(function (root) {
  'use strict';
  const WAT = { standard: 'S97-4-1', eaps_off: 'S97-4-3', eaps_on: 'S97-4-5', ibf: 'S97-4-7' };
  const DD = 'S97-4-10';
  const figName = fig => fig.replace(/^S97-/, '');
  const lin = (c, v) => c.a * v + c.b, inv = (c, v) => (v - c.b) / c.a;
  const EPS = 0.3;
  const fail = (fig, msg, extra) => Object.assign({ ok: false, fig, name: figName(fig), msg }, extra || {});

  // valor da polilinha na coordenada i = v (j = a outra coordenada); null fora da linha (com folga EPS)
  function on(pts, v, i, j) {
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      if (v < Math.min(a[i], b[i]) - EPS || v > Math.max(a[i], b[i]) + EPS) continue;
      if (a[i] === b[i]) return a[j];
      const t = Math.max(0, Math.min(1, (v - a[i]) / (b[i] - a[i])));
      return a[j] + t * (b[j] - a[j]);
    }
    return null;
  }
  const yOn = (pts, x) => on(pts, x, 0, 1), xOn = (pts, y) => on(pts, y, 1, 0);
  // prolonga o primeiro trecho da polilinha (ordenada por x) até x
  const yExt = (pts, x) => { const a = pts[0], b = pts[1]; return a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]); };

  // ---------- W.A.T. ----------
  function wat(cfg, pa, oat) {
    const fig = WAT[cfg] || WAT.standard;
    const r = root.SFEngine.wat(fig, pa, oat, 0);
    const kg = r.ok ? (r.limitedBy6400 ? r.gwMax : Math.floor(Math.min(r.gwMax, r.wMax))) : null;
    return Object.assign({ fig, name: figName(fig), supl: 'Supl. 97', ch: root.EW_CHARTS[fig], kg }, r);
  }

  // ---------- Drop Down ----------
  // tabela de vento zero: interpolação linear em OAT, Hp e peso; null se faltar célula (acima da MAX OAT da tabela)
  function tableFt(Z, gw, pa, oat) {
    const keys = o => Object.keys(o).map(Number).sort((a, b) => a - b);
    const br = (ks, v) => { let lo = null, hi = null; for (const k of ks) { if (k <= v + 1e-9) lo = k; if (k >= v - 1e-9) { hi = k; break; } } return lo == null || hi == null ? null : [lo, hi]; };
    const mix = (a, b, ka, kb, v) => (a == null || b == null ? null : ka === kb ? a : a + (v - ka) / (kb - ka) * (b - a));
    const atOat = (row, v) => { const b = br(keys(row), v); return b && mix(row[b[0]], row[b[1]], b[0], b[1], v); };
    const atHp = (tab, h, v) => { const b = br(keys(tab), h); return b && mix(atOat(tab[b[0]], v), atOat(tab[b[1]], v), b[0], b[1], h); };
    const b = br(keys(Z), gw);
    return b && mix(atHp(Z[b[0]], pa, oat), atHp(Z[b[1]], pa, oat), b[0], b[1], gw);
  }
  function dd(gw, pa, oat, hw) {
    const ch = root.EDD_CHARTS[DD], F = ch.frame, base = { fig: DD, name: figName(DD), supl: 'Supl. 97', ch };
    const E = (msg) => fail(DD, msg, base);
    const gws = ch.gw.map(c => c.v), gMin = Math.min(...gws), gMax = Math.max(...gws);
    if (gw < gMin - 1e-9) return E(`Peso abaixo de ${gMin} kg: a Fig. 4-10 começa em ${gMin} kg.`);
    if (gw > gMax + 1e-9) return E(`Peso acima de ${gMax} kg.`);
    const paLo = Math.round(lin(ch.pa, F.xl)), paHi = Math.round(lin(ch.pa, F.xr));
    if (pa < paLo - 1e-9 || pa > paHi + 1e-9) return E(`Altitude fora da carta (${paLo} a ${paHi} ft Hp).`);
    const vLim = Math.min(50, 50 - 1.98 * pa / 1000);
    if (oat > vLim + 1e-9) return E(`OAT acima do limite MAX OAT (ISA+35 = ${vLim.toFixed(1)} °C nesta altitude).`);
    const notes = [];
    const oMin = Math.min(...ch.oat.map(c => c.v));
    // abaixo da linha mais fria a carta não tem curva: lê na linha mais fria (perda maior ou igual, a favor da segurança; a tabela dá 0 ft)
    let oatUse = oat;
    if (oat < oMin) { oatUse = oMin; notes.push(`OAT abaixo de ${oMin} °C: lido na linha de ${oMin} °C.`); }
    const x0 = inv(ch.pa, pa);
    // a linha de 50 °C termina na MAX OAT LIMIT (perto de 0 ft); daí para cima a MAX OAT LIMIT é a curva de valor ISA+35
    const fam = ch.oat.filter(c => c.v <= vLim + 1e-9).map(c => ({ v: c.v, pos: yOn(c.pts, x0) })).filter(f => !(f.v >= vLim - 1e-9 && f.pos == null));
    if (!fam.some(f => f.v >= vLim - 1e-9)) { const p = yOn(ch.maxOat, x0); if (p != null) fam.push({ v: vLim, pos: p }); }
    fam.sort((a, b) => a.v - b.v);
    let lo = null, hi = null;
    for (const f of fam) { if (f.v <= oatUse + 1e-9) lo = f; if (f.v >= oatUse - 1e-9) { hi = f; break; } }
    if (!lo || !hi || lo.pos == null || hi.pos == null) return E('Fora da carta: nesta altitude a leitura passa do topo da carta (a Fig. 4-10 e as tabelas 4-11/4-12 não cobrem essa OAT).');
    const Y = lo.v === hi.v ? lo.pos : lo.pos + (oatUse - lo.v) / (hi.v - lo.v) * (hi.pos - lo.pos);

    // painel do meio: curvas-guia ordenadas pela altura na borda esquerda
    const hwUse = Math.max(0, Math.min(40, hw || 0));
    if ((hw || 0) > 40) notes.push('Vento acima de 40 kt: usado 40 kt (limite da carta).');
    const xH = inv(ch.hw, hwUse);
    // altura de uma guia em x: dentro da linha; antes do início, prolonga o 1º trecho; depois do fim, fica no último ponto
    // (as guias de baixo terminam antes de 40 kt; o último ponto dá perda de altura maior ou igual, a favor da segurança)
    const gy = (g, x) => { const y = yOn(g, x); if (y != null) return y; return x < g[0][0] ? yExt(g, x) : g[g.length - 1][1]; };
    const G = ch.guides.map(g => ({ g, y0: gy(g, F.xm0) })).sort((a, b) => a.y0 - b.y0);
    let Y2 = Y, path = [[F.xm0, Y], [xH, Y]];
    if (hwUse > 0) {
      let a = G[0], b = G[G.length - 1];
      for (let i = 0; i < G.length - 1; i++) if (Y >= G[i].y0 - 1e-9 && Y <= G[i + 1].y0 + 1e-9) { a = G[i]; b = G[i + 1]; break; }
      if (Y > G[G.length - 1].y0) { a = b = G[G.length - 1]; }
      const t = b.y0 === a.y0 ? 0 : (Y - a.y0) / (b.y0 - a.y0);
      const yAt = x => { const ya = gy(a.g, x), yb = gy(b.g, x); return ya + t * (yb - ya); };
      // abaixo da última guia: desloca a última guia (paralela) até a altura de entrada
      const shift = Y > G[G.length - 1].y0 ? Y - G[G.length - 1].y0 : 0;
      path = [];
      for (let k = 0; k <= 12; k++) { const x = F.xm0 + (xH - F.xm0) * k / 12; path.push([x, Math.min(F.yBot, yAt(x) + shift)]); }
      Y2 = path[path.length - 1][1];
    }

    // painel da direita: curva de peso na altura Y2
    const xAt = c => {
      const pts = c.pts, yStart = pts[0][1];             // pts ordenados por x: começa na borda esquerda (0 ft)
      if (Y2 >= yStart - 1e-9) return F.xd0;             // abaixo do início da curva: perda de altura 0 ft
      return xOn(pts, Y2);                               // null: a curva já saiu do quadro (acima de 150 ft)
    };
    let gl = ch.gw[0], gh = ch.gw[ch.gw.length - 1];
    const S = ch.gw.slice().sort((p, q) => p.v - q.v);
    for (const c of S) { if (c.v <= gw + 1e-9) gl = c; if (c.v >= gw - 1e-9) { gh = c; break; } }
    const xl = xAt(gl), xh = xAt(gh);
    if (xl == null || xh == null) {
      // a escala da carta termina em 150 ft: vale a tabela de vento zero do RFM (Fig. 4-11/4-12), sem crédito de vento
      const t = tableFt(ch.zeroWind, gw, pa, oat);
      if (t == null) return E('Leitura passa da escala da carta (150 ft) e fica fora da tabela de vento zero (Fig. 4-11/4-12).');
      const n = [...notes, `Acima de 150 ft a carta não lê: valor da tabela de vento zero (Fig. ${gw > 6400 ? '4-12' : '4-11'}), sem crédito de vento.`];
      const tr = [[x0, F.yBot], [x0, Y], ...path];
      return Object.assign(base, { ok: true, ft: t, final: Math.ceil(t - 1e-6), hw: 0, table: true, Y, Y2, x0, xH, vLim, notes: n, traces: [tr], dots: [[x0, Y]] });
    }
    const X = gh.v === gl.v ? xl : xl + (gw - gl.v) / (gh.v - gl.v) * (xh - xl);
    const ft = Math.max(0, lin(ch.dd, X));
    const final = Math.ceil(ft - 1e-6);
    const trace = [[x0, F.yBot], [x0, Y], ...path, [X, Y2], [X, F.yBot]];
    const traces = [trace];
    if (hwUse > 0) traces.push([[xH, F.yBot], [xH, Y2]]);
    return Object.assign(base, { ok: true, ft, final, hw: hwUse, Y, Y2, X, x0, xH, vLim, notes, oatCurves: [lo.v, hi.v], gwCurves: [gl.v, gh.v], traces, dots: [[x0, Y], [xH, Y2], [X, Y2]] });
  }

  root.EWEngine = { WAT, DD, wat, dd, figName };
})(typeof window !== 'undefined' ? window : globalThis);
