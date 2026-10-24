# CAT B Take-Off Distance e Landing Distance (Seção 4 Fig. 4-17/4-18; Supl. 50 Fig. 4-35/4-36; Supl. 90 Fig. 4-42/4-43).
# Leitura: Hp (eixo de baixo do painel esquerdo) -> sobe até a linha de OAT -> direita até a curva de peso -> desce até a distância.
# No pouso a mesma horizontal segue até a curva de frenagem (Braking Distance) -> desce até o eixo da frenagem.
# Linhas de OAT da Seção 4 são polígonos preenchidos (traço grosso contornado): usa a linha média das duas bordas.
# As linhas de 50 e -40 °C da Seção 4 são vermelhas (bordas do envelope). O limite ISA+35 (vermelho ou tracejado) vira maxOat.
import sys,json; sys.path.insert(0,'.')
from ex_obl import scissors,clipped,clip_poly,span,group,resample,ZOOM
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
W=list(range(4400,6401,200))
CH=[  # fig, página, pág RFM, tipo, OAT (de cima p/ baixo), painéis
 dict(fig='4-17',page=463,rfm='4-33',kind='to',oats=list(range(50,-41,-10)),left=(77.8,156.5,378.8,497.8),
      panels=[dict(k='to',box=(381.6,156.7,793.0,497.7),gws=W,ax=(165,340))]),
 dict(fig='4-18',page=465,rfm='4-35',kind='ld',oats=list(range(50,-41,-10)),left=(77.2,156.3,376.4,493.2),excl=[(310,400,446,492)],
      panels=[dict(k='td',box=(380.1,156.5,787.8,494.1),gws=W,ax=(140,200),notin='br',lab=(380,395,700,445)),
              dict(k='br',box=(531.5,156.5,787.9,347.3),gws=W,ax=(0,250),lab=(505,150,790,300))]),
 dict(fig='4-35',page=2135,rfm='S50-59',kind='to',hpFrame=(-1000,8000),oats=list(range(50,-31,-10)),left=(92.6,165.4,470.3,496.0),
      panels=[dict(k='to',box=(476.5,165.2,774.0,495.6),gws=[6400,6600,6800],ax=(275,400))]),
 dict(fig='4-36',page=2137,rfm='S50-61',kind='ld',hpFrame=(-1000,8000),oats=list(range(50,-31,-10)),left=(91.5,163.2,441.8,493.1),
      panels=[dict(k='td',box=(446.4,162.7,630.7,493.1),gws=[6400,6600,6800],ax=(140,170)),
              dict(k='br',box=(632.0,162.7,773.8,493.1),gws=[6400,6600,6800],ax=(0,150))]),
 dict(fig='4-42',page=3349,rfm='S90-67',kind='to',oats=list(range(50,-41,-10)),left=(97.6,183.2,437.2,485.5),
      panels=[dict(k='to',box=(440.1,183.2,765.7,485.5),gws=[6800,7000],ax=(250,400))]),
 dict(fig='4-43',page=3351,rfm='S90-69',kind='ld',oats=list(range(50,-41,-10)),left=(101.2,155.8,440.9,483.8),
      panels=[dict(k='td',box=(443.8,155.8,627.8,483.8),gws=[6800,7000],ax=(130,170)),
              dict(k='br',box=(629.5,155.8,770.8,483.8),gws=[6800,7000],ax=(0,150))]),
]
def kind_of(c):
    if not c: return None
    r,g,b=c[:3]
    if r<0.45 and g<0.45 and b<0.75 and abs(r-g)<0.15: return 'k'   # preto / cinza-azulado escuro
    if r>0.6 and g<0.4 and b<0.4: return 'r'
    return None
def visible(pix,pts,col,step=1.0):
    tot=ok=0
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        n=max(1,int(((x1-x0)**2+(y1-y0)**2)**0.5/step))
        for i in range(n):
            x=(x0+(x1-x0)*i/n)*ZOOM; y=(y0+(y1-y0)*i/n)*ZOOM; tot+=1; hit=False
            for dx in (-2,-1,0,1,2):
                for dy in (-2,-1,0,1,2):
                    X,Y=int(x)+dx,int(y)+dy
                    if 0<=X<pix.width and 0<=Y<pix.height:
                        r,g,b=pix.pixel(X,Y)
                        if (col=='k' and max(r,g,b)<120) or (col=='r' and r>170 and g<120 and b<120): hit=True
            ok+=hit
    return ok/max(1,tot)
def subpaths(p):  # caminhos traçados, separados em subcaminhos contínuos
    M=p.rotation_matrix; out=[]
    for d in p.get_drawings():
        if d['type'] not in ('s','fs'): continue
        cur=[]
        def flush():
            if len(cur)>=2: out.append(dict(seq=d['seqno'],w=round(d.get('width') or 0,2),c=d.get('color'),dash=d.get('dashes'),pts=cur[:]))
        for it in d['items']:
            if it[0]=='l': seg=[it[1],it[2]]
            elif it[0]=='c':
                p0,p1,p2,p3=it[1:5]; seg=[p0]
                for k in range(1,17):
                    t=k/16; u=1-t; seg.append(pymupdf.Point(u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y))
            else: flush(); cur=[]; continue
            seg=[(q.x,q.y) for q in (pp*M for pp in seg)]
            if cur and (abs(cur[-1][0]-seg[0][0])>0.05 or abs(cur[-1][1]-seg[0][1])>0.05): flush(); cur=[]
            if not cur: cur=[seg[0]]
            cur+=seg[1:]
        flush()
    return out
def bands(p):  # traço grosso desenhado como polígono preenchido: linha média entre as duas bordas
    M=p.rotation_matrix; out=[]
    for d in p.get_drawings():
        if d['type']!='f' or any(it[0]=='re' for it in d['items']) or not (6<=len(d['items'])<=24): continue
        col=kind_of(d.get('fill'))
        if not col: continue
        sides=[[]];
        for it in d['items']:
            pts=[q*M for q in it[1:] if hasattr(q,'x')]
            small=it[0]=='c' and max(abs(a.x-b.x)+abs(a.y-b.y) for a in pts for b in pts)<3
            if small:
                if sides[-1]: sides.append([])
                continue
            for q in pts:
                if not sides[-1] or abs(sides[-1][-1][0]-q.x)>1e-3 or abs(sides[-1][-1][1]-q.y)>1e-3: sides[-1].append((q.x,q.y))
        sides=[s for s in sides if len(s)>=2]
        if len(sides)!=2: continue
        a,b=sides; b=b[::-1]
        lo=max(min(x for x,y in a),min(x for x,y in b)); hi=min(max(x for x,y in a),max(x for x,y in b))
        if hi-lo<20: continue
        mid=[]
        for i in range(201):
            x=lo+(hi-lo)*i/200; ya,yb=y_at_x(a,x),y_at_x(b,x)
            if ya is not None and yb is not None: mid.append((x,(ya+yb)/2))
        if len(mid)>=2: out.append(dict(seq=d['seqno'],w=2.0,c=d.get('fill'),dash=None,pts=mid))
    return out
def group2(pieces,tol=0.15,minov=4):  # agrupa só pedaços que se sobrepõem na mesma direção (não basta tocar ou cruzar)
    import math
    def dense(c):
        out=[]
        for (x0,y0),(x1,y1) in zip(c,c[1:]):
            n=max(1,int(((x1-x0)**2+(y1-y0)**2)**0.5/0.5)); a=math.atan2(y1-y0,x1-x0)
            out+=[(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,a) for i in range(n)]
        return out
    def near(x,y,a,c):
        best=None
        for (x0,y0),(x1,y1) in zip(c,c[1:]):
            d=seg_dist(x,y,(x0,y0),(x1,y1))
            if best is None or d<best[0]: best=(d,math.atan2(y1-y0,x1-x0))
        da=abs((best[1]-a+math.pi/2)%math.pi-math.pi/2)
        return best[0]<tol and da<math.radians(3)
    D=[dense(c) for c in pieces]; n=len(pieces); par=list(range(n))
    def f(i):
        while par[i]!=i: par[i]=par[par[i]]; i=par[i]
        return i
    for i in range(n):
        for j in range(i+1,n):
            if sum(1 for x,y,a in D[i] if near(x,y,a,pieces[j]))>=minov or sum(1 for x,y,a in D[j] if near(x,y,a,pieces[i]))>=minov: par[f(i)]=f(j)
    g={}
    for i in range(n): g.setdefault(f(i),[]).append(pieces[i])
    return list(g.values())
def chain(groups,tol=0.8,maxang=8):  # junta grupos que continuam um ao outro pela ponta, na mesma direção
    import math
    G=[resample(g,1) for g in groups]; G=[sorted(c,key=lambda p:p[1]) for c in G]; src=[list(g) for g in groups]
    def ang(c,end):
        a,b=(c[-2],c[-1]) if end else (c[1],c[0])
        return math.atan2(b[1]-a[1],b[0]-a[0])
    merged=True
    while merged:
        merged=False
        for i in range(len(G)):
            for j in range(len(G)):
                if i==j: continue
                a,b=G[i],G[j]   # fim de a (y maior) encosta no começo de b (y menor)
                if math.dist(a[-1],b[0])<tol:
                    da=abs((ang(a,True)-(ang(b,True) if len(b)<2 else math.atan2(b[1][1]-b[0][1],b[1][0]-b[0][0]))+math.pi)%(2*math.pi)-math.pi)
                    if da<math.radians(maxang):
                        G[i]=a+b; src[i]+=src[j]; del G[j]; del src[j]; merged=True; break
            if merged: break
    return src
def inside(c,r): return all(r[0]-0.5<=x<=r[2]+0.5 and r[1]-0.5<=y<=r[3]+0.5 for x,y in c)
def extract(cfg,dbg=False):
    fig,n=cfg['fig'],cfg['page']; p=page(n); T,P=disp(p); sc=scissors(p); pix=p.get_pixmap(matrix=pymupdf.Matrix(ZOOM,ZOOM),alpha=False)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    lines=[]; dashed=[]
    for q in subpaths(p)+bands(p):
        col=kind_of(q['c'])
        if not col or q['w']<0.9: continue
        isd=bool(q['dash'] and not q['dash'].startswith('[] '))
        for c in clipped(q['pts'],sc.get(q['seq'])):
            if len(c)<2 or span(c,0)<3 or span(c,1)<3: continue
            if any(inside(c,r) for r in cfg.get('excl',[])): continue
            if isd: dashed.append(c)
            elif visible(pix,c,col)>0.9: lines.append((col,c))
    L=cfg['left']
    left=[c for col,c in lines if inside(c,L) and fit(c if len(c)>2 else c+[c[-1]])[2]<2.5]
    gl=group2(left); oat=[resample(g,0) for g in gl]
    # a borda ISA+35 vermelha (Seção 4) tem inclinação bem diferente das linhas de OAT: vira maxOat
    sl=[fit(c if len(c)>2 else c+[c[-1]])[0] for c in oat]; med=sorted(sl)[len(sl)//2]
    isa=[c for c,m in zip(oat,sl) if abs(m-med)>0.08]; oat=[c for c,m in zip(oat,sl) if abs(m-med)<=0.08]
    # ordena pela altura na borda esquerda (prolongando cada reta até lá)
    def y_at_left(c):
        m,b,_=fit(c if len(c)>2 else c+[c[-1]]); return m*L[0]+b
    oat.sort(key=y_at_left)
    if dbg: print(fig,'oat lines',len(oat),[ (round(c[0][0]),round(c[0][1]),round(c[-1][0]),round(c[-1][1])) for c in oat])
    assert len(oat)==len(cfg['oats']),(fig,'oat',len(oat))
    # limite ISA+35: linha vermelha da borda de cima (Seção 4) ou tracejada (Supl. 50/90)
    mx=[c for c in dashed if inside(c,L) and span(c,0)>20]
    mx=join(mx,tol=40) if mx else []
    mx=max(mx,key=lambda c:span(c,0)) if mx else (isa[0] if len(isa)==1 else None)
    if dbg: print('  maxOat',mx and (len(mx),mx[0],mx[-1]),'isa red',len(isa))
    if mx: mx=sorted(mx,key=lambda pt:pt[0])
    out=dict(fig=fig,page=n,rfmPage=cfg['rfm'],kind=cfg['kind'],left=[round(v,2) for v in L],
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(cfg['oats'],oat)],maxOat=clean(mx) if mx else None,panels=[])
    # eixo de Hp: rótulos em ft x 1000 logo abaixo do painel esquerdo
    bot=[(v,x,y) for v,x,y in nums if L[3]+2<y<L[3]+16 and L[0]-4<x<L[2]+4 and -1<=v<=14]
    H,V=gridcoords_disp(p,100)
    if cfg.get('hpFrame'):  # rótulos num span só: calibra pela moldura (conferido na imagem)
        a,b=cfg['hpFrame']; out['pa']=lin([(L[0],a),(L[2],b),((L[0]+L[2])/2,(a+b)/2)])
    else: out['pa']=lin([(snap(x,V,2) or x,v*1000) for v,x,y in bot])
    if dbg: print('  Hp axis',[v for v,x,y in bot],out['pa'])
    rights=[c for col,c in lines if not inside(c,L)]
    used=set()
    for pn in cfg['panels']:
        B=pn['box']
        cand=[c for c in rights if inside(c,B)]
        if pn['k']=='br' and cfg['fig']=='4-18': cand=[c for c in cand if min(pt[0] for pt in c)>B[0]-1 and max(pt[1] for pt in c)<B[3]+1]
        if pn.get('notin')=='br': cand=[c for c in cand if not (min(pt[0] for pt in c)>530.5 and max(pt[1] for pt in c)<348.5)]
        cand=[c for c in cand if abs(c[0][0]-c[-1][0])+abs(c[0][1]-c[-1][1])>1]   # sem contornos fechados (caixas)
        gs=[resample(g,1) for g in chain(group2(cand))]
        if dbg: print('  panel',pn['k'],len(gs),[(round(min(x for x,y in c)),round(max(x for x,y in c)),round(min(y for x,y in c)),round(max(y for x,y in c))) for c in gs])
        assert len(gs)==len(pn['gws']),(fig,pn['k'],len(gs))
        def cmp(a,b):  # compara no meio da faixa de y comum às duas curvas
            lo=max(min(p[1] for p in a),min(p[1] for p in b)); hi=min(max(p[1] for p in a),max(p[1] for p in b))
            y=(lo+hi)/2; xa,xb=x_at_y(a,y),x_at_y(b,y)
            assert hi>lo and xa is not None and xb is not None,(fig,'curvas sem faixa comum')
            return -1 if xa<xb else 1
        import functools; gs.sort(key=functools.cmp_to_key(cmp))
        lb=pn.get('lab',B)
        labs=[(v,x,y) for v,x,y in nums if v in pn['gws'] and lb[0]<x<lb[2] and lb[1]<y<lb[3]]
        # cada rótulo fica sobre/ao lado da sua curva: posição do rótulo entre as curvas na mesma altura
        labs=list({v:(v,x,y) for v,x,y in labs}.values())
        def rank(x,y):
            xs=[x_at_y(c,y) for c in gs]
            return min(range(len(gs)),key=lambda i:abs(xs[i]-x) if xs[i] is not None else 1e9)
        rk={v:rank(x,y) for v,x,y in labs}
        if dbg: print('  label ranks',{int(v):r for v,r in sorted(rk.items())})
        # rótulos ficam ao lado (não em cima) da curva: vale o sentido geral, com folga de uma curva; conferido nas sobreposições
        vals=sorted(rk); rs=[rk[v] for v in vals]
        trend=sum((rs[j]>rs[i])-(rs[j]<rs[i]) for i in range(len(rs)) for j in range(i+1,len(rs)))
        assert len(vals)>=2 and trend!=0,(fig,pn['k'],rk)
        if trend<0: gs=gs[::-1]; rk={v:len(gs)-1-r for v,r in rk.items()}
        bad=[v for v in rk if abs(rk[v]-pn['gws'].index(v))>1]
        assert len(bad)<=2 and len(rk)-len(bad)>=2,(fig,pn['k'],rk)
        if bad: print('  AVISO rótulos fora de posição (conferir na sobreposição):',bad)
        a0,a1=pn['ax']
        ya=pn.get('axy',B[3])
        ax=[(v,x,y) for v,x,y in nums if ya+2<y<ya+16 and B[0]-4<x<B[2]+4 and a0<=v<=a1]
        D=lin([(snap(x,V,2) or x,v) for v,x,y in ax])
        if dbg: print('  dist axis',[v for v,x,y in ax],D)
        out['panels'].append(dict(k=pn['k'],box=[round(v,2) for v in B],gwRange=[pn['gws'][0],pn['gws'][-1]],dist=D,gw=[dict(v=v,pts=clean(c)) for v,c in zip(pn['gws'],gs)]))
    return out
if __name__=='__main__':
    out={}
    only=sys.argv[1:]
    for c in CH:
        if only and c['fig'] not in only: continue
        try: o=extract(c,dbg=True); out[o['fig']]=o
        except AssertionError as e: print('FAIL',e)
    if not only: json.dump(out,open('cb.json','w'))
