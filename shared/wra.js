/* AW139 — WRA (ângulo do vento relativo) e decomposição do vento.
 * Supl. 12 Fig. 4K-4 (Wind Component Chart, vale para todos os procedimentos CAT A do Supl. 12/50/90):
 *   conferida vetorialmente: as linhas de ângulo e os arcos de velocidade são exatamente
 *   proa = V·cos(WRA) e través = V·sen(WRA) (diferença < 0,05 kt / 0,05°). Través máximo para decolagem e pouso: 20 kt.
 * Supl. 97 (Enhanced Offshore), Fig. 1-2 e 4-13 (ângulo positivo = vento da direita):
 *   WRA de -90° a 20°: vale a velocidade total do vento;
 *   WRA de 20° a 90°: vento até 15 kt sem benefício; acima de 15 kt, só o que passa de 15 kt: (V - 15)·cos(WRA)
 *   (Fig. 4-13, também conferida vetorialmente); WRA além de ±90°: setor de vento de cauda, proibido.
 * O crédito que vai para a carta é arredondado para baixo (kt inteiro), nunca para cima.
 */
(function (root) {
  'use strict';
  const MAX_XWIND = 20;
  const rad = d => d * Math.PI / 180;
  const norm = d => { let a = ((d % 360) + 360) % 360; if (a > 180) a -= 360; return a; };

  // windFrom e heading na mesma referência (°M); WRA positivo = vento vindo da direita
  function decompose(windFrom, speed, heading) {
    const wra = norm(windFrom - heading), v = Math.max(0, speed || 0);
    const head = v * Math.cos(rad(wra)), cross = v * Math.abs(Math.sin(rad(wra)));
    return { wra, speed: v, head, cross, side: wra > 0 ? 'direita' : wra < 0 ? 'esquerda' : '', tail: head < -1e-9 && v > 0 };
  }

  // crédito de vento de proa para a carta (kt), conforme o procedimento
  function credit(windFrom, speed, heading, rule) {
    const d = decompose(windFrom, speed, heading), notes = [];
    let hw, fig = 'Fig. 4K-4 (Supl. 12)', prohibited = false;
    if (rule === 'enhanced') {
      fig = 'Fig. 1-2 / 4-13 (Supl. 97)';
      if (Math.abs(d.wra) > 90) { hw = 0; prohibited = true; notes.push('Setor de vento de cauda: proibido no Enhanced (Fig. 1-2).'); }
      else if (d.wra <= 20) { hw = d.speed; notes.push('WRA entre -90° e 20°: vale a velocidade total do vento.'); }
      else if (d.speed <= 15) { hw = 0; notes.push('WRA entre 20° e 90° com vento até 15 kt: sem benefício de vento.'); }
      else { hw = (d.speed - 15) * Math.cos(rad(d.wra)); notes.push('WRA entre 20° e 90°: só o vento acima de 15 kt conta (Fig. 4-13).'); }
    } else {
      hw = Math.max(0, d.head);
      if (d.tail) notes.push(`Vento de cauda de ${(-d.head).toFixed(1)} kt: sem crédito de vento.`);
    }
    if (d.cross > MAX_XWIND + 1e-9) notes.push(`Través de ${d.cross.toFixed(1)} kt acima do máximo de ${MAX_XWIND} kt para decolagem e pouso (Fig. 4K-4).`);
    return Object.assign(d, { rule: rule || 'standard', fig, raw: hw, credit: Math.floor(hw + 1e-9), prohibited, notes, xwindOver: d.cross > MAX_XWIND + 1e-9 });
  }

  const fmt = v => v.toFixed(1).replace('.', ',');
  function describe(r) {
    const wra = r.wra === 0 ? '0°' : `${Math.abs(Math.round(r.wra))}° ${r.side === 'direita' ? 'da direita' : 'da esquerda'}`;
    const comp = r.head >= 0 ? `proa ${fmt(r.head)} kt` : `cauda ${fmt(-r.head)} kt`;
    return `WRA ${wra} · ${comp} · través ${fmt(r.cross)} kt · crédito na carta ${r.credit} kt (${r.fig})` + (r.notes.length ? ` · ${r.notes.join(' ')}` : '');
  }

  // Campos Vento (°M) / Velocidade / Proa (°M) logo abaixo do campo de vento de proa do perfil.
  // Preenchidos os três, o campo de vento de proa recebe o crédito (arredondado para baixo) e o perfil recalcula.
  function attach(hwInput, opts) {
    const o = opts || {}, label = hwInput.closest('label') || hwInput.parentElement;
    const box = document.createElement('div');
    box.className = 'wra-box';
    const field = (id, text, ph) => `<label class="${label.className}"><span>${text}</span><input id="${id}" class="${hwInput.className}" type="number" inputmode="numeric" min="0" max="360" step="1" placeholder="${ph}"></label>`;
    const p = o.prefix || 'wra';
    box.innerHTML = `<div class="wra-title">Vento relativo (WRA) <small>opcional: preenche o vento de proa</small> <small class="wra-review">· em conferência</small></div>
      <div class="wra-grid">${field(p + 'Dir', 'Vento <small>°M</small>', '360')}${field(p + 'Spd', 'Velocidade <small>kt</small>', '15')}${field(p + 'Hdg', 'Proa <small>°M</small>', '360')}</div>
      <p class="wra-out" aria-live="polite"></p>`;
    label.insertAdjacentElement('afterend', box);
    const $ = id => box.querySelector('#' + id), out = box.querySelector('.wra-out');
    const ins = [$(p + 'Dir'), $(p + 'Spd'), $(p + 'Hdg')];
    let last = null;
    function update() {
      const [d, s, h] = ins.map(i => i.value.trim());
      if (d === '' || s === '' || h === '') { out.textContent = ''; out.className = 'wra-out'; last = null; return; }
      const r = credit(Number(d) % 360, Number(s), Number(h) % 360, typeof o.rule === 'function' ? o.rule() : o.rule);
      last = r;
      out.textContent = describe(r);
      out.className = 'wra-out' + (r.prohibited || r.tail || r.xwindOver ? ' is-warn' : '');
      if (String(hwInput.value) !== String(r.credit)) {
        hwInput.value = String(r.credit);
        hwInput.dispatchEvent(new Event('input', { bubbles: true }));
        hwInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (o.onChange) o.onChange(r);
    }
    ins.forEach(i => { i.addEventListener('input', update); i.addEventListener('change', update); });
    if (o.heading != null) ins[2].value = String(o.heading);
    return { box, update, get: () => last, set(dir, spd, hdg) { if (dir != null) ins[0].value = dir; if (spd != null) ins[1].value = spd; if (hdg != null) ins[2].value = hdg; update(); } };
  }

  // estilo mínimo (herda cores e campos do tema do perfil)
  if (typeof document !== 'undefined' && !document.getElementById('wra-style')) {
    const st = document.createElement('style');
    st.id = 'wra-style';
    st.textContent = '.wra-box{grid-column:1/-1;margin:2px 0 6px}.wra-title{font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.8;margin:4px 0}' +
      '.wra-title small{text-transform:none;letter-spacing:0;opacity:.8}.wra-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
      '.wra-grid label{min-width:0}.wra-grid input{width:100%;box-sizing:border-box}.wra-out{margin:6px 0 0;font-size:12px;line-height:1.35;opacity:.9}.wra-out.is-warn{color:#ffb4b4}.wra-review{color:#ff7ac0;opacity:1}';
    document.head.appendChild(st);
  }

  root.WRA = { MAX_XWIND, decompose, credit, describe, attach, norm };
})(typeof window !== 'undefined' ? window : globalThis);
