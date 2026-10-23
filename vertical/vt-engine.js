/* AW139 CAT A Heliport/Helideck Vertical — tabela do RFM e cálculo do perfil.
 * Curvas (Fig. 4A-3 a 4A-5A e 4A-6) em vt-data.js, lidas pelo mesmo motor do Short Field.
 * Tabela Fig. 4A-7 e regras do TDPE transcritas do RFM Rev 30, Suplemento 12, Parte A.
 */
(function (root) {
  'use strict';
  const E = root.SFEngine;
  const CONFIGS = {
    clean:   { label: 'Clean',    wat: '4A-3' },
    eapsOff: { label: 'EAPS OFF', wat: '4A-4' },
    eapsOn:  { label: 'EAPS ON',  wat: '4A-5' },
    ibf:     { label: 'IBF',      wat: '4A-5A' }
  };
  const CTO_FIG = '4A-6';
  // PATH 1 Gradient (Fig. 4A-8 a 4A-31): uma carta por peso e configuração
  const P1_GW = [4400, 4800, 5200, 5600, 6000, 6400];
  const P1_FIRST = { clean: 8, eapsOff: 14, eapsOn: 20, ibf: 26 };
  const p1Fig = (config, i) => `4A-${P1_FIRST[config] + i}`;
  // PATH 2 Gradient (Parte K, Fig. 4K-5 a 4K-28): de 200 ft a 1000 ft ATS, em VY e MCP OEI
  const P2_FIRST = { clean: 5, eapsOff: 11, eapsOn: 17, ibf: 23 };
  const p2Fig = (config, i) => `4K-${P2_FIRST[config] + i}`;
  const M2FT = 3.28084, PATH1_TOP = 200;
  // Fig. 4A-7: TDPE (ft) | altura mínima (ft) | altura no fim do CTO (ft)
  const T4A7 = [[35, 15, 35], [40, 20, 40], [45, 25, 45], [50, 30, 50], [55, 35, 55], [60, 40, 60], [65, 45, 65], [70, 50, 70]];
  const TDP_MIN = 35, TDP_MAX = 70, PA_MAX = 14000, TDPE_ALT_MAX = 7000;
  const isaT = paFt => 15 - 1.98 * paFt / 1000;
  const hdFt = (paFt, oat) => paFt + 118.8 * (oat - isaT(paFt));   // altitude densidade aproximada

  function heights(tdp) {
    if (tdp < TDP_MIN || tdp > TDP_MAX) return null;
    for (let i = 0; i < T4A7.length - 1; i++) {
      const a = T4A7[i], b = T4A7[i + 1];
      if (tdp >= a[0] && tdp <= b[0]) {
        const t = (tdp - a[0]) / (b[0] - a[0]);
        const f = k => a[k] + t * (b[k] - a[k]);
        return { tdp, minH: f(1), endH: f(2), exact: t === 0 || t === 1 };
      }
    }
    return null;
  }
  // Obstáculo à frente (Fig. 4A-1): dentro da distância CTO, TDPE = HO + HC + 20 ft (35 a 70 ft).
  // Depois da distância CTO o RFM usa o gradiente PATH 1 (Fig. 4A-8 a 4A-31).
  function obstacleAhead(hoFt, hcFt, doM, ctoM) {
    if (ctoM != null && doM != null && doM > ctoM) return { after: true, d1: doM - ctoM };
    const req = Math.max(TDP_MIN, hoFt + hcFt + 20);
    return { after: false, req, possible: req <= TDP_MAX };
  }

  // Gradiente médio (ft ganhos em 100 ft horizontais) numa carta PATH 1.
  function grad(fig, paFt, oat, hwKt) {
    const G = E.geo, ch = G.chart(fig);
    const fail = msg => ({ ok: false, fig, msg });
    let y = G.inv(ch.pa, paFt);
    const top = Math.min(...ch.oat.map(c => Math.min(...c.pts.map(p => p[1]))));
    if (y < top - 0.2) return fail(`Altitude acima do limite da carta (${Math.round(G.lin(ch.pa, top) / 100) * 100} ft).`);
    if (y > ch.yBase + 0.1) return fail('Altitude abaixo do limite da carta.');
    y = Math.min(ch.yBase, Math.max(top, y));
    const { fam, vLim } = G.oatFamily(ch, pts => G.xAtY(pts, y), paFt);
    if (oat > vLim + 1e-9) return fail(`OAT acima do limite MAX OAT (ISA+35 = ${vLim.toFixed(1)} °C nesta altitude).`);
    const r = G.interp(fam, oat);
    if (!r) return fail('Fora das curvas da carta nesta altitude e temperatura.');
    const gMax = ch.gMax || 70, x = r.pos, x0 = G.inv(ch.g, 0), x70 = G.inv(ch.g, gMax);
    const gBase = Math.max(0, G.lin(ch.g, x));
    const notes = [];
    const trace = [[x0 - 4, y], [x, y], [x, ch.y0kt]];
    const hw = Math.max(0, Math.min(20, hwKt || 0));
    let gHw = gBase, xH = x;
    if (hw > 0) {
      const yH = G.inv(ch.hw, hw);
      const at = g => { const v = G.xAtY(g.pts, yH); return v != null ? v : (Math.max(...g.pts.map(p => p[1])) < yH ? x70 : null); };
      const gs = ch.guides.map(g => ({ pts: g.pts, top: g.pts[0][0], at: at(g) })).filter(g => g.at != null).sort((a, b) => a.top - b.top);
      gs.push({ pts: [[x70, ch.y0kt], [x70, yH + 50]], top: x70, at: x70 });
      if (x < gs[0].top - 1e-6) {
        notes.push('Gradiente sem vento abaixo da primeira guia de vento: sem crédito de vento (conservador).');
        trace.push([x, G.inv(ch.hw, 20) + 3]);
      } else {
        let i = gs.findIndex((g, k) => k < gs.length - 1 && x <= gs[k + 1].top + 1e-6);
        if (i < 0) i = gs.length - 2;
        const lo = gs[i], hi = gs[i + 1];
        const t = hi.top === lo.top ? 0 : (x - lo.top) / (hi.top - lo.top);
        xH = Math.min(x70, lo.at + t * (hi.at - lo.at));
        gHw = G.lin(ch.g, xH);
        for (let k = 1; k <= 16; k++) {
          const yy = ch.y0kt + (yH - ch.y0kt) * k / 16;
          const a = G.xAtY(lo.pts, yy), b = G.xAtY(hi.pts, yy);
          trace.push([Math.min(x70, a != null && b != null ? a + t * (b - a) : (a != null ? a : x70)), yy]);
        }
        trace.push([xH, yH], [xH, G.inv(ch.hw, 20) + 3]);
      }
    } else trace.push([x, G.inv(ch.hw, 20) + 3]);
    if (gHw >= gMax - 0.1) notes.push(`Gradiente no fim da escala da carta (${gMax} ft).`);
    if (ch.minGrad != null && gHw < ch.minGrad) notes.push(`Gradiente abaixo da linha "Min. Gradient" da carta (${ch.minGrad.toFixed(1).replace('.', ',')} ft).`);
    return { ok: true, fig, gBase, grad: Math.min(gMax, gHw), hw, notes, trace };
  }
  // Gradiente para o peso: interpolação linear entre as cartas de peso vizinhas (como no RFM, Ex. 2).
  function gradForGw(config, paFt, oat, hwKt, gwKg, path = 1) {
    const fig = path === 2 ? p2Fig : p1Fig;
    const gw = Math.max(P1_GW[0], Math.min(6400, gwKg));
    let i = P1_GW.findIndex((w, k) => k < P1_GW.length - 1 && gw <= P1_GW[k + 1]);
    if (i < 0) i = P1_GW.length - 2;
    const a = grad(fig(config, i), paFt, oat, hwKt), b = grad(fig(config, i + 1), paFt, oat, hwKt);
    const t = (gw - P1_GW[i]) / (P1_GW[i + 1] - P1_GW[i]);
    if (t <= 1e-9 && a.ok) return { ok: true, grad: a.grad, charts: [a], gw, t: 0, path, notes: gwKg < P1_GW[0] ? ['Peso abaixo de 4400 kg: usada a carta de 4400 kg (conservador).'] : [] };
    if (!a.ok) return a;
    if (!b.ok) return b;
    return { ok: true, grad: a.grad + t * (b.grad - a.grad), charts: [a, b], gw, t, path, notes: gwKg < P1_GW[0] ? ['Peso abaixo de 4400 kg: usada a carta de 4400 kg (conservador).'] : [] };
  }
  // Maior peso (até gwMax) que dá o gradiente exigido; null se nem 4400 kg atinge.
  function gwForGrad(config, paFt, oat, hwKt, need, gwMax) {
    const pts = P1_GW.map(w => ({ w, r: grad(p1Fig(config, P1_GW.indexOf(w)), paFt, oat, hwKt) })).filter(p => p.r.ok);
    if (!pts.length || pts[0].w !== 4400 || pts[0].r.grad < need) return null;
    let best = 4400;
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      if (b.w - a.w !== 400) break;
      if (b.r.grad >= need) { best = b.w; continue; }
      best = a.w + (a.r.grad - need) / (a.r.grad - b.r.grad) * 400; break;
    }
    return Math.min(best, gwMax);
  }
  // Altura no obstáculo depois do CTO: PATH 1 do fim do CTO até 200 ft ATS, depois PATH 2 (Fig. 4A-2 e Parte K).
  function heightAt(inp, gw, endH, d1Ft, top = PATH1_TOP) {
    const g1 = gradForGw(inp.config, inp.pa, inp.oat, inp.hw, gw, 1);
    if (!g1.ok) return { ok: false, msg: `PATH 1: ${g1.msg}` };
    const out = { ok: true, g1 };
    if (g1.grad <= 0) { out.h = endH; out.d1p = Infinity; return out; }
    out.d1p = Math.max(0, (top - endH) * 100 / g1.grad);   // ft até o fim do PATH 1 (200 ft ATS)
    if (d1Ft <= out.d1p) { out.h = endH + g1.grad * d1Ft / 100; return out; }
    const g2 = gradForGw(inp.config, inp.pa, inp.oat, inp.hw, gw, 2);
    if (!g2.ok) return { ok: false, msg: `PATH 2: ${g2.msg}`, g1 };
    out.g2 = g2;
    out.h = top + g2.grad * (d1Ft - out.d1p) / 100;
    return out;
  }
  function obstacleAfter(inp, ctoM, endH) {
    const hReq = inp.obsAheadH + (inp.obsAheadHc || 0);
    const d1Ft = (inp.obsAheadD - ctoM) * M2FT;
    const out = Object.assign({ after: true, d1: inp.obsAheadD - ctoM, d1Ft, hReq }, heightAt(inp, inp.gw, endH, d1Ft));
    out.aboveTop = hReq > 1000;
    if (!out.ok) return out;
    out.thg = out.h; out.clear = out.h - inp.obsAheadH;
    out.clears = out.h >= hReq - 1e-9;
    if (out.clears) return out;
    // 1) TDPE até 70 ft (altura no fim do CTO = TDPE, Fig. 4A-7)
    const H = t => heightAt(inp, inp.gw, t, d1Ft);
    const h70 = H(TDP_MAX);
    if (h70.ok && h70.h >= hReq - 1e-9) {
      let lo = Math.max(TDP_MIN, inp.tdp), hi = TDP_MAX;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; const r = H(m); if (r.ok && r.h >= hReq) hi = m; else lo = m; }
      out.tdpe = Math.ceil(hi - 1e-6);
      return out;
    }
    // 2) TDPE 70 ft e peso menor (CTO mantido do peso atual: conservador, como no RFM)
    const W = w => heightAt(inp, w, TDP_MAX, d1Ft);
    const w0 = W(4400);
    if (!w0.ok || w0.h < hReq) { out.gw2 = null; return out; }
    let lo = 4400, hi = Math.max(4400, Math.min(6400, inp.gw));
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; const r = W(m); if (r.ok && r.h >= hReq) lo = m; else hi = m; }
    out.gw2 = lo;
    return out;
  }

  function compute(inp) {
    const cfg = CONFIGS[inp.config] || CONFIGS.clean;
    const out = { cfg, input: inp };
    out.wat = inp.pa > PA_MAX ? { ok: false, msg: 'Acima de 14000 ft Hp: limite CAT A (Supl. 12, 1A).' } : E.wat(cfg.wat, inp.pa, inp.oat, inp.hw);
    if (out.wat.ok) out.wat.margin = out.wat.wMax - inp.gw;
    out.h = heights(inp.tdp);
    out.hd = hdFt(inp.pa, inp.oat);
    out.tdpeAltOk = !(inp.tdp > TDP_MIN) || (inp.pa <= TDPE_ALT_MAX && out.hd <= TDPE_ALT_MAX);
    out.dist = E.cto(inp.pa, inp.oat, inp.gw, inp.hw, CTO_FIG);
    if (out.dist.ok) out.cto = out.dist.dist;
    if (inp.obsAheadH != null) {
      out.ahead = obstacleAhead(inp.obsAheadH, inp.obsAheadHc != null ? inp.obsAheadHc : 0, inp.obsAheadD, out.cto);
      if (out.ahead.after && out.h) out.ahead = obstacleAfter(inp, out.cto, out.h.endH);
    }
    return out;
  }

  root.VTEngine = { CONFIGS, CTO_FIG, P1_GW, p1Fig, p2Fig, grad, gradForGw, gwForGrad, heightAt, obstacleAfter, T4A7, TDP_MIN, TDP_MAX, TDPE_ALT_MAX, heights, obstacleAhead, hdFt, compute };
})(typeof window !== 'undefined' ? window : globalThis);
