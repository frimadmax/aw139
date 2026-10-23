# Height Loss During Flyaway (RFM Seção 4 Fig. 4-43, até 6400 kg; Supl. 50 Fig. 4-37, 6400 a 6800 kg).
# Leitura: Hp (eixo de baixo) -> linha de OAT -> curva de peso -> sobe até a curva de vento -> perda de altura (eixo ft).
import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
CHARTS=[(495,'4-43','4-65','Height Loss During Flyaway',list(range(-40,51,10)),list(range(4400,6401,400))),
        (2139,'S50-4-37','S50-63','Height Loss During Flyaway, Weights from 6400 kg to 6800 kg',list(range(-30,51,10)),[6400,6600,6800])]
def rng(c,i): return max(p[i] for p in c)-min(p[i] for p in c)
def extract(n,fig,rfm,title,oats,gws):
    p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    big=[q for q in P if 0.9<=q['w']<1.2 and len(q['pts'])>=3 and (not q['dash'] or q['dash'].startswith('[] '))]
    wind=join([q['pts'] for q in P if q['w']>=1.4 and len(q['pts'])>=3])
    from collections import Counter
    div=Counter(round(max(pt[0] for pt in q['pts']),1) for q in big).most_common(1)[0][0]
    oat=join([q['pts'] for q in big if max(pt[0] for pt in q['pts'])<=div+0.5])
    oat=[sorted(c,key=lambda pt:-pt[0]) for c in oat]; oat.sort(key=lambda c:-c[0][1])
    assert len(oat)==len(oats),len(oat)
    ytop=min(pt[1] for c in oat for pt in c)-1
    mo=[q['pts'] for q in P if q['dash'] and not q['dash'].startswith('[] ') and len(q['pts'])>=3 and max(pt[0] for pt in q['pts'])<=div+0.5 and min(pt[1] for pt in q['pts'])>=ytop-1]
    assert len(mo)==1,len(mo); mo=sorted(mo[0],key=lambda pt:-pt[0])
    gw=join([q['pts'] for q in big if min(pt[0] for pt in q['pts'])>div+1])
    gw=[sorted(c,key=lambda pt:-pt[1]) for c in gw]; gw.sort(key=lambda c:min(pt[0] for pt in c))
    assert len(gw)==len(gws),len(gw)
    wind=[sorted(c,key=lambda pt:pt[0]) for c in wind]
    yflat=max(pt[1] for c in wind for pt in c); x0=min(pt[0] for c in wind for pt in c)
    wind=[c if c[0][0]<x0+1 else [[x0,c[0][1]]]+c for c in wind]   # trecho plano comum à esquerda
    # ordem: na altura média, o de menor x tem maior perda (0 kt)
    ym=(yflat+min(pt[1] for c in wind for pt in c))/2
    wind.sort(key=lambda c:x_at_y(sorted(c,key=lambda pt:pt[1]),ym) or 1e9)
    assert len(wind)==5,len(wind)
    ybot=max(pt[1] for c in oat for pt in c)
    PA=lin([(snap(x,V,6) or x,v) for v,x,y in nums if 480<y<510 and x<div and v==int(v) and v%2000==0])   # rótulos deslocados até ~5 pt da linha
    # eixo da perda de altura em ft: rótulos à esquerda do painel de cima
    hl=[(snap(y,H,2) or y,v) for v,x,y in nums if div-25<x<div+5 and y<yflat and v%50==0 and v>0]
    HL=lin(hl)
    return dict(fig=fig,page=n,rfmPage=rfm,title=title,pa=PA,hl=HL,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(oats,oat)],maxOat=clean(mo),
        gw=[dict(v=v,pts=clean(c)) for v,c in zip(gws,gw)],
        wind=[dict(v=v,pts=clean(c)) for v,c in zip(range(0,41,10),wind)])
if __name__=='__main__':
    out={}
    for a in CHARTS:
        o=extract(*a); out[o['fig']]=o
        print(o['fig'],{k:{kk:round(vv,4) for kk,vv in o[k].items()} for k in ('pa','hl')})
        print(' oat right-end',[(c['v'],[round(v,1) for v in c['pts'][0]]) for c in o['oat']])
        print(' gw',[(c['v'],c['pts'][0],c['pts'][-1]) for c in o['gw']])
        print(' wind',[(c['v'],c['pts'][0],c['pts'][-1]) for c in o['wind']])
    json.dump(out,open('hl.json','w'))
