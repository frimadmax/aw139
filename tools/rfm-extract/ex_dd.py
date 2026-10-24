"""Drop Down offshore (Supl. 12 Fig. 4E-7 CTO e 4I-1 Balked; Supl. 50 Fig. 4-74; Supl. 97 Fig. 4-10 Enhanced).
Painel esquerdo: Hp (ft, eixo de baixo) -> sobe até a linha de OAT -> direita até a linha de peso -> desce até o drop down (ft).
As linhas de peso são levemente curvas (polilinhas do PDF); saída: oat/gw [{v,pts}], eixos pa e dd (coord -> valor), molduras L e R."""
import sys,json; sys.path.insert(0,'.')
from lib import *; from geo import *
def num(t):
    try: return float(t)
    except: return None
def lin(pairs):
    m,c,r=fit(pairs); return dict(a=m,b=c,resid=r,n=len(pairs))
def extract(n,fig,cfg):
    p=page(n); T,P=disp(p)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    blk=[q for q in P if q['c'] and max(q['c'])<0.3 and len(q['pts'])>=2]
    def ext(q): xs=[a for a,b in q['pts']]; ys=[b for a,b in q['pts']]; return min(xs),min(ys),max(xs),max(ys)
    diag=[q for q in blk if (lambda e:(e[2]-e[0])>15 and (e[3]-e[1])>15)(ext(q))]
    # moldura: os eixos de baixo (rótulos de Hp em ft e de drop down em ft) ficam na linha mais baixa de números
    yb=max(y for v,x,y in nums if v in (0,1000,2000) and y<560)
    bot=sorted([(v,x) for v,x,y in nums if abs(y-yb)<3],key=lambda t:t[1])
    i0=[i for i,(v,x) in enumerate(bot) if v==5000][0]
    paL=bot[:i0+1]; ddL=bot[i0+1:]
    if ddL and ddL[0][0]==5000: ddL=ddL[1:]
    PA=lin([(x,v) for v,x in paL if 0<=v<=4000])   # -1000 e 5000 ficam deslocados (sinal/colados no 0 do drop down)
    # "50000": rótulo 5000 do Hp colado no 0 do drop down
    DD=lin([(x,v) for v,x in ddL] if len(ddL)>=3 else [(x,v) for v,x in ddL])
    xsplit=(paL[-1][1]+ (ddL[0][1] if ddL else paL[-1][1]+10))/2
    L=[q for q in diag if ext(q)[2]<=xsplit+1]; R=[q for q in diag if ext(q)[0]>=xsplit-1]
    def label(lines,cands):
        out=[]
        for q in lines:
            pts=sorted(q['pts'],key=lambda pt:pt[0])
            best=min(cands,key=lambda c:pl_dist(c[1],c[2],pts))
            out.append(dict(v=best[0],d=round(pl_dist(best[1],best[2],pts),2),pts=[[round(a,3),round(b,3)] for a,b in clean(pts)]))
        return out
    labsL=[(v,x,y) for v,x,y in nums if x<xsplit and y<yb-5 and v==int(v) and -40<=v<=50 and y>cfg.get('ytop',200)]
    labsR=[(v,x,y) for v,x,y in nums if x>xsplit and y<yb-5 and 4000<=v<=7200]
    oat=sorted([c for c in label([q for q in L if q['w']>=cfg.get('wo',0.9)],labsL) if c['d']<15],key=lambda c:c['v'])
    gw=sorted([c for c in label(R,labsR) if c['d']<15],key=lambda c:c['v'])
    blue=[q for q in P if q['c'] and q['c'][2]>0.5 and q['c'][0]<0.45 and q['w']>=0.8 and ext(q)[2]<=xsplit]
    lim=sorted([pt for q in blue for pt in q['pts']],key=lambda pt:pt[0])
    ys=[b for q in diag for a,b in q['pts']]
    return dict(fig=fig,page=n,rfmPage=cfg['rfm'],title=cfg['title'],pa=PA,dd=DD,yTop=min(ys),yBot=yb-7,xSplit=xsplit,
                oat=oat,gw=gw,isaLim=[[round(a,3),round(b,3)] for a,b in (lim[0],lim[-1])] if lim else None)
CFG={
 '4E-7':(1123,dict(rfm='S12-E31',title='Offshore Helideck Procedure Drop Down Height BTS for CTO OEI')),
 '4I-1':(1295,dict(rfm='S12-I37',title='Offshore Helideck Balked Landing Drop Down Below LDP (BLDP)')),
 '4-74':(2209,dict(rfm='S50-119',title='Offshore Helideck Procedure Drop Down for CTO (BTS) and Balked Landing (BLDP)')),
}
if __name__=='__main__':
    sel=sys.argv[1].split(',') if len(sys.argv)>1 else list(CFG)
    out={}
    for f in sel:
        n,c=CFG[f]; r=extract(n,f,c); out[f]=r
        print(f,'PA',{k:round(v,4) for k,v in r['pa'].items()},'DD',{k:round(v,4) for k,v in r['dd'].items()})
        print('  oat',[(o['v'],o['d']) for o in r['oat']]); print('  gw',[(o['v'],o['d']) for o in r['gw']],'isa',r['isaLim'])
    json.dump(out,open(sys.argv[2] if len(sys.argv)>2 else 'dd.json','w'))
