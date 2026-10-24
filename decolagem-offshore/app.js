const $=id=>document.getElementById(id);
// Procedimento vem do menu CAT A (?procedure=offshore|enhanced); não há seletor na tela.
const PROC=new URLSearchParams(location.search).get('procedure')==='enhanced'?'enhanced':'offshore';
$('procedure').value=PROC;
if(PROC==='enhanced'){
  const t='Decolagem Enhanced Offshore';
  document.title=document.title.replace('Decolagem Offshore',t);
  document.querySelectorAll('.product-sub,.panel-title-row h1').forEach(e=>{if(e.textContent.trim()==='Decolagem Offshore')e.textContent=t;});
  $('runBtn').textContent='Calcular '+t;
}
_loadConfinedDataFrom('../wat/data/');
// W.A.T. e Drop Down pelas cartas vetoriais do RFM (shared/offshore): Offshore pelo Supl. 50/12 (OFSEngine), Enhanced pelo Supl. 97 (EWEngine).
const VEC=true,ENH=PROC==='enhanced';
if(ENH)$('ewReview').hidden=false;
if(VEC){['watView','ddView'].forEach(id=>OFSView.mount($(id)));$('watCanvas').style.display='none';$('watView').style.display='';}
const KG_TO_LB=2.2046226218;
function isLbUnit(){return $('weightUnit')?.value==='lb';}
function parseWeightKg(){const r=Number($('weight').value||0);return isLbUnit()?r/KG_TO_LB:r;}
function fmtWt(kg){return isLbUnit()?`${Math.round(kg*KG_TO_LB)} lb`:`${kg} kg`;}
function updateWeightUi(){const lb=isLbUnit();const lbl=$('weightLabel');if(lbl)lbl.textContent=`Weight (${lb?'lb':'kg'})`;$('weight').placeholder=lb?'14330':'6500';}
const state={};
function calcPA(qnh,elev){const q=(qnh>=800&&qnh<=1100)?qnh:1013.25;return Math.round(elev+(1013.25-q)*30);}
function mapCfg(cfg){return cfg==='eaps_off'?'eapsOff':cfg==='eaps_on'?'eapsOn':'standard';}
function activeTab(){return document.querySelector('.viewer-tab.active')?.dataset.tab;}
function showTab(tab){
  $('watCanvas').style.display=!VEC&&tab==='wat'?'':'none';
  $('ddCanvas').style.display=!VEC&&tab==='dropdown'?'':'none';
  $('watView').style.display=VEC&&tab==='wat'?'':'none';
  $('ddView').style.display=VEC&&tab==='dropdown'?'':'none';
  $('vizTitle').textContent=(tab==='wat'?'WAT ':'Dropdown ')+(ENH?'Enhanced':'Offshore');
  if(tab==='dropdown')requestAnimationFrame(()=>requestAnimationFrame(drawDD));
  else if(tab==='wat')requestAnimationFrame(()=>requestAnimationFrame(drawWAT));
}
const fmtHp=v=>Math.round(v).toLocaleString('pt-BR');
function drawVecWAT(){
  if(ENH)return drawEnhWAT();
  const s=state.last,cfg=(s&&s.cfg)||$('config').value,fig=OFSEngine.WAT[cfg]||OFSEngine.WAT.standard,ch=OFW_CHARTS[fig];
  const r=s&&!s.error&&s.vw&&s.vw.ok?s.vw:null;
  OFSView.draw($('watView'),ch,`<b>Fig. ${fig}</b> ${ch.title} · Supl. 50, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?` · leitura: <b>${fmtHp(r.kg)} kg</b>`:s&&s.error?` · ${s.error}`:''),r?[r.trace]:[]);
}
function drawEnhWAT(){
  const s=state.last,cfg=(s&&s.cfg)||$('config').value,fig=EWEngine.WAT[cfg]||EWEngine.WAT.standard,ch=EW_CHARTS[fig];
  const r=s&&!s.error&&s.vw&&s.vw.ok?s.vw:null;
  OFSView.draw($('watView'),ch,`<b>Fig. ${EWEngine.figName(fig)}</b> ${ch.title} · Supl. 97, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?` · leitura: <b>${fmtHp(r.kg)} kg</b>`:s&&s.error?` · ${s.error}`:''),r?[r.trace]:[]);
}
function drawEnhDD(){
  const s=state.last,r=s&&s.vd?s.vd:null,ch=EDD_CHARTS[EWEngine.DD];
  OFSView.draw($('ddView'),ch,`<b>Fig. 4-10</b> ${ch.title} · Supl. 97, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?(r.ok?` · leitura na carta: <b>${r.final} ft</b>`:` · ${r.msg}`):''),r&&r.ok?r.traces:[],r&&r.ok?r.dots:[]);
}
function drawVecDD(){
  if(ENH)return drawEnhDD();
  const s=state.last,r=s&&s.vd?s.vd:null,fig=r?r.fig:OFSEngine.ddFig(s&&s.w||6000,'takeoff'),ch=OFD_CHARTS[fig];
  const sup=fig==='4-74'?'Supl. 50':'Supl. 12';
  OFSView.draw($('ddView'),ch,`<b>Fig. ${fig}</b> ${ch.title} · ${sup}, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?(r.ok?` · leitura na carta: <b>${Math.ceil(r.base)} ft</b>`:` · ${r.msg}`):''),r&&r.ok?[r.trace]:[]);
}
function drawDD(){if(VEC)return drawVecDD();drawDDV7Canvas($('ddCanvas'),state.last?.ddResult,'../dropdown/assets/');}
function drawWAT(){if(VEC)return drawVecWAT();drawWATCanvas($('watCanvas'),state.last?.watResult,'../wat/',false);}
function calc(){
  const qnh=Number($('qnh').value),elev=Number($('elevation').value||0),pa=calcPA(qnh,elev);
  const oat=Number($('oat').value||0),wRaw=Number($('weight').value||0),w=isLbUnit()?wRaw/KG_TO_LB:wRaw,hw=Number($('wind').value||0);
  const ac=Number($('aircraft').value||7000),proc=$('procedure').value,cfg=$('config').value;
  let wat;
  if(VEC){
    const vw=ENH?EWEngine.wat(cfg,pa,oat):OFSEngine.wat(cfg,pa,oat,hw);
    if(!vw.ok){state.last={error:vw.msg,proc,cfg,qnh,elev,pa,oat,w,wRaw,hw,ac,vw,vd:null};render();saveInputs();return;}
    const vd=ENH?EWEngine.dd(w,pa,oat,hw):OFSEngine.dd(w,pa,oat,hw,{phase:'takeoff'});
    const maxWeight=vw.kg,margin=Math.round(maxWeight-w),ok=margin>=0;
    const dropdown=vd.ok?Math.ceil(vd.final):null;
    state.last={qnh,elev,pa,oat,w,wRaw,hw,ac,proc,cfg,wat:maxWeight,vw,vd,dropdown,margin,ok};
    render();saveInputs();return;
  }
  if(proc==='enhanced'){
    if(cfg==='eaps_off')wat=calculateEnhancedEapsOff(pa,oat,w);
    else if(cfg==='eaps_on')wat=calculateEnhancedEapsOn(pa,oat,w);
    else if(cfg==='ibf')wat=calculateEnhancedIbf(pa,oat,w);
    else wat=calculateEnhancedStandard(pa,oat,w);
  }else if(proc==='confined'){
    if(cfg==='eaps_off')wat=calculateExactConfinedEapsOff(pa,oat,w);
    else if(cfg==='eaps_on')wat=calculateExactConfinedEapsOn(pa,oat,w);
    else if(cfg==='ibf')wat=calculateExactConfinedIbf(pa,oat,w);
    else wat=calculateExactConfinedStandard(pa,oat,w);
  }else{
    if(cfg==='eaps_off')wat=calculateExactEapsOff(pa,oat,w,hw);
    else if(cfg==='eaps_on')wat=calculateExactEapsOn(pa,oat,w,hw);
    else if(cfg==='ibf')wat=calculateExactIbfInstalled(pa,oat,w,hw);
    else wat=calculateExactOffshoreStandard(pa,oat,w,hw);
  }
  if(wat.error){state.last={error:wat.error,proc,cfg,qnh,elev,pa,oat,w,hw,ac,watResult:null,ddResult:null};render();return;}
  let ddResult=null;
  try{
    if(proc!=='confined')ddResult=proc==='enhanced'?calculateEnhancedDropdown(pa,oat,w,hw):calculateOffshoreDropdown(pa,oat,w,hw,'offshore',mapCfg(cfg));
  }catch(e){}
  const maxWeight=wat.maxWeight,margin=Math.round(maxWeight-w),ok=margin>=0;
  const dropdown=ddResult?Math.round(ddResult.finalFt):null;
  state.last={qnh,elev,pa,oat,w,wRaw,hw,ac,proc,cfg,wat:maxWeight,watResult:wat,dropdown,margin,ok,ddResult};
  render();
  localStorage.setItem('aw139_offshore_takeoff_v1',JSON.stringify({qnh,elev,pa,oat,w,wRaw,weightUnit:isLbUnit()?'lb':'kg',hw,ac,proc,cfg,wat:maxWeight,dropdown,margin,ok}));
  localStorage.setItem('aw139_companion_shared_context_v1',JSON.stringify({lastModule:'decolagem-offshore',updatedAt:new Date().toISOString(),weightKg:w,oatC:oat,pressureAltitudeFt:pa,headwindKt:hw,cataAircraftSet:String(ac),cataConfiguration:cfg}));
}
function saveInputs(){const s=state.last;try{localStorage.setItem('aw139_offshore_takeoff_v1',JSON.stringify({qnh:s.qnh,elev:s.elev,pa:s.pa,oat:s.oat,w:s.w,wRaw:s.wRaw,weightUnit:isLbUnit()?'lb':'kg',hw:s.hw,ac:s.ac,proc:s.proc,cfg:s.cfg,vec:true}));}catch(e){}}
function render(){
  if(!state.last)return;const s=state.last;
  document.querySelector('.result-panel')?.classList.remove('pending');
  const chip=$('statusChip');
  if(s.error){chip.textContent='Erro';chip.className='status-chip bad';$('maxWeight').textContent='—';$('dropdownRes').textContent='—';$('watSummary').textContent=s.error;$('ddSummary').textContent='—';$('margin').textContent='—';$('watBox').className='result-box';$('ddBox').className='result-box';return;}
  const ddOk=s.dropdown!=null?(s.elev-s.dropdown)>=15:null;
  $('watBox').classList.toggle('ok',s.ok);$('watBox').classList.toggle('bad',!s.ok);
  $('ddBox').classList.toggle('ok',ddOk===true);$('ddBox').classList.toggle('bad',ddOk===false);
  $('maxWeight').textContent=fmtWt(s.wat);
  $('dropdownRes').textContent=s.dropdown!=null?`${s.dropdown} ft`:'—';
  $('watSummary').textContent=`${s.proc==='confined'?'Confined Area':s.proc==='enhanced'?'Enhanced':'Offshore'} · ${s.cfg} · PA ${s.pa} ft`;
  $('ddSummary').textContent=ddOk!=null?`Clearance ${s.elev-s.dropdown} ft ASL`:'Dropdown Offshore Takeoff';
  if(VEC){
    const d=s.vd;
    $('watSummary').textContent=ENH?`Fig. ${s.vw.name} · Supl. 97 · PA ${s.pa} ft`:`Fig. ${s.vw.fig} · Supl. 50 · PA ${s.pa} ft${s.vw.hw?` · vento ${s.vw.hw} kt`:''}`;
    if(d&&d.ok&&ENH){const parts=[`Fig. 4-10: ${d.final} ft${d.hw?` com ${d.hw.toFixed(0)} kt de proa`:''}`,...d.notes];$('ddSummary').textContent=`${ddOk!=null?`Clearance ${s.elev-s.dropdown} ft ASL · `:''}${parts.join(' · ')}`;}
    else if(d&&d.ok){const parts=[`Fig. ${d.fig}: ${Math.ceil(d.base)} ft`];if(d.wind)parts.push(`vento ${d.wind} ft`);$('ddSummary').textContent=`${ddOk!=null?`Clearance ${s.elev-s.dropdown} ft ASL · `:''}${parts.join(' · ')}`;}
    else if(d)$('ddSummary').textContent=d.msg;
  }
  $('margin').textContent=`Margin: ${fmtWt(s.margin)}`;
  chip.textContent=s.ok?'Viável':'Não viável';chip.className=`status-chip ${s.ok?'ok':'bad'}`;
  const tab=activeTab();
  if(tab==='dropdown')drawDD();
  else if(tab==='wat')drawWAT();
}
function restore(){
  try{
    const s=JSON.parse(localStorage.getItem('aw139_offshore_takeoff_v1')||'null');
    if(!s){requestAnimationFrame(()=>drawWAT());return;}
    if(s.qnh!=null)$('qnh').value=s.qnh;if(s.elev!=null)$('elevation').value=s.elev;$('oat').value=s.oat;if($('weightUnit')&&s.weightUnit)$('weightUnit').value=s.weightUnit;$('weight').value=s.wRaw!=null?s.wRaw:s.w;$('wind').value=s.hw;$('aircraft').value=String(s.ac);$('config').value=s.cfg;updateWeightUi();
    if(s.proc!==PROC){requestAnimationFrame(()=>drawWAT());return;}
    if(VEC){if(s.vec)calc();else requestAnimationFrame(()=>drawWAT());return;}
    state.last=s;
    requestAnimationFrame(()=>render());
  }catch{}
}
function openFS(){
  if(VEC)return;
  const tab=activeTab();
  $('fsOverlay').hidden=false;document.body.classList.add('fullscreen-body');
  $('fsOverlay').scrollTop=0;
  requestAnimationFrame(()=>{
    const fc=$('fsCanvas');
    if(tab==='dropdown')drawDDV7Canvas(fc,state.last?.ddResult,'../dropdown/assets/');
    else drawWATCanvas(fc,state.last?.watResult,'../wat/',false);
  });
}
function closeFS(){$('fsOverlay').hidden=true;document.body.classList.remove('fullscreen-body');}
function exportPDF(){
  if(VEC||!state.last?.watResult||state.last.watResult.error){window.print();return;}
  createWATExportCanvas(state.last.watResult,'../wat/',(ec)=>{
    ec.toBlob(blob=>{
      const url=URL.createObjectURL(blob);
      const win=window.open('','_blank');
      if(!win){window.print();return;}
      win.document.write('<!DOCTYPE html><html><head><title>WAT Export</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}img{display:block;width:100%;height:auto}@media print{@page{margin:6mm}}</style></head><body><img src="'+url+'" onload="window.print()"></body></html>');
      win.document.close();
    },'image/png');
  });
}
document.querySelectorAll('.viewer-tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.viewer-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  showTab(b.dataset.tab);
}));
$('watCanvas').addEventListener('click',openFS);$('ddCanvas').addEventListener('click',openFS);
$('fsClose').addEventListener('click',closeFS);document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeFS();});
$('runBtn').onclick=calc;$('resetBtn').onclick=()=>location.reload();$('pdfBtn').onclick=exportPDF;
$('weightUnit')?.addEventListener('change',updateWeightUi);
const _fields=['weight','qnh','elevation','oat','wind'];
_fields.forEach((id,i)=>{$(id).addEventListener('keydown',(e)=>{if(e.key!=='Enter')return;e.preventDefault();if(i<_fields.length-1)$(_fields[i+1]).focus();else calc();});});
restore();
