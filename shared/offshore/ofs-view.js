/* Offshore: desenha a carta do RFM (imagem) com o caminho da leitura do app por cima (SVG em pontos PDF). */
(function (root) {
  'use strict';
  const BASE = '../shared/offshore/';
  function mount(el) {
    el.classList.add('obl-view');
    el.innerHTML = '<div class="obl-view-head"><p class="ldg-chart-cap"></p><button type="button" class="ldg-zoom">Ampliar</button></div>' +
      '<div class="ldg-chart-wrap"><div class="ldg-chart"><img alt=""><svg aria-hidden="true"></svg></div></div>' +
      '<p class="ldg-conditions">Linha magenta: caminho da leitura feito pelo app.</p>';
    const btn = el.querySelector('.ldg-zoom'), chart = el.querySelector('.ldg-chart');
    btn.addEventListener('click', () => { const z = chart.classList.toggle('is-zoom'); btn.textContent = z ? 'Reduzir' : 'Ampliar'; });
  }
  // traces: lista de polilinhas; dots: pontos
  function draw(el, ch, cap, traces, dots) {
    if (!el.querySelector('.ldg-chart')) mount(el);
    const img = el.querySelector('img'), src = BASE + ch.img.src;
    if (img.getAttribute('src') !== src) { img.src = src; img.alt = `Figura ${ch.fig} do RFM`; }
    const [bx, by, bw, bh] = ch.img.box, svg = el.querySelector('svg');
    svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
    let s = '';
    for (const t of traces || []) s += `<polyline class="trace" points="${t.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`;
    for (const d of dots || []) s += `<circle class="dot" cx="${d[0].toFixed(2)}" cy="${d[1].toFixed(2)}" r="2.2"/>`;
    svg.innerHTML = s;
    el.querySelector('.ldg-chart-cap').innerHTML = cap;
  }
  root.OFSView = { mount, draw };
})(window);
