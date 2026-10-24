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
  const fmt = v => v.toFixed(1).replace('.', ',');
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
      if (d.tail) notes.push(`Vento de cauda de ${fmt(-d.head)} kt: sem crédito de vento.`);
    }
    if (d.cross > MAX_XWIND + 1e-9) notes.push(`Través de ${fmt(d.cross)} kt acima do máximo de ${MAX_XWIND} kt para decolagem e pouso (Fig. 4K-4).`);
    return Object.assign(d, { rule: rule || 'standard', fig, raw: hw, credit: Math.floor(hw + 1e-9), prohibited, notes, xwindOver: d.cross > MAX_XWIND + 1e-9 });
  }

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
    box.innerHTML = `<div class="wra-title">Vento relativo (WRA) <small>opcional: preenche o vento de proa</small></div>
      <div class="wra-grid">${field(p + 'Dir', 'Vento <small>°M</small>', '360')}${field(p + 'Spd', 'Velocidade <small>kt</small>', '15')}${field(p + 'Hdg', 'Proa <small>°M</small>', '360')}</div>
      <p class="wra-out" aria-live="polite"></p>`;
    label.insertAdjacentElement('afterend', box);
    const $ = id => box.querySelector('#' + id), out = box.querySelector('.wra-out');
    const ins = [$(p + 'Dir'), $(p + 'Spd'), $(p + 'Hdg')];
    let last = null;
    const hooks = [];
    function update() {
      const [d, s, h] = ins.map(i => i.value.trim());
      if (d === '' || s === '' || h === '') { out.textContent = ''; out.className = 'wra-out'; last = null; hooks.forEach(f => f(null)); return; }
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
      hooks.forEach(f => f(r));
    }
    ins.forEach(i => { i.addEventListener('input', update); i.addEventListener('change', update); });
    if (o.heading != null) ins[2].value = String(o.heading);
    return { box, input: hwInput, update, get: () => last, onChange: f => hooks.push(f), set(dir, spd, hdg) { if (dir != null) ins[0].value = dir; if (spd != null) ins[1].value = spd; if (hdg != null) ins[2].value = hdg; update(); } };
  }

  // ---------- aba WRA: carta de vento do RFM com o caminho da leitura ----------
  const WBASE = '../shared/wind/';
  // r = resultado de credit(); devolve a carta, as polilinhas (pontos PDF) e a legenda
  function chartFor(r, rule) {
    const C = root.WIND_CHARTS || {};
    const pol = (ch, v, th) => [ch.o[0] + v * Math.sin(rad(th)) * ch.sx, ch.o[1] - v * Math.cos(rad(th)) * ch.sy];
    const arc = (ch, v, th) => { const p = []; for (let k = 0; k <= 24; k++) p.push(pol(ch, v, th * k / 24)); return p; };
    const polar = (ch, v) => {
      const th = Math.abs(r.wra), P = pol(ch, v, th), xr = ch.o[0] + (ch.vMax - ch.vMin) * ch.sx, yt = ch.o[1] - (ch.vMax - ch.vMin) * ch.sy;
      return { ch, traces: [[...arc(ch, v, th), [xr, P[1]]], [P, [P[0], yt]]], dots: [P] };
    };
    if (!r) return { ch: C[rule === 'enhanced' ? 'S97-1-2' : '4K-4'], traces: [], dots: [], msg: 'Preencha Vento, Velocidade e Proa para ver a leitura.' };
    if (rule === 'enhanced') {
      if (r.wra > 20 && r.wra <= 90 && r.speed > 15) {
        const ch = C['S97-4-13'], v = r.speed - 15;
        if (v > ch.vMax - ch.vMin) return { ch, traces: [], dots: [], msg: 'Vento acima da escala da carta (45 kt).' };
        return Object.assign(polar(ch, v), { msg: `${r.speed} kt − 15 kt = ${fmt(v)} kt a ${Math.round(r.wra)}°: crédito ${fmt(r.raw)} kt` });
      }
      const ch = C['S97-1-2'], c = ch.centers[r.speed > 15 ? 1 : 0], th = r.wra;
      const end = [c[0] + ch.r * Math.sin(rad(th)), c[1] - ch.r * Math.cos(rad(th))];
      return { ch, traces: [[c, end]], dots: [end], msg: r.notes[0] || '' };
    }
    const ch = C['4K-4'];
    if (Math.abs(r.wra) > 90) return { ch, traces: [], dots: [], msg: 'Vento de cauda: a carta vai até 90°.' };
    if (r.speed > ch.vMax) return { ch, traces: [], dots: [], msg: 'Vento acima da escala da carta (60 kt).' };
    return Object.assign(polar(ch, r.speed), { msg: `proa ${fmt(r.head)} kt · través ${fmt(r.cross)} kt` });
  }
  const capOf = (ch, extra) => ch ? `<b>Fig. ${ch.fig.replace(/^S97-/, '')}</b> ${ch.title} · ${ch.supl}, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)${extra ? ' · ' + extra : ''} · <b>aba WRA em conferência</b>` : '';
  const svgOf = v => v.traces.map(t => `<polyline class="trace" points="${t.map(p => p.map(n => n.toFixed(2)).join(',')).join(' ')}"/>`).join('') +
    v.dots.map(d => `<circle class="dot" cx="${d[0].toFixed(2)}" cy="${d[1].toFixed(2)}" r="2.2"/>`).join('');

  // Perfis Short Field / Back Up / Confined / Vertical / Pousos: abas .sf-tabs e carta única (#chartImg, #chartSvg, #chartCap)
  // ids: carta de outro nome (Height Loss: hlImg/hlSvg/hlCap, sem abas: cria "carta do perfil | WRA")
  function sfTab(ctl, rule, ids, hwInput) {
    const I = ids || { img: 'chartImg', svg: 'chartSvg', cap: 'chartCap' };
    const img = document.getElementById(I.img), svg = document.getElementById(I.svg), cap = document.getElementById(I.cap);
    let tabs = ids ? null : [...document.querySelectorAll('.sf-tabs')].find(t => t.querySelector('[data-tab]'));
    if (!img || !svg || !cap) return;
    if (!tabs && ids) {
      tabs = document.createElement('div'); tabs.className = 'sf-tabs'; tabs.setAttribute('role', 'tablist');
      tabs.innerHTML = `<button type="button" role="tab" data-tab="main" aria-selected="true">${I.label || 'Carta'}</button>`;
      cap.insertAdjacentElement('beforebegin', tabs);
      // volta para a carta do perfil: o perfil redesenha a cada alteração de campo
      tabs.firstElementChild.addEventListener('click', () => { tabs.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === 'main'))); hwInput.dispatchEvent(new Event('input', { bubbles: true })); });
    }
    if (!tabs) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.setAttribute('role', 'tab'); btn.dataset.tab = 'wra'; btn.setAttribute('aria-selected', 'false'); btn.textContent = 'WRA';
    tabs.appendChild(btn);
    let active = false;
    const draw = () => {
      if (!active) return;
      tabs.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      const v = chartFor(ctl.get(), rule());
      if (!v.ch) return;
      const src = WBASE + v.ch.img.src;
      if (img.getAttribute('src') !== src) { img.src = src; img.alt = `Figura ${v.ch.fig} do RFM`; }
      const [bx, by, bw, bh] = v.ch.img.box;
      svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
      svg.innerHTML = svgOf(v);
      cap.innerHTML = capOf(v.ch, v.msg);
    };
    tabs.addEventListener('click', e => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      if (b === btn) { e.stopPropagation(); active = true; draw(); } else active = false;
    }, true);
    // o perfil redesenha a carta dele a cada alteração: com a aba WRA ativa, desenha de novo por cima
    document.addEventListener('input', () => { if (active) setTimeout(draw, 0); });
    return draw;
  }

  // Offshore / Enhanced: abas .viewer-tab e área .viewer-stage (desenho com OFSView)
  function offTab(ctl, rule) {
    const tabs = document.querySelector('.viewer-tabs'), stage = document.querySelector('.viewer-stage');
    if (!tabs || !stage || !root.OFSView) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'viewer-tab'; btn.dataset.tab = 'wra'; btn.textContent = 'WRA';
    tabs.appendChild(btn);
    const view = document.createElement('div'); view.id = 'wraView'; view.style.display = 'none';
    stage.appendChild(view); root.OFSView.mount(view);
    let active = false;
    const draw = () => {
      if (!active) return;
      const v = chartFor(ctl.get(), rule());
      if (!v.ch) return;
      root.OFSView.draw(view, Object.assign({}, v.ch, { img: Object.assign({}, v.ch.img, { src: '../wind/' + v.ch.img.src }) }), capOf(v.ch, v.msg), v.traces, v.dots);
    };
    tabs.addEventListener('click', e => {
      const b = e.target.closest('.viewer-tab');
      if (!b) return;
      if (b === btn) {
        e.stopPropagation(); active = true;
        tabs.querySelectorAll('.viewer-tab').forEach(x => x.classList.toggle('active', x === btn));
        [...stage.children].forEach(c => { if (c !== view) c.style.display = 'none'; });
        view.style.display = '';
        const t = document.getElementById('vizTitle'); if (t) t.textContent = 'WRA (vento relativo)';
        draw();
      } else { active = false; view.style.display = 'none'; }
    }, true);
    return draw;
  }

  // liga a aba WRA ao controle criado por attach()
  function tab(ctl, opts) {
    const o = opts || {}, rule = () => (typeof o.rule === 'function' ? o.rule() : o.rule) || 'standard';
    const draw = o.chart ? sfTab(ctl, rule, o.chart, ctl.input) : (sfTab(ctl, rule) || offTab(ctl, rule));
    if (draw) ctl.onChange(draw);
    return draw;
  }

  // estilo mínimo (herda cores e campos do tema do perfil)
  if (typeof document !== 'undefined' && !document.getElementById('wra-style')) {
    const st = document.createElement('style');
    st.id = 'wra-style';
    st.textContent = '.wra-box{grid-column:1/-1;margin:2px 0 6px}.wra-title{font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.8;margin:4px 0}' +
      '.wra-title small{text-transform:none;letter-spacing:0;opacity:.8}.wra-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
      '.wra-grid label{min-width:0}.wra-grid input{width:100%;box-sizing:border-box}.wra-out{margin:6px 0 0;font-size:12px;line-height:1.35;opacity:.9}.wra-out.is-warn{color:#ffb4b4}';
    document.head.appendChild(st);
  }

  root.WRA = { MAX_XWIND, decompose, credit, describe, attach, norm, chartFor, tab };
})(typeof window !== 'undefined' ? window : globalThis);
