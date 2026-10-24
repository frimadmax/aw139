const $=id=>document.getElementById(id);
const KG_TO_LB=2.2046226218;
function isLbUnit(){return $('weightUnit')?.value==='lb';}
function parseWeightKg(){const r=Number($('weight').value||0);return isLbUnit()?r/KG_TO_LB:r;}
function fmtWt(kg){return isLbUnit()?`${Math.round(kg*KG_TO_LB)} lb`:`${kg} kg`;}
function updateWeightUi(){const lb=isLbUnit();const lbl=$('weightLabel');if(lbl)lbl.textContent=`Weight (${lb?'lb':'kg'})`;$('weight').placeholder=lb?'14330':'6500';}
const state={};
function calcPA(qnh,elev){const q=(qnh>=800&&qnh<=1100)?qnh:1013.25;return Math.round(elev+(1013.25-q)*30);}
function activeTab(){return document.querySelector('.viewer-tab.active')?.dataset.tab;}
// W.A.T. e Drop Down: cartas vetoriais do RFM (shared/offshore/ofs-engine.js).
['watView','ddView'].forEach(id=>OFSView.mount($(id)));
function showTab(tab){
  $('watView').style.display=tab==='wat'?'':'none';
  $('ddView').style.display=tab==='dropdown'?'':'none';
  $('oblView').style.display=tab==='balked'?'':'none';
  $('vizTitle').textContent=tab==='wat'?'WAT Offshore Procedure':tab==='dropdown'?'Dropdown Offshore Landing':'Balked Landing Distance OEI';
  if(tab==='balked')drawOBL();
  if(tab==='dropdown')requestAnimationFrame(()=>requestAnimationFrame(drawDD));
  else if(tab==='wat')requestAnimationFrame(()=>requestAnimationFrame(drawWAT));
}
function drawDD(){
  const s=state.last,r=s&&s.vd?s.vd:null,fig=r?r.fig:OFSEngine.ddFig(s&&s.w||6000,'landing'),ch=OFD_CHARTS[fig];
  const sup=fig==='4-74'?'Supl. 50':'Supl. 12';
  OFSView.draw($('ddView'),ch,`<b>Fig. ${fig}</b> ${ch.title} · ${sup}, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?(r.ok?` · leitura na carta: <b>${Math.ceil(r.base)} ft</b>`:` · ${r.msg}`):''),r&&r.ok?[r.trace]:[]);
}
// Balked Landing Distance OEI: cartas vetoriais do RFM (obl-data.js / obl-engine.js)
const fmtM=n=>Math.round(n).toLocaleString('pt-BR');
function calcOBL(s){return window.OBLEngine.compute(s.w,s.pa,s.oat,s.hw,s.cfg);}
function drawOBL(){
  const s=state.last,r=s&&!s.error?s.obl||calcOBL(s):null;
  const E=window.OBLEngine,set=r&&r.set?r.set:E.SETS[0],cfg=s&&s.cfg?s.cfg:'standard',key=r&&r.fig?r.fig:set.figs[cfg]||set.figs.standard,ch=window.OBL_CHARTS[key];
  const img=$('oblImg');if(img.getAttribute('src')!==ch.img.src){img.src=ch.img.src;img.alt=`Figura ${ch.fig} do RFM`;}
  const [bx,by,bw,bh]=ch.img.box,svg=$('oblSvg');svg.setAttribute('viewBox',`${bx} ${by} ${bw} ${bh}`);
  let h='';
  if(r&&r.ok){h+=`<polyline class="trace" points="${r.trace.map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' ')}"/>`;h+=`<circle class="dot" cx="${r.trace[2][0]}" cy="${r.trace[2][1]}" r="2.2"/>`;}
  svg.innerHTML=h;
  $('oblCap').innerHTML=`<b>Fig. ${ch.fig}</b> Offshore Helideck Balked Landing Distance · ${set.supl}, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?(r.ok?` · leitura na carta: <b>${fmtM(r.dist0)} m</b>`:` · ${r.msg}`):'');
}
function renderOBL(s){
  const box=$('oblBox'),note=$('oblNotice');box.classList.remove('ok','bad');note.hidden=true;
  if(!s||s.error){$('oblRes').textContent='—';$('oblSub').textContent=s&&s.error?'—':'Sem cálculo ainda.';return;}
  const r=s.obl||calcOBL(s);
  if(!r.ok){$('oblRes').textContent='—';$('oblSub').textContent=r.fig?`Fig. ${r.fig}`:'Fora das cartas';note.hidden=false;note.textContent=r.msg;return;}
  $('oblRes').textContent=`${fmtM(r.dist)} m`;
  const w=r.corr?` · vento ${s.hw} kt: ${r.corr} m (carta ${fmtM(r.dist0)} m)`:'';
  $('oblSub').textContent=`Fig. ${r.fig} · ${r.set.supl}${w}`;
  const msgs=r.notes.slice();
  if(s.hw<0)msgs.push('Vento de cauda: a carta não traz correção para vento de cauda; nenhum crédito aplicado.');
  if(s.hw>40)msgs.push('Vento acima de 40 kt: crédito limitado ao da tabela (40 kt, -120 m).');
  if(msgs.length){note.hidden=false;note.innerHTML=msgs.map(m=>`<div>${m}</div>`).join('');}
}
function drawWAT(){
  const s=state.last,cfg=(s&&s.cfg)||$('config').value,fig=OFSEngine.WAT[cfg]||OFSEngine.WAT.standard,ch=OFW_CHARTS[fig];
  const r=s&&!s.error&&s.vw&&s.vw.ok?s.vw:null;
  OFSView.draw($('watView'),ch,`<b>Fig. ${fig}</b> ${ch.title} · Supl. 50, RFM ${ch.rfmPage} (pág. ${ch.page} do PDF)`+(r?` · leitura: <b>${fmtM(r.kg)} kg</b>`:s&&s.error?` · ${s.error}`:''),r?[r.trace]:[]);
}
function calc(){
  const qnh=Number($('qnh').value),elev=Number($('elevation').value||0),pa=calcPA(qnh,elev);
  const oat=Number($('oat').value||0),wRaw=Number($('weight').value||0),w=isLbUnit()?wRaw/KG_TO_LB:wRaw,hw=Number($('wind').value||0);
  const profile=$('profile').value,cfg=$('config').value;
  const vw=OFSEngine.wat(cfg,pa,oat,hw);
  const save=()=>localStorage.setItem('aw139_offshore_landing_v1',JSON.stringify({qnh,elev,pa,oat,w,wRaw,weightUnit:isLbUnit()?'lb':'kg',hw,profile,cfg,vec:true}));
  if(!vw.ok){state.last={error:vw.msg,profile,cfg,qnh,elev,pa,oat,w,wRaw,hw,vw,vd:null};render();save();return;}
  const vd=OFSEngine.dd(w,pa,oat,hw,{phase:'landing',descending:profile==='descending'});
  const maxWeight=vw.kg,margin=Math.round(maxWeight-w),ok=margin>=0;
  const dropdown=vd.ok?Math.ceil(vd.final):null;
  state.last={qnh,elev,pa,oat,w,wRaw,hw,profile,cfg,wat:maxWeight,vw,vd,dropdown,margin,ok};
  state.last.obl=calcOBL(state.last);
  render();save();
  localStorage.setItem('aw139_companion_shared_context_v1',JSON.stringify({lastModule:'pouso-offshore',updatedAt:new Date().toISOString(),weightKg:w,oatC:oat,pressureAltitudeFt:pa,headwindKt:hw,cataConfiguration:cfg}));
}
function render(){
  if(!state.last)return;const s=state.last;
  document.querySelector('.result-panel')?.classList.remove('pending');
  const chip=$('statusChip');
  renderOBL(s);
  if(s.error){chip.textContent='Erro';chip.className='status-chip bad';$('maxWeight').textContent='—';$('dropdownRes').textContent='—';$('watSummary').textContent=s.error;$('ddSummary').textContent='—';$('margin').textContent='—';$('watBox').className='result-box';$('ddBox').className='result-box';return;}
  const ddOk=s.dropdown!=null?(s.elev-s.dropdown)>=15:null;
  $('watBox').classList.toggle('ok',s.ok);$('watBox').classList.toggle('bad',!s.ok);
  $('ddBox').classList.toggle('ok',ddOk===true);$('ddBox').classList.toggle('bad',ddOk===false);
  $('maxWeight').textContent=fmtWt(s.wat);
  $('dropdownRes').textContent=s.dropdown!=null?`${s.dropdown} ft`:'—';
  const d=s.vd;
  $('watSummary').textContent=`Perfil ${s.profile==='level'?'Level':'Descending'} · Fig. ${s.vw.fig} · PA ${s.pa} ft${s.vw.hw?` · vento ${s.vw.hw} kt`:''}`;
  if(d&&d.ok){const parts=[`Fig. ${d.fig}: ${Math.ceil(d.base)} ft`];if(d.wind)parts.push(`vento ${d.wind} ft`);if(d.desc)parts.push(`descending +${d.desc} ft`);$('ddSummary').textContent=`${ddOk!=null?`Clearance ${s.elev-s.dropdown} ft ASL · `:''}${parts.join(' · ')}`;}
  else $('ddSummary').textContent=d?d.msg:'Dropdown Offshore Landing';
  $('margin').textContent=`Margin: ${fmtWt(s.margin)}`;
  chip.textContent=s.ok?'Viável':'Não viável';chip.className=`status-chip ${s.ok?'ok':'bad'}`;
  const tab=activeTab();
  if(tab==='dropdown')drawDD();
  else if(tab==='wat')drawWAT();
  else if(tab==='balked')drawOBL();
}
function restore(){
  try{
    const s=JSON.parse(localStorage.getItem('aw139_offshore_landing_v1')||'null');
    if(!s){requestAnimationFrame(()=>drawWAT());return;}
    if(s.qnh!=null)$('qnh').value=s.qnh;if(s.elev!=null)$('elevation').value=s.elev;$('oat').value=s.oat;if($('weightUnit')&&s.weightUnit)$('weightUnit').value=s.weightUnit;$('weight').value=s.wRaw!=null?s.wRaw:s.w;$('wind').value=s.hw;$('profile').value=s.profile;$('config').value=s.cfg;updateWeightUi();
    if(s.vec)calc();else requestAnimationFrame(()=>drawWAT());
  }catch{}
}
document.querySelectorAll('.viewer-tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.viewer-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  showTab(b.dataset.tab);
}));
$('oblZoom').addEventListener('click',()=>{const z=$('oblChart').classList.toggle('is-zoom');$('oblZoom').textContent=z?'Reduzir':'Ampliar';});
$('runBtn').onclick=calc;$('resetBtn').onclick=()=>location.reload();$('pdfBtn').onclick=()=>window.print();
$('weightUnit')?.addEventListener('change',updateWeightUi);
const _fields=['weight','qnh','elevation','oat','wind'];
_fields.forEach((id,i)=>{$(id).addEventListener('keydown',(e)=>{if(e.key!=='Enter')return;e.preventDefault();if(i<_fields.length-1)$(_fields[i+1]).focus();else calc();});});
restore();
