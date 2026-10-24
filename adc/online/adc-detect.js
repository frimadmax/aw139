/* Leitura automática da carta ADC do DECEA (PDF vetorial), a partir de PdfPaths.extract.
 * Página 2: tabela de características físicas e distâncias declaradas (texto).
 * Página 1: pista = polígono preto alongado; taxiways = áreas/contornos cinza que encostam na borda da pista;
 *           nome da taxiway = letra isolada mais próxima do ponto de contato.
 * Tudo em pontos da página (origem no canto superior esquerdo). Resultado sem conferência humana. */
(function (root) {
  'use strict';
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const DESIG = /^(0[1-9]|[12]\d|3[0-6])[LRC]?$/;

  // ---------- textos: junta letras soltas na mesma linha em palavras ----------
  function words(texts) {
    const items = texts.map(t => Object.assign({}, t)).sort((a, b) => a.angle - b.angle || a.y - b.y || a.x - b.x);
    const out = [];
    const used = new Set();
    // agrupa por ângulo e linha de base; ordena ao longo da direção do texto
    const groups = [];
    for (const t of items) {
      const c = Math.cos(t.angle), s = Math.sin(t.angle);
      const along = t.x * c + t.y * s, across = -t.x * s + t.y * c;
      let g = groups.find(g => Math.abs(g.angle - t.angle) < 0.03 && Math.abs(g.across - across) < Math.max(1.2, t.h * 0.35));
      if (!g) { g = { angle: t.angle, across, list: [] }; groups.push(g); }
      g.list.push(Object.assign(t, { along }));
    }
    for (const g of groups) {
      g.list.sort((a, b) => a.along - b.along);
      let cur = null;
      for (const t of g.list) {
        const gap = cur ? t.along - (cur.endAlong) : Infinity;
        if (cur && gap < Math.max(1.5, t.h * 0.45)) {
          cur.str += (gap > t.h * 0.18 ? ' ' : '') + t.str;
          cur.endAlong = t.along + (t.w || t.h * 0.6 * t.str.length);
          cur.n++;
        } else {
          cur = { str: t.str, x: t.x, y: t.y, h: t.h, angle: t.angle, endAlong: t.along + (t.w || t.h * 0.6 * t.str.length), n: 1 };
          out.push(cur);
        }
      }
    }
    for (const w of out) {
      w.str = w.str.replace(/\s+/g, ' ').trim();
      // centro aproximado da palavra
      const len = w.endAlong - (w.x * Math.cos(w.angle) + w.y * Math.sin(w.angle));
      w.cx = w.x + Math.cos(w.angle) * len / 2 + Math.sin(w.angle) * w.h * 0.35;
      w.cy = w.y + Math.sin(w.angle) * len / 2 - Math.cos(w.angle) * w.h * 0.35;
    }
    return out;
  }

  // ---------- página 2: tabela ----------
  const num = s => { const m = String(s).replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
  function parseTable(ws) {
    const hz = ws.filter(w => Math.abs(w.angle) < 0.05);
    const find = re => hz.filter(w => re.test(w.str));
    const res = { ends: {}, warnings: [] };
    // distâncias declaradas
    const hTora = find(/^TORA/)[0], hToda = find(/^TODA/)[0], hAsda = find(/^ASDA/)[0], hLda = find(/^LDA/)[0];
    const colX = h => h && h.cx;
    if (hTora && hLda) {
      const yH = hTora.cy;
      const rwyH = find(/^RWY$/).filter(w => Math.abs(w.cy - yH) < 6).sort((a, b) => a.cx - b.cx)[0];
      const xR = rwyH ? rwyH.cx : hTora.cx - 30;
      const rows = hz.filter(w => DESIG.test(w.str) && Math.abs(w.cx - xR) < 12 && w.cy > yH + 4 && w.cy < yH + 120).sort((a, b) => a.cy - b.cy);
      for (const r of rows) {
        const cell = x => { const c = hz.filter(w => Math.abs(w.cy - r.cy) < 5 && Math.abs(w.cx - x) < 14).sort((a, b) => Math.abs(a.cx - x) - Math.abs(b.cx - x))[0]; return c ? num(c.str) : null; };
        res.ends[r.str] = Object.assign(res.ends[r.str] || {}, { tora: cell(colX(hTora)), toda: cell(colX(hToda)), asda: cell(colX(hAsda)), lda: cell(colX(hLda)) });
        const co = hz.filter(w => Math.abs(w.cy - r.cy) < 5 && /^[NS]\d/.test(w.str))[0];
        if (co) res.ends[r.str].coord = co.str;
      }
    }
    // características físicas: rumo magnético, dimensões, stopway e clearway
    const hBrg = find(/^BRG/)[0];
    if (hBrg) {
      const yH = hBrg.cy;
      const rwyH = find(/^RWY$/).filter(w => Math.abs(w.cy - yH) < 6).sort((a, b) => a.cx - b.cx);
      const xR = rwyH[0] ? rwyH[0].cx : hBrg.cx - 25;
      const hSwy = find(/^SWY$/).filter(w => Math.abs(w.cy - yH) < 6).sort((a, b) => a.cx - b.cx)[0];
      const hCwy = find(/^CWY$/).filter(w => Math.abs(w.cy - yH) < 6)[0];
      const hDim = rwyH[1];
      const rows = hz.filter(w => DESIG.test(w.str) && Math.abs(w.cx - xR) < 12 && w.cy > yH + 4 && w.cy < yH + 100).sort((a, b) => a.cy - b.cy);
      const y0 = rows.length ? rows[0].cy - 6 : yH, y1 = rows.length ? rows[rows.length - 1].cy + 6 : yH + 60;
      for (const r of rows) {
        const e = res.ends[r.str] = res.ends[r.str] || {};
        const b = hz.filter(w => Math.abs(w.cy - r.cy) < 5 && Math.abs(w.cx - hBrg.cx) < 12)[0];
        if (b) e.brgMag = num(b.str);
        const sw = hSwy && hz.filter(w => Math.abs(w.cy - r.cy) < 5 && Math.abs(w.cx - hSwy.cx) < 14 && /\d/.test(w.str))[0];
        e.swyM = sw ? num(sw.str) : 0;
        const cw = hCwy && hz.filter(w => Math.abs(w.cy - r.cy) < 5 && Math.abs(w.cx - hCwy.cx) < 14 && /\d/.test(w.str))[0];
        e.cwyM = cw ? num(cw.str) : 0;
      }
      // pares de cabeceiras recíprocas (10/28, 15/33...) e dimensões de cada pista (texto entre as duas linhas)
      const n2 = d => Number(d.replace(/\D/g, ''));
      res.pairs = [];
      for (let i = 0; i + 1 < rows.length; i++) {
        const r1 = rows[i], r2 = rows[i + 1];
        if (Math.abs(Math.abs(n2(r1.str) - n2(r2.str)) - 18) > 0) continue;
        const pair = { ends: [r1.str, r2.str] };
        if (hDim) {
          const d = hz.filter(w => /^\d{3,4}\s*[xX]\s*\d{2,3}/.test(w.str) && Math.abs(w.cx - hDim.cx) < 20 && w.cy > r1.cy - 6 && w.cy < r2.cy + 6)[0];
          if (d) { const m = d.str.match(/(\d{3,4})\s*[xX]\s*(\d{2,3}(?:[.,]\d)?)/); pair.lengthM = Number(m[1]); pair.widthM = num(m[2]); }
        }
        res.pairs.push(pair); i++;
      }
      if (res.pairs[0]) { res.lengthM = res.pairs[0].lengthM; res.widthM = res.pairs[0].widthM; }
    }
    if (!Object.keys(res.ends).length) res.warnings.push('Tabela de distâncias declaradas não encontrada na página 2.');
    return res;
  }

  // ---------- página 1: cabeçalho ----------
  function parseHeader(ws) {
    const all = ws.map(w => w.str).join(' | ');
    const out = {};
    const icao = all.match(/\((S[A-Z]{3})\)/); if (icao) out.icao = icao[1];
    const title = ws.find(w => /\(S[A-Z]{3}\)/.test(w.str)); if (title) out.name = title.str.replace(/\s*\(S[A-Z]{3}\)\s*/, '').trim();
    const elev = all.match(/AD\s*ELEV:?\s*(-?\d+)/i); if (elev) out.elevationFt = Number(elev[1]);
    const v = all.match(/VAR\s*(\d+(?:[.,]\d+)?)\s*[º°]?\s*([EW])/i);
    if (v) out.magVar = (v[2].toUpperCase() === 'W' ? -1 : 1) * Number(v[1].replace(',', '.'));
    const amdt = all.match(/AIRAC AMDT\s*\S+\s+(\d{1,2} [A-Z]{3} \d{2})/); if (amdt) out.date = amdt[1];
    return out;
  }

  // ---------- página 1: escala gráfica (metros) ----------
  function parseScale(ws) {
    const nums = ws.filter(w => /^\d{1,5}$/.test(w.str));
    // números de uma escala ficam numa linha: ao longo do texto (mesma linha de base, v) ou empilhados (u);
    // agrupa nas duas chaves separadamente para que as escalas de metros e pés não se misturem
    const groups = [];
    for (const key of ['u', 'v']) {
      const gs = [];
      for (const w of nums) {
        const c = Math.cos(w.angle), sn = Math.sin(w.angle);
        const k = key === 'u' ? w.cx * c + w.cy * sn : -w.cx * sn + w.cy * c;
        let g = gs.find(g => Math.abs(g.angle - w.angle) < 0.05 && Math.abs(g.k - k) < 4);
        if (!g) { g = { angle: w.angle, k, list: [] }; gs.push(g); }
        g.list.push(w);
      }
      groups.push(...gs);
    }
    const fits = [];
    for (const g of groups) {
      if (g.list.length < 4 || !g.list.some(w => w.str === '0')) continue;
      const z = g.list.find(w => w.str === '0');
      const pts = g.list.map(w => ({ v: Number(w.str), d: dist([w.cx, w.cy], [z.cx, z.cy]) }));
      // ajuste d = k·v pela origem (zero)
      const k = pts.reduce((a, p) => a + p.v * p.d, 0) / pts.reduce((a, p) => a + p.v * p.v, 0);
      const err = Math.max(...pts.map(p => Math.abs(p.d - k * p.v)));
      if (k > 0 && err < 2.5) fits.push({ k, n: pts.length, max: Math.max(...pts.map(p => p.v)) });
    }
    if (!fits.length) return null;
    // duas escalas (metros e pés): a de metros tem mais pontos por unidade (1 m = 3,28 ft)
    fits.sort((a, b) => b.k - a.k);
    return { ptPerM: fits[0].k, mPerPt: 1 / fits[0].k, both: fits.length > 1, ratio: fits.length > 1 ? fits[0].k / fits[1].k : null };
  }

  // ---------- página 1: pistas ----------
  function edges(pts, closed) { const e = []; for (let i = 0; i < pts.length - 1; i++) e.push([pts[i], pts[i + 1]]); if (closed && pts.length > 2) e.push([pts[pts.length - 1], pts[0]]); return e; }
  function runwayFromPolys(polys) {
    const allPts = polys.flatMap(p => p.pts);
    const es = polys.flatMap(p => edges(p.pts, true)).filter(([a, b]) => dist(a, b) > 1);
    // direção: média ponderada pelo comprimento dos lados mais longos (eixo da pista)
    es.sort((a, b) => dist(b[0], b[1]) - dist(a[0], a[1]));
    const longest = dist(es[0][0], es[0][1]);
    let dx = 0, dy = 0;
    for (const [a, b] of es) {
      const l = dist(a, b); if (l < longest * 0.5) break;
      let ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l;
      if (dx * ux + dy * uy < 0 || (dx === 0 && dy === 0 && ux < 0)) { ux = -ux; uy = -uy; }
      dx += ux * l; dy += uy * l;
    }
    const n = Math.hypot(dx, dy); const ux = dx / n, uy = dy / n;
    const o0 = allPts[0];
    const S = p => (p[0] - o0[0]) * ux + (p[1] - o0[1]) * uy, O = p => -(p[0] - o0[0]) * uy + (p[1] - o0[1]) * ux;
    // largura: lados longos (offset estável), ignorando cabeceiras alargadas (área de giro)
    const longEdges = es.filter(([a, b]) => dist(a, b) >= longest * 0.5);
    const offs = longEdges.map(([a, b]) => (O(a) + O(b)) / 2);
    const oMin = Math.min(...offs), oMax = Math.max(...offs);
    const width = oMax - oMin, oc = (oMin + oMax) / 2;
    // fim da pista: extremos dos lados longos (a área de giro arredondada não conta)
    const sl = longEdges.flatMap(([a, b]) => [S(a), S(b)]);
    const s0 = Math.min(...sl), s1 = Math.max(...sl);
    const P = (s, o) => [o0[0] + ux * s - uy * o, o0[1] + uy * s + ux * o];
    return { a: P(s0, oc), b: P(s1, oc), widthPt: width, lengthPt: s1 - s0, ux, uy };
  }
  function findRunways(paths) {
    const dark = paths.filter(p => p.fill && Math.max(...p.fill) < 0.2 && p.pts.length >= 4);
    const cands = [];
    for (const p of dark) {
      const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]);
      if ((Math.max(...xs) - Math.min(...xs)) + (Math.max(...ys) - Math.min(...ys)) < 60) continue;
      const r = runwayFromPolys([p]);
      if (r.lengthPt > 60 && r.widthPt > 2 && r.lengthPt / r.widthPt > 8) cands.push(Object.assign(r, { polys: [p] }));
    }
    // junta pedaços colineares da mesma pista (pista desenhada em partes)
    const out = [];
    for (const c of cands.sort((a, b) => b.lengthPt - a.lengthPt)) {
      const g = out.find(r => Math.abs(r.ux * c.uy - r.uy * c.ux) < 0.02 && Math.abs(-(c.a[0] - r.a[0]) * r.uy + (c.a[1] - r.a[1]) * r.ux) < r.widthPt);
      if (g) { const m = runwayFromPolys(g.polys.concat(c.polys)); Object.assign(g, m, { polys: g.polys.concat(c.polys) }); }
      else out.push(c);
    }
    return out;
  }

  // ---------- taxiways: contato com a borda da pista ----------
  function contacts(paths, rw, mPerPt) {
    const { a, ux, uy } = rw, half = rw.widthPt / 2;
    const S = p => (p[0] - a[0]) * ux + (p[1] - a[1]) * uy, O = p => -(p[0] - a[0]) * uy + (p[1] - a[1]) * ux;
    const tol = Math.max(1.2, 8 / mPerPt);
    const hits = [];
    for (const p of paths) {
      const col = p.fill || p.stroke;
      if (!col) continue;
      const mx = Math.max(...col), mn = Math.min(...col);
      if (mx < 0.2 || mn > 0.95 || mx - mn > 0.15) continue;            // cinzas (taxiway/pátio), não preto, branco ou cor
      if (rw.polys.includes(p)) continue;
      for (const [q0, q1] of edges(p.pts, p.closed || !!p.fill)) {
        const n = Math.max(1, Math.ceil(dist(q0, q1) / 0.5));
        for (let i = 0; i <= n; i++) {
          const q = [q0[0] + (q1[0] - q0[0]) * i / n, q0[1] + (q1[1] - q0[1]) * i / n];
          const s = S(q), o = O(q);
          if (s < -1 || s > rw.lengthPt + 1) continue;
          if (Math.abs(o) > half - 0.5 && Math.abs(o) < half + tol) hits.push({ s, side: Math.sign(o), q });
        }
      }
    }
    // agrupa por lado e por posição ao longo da pista (até 30 m entre bordas = mesma taxiway)
    const out = [];
    for (const side of [-1, 1]) {
      const hs = hits.filter(h => h.side === side).sort((x, y) => x.s - y.s);
      let cur = null;
      for (const h of hs) {
        if (cur && h.s - cur.s1 <= 30 / mPerPt) { cur.s1 = h.s; cur.n++; }
        else { cur = { side, s0: h.s, s1: h.s, n: 1 }; out.push(cur); }
      }
    }
    // pontas da pista (área de giro, pátio de cabeceira) não são taxiways de saída: fica só o que tem largura de taxiway
    return out.filter(c => (c.s1 - c.s0) * mPerPt >= 5 || c.n > 6).map(c => {
      const s = (c.s0 + c.s1) / 2;
      return { s, side: c.side, widthM: (c.s1 - c.s0) * mPerPt, point: [a[0] + ux * s - uy * c.side * half, a[1] + uy * s + ux * c.side * half] };
    });
  }
  function labelFor(c, ws, rw, mPerPt, taken) {
    const cand = ws.filter(w => /^[A-Z]{1,2}\d?$/.test(w.str) && w.n <= 2 && !DESIG.test(w.str) && !taken.has(w));
    let best = null, bd = Infinity;
    for (const w of cand) {
      const d = dist([w.cx, w.cy], c.point);
      // do lado da taxiway e a menos de ~250 m do ponto de contato
      const o = -(w.cx - rw.a[0]) * rw.uy + (w.cy - rw.a[1]) * rw.ux;
      if (Math.sign(o) !== c.side) continue;
      if (d * mPerPt < 250 && d < bd) { bd = d; best = w; }
    }
    return best;
  }

  // ---------- tudo junto ----------
  // Modelo de cada pista (metros ao longo do eixo, de p0 = ponta do lado A):
  //   pavimento [p0, p1] com o comprimento da tabela; cabeceiras de pouso thrA/thrB;
  //   o trecho preto da carta é a pista inteira (H1) ou só o trecho entre cabeceiras deslocadas (H2).
  function analyze(p1, p2) {
    const ws1 = words(p1.texts), ws2 = p2 ? words(p2.texts) : [];
    const head = parseHeader(ws1);
    const tab = parseTable(ws2.length ? ws2 : ws1);
    const scale = parseScale(ws1);
    const warnings = tab.warnings.slice();
    if (!scale) warnings.push('Escala gráfica não encontrada: escala tirada do comprimento da pista.');
    const rws = findRunways(p1.paths);
    if (!rws.length) return { ok: false, msg: 'Não achei a pista na carta.', head, tab, warnings };
    const designators = ws1.filter(w => DESIG.test(w.str));
    const runways = [];
    for (const rw of rws) {
      const near = pt => designators.slice().sort((x, y) => dist([x.cx, x.cy], pt) - dist([y.cx, y.cy], pt))[0];
      const da = near(rw.a), db = near(rw.b);
      let endA = da && da.str, endB = db && db.str;
      let pair = (tab.pairs || []).find(pr => pr.ends.includes(endA) || pr.ends.includes(endB));
      if (pair) {
        if (!pair.ends.includes(endA)) endA = pair.ends.find(e => e !== endB);
        if (!pair.ends.includes(endB)) endB = pair.ends.find(e => e !== endA);
      }
      if (!pair || endA === endB) { warnings.push(`Pista sem cabeceiras identificadas (${endA || '?'}/${endB || '?'}): ignorada.`); continue; }
      const eA = tab.ends[endA] || {}, eB = tab.ends[endB] || {};
      const D = pair.lengthM || Math.max(eA.tora || 0, eB.tora || 0, eA.toda || 0);
      const blackPt = rw.lengthPt;
      // H1 x H2 pela escala gráfica
      const ldaMax = Math.max(eA.lda || 0, eB.lda || 0);
      const thrSpan = D - Math.max(0, D - (eB.tora || D)) - Math.max(0, D - (eA.tora || D));   // entre cabeceiras deslocadas
      let mode = 'H1', notes = [];
      if (scale) {
        const bm = blackPt * scale.mPerPt;
        const e1 = Math.abs(bm - D) / D, e2 = Math.abs(bm - thrSpan) / D;
        if (thrSpan < D - 1 && e2 < e1) mode = 'H2';
        const e = mode === 'H1' ? e1 : e2;
        if (e > 0.04) warnings.push(`Pista ${endA}/${endB}: desenho difere ${Math.round(e * 100)}% da escala gráfica.`);
      }
      // deslocamentos de cabeceira: dA (lado A) e dB (lado B); TORA de A vai da ponta A até a cabeceira B
      let dA = Math.max(0, D - (eB.tora || D)), dB = Math.max(0, D - (eA.tora || D));
      if (mode === 'H1' && !(dA || dB)) {
        // sem pista deslocada para decolagem: cabeceira de pouso pela LDA (pouso até o fim do pavimento)
        dA = Math.max(0, D - (eA.lda || D)); dB = Math.max(0, D - (eB.lda || D));
      }
      const blackM = mode === 'H1' ? D : D - dA - dB;
      const mPerPt = blackM / blackPt;                       // calibração local pela própria pista
      // eixo em metros: s = 0 na ponta do pavimento do lado A
      const off = mode === 'H1' ? 0 : dA;                    // onde começa o trecho preto
      const ux = (rw.b[0] - rw.a[0]) / blackPt, uy = (rw.b[1] - rw.a[1]) / blackPt;
      const P = m => [rw.a[0] + ux * (m - off) / mPerPt, rw.a[1] + uy * (m - off) / mPerPt];
      // stopway: ASDA além do pavimento
      const sA = Math.max(0, (eB.asda || 0) - D), sB = Math.max(0, (eA.asda || 0) - D);
      const cs = contacts(p1.paths, rw, mPerPt);
      const taken = new Set();
      const twys = cs.map(c => {
        const w = labelFor(c, ws1, rw, mPerPt, taken);
        if (w) taken.add(w);
        return { name: w ? w.str : null, m: off + c.s * mPerPt, point: c.point, widthM: c.widthM };
      });
      if (twys.some(t => !t.name)) warnings.push(`Pista ${endA}/${endB}: ${twys.filter(t => !t.name).length} taxiway(s) sem nome na carta.`);
      runways.push({ endA, endB, D, widthM: pair.widthM || rw.widthPt * mPerPt, mode, dA, dB, sA, sB, mPerPt, P, ends: { [endA]: eA, [endB]: eB }, taxiways: twys, rw });
    }
    if (!runways.length) return { ok: false, msg: 'Não consegui ligar a pista da carta à tabela de distâncias.', head, tab, warnings };
    return { ok: true, head, tab, scale, runways, warnings };
  }

  // Monta o pacote no formato das bases offline (coordenadas em pixels da imagem renderizada com escala S)
  function buildPack(res, S, imgW, imgH) {
    const icao = res.head.icao || 'ONLINE';
    const px = p => ({ x: Math.round(p[0] * S * 100) / 100, y: Math.round(p[1] * S * 100) / 100 });
    const runways = res.runways.map(r => {
      const A = r.endA, B = r.endB;
      const [lo, hi] = [A, B].sort((x, y) => parseInt(x, 10) - parseInt(y, 10));   // nome como na carta: 10/28
      // pavimento estendido pelas stopways: estação 0 = ponta da stopway do lado A
      const L = r.sA + r.D + r.sB;
      const st = m => m + r.sA;                               // metros a partir da ponta A do pavimento -> estação
      const opA = r.sA > 0 ? r.sA : 0, opB = r.sB > 0 ? r.sB : 0;
      const eA = r.ends[A], eB = r.ends[B];
      const feat = (op, d, sw, cw) => ({ displacedThresholdM: Math.round(d), stopwayM: Math.round(sw), clearwayM: Math.round(cw || 0), operationalStartM: Math.round(op) });
      // fim da ASDA de cada decolagem: ASDA a partir do início da corrida
      const asdaEndFromB = (L - opA) - (eA.asda || r.D);       // decolando de A: quanto falta até a ponta B
      const asdaEndFromA = (L - opB) - (eB.asda || r.D);
      const endTok = (side, gap) => gap > 0.5 ? `OP:${side}` : `PAV:${side}`;
      const startTok = (side, op) => op > 0 ? `OP:${side}` : `PAV:${side}`;
      const logic = {};
      // OP de um lado serve como início da corrida desse lado (stopway) ou fim da ASDA do outro: nunca os dois
      let opAuse = opA, opBuse = opB;
      if (asdaEndFromB > 0.5) { if (opB > 0) res.warnings.push(`RWY ${A}: ASDA menor que o pavimento e stopway na ${B}; usado o valor menor.`); opBuse = Math.max(opBuse, asdaEndFromB); }
      if (asdaEndFromA > 0.5) { if (opA > 0) res.warnings.push(`RWY ${B}: ASDA menor que o pavimento e stopway na ${A}; usado o valor menor.`); opAuse = Math.max(opAuse, asdaEndFromA); }
      // fim de cada distância: a âncora (cabeceira, fim operacional ou ponta do pavimento) mais próxima do valor da tabela
      const stations = side => side === B
        ? { THR: st(r.D - r.dB), OP: L - opBuse, PAV: L }
        : { THR: st(r.dA), OP: opAuse, PAV: 0 };
      const endFor = (dep, from, dist, kind) => {
        const other = dep === A ? B : A, sg = dep === A ? 1 : -1, an = stations(other);
        const target = from + sg * dist;
        const best = ['PAV', 'THR', 'OP'].filter(t => t !== 'OP' || (other === B ? opBuse : opAuse) > 0)
          .map(t => ({ t, e: Math.abs(an[t] - target) })).sort((x, y) => x.e - y.e)[0];
        if (best.e > 5) res.warnings.push(`RWY ${dep}: ${kind.toUpperCase()} ${dist} m não fecha com o desenho (${Math.round(best.e)} m de diferença).`);
        return `${best.t}:${other}`;
      };
      for (const [dep, op, e] of [[A, opA, eA], [B, opB, eB]]) {
        const from = dep === A ? op : L - op;
        const start = startTok(dep, op);
        logic[dep] = {
          tora: { start, end: endFor(dep, from, e.tora || r.D, 'tora') },
          toda: { start, end: endFor(dep, from, e.toda || e.tora || r.D, 'toda') },
          asda: { start, end: endFor(dep, from, e.asda || r.D, 'asda') },
          lda: { start: `THR:${dep}`, end: `THR:${dep === A ? B : A}` },
        };
      }
      const P = m => px(r.P(m));
      return {
        id: `RWY_${lo}_${hi}`, label: `${lo}/${hi}`, chartId: 'ADC_MAIN', referenceEnd: A, ends: [A, B],
        lengthM: Math.round(L * 10) / 10, widthM: r.widthM, widthPx: Math.max(6, Math.round(r.rw.widthPt * S)),
        pavementRef: P(-r.sA), pavementOpp: P(r.D + r.sB), thresholdRef: P(r.dA), thresholdOpp: P(r.D - r.dB),
        declaredDistances: { [A]: { tora: eA.tora, toda: eA.toda, asda: eA.asda, lda: eA.lda }, [B]: { tora: eB.tora, toda: eB.toda, asda: eB.asda, lda: eB.lda } },
        intersections: r.taxiways.map((t, i) => ({ id: t.name || `T${i + 1}`, name: t.name ? `TWY ${t.name}` : 'TWY s/ nome', metersFromRef: Math.round(st(t.m) * 10) / 10, labelPoint: px(t.point) })),
        endFeatures: { [A]: feat(opAuse, r.dA, r.sB, eA.cwyM), [B]: feat(opBuse, r.dB, r.sA, eB.cwyM) },
        distanceLogic: logic,
        brgMag: { [A]: eA.brgMag, [B]: eB.brgMag },
      };
    });
    return {
      id: icao, code: icao, name: res.head.name || icao, city: 'Brasil', adcTitle: `${icao} ADC ${res.head.date || ''} (online)`.trim(),
      engineId: 'adc_generic_v1', stability: 'online', online: true, locked: true, schemaVersion: 5,
      defaultChartId: 'ADC_MAIN', defaultRunwayId: runways[0].id,
      charts: [{ id: 'ADC_MAIN', label: 'ADC online', asset: '', assetName: `${icao.toLowerCase()}_online.png`, size: { width: imgW, height: imgH } }],
      runways, elevationFt: res.head.elevationFt, magVar: res.head.magVar, warnings: res.warnings,
    };
  }

  root.AdcDetect = { words, parseTable, parseHeader, parseScale, findRunways, analyze, buildPack };
})(typeof window !== 'undefined' ? window : globalThis);
