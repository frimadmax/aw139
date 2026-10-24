/* AW139 CAT A Clear Area — pouso OEI pelas cartas do RFM Rev 30 (dados vetoriais em cl-data.js).
 * Até 6400 kg: Supl. 12 Parte J, Fig. 4J-2/1 (LDP até o toque), 4J-2/2 (frenagem) e 4J-1 (balked).
 * 6400 a 6800 kg: Supl. 50, Fig. 4-60, 4-61 e 4-62. 6800 a 7000 kg: Supl. 90, Fig. 4-100, 4-101 e 4-102.
 * Leitura: Hp (eixo de baixo) -> sobe até a linha de OAT -> direita até a curva de peso -> desce até a distância.
 */
(function (root) {
  'use strict';
  const EPS = 0.05;
  const SETS = [
    { max: 6400, supl: 'Supl. 12', land: '4J-2_1', brake: '4J-2_2', balked: '4J-1' },
    { max: 6800, supl: 'Supl. 50', land: '4-60', brake: '4-61', balked: '4-62' },
    { max: 7000, supl: 'Supl. 90', land: '4-100', brake: '4-101', balked: '4-102' }
  ];
  const isaMaxOat = pa => 50 - 1.98 * pa / 1000;   // ISA+35 (MAX OAT LIMIT)
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
    const s = list.filter(e => e.pos != null).sort((a, b) => a.v - b.v);
    if (!s.length || v < s[0].v - 1e-9 || v > s[s.length - 1].v + 1e-9) return null;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      if (v <= b.v + 1e-9) { const t = b.v === a.v ? 0 : (v - a.v) / (b.v - a.v); return a.pos + t * (b.pos - a.pos); }
    }
    return s[0].pos;
  }
  const fail = (fig, msg) => ({ ok: false, fig, msg });
  const setFor = gw => SETS.find(s => gw <= s.max + 1e-9);

  // Uma carta: devolve distância (m) e o caminho da leitura para desenhar.
  function read(fig, gw, pa, oat) {
    const ch = root.CL_LDG[fig];
    if (!ch) return fail(fig, 'Carta não encontrada.');
    const [xL, yTop, xR, yBot] = ch.frame;
    const notes = [];
    const [gMin, gMax] = ch.gwRange;
    if (gw < gMin - 1e-9 || gw > gMax + 1e-9) return fail(ch.fig, `Peso fora da carta (${gMin} a ${gMax} kg).`);
    const x = inv(ch.pa, pa);
    const paMin = Math.ceil(lin(ch.pa, ch.pa.a < 0 ? xR : xL) / 10) * 10, paMax = Math.floor(lin(ch.pa, ch.pa.a < 0 ? xL : xR) / 10) * 10;
    if (x < Math.min(xL, xR) - 0.3 || x > Math.max(xL, xR) + 0.3) return fail(ch.fig, `Altitude fora da carta (${paMin} a ${paMax} ft Hp).`);
    const vLim = isaMaxOat(pa);
    if (oat > vLim + 1e-9) return fail(ch.fig, `OAT acima do MAX OAT LIMIT (ISA+35 = ${vLim.toFixed(1).replace('.', ',')} °C nesta altitude).`);
    // Linhas de OAT; uma linha que já saiu pela borda de baixo antes desta altitude conta como a borda de baixo
    // (leitura mais alta = distância maior, a favor da segurança).
    let clampedBottom = false;
    const fam = ch.oat.filter(c => c.v <= vLim + 1e-9).map(c => {
      let pos = yAtX(c.pts, x);
      if (pos == null) {
        // Linha que saiu pela borda de baixo antes desta altitude: prolonga o último trecho (quase reto) para fora da carta.
        const p = c.pts, first = Math.abs(p[0][0] - x) < Math.abs(p[p.length - 1][0] - x);
        const q = first ? p : p.slice().reverse(), e = q[0], f = q.find(pt => Math.abs(pt[0] - e[0]) > 2) || q[1];  // ignora o toquinho final
        if (e[1] >= yBot - 1.5 && e[0] !== f[0]) pos = e[1] + (x - e[0]) * (e[1] - f[1]) / (e[0] - f[0]);
      }
      return { v: c.v, pos };
    });
    if (ch.maxOat) { const pm = yAtX(ch.maxOat, x); if (pm != null) fam.push({ v: vLim, pos: pm }); }
    let Y = interp(fam, oat);
    if (Y == null) return fail(ch.fig, 'Fora da carta: com essa altitude e OAT a leitura passa da borda da carta.');
    if (Y > yBot) { Y = yBot; clampedBottom = true; }
    if (Y < yTop - 0.3) return fail(ch.fig, 'Fora da carta: a leitura passa do topo da carta.');
    // Curvas de peso: x de cada curva na altura Y.
    const curves = ch.gw.map(c => {
      let X = xAtY(c.pts, Y), start = false;
      if (X == null && ch.kind === 'brake') {
        // Abaixo do início da curva (que nasce no eixo de 0 m): frenagem igual ao início da curva.
        const lo = c.pts.reduce((m, p) => (p[1] > m[1] ? p : m));
        if (Y > lo[1]) { X = lo[0]; start = true; }
      }
      return { v: c.v, pos: X, start };
    });
    const X = interp(curves, gw);
    const used = curves.filter(c => c.pos != null).sort((a, b) => a.v - b.v);
    const k = used.findIndex(c => c.v >= gw - 1e-9);
    const startNote = k >= 0 && (used[k].start || (k > 0 && used[k].v > gw + 1e-9 && used[k - 1].start));
    if (X == null) return fail(ch.fig, 'Leitura fora das curvas de peso da carta.');
    const dist = Math.max(0, lin(ch.dist, X));
    if (clampedBottom) notes.push(`Fig. ${ch.fig}: a linha dessa OAT sai pela borda de baixo da carta nesta altitude; a leitura usa a borda de baixo (distância maior, a favor da segurança).`);
    if (startNote) notes.push(`Fig. ${ch.fig}: a leitura fica abaixo do início da curva de peso, junto ao eixo de 0 m; frenagem praticamente nula nessa condição.`);
    const xZero = inv(ch.dist, 0);
    return { ok: true, fig: ch.fig, key: fig, dist, notes, trace: [[x, yBot], [x, Y], [X, Y], [X, yBot]], xZero };
  }

  function compute(gw, pa, oat) {
    if (!(gw >= 4400 - 1e-9)) return { ok: false, msg: 'Peso abaixo de 4400 kg: fora das cartas do RFM.' };
    const set = setFor(gw);
    if (!set) return { ok: false, msg: 'Peso acima de 7000 kg: fora das cartas do RFM.' };
    const land = read(set.land, gw, pa, oat), brake = read(set.brake, gw, pa, oat), balked = read(set.balked, gw, pa, oat);
    const total = land.ok && brake.ok ? land.dist + brake.dist : null;
    const notes = [land, brake, balked].flatMap(r => (r.ok ? r.notes : []));
    return { ok: true, set, land, brake, balked, total, notes, maxOat: isaMaxOat(pa) };
  }

  root.CLEngine = { SETS, read, compute, isaMaxOat };
})(typeof window !== 'undefined' ? window : globalThis);
