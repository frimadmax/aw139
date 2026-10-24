/* Tela inicial: barra de progresso do download para uso offline (dados vindos do sw.js). */
(function () {
  'use strict';
  const card = document.getElementById('offCard');
  if (!card || !('serviceWorker' in navigator) || !('caches' in window)) return;
  const $ = id => document.getElementById(id);
  const badge = $('offBadge');
  const title = $('offTitle'), sub = $('offSub'), pct = $('offPct'), fill = $('offFill'), retry = $('offRetry');
  let last = null, asked = 0, timer = null, newest = '';

  function render(s) {
    last = s;
    card.hidden = false;
    const p = s.total ? Math.floor(100 * s.done / s.total) : 0;
    const online = navigator.onLine;
    card.dataset.state = s.state;
    fill.style.width = (s.state === 'ready' ? 100 : p) + '%';
    pct.textContent = (s.state === 'ready' ? 100 : p) + '%';
    retry.hidden = true;
    if (badge) badge.hidden = s.state !== 'ready';
    if (s.state === 'ready') {
      title.textContent = 'Ready for offline use';
      sub.textContent = online ? `All ${s.total} files saved on this device` : `No internet · using the saved version (${s.total} files)`;
    } else if (s.state === 'downloading') {
      title.textContent = 'Downloading for offline use';
      sub.textContent = `${s.done} of ${s.total} files · keep this screen open`;
    } else if (s.state === 'partial') {
      title.textContent = 'Offline download incomplete';
      sub.textContent = `${s.failed} of ${s.total} files missing` + (online ? '' : ' · connect to the internet to finish');
      retry.hidden = !online;
    } else {
      title.textContent = 'Preparing offline download';
      sub.textContent = online ? 'Starting…' : 'Connect to the internet once to save the app';
    }
  }

  async function ask() {
    const reg = await navigator.serviceWorker.getRegistration();
    const w = reg && (reg.installing || reg.waiting || reg.active);
    if (w) w.postMessage({ type: 'OFFLINE_STATUS' });
    else if (!last) render({ state: 'idle', done: 0, total: 0 });
  }
  // Pergunta até ter resposta final; o service worker manda o progresso sozinho enquanto baixa.
  function poll() {
    clearTimeout(timer);
    if (last && last.state === 'ready') return;
    ask().catch(() => {});
    asked++;
    timer = setTimeout(poll, asked < 10 ? 800 : 3000);
  }
  navigator.serviceWorker.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.type !== 'offline-status') return;
    // Mensagens de uma versão antiga (ainda ativa) não substituem o progresso da nova.
    if (newest && d.version < newest) return;
    newest = d.version;
    render(d);
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { asked = 0; poll(); });
  retry.addEventListener('click', async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const w = reg && (reg.active || reg.waiting || reg.installing);
    if (w) { w.postMessage({ type: 'OFFLINE_FILL' }); render(Object.assign({}, last, { state: 'downloading' })); }
  });
  window.addEventListener('online', () => { asked = 0; poll(); if (last) render(last); });
  window.addEventListener('offline', () => { if (last) render(last); });
  poll();
})();
