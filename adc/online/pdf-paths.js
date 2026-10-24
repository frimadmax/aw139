/* Extrai do PDF (pdf.js) os caminhos vetoriais com cor de preenchimento/traço e os textos,
 * em coordenadas da página já orientada (pontos, origem no canto superior esquerdo). */
(function (root) {
  'use strict';
  const mul = (a, b) => [a[0]*b[0] + a[2]*b[1], a[1]*b[0] + a[3]*b[1], a[0]*b[2] + a[2]*b[3], a[1]*b[2] + a[3]*b[3], a[0]*b[4] + a[2]*b[5] + a[4], a[1]*b[4] + a[3]*b[5] + a[5]];
  const ap = (m, x, y) => [m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5]];
  const hex = c => {
    if (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)) return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255);
    if (Array.isArray(c) || ArrayBuffer.isView(c)) return Array.from(c).slice(0, 3).map(v => v > 1 ? v / 255 : v);
    return null;
  };

  // pdf.js entrega a cor como [r,g,b] 0-255 (array tipado) ou como '#rrggbb'
  const colorArg = a => (typeof a?.[0] === 'number' ? a : a?.[0]);

  async function extract(page, pdfjsLib) {
    const OPS = pdfjsLib.OPS;
    const vp = page.getViewport({ scale: 1 });
    const base = vp.transform;                       // espaço do PDF -> página orientada
    const ol = await page.getOperatorList();
    const paths = [];
    let ctm = [1, 0, 0, 1, 0, 0], fill = [0, 0, 0], stroke = [0, 0, 0], lw = 1;
    const stack = [];
    let pending = [];                                 // subcaminhos aguardando a operação de pintura
    const flush = (mode) => {
      if (!pending.length) return;
      const m = mul(base, ctm);
      const scale = Math.hypot(m[0], m[1]);
      for (const sp of pending) {
        const pts = sp.pts.map(([x, y]) => ap(m, x, y));
        paths.push({ pts, closed: sp.closed, fill: mode.fill ? fill.slice() : null, stroke: mode.stroke ? stroke.slice() : null, width: lw * scale });
      }
      pending = [];
    };
    for (let i = 0; i < ol.fnArray.length; i++) {
      const fn = ol.fnArray[i], a = ol.argsArray[i];
      switch (fn) {
        case OPS.save: stack.push([ctm, fill, stroke, lw]); break;
        case OPS.restore: if (stack.length) [ctm, fill, stroke, lw] = stack.pop(); break;
        case OPS.transform: ctm = mul(ctm, a); break;
        case OPS.setLineWidth: lw = a[0]; break;
        case OPS.setFillRGBColor: case OPS.setFillColor: case OPS.setFillGray: case OPS.setFillCMYKColor: { const c = hex(colorArg(a)); if (c) fill = c; break; }
        case OPS.setStrokeRGBColor: case OPS.setStrokeColor: case OPS.setStrokeGray: case OPS.setStrokeCMYKColor: { const c = hex(colorArg(a)); if (c) stroke = c; break; }
        case OPS.constructPath: {
          const [ops, coords] = a;
          let k = 0, cur = null;
          for (const op of ops) {
            if (op === OPS.moveTo) { cur = { pts: [[coords[k], coords[k + 1]]], closed: false }; pending.push(cur); k += 2; }
            else if (op === OPS.lineTo) { if (!cur) { cur = { pts: [], closed: false }; pending.push(cur); } cur.pts.push([coords[k], coords[k + 1]]); k += 2; }
            else if (op === OPS.curveTo) { cur && cur.pts.push([coords[k + 4], coords[k + 5]]); k += 6; }
            else if (op === OPS.curveTo2 || op === OPS.curveTo3) { cur && cur.pts.push([coords[k + 2], coords[k + 3]]); k += 4; }
            else if (op === OPS.closePath) { if (cur) cur.closed = true; }
            else if (op === OPS.rectangle) {
              const [x, y, w, h] = coords.slice(k, k + 4); k += 4;
              cur = { pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], closed: true }; pending.push(cur);
            }
          }
          break;
        }
        case OPS.fill: case OPS.eoFill: flush({ fill: true }); break;
        case OPS.stroke: case OPS.closeStroke: flush({ stroke: true }); break;
        case OPS.fillStroke: case OPS.eoFillStroke: case OPS.closeFillStroke: case OPS.closeEOFillStroke: flush({ fill: true, stroke: true }); break;
        case OPS.endPath: pending = []; break;
      }
    }
    const tc = await page.getTextContent();
    const texts = tc.items.filter(t => t.str && t.str.trim()).map(t => {
      const m = mul(base, t.transform);
      const h = Math.hypot(m[2], m[3]) || t.height;
      return { str: t.str.trim(), x: m[4], y: m[5], w: t.width, h, angle: Math.atan2(m[1], m[0]) };
    });
    return { width: vp.width, height: vp.height, paths, texts };
  }
  root.PdfPaths = { extract };
})(typeof window !== 'undefined' ? window : globalThis);
