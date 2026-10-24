// Aproximação / decolagem offshore: setor livre de obstáculos (SLO) por tipo de unidade, vento e aproamento.
// Regras: SOP 52 Rev. 01 (Omni) itens 5.2, 5.4, 5.8-5.11 e 5.14, que citam a NORMAM-223/DPC:
//   SLO de 210° (180° em unidade acoplada por gangway), limite externo de 500 m;
//   defasagem máxima de 30° além dos limites laterais (45° da orientação do "H") só quando o vento de través exigir;
//   circuito a 500 ft / 80 KIAS: perna do vento a 1,0 NM, base entre 1,5 e 1,8 NM, final entre 1,2 e 1,5 NM.
// Posição do helideque e bissetriz de cada tipo de unidade são valores de partida (em conferência), ajustáveis na tela.
(function (root) {
  'use strict';
  const rad = d => d * Math.PI / 180;
  const norm = d => { let a = ((d % 360) + 360) % 360; if (a > 180) a -= 360; return a; };
  const n360 = d => ((Math.round(d) % 360) + 360) % 360 || 360;
  const deg3 = d => String(n360(d)).padStart(3, '0');
  const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
  const SLO = 210, SLO_ACOPLADA = 180, FLEX = 30, EXT_M = 500, XWIND = 20;

  // Unidades. Coordenadas locais em metros: s = boreste (+) / bombordo (-), f = proa (+) / popa (-).
  // deck: posição do helideque; bis: bissetriz do SLO relativa à proa da unidade; cls: classe do helideque (SOP 5.2).
  const UNITS = {
    ns: { name: 'NS', sub: 'Navio-sonda · deck na proa', hull: 'ship', L: 180, B: 34, deck: [0, 74], bis: [0], cls: 3, rig: true },
    'fpso-bb': { name: 'FPSO', sub: 'Deck na popa · bombordo', hull: 'ship', L: 300, B: 58, deck: [-17, -136], bis: [225], cls: 1, mods: true, provisional: true },
    'fpso-c': { name: 'FPSO', sub: 'Deck na popa · central', hull: 'ship', L: 300, B: 58, deck: [0, -138], bis: [180], cls: 1, mods: true },
    'fpso-be': { name: 'FPSO', sub: 'Deck na popa · boreste', hull: 'ship', L: 300, B: 58, deck: [17, -136], bis: [135], cls: 1, mods: true, provisional: true },
    'flo-pbb': { name: 'Flotel', sub: 'Canto proa · bombordo', hull: 'semi', L: 90, B: 74, deck: [-30, 38], bis: [315], cls: 1, provisional: true },
    'flo-pbe': { name: 'Flotel', sub: 'Canto proa · boreste', hull: 'semi', L: 90, B: 74, deck: [30, 38], bis: [45], cls: 1, provisional: true },
    'flo-rbb': { name: 'Flotel', sub: 'Canto popa · bombordo', hull: 'semi', L: 90, B: 74, deck: [-30, -38], bis: [225], cls: 1, provisional: true },
    'flo-rbe': { name: 'Flotel', sub: 'Canto popa · boreste', hull: 'semi', L: 90, B: 74, deck: [30, -38], bis: [135], cls: 1, provisional: true },
    meia: { name: 'Meia-nau', sub: 'Dois setores, um por bordo', hull: 'ship', L: 120, B: 24, deck: [0, 0], bis: [90, 270], open: 120, cls: 2, provisional: true, noH: true },
    outro: { name: 'Outros', sub: 'Semissub, fixa, PSV…', hull: 'plat', L: 70, B: 70, deck: null, bis: null, cls: null }
  };
  const GROUPS = [
    { id: 'ns', label: 'NS', hint: 'deck na proa', opts: [['ns', 'Proa']] },
    { id: 'fpso', label: 'FPSO', hint: 'deck na popa', opts: [['fpso-bb', 'BB'], ['fpso-c', 'Central'], ['fpso-be', 'BE']] },
    { id: 'flo', label: 'Flotel', hint: 'deck num canto', opts: [['flo-pbb', 'Proa BB'], ['flo-pbe', 'Proa BE'], ['flo-rbb', 'Popa BB'], ['flo-rbe', 'Popa BE']] },
    { id: 'meia', label: 'Meia-nau', hint: 'deck no meio', opts: [['meia', 'Meia-nau']] },
    { id: 'outro', label: 'Outros', hint: 'bissetriz manual', opts: [['outro', 'Outros']] }
  ];

  // ---------- cálculo ----------
  function unitOf(st) {
    const u = Object.assign({}, UNITS[st.unit] || UNITS.ns);
    if (st.unit === 'outro') {
      const b = Number(st.customBis) || 0;
      u.bis = [b]; u.deck = [Math.sin(rad(b)) * 30, Math.cos(rad(b)) * 30]; u.cls = Number(st.customCls) || 1;
    }
    return u;
  }
  // setores (°M) do SLO: bissetriz absoluta e meia-abertura
  function sectors(st) {
    const u = unitOf(st);
    let open = st.acoplada ? SLO_ACOPLADA : (u.open || SLO);
    if (u.open && st.meiaOpen) open = Math.max(30, Math.min(210, Number(st.meiaOpen)));
    return u.bis.map(b => ({ bis: n360(st.unitHdg + b + (Number(st.bisAdj) || 0)), half: open / 2, noH: !!u.noH }));
  }
  // zona de uma marcação (de onde vem na aproximação / para onde vai na decolagem)
  function zoneOf(bearing, secs) {
    let best = null;
    for (const s of secs) {
      const off = Math.abs(norm(bearing - s.bis));
      const z = off <= s.half + 1e-9 ? 'green' : off <= s.half + FLEX + 1e-9 ? 'amber' : 'red';
      const beyond = Math.max(0, off - s.half);
      if (!best || beyond < best.beyond) best = { zone: z, off, beyond, sec: s };
    }
    return best;
  }
  // defasagem da proa em relação à orientação do "H" (eixo perpendicular à bissetriz, SOP 5.4 fig.)
  const hDev = (course, sec) => { const a = Math.abs(norm(course - (sec.bis + 90))); return Math.min(a, 180 - a); };

  function evaluate(st, course) {
    const secs = sectors(st), land = st.mode !== 'takeoff';
    const path = land ? n360(course + 180) : n360(course);
    const z = zoneOf(path, secs);
    const wra = norm(st.windDir - course), v = Math.max(0, st.windSpd || 0);
    const head = v * Math.cos(rad(wra)), cross = v * Math.abs(Math.sin(rad(wra)));
    return { course: n360(course), path, zone: z.zone, beyond: z.beyond, sec: z.sec, hdev: z.sec.noH ? null : hDev(course, z.sec), wra, head, cross, side: wra > 0 ? 'direita' : wra < 0 ? 'esquerda' : '' };
  }

  function solve(st) {
    const lim = Number(st.xwind) || XWIND, all = [];
    for (let c = 1; c <= 360; c++) all.push(evaluate(st, c));
    const ok = e => e.head >= -1e-9 && e.cross <= lim + 1e-9;
    // vento calmo: qualquer proa vale; fica a do eixo do "H" (ou a bissetriz, na meia-nau)
    const score = e => (st.windSpd > 0 ? e.head * 1000 : 0) - (e.hdev == null ? e.beyond : e.hdev);
    const pick = list => list.reduce((a, b) => (!a || score(b) > score(a) + 1e-9 ? b : a), null);
    const green = pick(all.filter(e => e.zone === 'green' && ok(e)));
    if (green) return { best: green, kind: 'green', all, lim };
    const amber = pick(all.filter(e => e.zone === 'amber' && ok(e)));
    if (amber) return { best: amber, kind: 'amber', all, lim };
    // nenhuma proa atende: mostra a de menor través dentro do SLO, como referência
    const ref = all.filter(e => e.zone !== 'red' && e.head >= -1e-9).sort((a, b) => a.cross - b.cross)[0] || all.filter(e => e.zone === 'green')[0];
    return { best: ref, kind: 'none', all, lim };
  }

  // vento relativo à unidade (proa, bochecha, través, alheta, popa) e reclassificação do helideque (SOP 5.2)
  function relWind(st) {
    const r = norm(st.windDir - st.unitHdg), a = Math.abs(r);
    const part = a <= 22.5 ? 'proa' : a <= 67.5 ? 'bochecha' : a <= 112.5 ? 'través' : a <= 157.5 ? 'alheta' : 'popa';
    const side = a <= 22.5 || a > 157.5 ? '' : r > 0 ? ' BE' : ' BB';
    return { r, part, txt: part + side };
  }
  function classOf(st) {
    const u = unitOf(st), w = relWind(st), aft = w.part === 'alheta' || w.part === 'popa';
    if (!u.cls) return null;
    if (u.cls === 2 && aft) return { base: 2, now: 3, note: `Vento de ${w.txt}: Classe 2 reclassificada para Classe 3.` };
    if (u.cls === 3 && aft) return { base: 3, now: 2, note: `Vento de ${w.txt}: Classe 3 reclassificada para Classe 2.` };
    return { base: u.cls, now: u.cls, note: '' };
  }
  // lado da arremetida: para longe dos obstáculos (lado da bissetriz em relação à proa)
  const gaSide = e => (norm(e.sec.bis - e.course) >= 0 ? 'direita' : 'esquerda');

  // ---------- desenho ----------
  const NS = 'http://www.w3.org/2000/svg';
  const R = 232; // raio do setor de 500 m na vista do helideque
  function pt(bearing, r, rot) { const a = rad(bearing - rot); return [Math.sin(a) * r, -Math.cos(a) * r]; }
  const P = p => p.map(v => v.toFixed(1)).join(',');
  function wedge(b1, b2, r, rot) {
    const span = ((b2 - b1) % 360 + 360) % 360 || 360;
    if (span >= 359.9) return `M${-r},0a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
    const a = pt(b1, r, rot), b = pt(b1 + span, r, rot);
    return `M0,0L${P(a)}A${r},${r} 0 ${span > 180 ? 1 : 0},1 ${P(b)}Z`;
  }
  // casco em coordenadas locais (m) -> pontos SVG; escala k px/m, origem no helideque
  function hullPath(u, k, unitHdg, rot) {
    const d = u.deck || [0, 0], L = u.L / 2, B = u.B / 2;
    let pts;
    if (u.hull === 'ship') pts = [[-B, -L], [B, -L], [B, L * 0.62], [B * 0.55, L * 0.9], [0, L], [-B * 0.55, L * 0.9], [-B, L * 0.62]];
    else pts = [[-B, -L], [B, -L], [B, L], [-B, L]];
    return pts.map(p => loc(p, d, k, unitHdg, rot));
  }
  function loc(p, d, k, unitHdg, rot) {
    const s = p[0] - d[0], f = p[1] - d[1], a = rad(unitHdg - rot);
    // proa da unidade no rumo unitHdg; boreste 90° à direita
    return [(s * Math.cos(a) + f * Math.sin(a)) * k, (s * Math.sin(a) - f * Math.cos(a)) * k];
  }
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls, extra) { const t = el('text', Object.assign({ x: x.toFixed(1), y: y.toFixed(1), class: cls || '' }, extra || {}), parent); t.textContent = s; return t; }
  function arrowHead(g, tip, bearing, rot, size, cls) {
    const a = rad(bearing - rot), ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
    const b = [tip[0] - ux * size, tip[1] - uy * size];
    el('path', { d: `M${P(tip)}L${P([b[0] + px * size * 0.55, b[1] + py * size * 0.55])}L${P([b[0] - px * size * 0.55, b[1] - py * size * 0.55])}Z`, class: cls }, g);
  }
  function heli(g, at, course, rot, cls) {
    const h = el('g', { transform: `translate(${P(at)}) rotate(${course - rot})`, class: cls || 'oa-heli' }, g);
    el('ellipse', { cx: 0, cy: 2, rx: 5, ry: 10 }, h);
    el('rect', { x: -1.4, y: 10, width: 2.8, height: 16, rx: 1.2 }, h);
    el('rect', { x: -6, y: 23, width: 12, height: 2.4, rx: 1 }, h);
    el('line', { x1: -17, y1: -10, x2: 17, y2: 14, class: 'oa-rotor' }, h);
    el('line', { x1: 17, y1: -10, x2: -17, y2: 14, class: 'oa-rotor' }, h);
  }

  function drawDeck(svg, st, res) {
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '-300 -300 600 600');
    const rot = st.northUp ? 0 : st.unitHdg, u = unitOf(st), secs = sectors(st), land = st.mode !== 'takeoff';
    const g = el('g', {}, svg);
    // zonas: vermelho (fundo), âmbar (flexibilidade de 30°), verde (SLO)
    el('path', { d: wedge(0, 360, R, rot), class: 'oa-z-red' }, g);
    secs.forEach(s => {
      el('path', { d: wedge(s.bis + s.half, s.bis + s.half + FLEX, R, rot), class: 'oa-z-amber' }, g);
      el('path', { d: wedge(s.bis - s.half - FLEX, s.bis - s.half, R, rot), class: 'oa-z-amber' }, g);
    });
    secs.forEach(s => el('path', { d: wedge(s.bis - s.half, s.bis + s.half, R, rot), class: 'oa-z-green' }, g));
    secs.forEach(s => [s.bis - s.half, s.bis + s.half].forEach(b => el('line', { x1: 0, y1: 0, x2: pt(b, R, rot)[0], y2: pt(b, R, rot)[1], class: 'oa-lim' }, g)));
    // anel da bússola
    const ring = el('g', { class: 'oa-ring' }, svg);
    el('circle', { cx: 0, cy: 0, r: R, class: 'oa-ring-c' }, ring);
    for (let b = 0; b < 360; b += 10) {
      const a = pt(b, R, rot), c = pt(b, R + (b % 30 ? 6 : 11), rot);
      el('line', { x1: a[0], y1: a[1], x2: c[0], y2: c[1] }, ring);
      if (b % 30 === 0) { const t = pt(b, R + 24, rot); txt(ring, t[0], t[1] + 4, b === 0 ? 'N' : String(b / 10).padStart(2, '0'), 'oa-ring-t' + (b === 0 ? ' is-n' : '')); }
    }
    // unidade (em escala: raio = 500 m além da AAFD)
    const k = R / (EXT_M + 15);
    const hull = hullPath(u, k, st.unitHdg, rot);
    el('path', { d: 'M' + hull.map(P).join('L') + 'Z', class: 'oa-hull' }, svg);
    if (u.hull === 'semi') [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const c = loc([a * (u.B / 2 - 9), b * (u.L / 2 - 9)], u.deck, k, st.unitHdg, rot); el('circle', { cx: c[0], cy: c[1], r: 7 * k + 1.5, class: 'oa-col' }, svg); });
    if (u.mods) for (let f = -95; f <= 120; f += 26) { const q = [[-20, f], [20, f], [20, f + 18], [-20, f + 18]].map(p => loc(p, u.deck, k, st.unitHdg, rot)); el('path', { d: 'M' + q.map(P).join('L') + 'Z', class: 'oa-mod' }, svg); }
    if (u.rig) { const q = [[-11, -12], [11, -12], [11, 10], [-11, 10]].map(p => loc(p, u.deck, k, st.unitHdg, rot)); el('path', { d: 'M' + q.map(P).join('L') + 'Z', class: 'oa-rig' }, svg); }
    const bow = loc([0, u.L / 2], u.deck, k, st.unitHdg, rot), bq = rad(st.unitHdg - rot);
    txt(svg, bow[0] + Math.sin(bq) * 16, bow[1] - Math.cos(bq) * 16 + 4, 'PROA', 'oa-bow');
    // helideque (fora de escala) com o "H" no eixo perpendicular à bissetriz
    const s0 = secs[0], dg = el('g', { transform: `rotate(${s0.bis - rot})` }, svg);
    const oct = []; for (let i = 0; i < 8; i++) { const a = rad(22.5 + i * 45); oct.push([Math.cos(a) * 17, Math.sin(a) * 17]); }
    el('path', { d: 'M' + oct.map(P).join('L') + 'Z', class: 'oa-deck' }, dg);
    el('circle', { cx: 0, cy: 0, r: 10, class: 'oa-tdpm' }, dg);
    if (!s0.noH) txt(dg, 0, 0, 'H', 'oa-h', { transform: 'rotate(90)' });
    // eixo do "H" (referência dos 45°)
    if (!s0.noH) { const a = pt(s0.bis + 90, R, rot), b = pt(s0.bis - 90, R, rot); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'oa-haxis' }, svg); }
    // vento
    if (st.windSpd > 0) {
      const a = pt(st.windDir, R + 52, rot), b = pt(st.windDir, R - 8, rot);
      el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'oa-wind' }, svg);
      arrowHead(svg, b, st.windDir + 180, rot, 13, 'oa-wind-h');
    }
    // trajetória recomendada
    const e = res.best;
    if (e) {
      const cls = res.kind === 'none' ? 'oa-path is-bad' : res.kind === 'amber' ? 'oa-path is-flex' : 'oa-path';
      if (land) {
        const a = pt(e.path, R + 40, rot), b = pt(e.path, 24, rot);
        el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, svg);
        arrowHead(svg, b, e.course, rot, 12, cls + ' oa-head');
        heli(svg, pt(e.path, R * 0.62, rot), e.course, rot);
      } else {
        const a = pt(e.path, 24, rot), b = pt(e.path, R + 40, rot);
        el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, svg);
        arrowHead(svg, b, e.course, rot, 12, cls + ' oa-head');
        heli(svg, pt(e.path, R * 0.45, rot), e.course, rot);
      }
      // rótulo da proa ao lado do helicóptero, afastado da linha
      const lb = pt(e.path, R * (land ? 0.62 : 0.45), rot), q = rad(e.path + 90 - rot);
      txt(svg, lb[0] + Math.sin(q) * 34, lb[1] - Math.cos(q) * 34 + 6, deg3(e.course) + '°', 'oa-crs', { 'text-anchor': 'middle' });
    }
    txt(svg, -292, 288, '500 m · unidade em escala, helideque fora de escala', 'oa-note', { 'text-anchor': 'start' });
  }

  // circuito padrão diurno (SOP 52 5.8 a 5.11), distâncias em NM
  function drawCircuit(svg, st, res) {
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '-300 -300 600 600');
    const rot = st.northUp ? 0 : st.unitHdg, k = 118; // px por NM
    const e = res.best;
    const secs = sectors(st);
    secs.forEach(s => el('path', { d: wedge(s.bis - s.half, s.bis + s.half, 0.27 * k, rot), class: 'oa-z-green' }, svg));
    [1, 1.5, 1.8].forEach(r => { el('circle', { cx: 0, cy: 0, r: r * k, class: 'oa-rr' }, svg); const t = pt(rot + 135, r * k, rot); txt(svg, t[0] + 3, t[1] - 3, String(r).replace('.', ',') + ' NM', 'oa-rr-t', { 'text-anchor': 'start' }); });
    el('circle', { cx: 0, cy: 0, r: 6, class: 'oa-um' }, svg);
    // norte
    const nn = pt(0, 285, rot); txt(svg, nn[0], nn[1] + 5, 'N', 'oa-ring-t is-n');
    if (st.windSpd > 0) {
      const a = pt(st.windDir, 280, rot), b = pt(st.windDir, 236, rot);
      el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'oa-wind' }, svg);
      arrowHead(svg, b, st.windDir + 180, rot, 12, 'oa-wind-h');
    }
    if (!e || st.mode === 'takeoff') {
      if (e) { const a = pt(e.course, 10, rot), b = pt(e.course, 1.8 * k, rot); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'oa-path' }, svg); arrowHead(svg, b, e.course, rot, 12, 'oa-path oa-head'); txt(svg, b[0], b[1] - 14, 'Decolagem ' + deg3(e.course) + '° · sem curvas abaixo de 500 ft', 'oa-leg-t'); }
      return;
    }
    const C = e.course, right = st.pfSide !== 'left';
    const lat = right ? C + 90 : C - 90; // lado da perna do vento visto na final
    const off = (b, d) => pt(b, d * k, rot);
    const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
    const back = 1.31, fin = 1.35; // base a ~1,65 NM da UM (1,5–1,8); final a ~1,35 NM (1,2–1,5)
    const ovh = off(C, 0.55);
    const dw0 = add(off(lat, 1.0), off(C, 0.9)), dw1 = add(off(lat, 1.0), off(C + 180, back));
    const b1 = off(C + 180, fin);
    el('path', { d: `M0,0L${P(ovh)}L${P(dw0)}`, class: 'oa-circ is-ovf' }, svg);
    el('path', { d: `M${P(dw0)}L${P(dw1)}L${P(b1)}`, class: 'oa-circ' }, svg);
    arrowHead(svg, add(off(lat, 1.0), off(C + 180, back * 0.1)), C + 180, rot, 11, 'oa-circ-h');
    arrowHead(svg, add(off(lat, 0.5), off(C + 180, (back + fin) / 2)), lat + 180, rot, 11, 'oa-circ-h');
    arrowHead(svg, off(C + 180, fin * 0.45), C, rot, 12, 'oa-path oa-head');
    el('line', { x1: b1[0], y1: b1[1], x2: 0, y2: 0, class: 'oa-path' }, svg);
    heli(svg, off(C + 180, fin * 0.7), C, rot);
    const lab = (p, s) => txt(svg, p[0], p[1], s, 'oa-leg-t');
    lab(add(off(lat, 1.22), off(C + 180, back * 0.35)), 'Perna do vento 1,0 NM');
    lab(add(off(lat, 0.5), off(C + 180, (back + fin) / 2 + 0.2)), 'Base 1,5–1,8 NM');
    lab(add(off(lat, -0.42), off(C + 180, fin * 0.55)), 'Final 1,2–1,5 NM · ' + deg3(C) + '°');
    lab(add(off(lat, 0.35), off(C, 0.7)), 'Sobrevoo / identificação');
    txt(svg, -292, 288, '500 ft RA · 80 KIAS · bank máx. 20° · curvas para o lado do PF', 'oa-note', { 'text-anchor': 'start' });
  }

  // ---------- interface ----------
  const KEY = 'aw139.offApproach';
  const ICONS = {
    ns: '<svg viewBox="0 0 64 40"><path d="M6 14h40l12 6-12 6H6z" class="h"/><rect x="22" y="12" width="9" height="16" class="m"/><circle cx="50" cy="20" r="5" class="d"/></svg>',
    fpso: '<svg viewBox="0 0 64 40"><path d="M10 13h40l10 7-10 7H10z" class="h"/><rect x="20" y="15" width="6" height="10" class="m"/><rect x="28" y="15" width="6" height="10" class="m"/><rect x="36" y="15" width="6" height="10" class="m"/><circle cx="9" cy="20" r="5" class="d"/></svg>',
    flo: '<svg viewBox="0 0 64 40"><rect x="14" y="6" width="36" height="28" rx="3" class="h"/><circle cx="18" cy="10" r="3" class="m"/><circle cx="46" cy="30" r="3" class="m"/><circle cx="18" cy="30" r="3" class="m"/><circle cx="48" cy="9" r="5" class="d"/></svg>',
    meia: '<svg viewBox="0 0 64 40"><path d="M4 14h44l12 6-12 6H4z" class="h"/><circle cx="28" cy="20" r="5" class="d"/></svg>',
    outro: '<svg viewBox="0 0 64 40"><rect x="18" y="8" width="28" height="24" class="h"/><path d="M32 8v24M18 20h28" class="m2"/><circle cx="46" cy="9" r="5" class="d"/></svg>'
  };

  function mount(opts) {
    const o = opts || {};
    const tabs = document.querySelector('.viewer-tabs'), stage = document.querySelector('.viewer-stage');
    if (!tabs || !stage) return null;
    const mode = o.mode === 'takeoff' ? 'takeoff' : 'landing';
    let st = { unit: 'fpso-c', unitHdg: 360, windDir: '', windSpd: '', acoplada: false, xwind: XWIND, pfSide: 'right', northUp: true, view: 'deck', bisAdj: 0, customBis: 0, customCls: 1, meiaOpen: '' };
    try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (_) { /* sem armazenamento */ }
    st.mode = mode;
    const save = () => { try { const c = Object.assign({}, st); delete c.mode; localStorage.setItem(KEY, JSON.stringify(c)); } catch (_) { /* idem */ } };

    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'viewer-tab'; btn.dataset.tab = 'approach'; btn.textContent = mode === 'takeoff' ? 'Saída SLO' : 'Aproximação';
    tabs.appendChild(btn);
    const view = document.createElement('div');
    view.className = 'oa'; view.style.display = 'none';
    stage.appendChild(view);
    const groupOf = id => GROUPS.find(g => g.opts.some(x => x[0] === id)) || GROUPS[0];
    view.innerHTML = `
      <p class="ldg-review oa-review" role="note">Em conferência: regras da SOP 52 Rev. 01 (SLO 210°/180°, 500 m, +30° além do SLO = 45° do "H", circuito 1,0 / 1,5–1,8 / 1,2–1,5 NM). Posição do deck e bissetriz de cada tipo de unidade são valores de partida até a conferência com a NORMAM-223; confira no Helideck Report.</p>
      <div class="oa-units" role="radiogroup" aria-label="Tipo de unidade">${GROUPS.map(g => `<button type="button" class="oa-unit" data-group="${g.id}" role="radio">${ICONS[g.id]}<b>${g.label}</b><small>${g.hint}</small></button>`).join('')}</div>
      <div class="oa-sub" role="radiogroup" aria-label="Posição do helideque"></div>
      <div class="oa-inputs">
        <label class="field"><span>Vento <small>°M</small></span><input data-k="windDir" type="number" inputmode="numeric" min="0" max="360" placeholder="090"></label>
        <label class="field"><span>Vento <small>kt</small></span><input data-k="windSpd" type="number" inputmode="numeric" min="0" max="80" placeholder="15"></label>
        <label class="field"><span>Aproamento da unidade <small>°M</small></span><input data-k="unitHdg" type="number" inputmode="numeric" min="0" max="360" placeholder="180"></label>
      </div>
      <details class="oa-more"><summary>Ajustes</summary><div class="oa-inputs">
        <label class="field oa-only-outro"><span>Bissetriz do SLO <small>° rel. à proa da unidade</small></span><input data-k="customBis" type="number" inputmode="numeric" min="0" max="360" placeholder="0"></label>
        <label class="field oa-only-outro"><span>Classe do helideque</span><select data-k="customCls"><option value="1">Classe 1</option><option value="2">Classe 2</option><option value="3">Classe 3</option></select></label>
        <label class="field oa-only-meia"><span>Abertura de cada setor <small>° (provisório)</small></span><input data-k="meiaOpen" type="number" inputmode="numeric" min="30" max="210" placeholder="120"></label>
        <label class="field"><span>Correção da bissetriz <small>° (+ horário)</small></span><input data-k="bisAdj" type="number" inputmode="numeric" min="-90" max="90" placeholder="0"></label>
        <label class="field"><span>Través máximo <small>kt</small></span><input data-k="xwind" type="number" inputmode="numeric" min="0" max="40" placeholder="20"></label>
        <label class="field"><span>Lado do PF <small>curvas do circuito</small></span><select data-k="pfSide"><option value="right">Direita</option><option value="left">Esquerda</option></select></label>
        <label class="oa-check"><input data-k="acoplada" type="checkbox"> Unidade acoplada por gangway (SLO 180°)</label>
      </div></details>
      <div class="oa-bar"><div class="oa-seg" role="tablist"><button type="button" data-view="deck">Helideque</button><button type="button" data-view="circuit">Circuito</button></div>
        <div class="oa-seg"><button type="button" data-north="1">Norte acima</button><button type="button" data-north="0">Unidade acima</button></div></div>
      <div class="oa-fig"><svg class="oa-svg" role="img" aria-label="Setor livre de obstáculos e aproximação recomendada"></svg></div>
      <div class="oa-legend"><span class="g">SLO</span><span class="a">+30° (só com través)</span><span class="r">Obstáculos</span><span class="w">Vento</span></div>
      <div class="oa-out" aria-live="polite"></div>`;
    const $ = s => view.querySelector(s), svg = $('.oa-svg'), out = $('.oa-out');
    view.querySelectorAll('[data-k]').forEach(i => {
      const v = st[i.dataset.k];
      if (i.type === 'checkbox') i.checked = !!v; else i.value = v === '' || v == null || (i.dataset.k === 'bisAdj' && !v) ? '' : String(v);
      const on = () => {
        const kk = i.dataset.k;
        st[kk] = i.type === 'checkbox' ? i.checked : i.tagName === 'SELECT' ? i.value : i.value.trim() === '' ? '' : Number(i.value);
        save(); render();
      };
      i.addEventListener('input', on); i.addEventListener('change', on);
    });
    $('.oa-units').addEventListener('click', ev => {
      const b = ev.target.closest('[data-group]'); if (!b) return;
      const g = GROUPS.find(x => x.id === b.dataset.group);
      if (!g.opts.some(x => x[0] === st.unit)) st.unit = g.id === 'fpso' ? 'fpso-c' : g.opts[0][0];
      save(); render();
    });
    $('.oa-sub').addEventListener('click', ev => { const b = ev.target.closest('[data-unit]'); if (!b) return; st.unit = b.dataset.unit; save(); render(); });
    view.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { st.view = b.dataset.view; save(); render(); }));
    view.querySelectorAll('[data-north]').forEach(b => b.addEventListener('click', () => { st.northUp = b.dataset.north === '1'; save(); render(); }));

    // vento e proa vindos dos campos de WRA do perfil, quando os daqui estão vazios
    function pull() {
      const w = o.wra && o.wra.box;
      if (!w) return;
      const [d, s] = [...w.querySelectorAll('input')].map(i => i.value.trim());
      let ch = false;
      if (st.windDir === '' && d !== '') { st.windDir = Number(d); ch = true; }
      if (st.windSpd === '' && s !== '') { st.windSpd = Number(s); ch = true; }
      if (ch) { view.querySelector('[data-k="windDir"]').value = st.windDir; view.querySelector('[data-k="windSpd"]').value = st.windSpd; save(); }
    }

    function render() {
      const g = groupOf(st.unit), u = unitOf(st);
      view.querySelectorAll('.oa-unit').forEach(b => { const on = b.dataset.group === g.id; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
      const sub = $('.oa-sub');
      sub.innerHTML = g.opts.length > 1 ? g.opts.map(([id, l]) => `<button type="button" data-unit="${id}" role="radio" aria-checked="${id === st.unit}" class="${id === st.unit ? 'is-on' : ''}">${l}</button>`).join('') : '';
      sub.hidden = g.opts.length < 2;
      view.querySelectorAll('.oa-only-outro').forEach(x => { x.hidden = st.unit !== 'outro'; });
      view.querySelectorAll('.oa-only-meia').forEach(x => { x.hidden = st.unit !== 'meia'; });
      view.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-on', b.dataset.view === st.view));
      view.querySelectorAll('[data-north]').forEach(b => b.classList.toggle('is-on', (b.dataset.north === '1') === !!st.northUp));
      const calc = Object.assign({}, st, { unitHdg: st.unitHdg === '' ? 360 : Number(st.unitHdg) % 360, windDir: st.windDir === '' ? 0 : Number(st.windDir) % 360, windSpd: st.windDir === '' || st.windSpd === '' ? 0 : Number(st.windSpd) });
      const res = solve(calc);
      (st.view === 'circuit' ? drawCircuit : drawDeck)(svg, calc, res);
      out.innerHTML = summary(calc, res, u);
      const use = out.querySelector('.oa-use');
      if (use) use.addEventListener('click', () => { o.wra.set(calc.windDir ? n360(calc.windDir) : 360, calc.windSpd, res.best.course); use.textContent = 'Enviado ao cálculo ✓'; });
    }

    function summary(st, res, u) {
      const e = res.best, land = st.mode !== 'takeoff', haveWind = st.windSpd > 0;
      const rows = [], notes = [];
      const head = res.kind === 'green' ? ['ok', land ? 'Final dentro do SLO' : 'Saída dentro do SLO']
        : res.kind === 'amber' ? ['warn', 'Só com a flexibilidade de 30° (SOP 5.4)'] : ['bad', land ? 'Nenhuma proa atende: não prosseguir' : 'Nenhuma proa atende'];
      rows.push(`<div class="oa-big ${head[0]}"><span>${land ? 'Proa da final' : 'Proa de decolagem'}</span><b>${e ? deg3(e.course) + '°' : '—'}</b><em>${head[1]}</em></div>`);
      if (e) {
        rows.push(`<div class="oa-kv"><span>${haveWind ? 'Vento de proa' : 'Vento'}</span><b>${haveWind ? (e.head >= 0 ? fmt1(e.head) + ' kt' : 'cauda ' + fmt1(-e.head) + ' kt') : 'calmo / não informado'}</b></div>`);
        if (haveWind) rows.push(`<div class="oa-kv ${e.cross > res.lim ? 'bad' : ''}"><span>Través</span><b>${fmt1(e.cross)} kt ${e.side ? 'da ' + e.side : ''}</b></div>`);
        rows.push(`<div class="oa-kv"><span>${land ? 'Vem de' : 'Sai para'}</span><b>${deg3(e.path)}° · ${e.zone === 'green' ? 'no SLO' : e.zone === 'amber' ? Math.round(e.beyond) + '° além do SLO' : 'fora do SLO'}</b></div>`);
        if (e.hdev != null) rows.push(`<div class="oa-kv ${e.hdev > 45 + 1e-9 && e.zone !== 'green' ? 'bad' : ''}"><span>Defasagem do "H"</span><b>${Math.round(e.hdev)}°</b></div>`);
        rows.push(land ? `<div class="oa-kv"><span>Arremetida</span><b>curva pela ${gaSide(e)}</b></div>` : `<div class="oa-kv"><span>Curvas</span><b>só acima de 500 ft, pela ${gaSide(e)}</b></div>`);
        if (land) {
          const tk = zoneOf(e.course, sectors(st));
          notes.push(tk.zone === 'green' ? `Decolagem na mesma proa (${deg3(e.course)}°) também sai pelo SLO (SOP 5.14).` : `A decolagem na mesma proa não sai pelo SLO: planeje a saída na aba de decolagem.`);
        }
      }
      const cl = classOf(st);
      if (cl) rows.push(`<div class="oa-kv"><span>Helideque</span><b>Classe ${cl.now}${cl.now !== cl.base ? ` (era ${cl.base})` : ''}</b></div>`);
      const rw = relWind(st);
      if (haveWind) rows.push(`<div class="oa-kv"><span>Vento na unidade</span><b>${rw.txt}</b></div>`);
      if (cl && cl.note) notes.push(cl.note);
      if (!haveWind) notes.unshift('Informe o vento e o aproamento da unidade (rádio operador, 5 min antes do ETA).');
      if (res.kind === 'amber') notes.push('O través impede a final dentro do SLO: defasagem de até 30° além do limite lateral (45° do "H"), mantendo a separação dos obstáculos. No LDP a trajetória tem de estar toda dentro do SLO, cauda livre.');
      if (res.kind === 'none') notes.push(`Não há proa que cumpra o SLO (+30°) e o través máximo de ${res.lim} kt ao mesmo tempo: a aproximação deve ser descontinuada (SOP 5.4). A proa mostrada é a de menor través, só como referência.`);
      if (u.provisional) notes.push('Bissetriz deste tipo de unidade ainda em conferência: use a correção em Ajustes conforme o Helideck Report.');
      if (st.acoplada) notes.push('Unidade acoplada por gangway: SLO de 180°.');
      if (land && st.view === 'circuit') notes.push(`Circuito com curvas pela ${st.pfSide === 'left' ? 'esquerda' : 'direita'} (UM do lado do PF).`);
      const canUse = o.wra && e && haveWind && res.kind !== 'none';
      return `<div class="oa-grid">${rows.join('')}</div>${notes.length ? `<ul class="oa-notes">${notes.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}` +
        (canUse ? `<button type="button" class="ghost-btn oa-use">Usar ${deg3(e.course)}° e o vento no cálculo de performance</button>` : '');
    }

    let active = false;
    tabs.addEventListener('click', ev => {
      const b = ev.target.closest('.viewer-tab');
      if (!b) return;
      if (b === btn) {
        ev.stopPropagation(); active = true;
        tabs.querySelectorAll('.viewer-tab').forEach(x => x.classList.toggle('active', x === btn));
        [...stage.children].forEach(c => { if (c !== view) c.style.display = 'none'; });
        view.style.display = '';
        const pane = stage.closest('.viewer-pane'); if (pane) pane.classList.remove('is-empty');
        const t = document.getElementById('vizTitle'); if (t) t.textContent = mode === 'takeoff' ? 'Saída pelo setor livre (SLO)' : 'Aproximação offshore (SLO)';
        pull(); render();
      } else { active = false; view.style.display = 'none'; }
    }, true);
    render();
    return { render, isActive: () => active };
  }

  root.OffApproach = { UNITS, sectors, zoneOf, evaluate, solve, relWind, classOf, mount };
})(typeof window !== 'undefined' ? window : globalThis);
