# Pouso Clear Area OEI (Supl. 12 Parte J; Supl. 50; Supl. 90): Landing Distance (LDP->toque), Braking (toque->parada)
# e Balked Landing. Todas: Hp (embaixo, painel esquerdo) -> linha de OAT -> direita até a curva de peso -> desce até a distância.
import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
from collections import Counter
CH=[  # fig, página (1-based), pág RFM, tipo, valores de OAT (baixo->cima), pesos (esq->dir)
 ('4J-2/1',1321,'S12-J17','land',list(range(-40,51,10)),[4400,4800,5200,5600,6000,6400]),
 ('4J-2/2',1323,'S12-J19','brake',list(range(-40,41,10)),list(range(4400,6401,200))),  # 1ª curva sem rótulo = 4400 (espaçamento igual)
 ('4J-1',1319,'S12-J15','balked',list(range(-40,51,10)),[4400,4800,5200,5600,6000,6400]),
 ('4-60',2181,'S50-97','land',list(range(-30,51,10)),[6400,6800]),
 ('4-61',2183,'S50-99','brake',list(range(-30,51,10)),[6400,6600,6800]),
 ('4-62',2185,'S50-101','balked',list(range(-30,51,10)),[6400,6800]),
 ('4-100',3421,'S90-139','land',list(range(-40,51,10)),[6800,7000]),
 ('4-101',3423,'S90-141','brake',list(range(-40,51,10)),[6800,7000]),
 ('4-102',3425,'S90-143','balked',list(range(-40,51,10)),[6800,7000]),
]
def ext(q): xs=[p[0] for p in q['pts']]; ys=[p[1] for p in q['pts']]; return min(xs),max(xs),min(ys),max(ys)
def extract(fig,n,rfm,kind,oats,gws,dbg=False):
    p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    thick=[q for q in P if q['w']>=0.9 and len(q['pts'])>=2]
    big=[q for q in thick if (ext(q)[1]-ext(q)[0])>4 and (ext(q)[3]-ext(q)[2])>4]
    solid=[q for q in big if not q['dash'] or q['dash'].startswith('[] ')]
    if fig=='4J-2/2':  # linhas de OAT (-40 a 30) desenhadas como polígonos preenchidos finos: usa a reta média
        M=p.rotation_matrix; fl=[]
        for d in p.get_drawings():
            r=d['rect']*M
            if d['type']=='f' and d.get('fill')==(0.0,0.0,0.0) and len(d['items'])==10 and r.x1<430 and r.width>40:
                pts=[]
                for it in d['items']:
                    for pt in it[1:]: q=pt*M; pts.append((q.x,q.y))
                m,c,_=fit(pts)
                if all(abs(m*300+c-(f[0]*300+f[1]))>1.5 for f in fl): fl.append((m,c))  # há polígonos repetidos
        for q in solid:  # as linhas de 50 e 40 °C são traços normais
            if ext(q)[1]<430 and ext(q)[1]-ext(q)[0]>100 and len(q['pts'])==2:
                (x0,y0),(x1,y1)=q['pts']; m=(y1-y0)/(x1-x0); fl.append((m,y0-m*x0))
        XA,XB=127.35,422.9   # moldura do painel esquerdo
        fl=[dict(w=1,dash=None,pts=[(XA,m*XA+c),(XB,m*XB+c)]) for m,c in fl]
        solid=[q for q in solid if not (ext(q)[1]<430)]+fl
    dashed=[q for q in thick if q['dash'] and not q['dash'].startswith('[] ')]
    # divisor entre painéis: linha vertical longa mais à esquerda das que separam
    # divisor = borda esquerda da moldura do painel da direita (retângulo mais alto com x0 > 400 e largura > 250)
    M=p.rotation_matrix; rr=[d['rect']*M for d in p.get_drawings()]
    rp=max([r for r in rr if r.x0>400 and r.width>250 and r.width<400 and r.height>150],key=lambda r:(round(r.height),-r.x0))
    div=rp.x0-1.2
    left=[q for q in solid if ext(q)[1]<=div+0.6]; right=[q for q in solid if ext(q)[0]>=div-0.6 and q not in left]
    right=join([q['pts'] for q in right])
    if dbg: print('  right ext',[tuple(round(v) for v in ext(dict(pts=c))) for c in right])
    if dbg: print(fig,'div',div,'left',len(left),'right',len(right),'dashed',len(dashed))
    xm=(min(ext(q)[0] for q in left)+div)/2
    def yfit(q):  # y estimado em xm por ajuste linear
        pts=q['pts']; m,c,_=fit([(a,b) for a,b in pts]) if len(pts)>2 else fit(pts+[pts[-1]]); return m*xm+c
    left=sorted(left,key=lambda q:-yfit(q))
    assert len(left)==len(oats),(fig,len(left),len(oats))
    oat=[sorted(q['pts'],key=lambda pt:pt[0]) for q in left]
    md=[q['pts'] for q in dashed if ext(q)[1]<=div+0.6]
    md=join(md,tol=12) if len(md)>1 else md
    md=max(md,key=lambda c:len(c)) if md else None
    if fig=='4J-2/2':  # a linha de 50 °C coincide com o MAX OAT (ISA+35) entre -1000 e 0 ft: estende o limite até a moldura
        md=sorted(md,key=lambda pt:pt[0]); (x0,y0),(x1,y1)=md[0],md[-1]; m=(y1-y0)/(x1-x0); md=[(127.35,y0+(127.35-x0)*m)]+md
    gw=[sorted(c,key=lambda pt:pt[1]) for c in right]
    if dbg: print('  gw x@y', [[round(x_at_y(c,y),1) if x_at_y(c,y) is not None else None for y in (rp.y0+20,(rp.y0+rp.y1)/2,rp.y1-25)] for c in gw])
    ymid=sum(pt[1] for c in gw for pt in c)/sum(len(c) for c in gw)
    gw.sort(key=lambda c:min(pt[0] for pt in c)+ (x_at_y(c,ymid) or 1e9)*0)
    gw.sort(key=lambda c:(x_at_y(c,ymid) if x_at_y(c,ymid) is not None else min(pt[0] for pt in c)))
    assert len(gw)==len(gws),(fig,len(gw),len(gws))
    # confere a ordem pelos rótulos de peso impressos (nas cartas de pouso o peso maior fica à esquerda)
    labs=[(v,x,y) for v,x,y in nums if v in gws and x>div]
    if len(labs)>=2:
        near=lambda x,y:min(range(len(gw)),key=lambda i:pl_dist(x,y,gw[i]))
        idx={v:near(x,y) for v,x,y in labs}
        order=sorted(idx,key=lambda v:idx[v])
        if dbg: print('  labels->curve',idx)
        if len(set(idx.values()))==len(idx) and order[0]>order[-1]: gw=gw[::-1]
        elif fig=='4-100': gw=gw[::-1]  # rótulos ambíguos; a curva de 6800 tem de bater com a 6800 da Fig. 4-60 (conferido)
        elif len(set(idx.values()))!=len(idx): print('  AVISO rótulos ambíguos',fig,idx)
    ybot=rp.y1
    bot=[(v,x,y) for v,x,y in nums if ybot-2<y<ybot+22]
    FR={'4J-2/2':(127.35,422.9,-1000,14000),'4-61':(103.3,451.1,-1000,8000)}  # rótulos de Hp são desenhos: calibra pela moldura
    if fig in FR:
        xa,xb,va,vb=FR[fig]; PA=lin([(xa,va),(xb,vb),((xa+xb)/2,(va+vb)/2)])
    else: PA=lin([(snap(x,V,2) or x,v*1000) for v,x,y in bot if x<div-3 and -2<=v<=14])
    D=lin([(snap(x,V,2) or x,v) for v,x,y in bot if x>div+3 and 0<=v<=700])
    xL=min(pt[0] for c in oat for pt in c)
    TIT={'land':'Clear Area Landing Distance OEI (LDP até o toque)','brake':'Braking Distance Clear Area (toque até parar)','balked':'Clear Area Balked Landing Distance'}
    return dict(fig=fig,page=n,rfmPage=rfm,kind=kind,title=TIT[kind],gwRange=[gws[0],gws[-1]],frame=[round(xL,2),round(rp.y0,2),round(div,2),round(rp.y1,2)],pa=PA,dist=D,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(oats,oat)],maxOat=clean(sorted(md,key=lambda pt:pt[0])) if md else None,
        gw=[dict(v=v,pts=clean(c)) for v,c in zip(gws,gw)])
if __name__=='__main__':
    out={}
    for c in CH:
        try:
            o=extract(*c,dbg=True); out[o['fig'].replace('/','_')]=o
            print(' pa',{a:round(b,4) for a,b in o['pa'].items()},'dist',{a:round(b,4) for a,b in o['dist'].items()},'maxOat',o['maxOat'] and len(o['maxOat']))
        except AssertionError as e: print('FAIL',e)
    json.dump(out,open('cl_ldg.json','w'))
