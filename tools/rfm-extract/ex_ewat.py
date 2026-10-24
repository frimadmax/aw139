"""W.A.T. do Enhanced Offshore (Supl. 97 Fig. 4-1, 4-3, 4-5, 4-7): carta sem painel de vento, Hp em ft x 100, peso em kg x 100, até 7000 kg.
Mesma leitura do ex_ofw.extract. Conferida contra as tabelas do próprio RFM (Fig. 4-2, 4-4, 4-6, 4-8)."""
import sys,json; sys.path.insert(0,'.')
from ex_ofw import extract
from lib import *; from geo import *
T97='Enhanced Offshore Helideck Take-Off Procedure Weight Limitations'
base=dict(oats=None,bylabel=True,hwPanel=False,paMul=100,kgMul=100,gwMax=7000,isaDev=35,vline=0,forceV=True)
CFG={
 'S97-4-1':(3579,dict(base,rfm='S97-25',title=T97)),
 'S97-4-3':(3581,dict(base,rfm='S97-27',title=T97+', EAPS OFF')),
 'S97-4-5':(3583,dict(base,rfm='S97-29',title=T97+', EAPS ON')),
 'S97-4-7':(3585,dict(base,rfm='S97-31',title=T97+', IBF Installed')),
}
if __name__=='__main__':
    sel=sys.argv[1].split(',') if len(sys.argv)>1 and sys.argv[1] else list(CFG)
    out={}
    for f in sel:
        n,c=CFG[f]; r=extract(n,f,dict(c)); out[f]=r
        # azuis: MAX OAT LIMIT tracejada [3 1], Hd limit traço-ponto [3 1 1 1] (às vezes em dois pedaços)
        T,P=disp(page(n))
        bl=[q for q in P if q['c'] and q['c'][2]>0.45 and q['c'][0]<0.35 and q['c'][1]<0.4 and q['w']>=0.8]
        mo=[q['pts'] for q in bl if q['dash'].startswith('[ 3 1 ]')]; hd=[q['pts'] for q in bl if q['dash'].startswith('[ 3 1 1 1 ]')]
        assert len(mo)==1 and hd,(f,len(mo),len(hd))
        r['maxOat']=clean(sorted(mo[0],key=lambda pt:pt[1])); r['hd']=clean(sorted(join(hd)[0],key=lambda pt:pt[1]))
        print(f,'PA',{k:round(v,4) for k,v in r['pa'].items()},'W',{k:round(v,4) for k,v in r['w'].items()})
        print('  oat',[(o['v'],len(o['pts']),[round(t) for t in o['pts'][0]],[round(t) for t in o['pts'][-1]],o.get('synthetic')) for o in r['oat']])
        print('  maxoat',r['maxOat'] and len(r['maxOat']),'hd',r['hd'] and len(r['hd']))
    json.dump(out,open(sys.argv[2] if len(sys.argv)>2 else 'ewat.json','w'))
