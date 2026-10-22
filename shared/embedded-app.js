// Carregador dos apps do pacote MENU-AW139 (CAT B, Power Check, NDL, ROC,
// Consumo, Teto do Pairado, Limitações). Cada app roda isolado num Shadow DOM,
// com "document" redirecionado para o shadow root, igual ao menu original.
window.AW = window.AW || (function(){
  var lang = 'pt';
  try { var sv = localStorage.getItem('aw139_lang'); if (sv === 'en' || sv === 'pt') lang = sv; } catch(e){}
  return {
    get lang(){ return lang; },
    set lang(v){ lang = v; try { localStorage.setItem('aw139_lang', v); } catch(e){} },
    KG_LB: 2.20462262
  };
})();

window.loadEmbeddedApp = function(container, app){
  const root = container.shadowRoot || container.attachShadow({ mode: 'open' });
  root.innerHTML = '';
  const styleEl = document.createElement('style');
  styleEl.textContent = app.style;
  root.appendChild(styleEl);
  const bodyWrap = document.createElement('div');
  bodyWrap.innerHTML = app.body;
  root.appendChild(bodyWrap);

  const realDocument = document;
  const shimDoc = new Proxy(root, {
    get(target, prop){
      if (prop in target){
        const v = target[prop];
        return typeof v === 'function' ? v.bind(target) : v;
      }
      const v = realDocument[prop];
      return typeof v === 'function' ? v.bind(realDocument) : v;
    }
  });

  for (const code of app.scripts){
    try {
      const fn = new Function('document', 'window', code);
      fn(shimDoc, window);
    } catch (err){
      const errBox = document.createElement('div');
      errBox.style.cssText = 'background:#b23a34;color:#fff;padding:12px;font-family:monospace;font-size:12px;white-space:pre-wrap;';
      errBox.textContent = 'Erro ao executar script do app: ' + (err && err.message ? err.message : err);
      root.appendChild(errBox);
    }
  }
};
