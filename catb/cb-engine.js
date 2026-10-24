/* AW139 CAT B — Take-Off Distance e Landing Distance pelas cartas do RFM Rev 30 (dados vetoriais em cb-data.js).
 * Até 6400 kg: Seção 4, Fig. 4-17 (decolagem) e 4-18 (pouso: até o toque e frenagem).
 * 6400 a 6800 kg: Supl. 50, Fig. 4-35 e 4-36. 6800 a 7000 kg: Supl. 90, Fig. 4-42 e 4-43.
 * Leitura: Hp (eixo de baixo) -> sobe até a linha de OAT -> direita até a curva de peso -> desce até a distância.
 * No pouso a mesma horizontal segue até a curva de frenagem -> desce até o eixo da frenagem.
 */
(function (root) {
  'use strict';
  const EPS = 0.05;
  const SETS = [
    { max: 6400, supl: 'Seção 4', to: '4-17', ld: '4-18' },
    { max: 6800, supl: 'Supl. 50', to: '4-35', ld: '4-36' },
    { max: 7000, supl: 'Supl. 90', to: '4-42', ld: '4-43' }
  ];
  const isaMaxOat = pa => 50 - 1.98 * pa / 1000;   // ISA+35
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
  // Interpola entre os dois vizinhos; se um deles não existe nesse ponto, não há leitura (sem extrapolar).
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
  const fail = (fig, msg) => ({ ok: false, fig, msg });
  const setFor = gw => SETS.find(s => gw <= s.max + 1e-9);

  // Uma carta: devolve a distância de cada painel ('to' ou 'td' + 'br') e o caminho da leitura.
  function read(fig, gw, pa, oat) {
    const ch = root.CB_CHARTS[fig];
    if (!ch) return fail(fig, 'Carta não encontrada.');
    const [lx0, ly0, lx1, ly1] = ch.left;
    const x = inv(ch.pa, pa);
    const hpA = lin(ch.pa, lx0), hpB = lin(ch.pa, lx1);
    const hpMin = Math.round(Math.min(hpA, hpB) / 100) * 100, hpMax = Math.round(Math.max(hpA, hpB) / 100) * 100;
    if (pa < hpMin - 1e-6 || pa > hpMax + 1e-6) return fail(fig, `Altitude fora da carta (${hpMin} a ${hpMax} ft Hp).`);
    const vLim = isaMaxOat(pa);
    if (oat > vLim + 1e-9) return fail(fig, `OAT acima do limite ISA+35 (${vLim.toFixed(1).replace('.', ',')} °C nesta altitude).`);
    const vals = ch.oat.map(c => c.v), oMin = Math.min(...vals), oMax = Math.max(...vals);
    if (oat < oMin - 1e-9) return fail(fig, `OAT abaixo da carta (mínimo ${oMin} °C).`);
    if (oat > oMax + 1e-9) return fail(fig, `OAT acima da carta (máximo ${oMax} °C).`);
    // Na borda da carta (altitude mínima/máxima) a linha pode começar uns décimos de ponto para dentro.
    const at = pts => { const xs = pts.map(p => p[0]), a = Math.min(...xs), b = Math.max(...xs); return yAtX(pts, Math.min(b, Math.max(a, x)) + (x < a - 1 || x > b + 1 ? 1e9 : 0)); };
    // Linhas que terminam antes desta altitude (no limite ISA+35 ou na borda de cima) saem da interpolação.
    const fam = ch.oat.map(c => ({ v: c.v, pos: at(c.pts) })).filter(f => f.pos != null);
    if (ch.maxOat && vLim < oMax) { const pm = at(ch.maxOat); if (pm != null) fam.push({ v: vLim, pos: pm }); }
    const Y = interp(fam, oat);
    if (Y == null) return fail(fig, fam.some(f => f.v > oat) || !fam.some(f => f.v < oat)
      ? 'Fora da carta: com essa altitude e OAT a leitura sai da área das linhas de OAT.'
      : 'Fora da carta: com essa altitude e OAT a leitura passa do topo da carta (além da escala de distância).');
    if (Y < ly0 - 0.3 || Y > ly1 + 0.3) return fail(fig, 'Fora da carta: a leitura passa da borda da carta.');
    const out = { ok: true, fig, notes: [], x, Y, traces: [] };
    let lastX = x;
    for (const pn of ch.panels) {
      const [gMin, gMax] = pn.gwRange;
      if (gw < gMin - 1e-9 || gw > gMax + 1e-9) return fail(fig, `Peso fora da carta (${gMin} a ${gMax} kg).`);
      const curves = pn.gw.map(c => {
        let X = xAtY(c.pts, Y), start = false;
        if (X == null && pn.k === 'br') {
          // Abaixo do começo da curva de frenagem (que nasce no eixo de 0 m): frenagem igual ao começo da curva.
          const lo = c.pts.reduce((m, p) => (p[1] > m[1] ? p : m));
          if (Y > lo[1]) { X = lo[0]; start = true; }
        }
        return { v: c.v, pos: X, start };
      });
      const X = interp(curves, gw);
      if (X == null) return fail(fig, `Leitura fora das curvas de peso (${pn.k === 'br' ? 'frenagem' : pn.k === 'td' ? 'pouso' : 'decolagem'}).`);
      if (pn.k === 'br' && curves.some(c => c.start && Math.abs(c.v - gw) < 400)) out.notes.push(`Fig. ${fig}: a leitura fica abaixo do começo das curvas de frenagem; frenagem praticamente nula nessa condição.`);
      out[pn.k] = Math.max(0, lin(pn.dist, X));
      const yAx = pn.box[3];
      out.traces.push(pn.k === 'br' ? [[lastX, Y], [X, Y], [X, yAx]] : [[x, ly1], [x, Y], [X, Y], [X, yAx]]);
      out[pn.k + 'Dot'] = [X, Y];
      lastX = X;
    }
    return out;
  }

  function compute(gw, pa, oat) {
    if (!(gw >= 4400 - 1e-9)) return { ok: false, msg: 'Peso abaixo de 4400 kg: fora das cartas do RFM.' };
    const set = setFor(gw);
    if (!set) return { ok: false, msg: 'Peso acima de 7000 kg: fora das cartas do RFM.' };
    const to = read(set.to, gw, pa, oat), ld = read(set.ld, gw, pa, oat);
    return { ok: true, set, to, ld, notes: [to, ld].flatMap(r => (r.ok ? r.notes : [])) };
  }

  root.CBEngine = { SETS, read, compute, isaMaxOat };
})(typeof window !== 'undefined' ? window : globalThis);
