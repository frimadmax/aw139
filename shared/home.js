const installGuideBtn=document.getElementById('installGuideBtn');
const installStatusText=document.getElementById('installStatusText');

installGuideBtn?.addEventListener('click',()=>{
  if (typeof window.showAw139InstallGuide === 'function') window.showAw139InstallGuide();
});
window.addEventListener('aw139-pwa-state',(event)=>{
  const detail=event.detail||{};
  if (!installStatusText) return;
  if (detail.installed){
    installStatusText.textContent='O app já está instalado neste aparelho. Abra pela tela inicial para a melhor experiência.';
    if (installGuideBtn){installGuideBtn.textContent='App instalado';installGuideBtn.disabled=true;installGuideBtn.style.opacity='.7';}
    return;
  }
  if (detail.platform==='ios') installStatusText.textContent='Instale pela Safari em Compartilhar → Adicionar à Tela de Início para usar como app no iPhone e no iPad.';
  else if (detail.platform==='android') installStatusText.textContent='Use a opção Instalar app do navegador para abrir em tela cheia e fixar na tela inicial.';
  else installStatusText.textContent='Instale o app pelo navegador para abrir em tela cheia e acessar as ferramentas mais rápido.';
});
