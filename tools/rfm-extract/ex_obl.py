# Pouso Offshore: Balked Landing Distance OEI (Supl. 12 Parte I, Fig. 4I-2/4/6/8; Supl. 50, Fig. 4-75/77/79/100).
# Leitura: OAT (eixo de baixo, painel esquerdo) -> sobe até a linha de Hp -> direita até a curva de peso -> desce até a distância.
# As curvas vêm em pedaços sobrepostos e recortados (clip) pela moldura de cada painel: recorta, agrupa os pedaços que se
# sobrepõem e reamostra cada curva pela média dos pedaços.
import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
HP=list(range(-1000,5001,1000))
CH=[  # fig, página (1-based), pág RFM, configuração, pesos (esq->dir)
 ('4I-2',1297,'S12-I39','standard',[4400,4800,5200,5600,6000,6400]),
 ('4I-4',1299,'S12-I41','eaps_off',[4400,4800,5200,5600,6000,6400]),
 ('4I-6',1301,'S12-I43','eaps_on',[4400,4800,5200,5600,6000,6400]),
 ('4I-8',1303,'S12-I45','ibf',[4400,4800,5200,5600,6000,6400]),
 ('4-75',2211,'S50-121','standard',[4400,4800,5200,5600,6000,6400,6800]),
 ('4-77',2213,'S50-123','eaps_off',[4400,4800,5200,5600,6000,6400,6800]),
 ('4-79',2215,'S50-125','eaps_on',[4400,4800,5200,5600,6000,6400,6800]),
 ('4-100',2237,'S50-147','ibf',[4400,4800,5200,5600,6000,6400,6800]),
]
FR={'4I-8':((100.3,185.27,372.24,489.61),(378.24,185.27,771.14,489.61)),'4-100':((99.0,182.5,371.0,486.8),(377.0,182.5,769.9,486.8))}
ZOOM=4
def visible(pix,pts,step=1.0):  # fração dos pontos da linha que aparecem escuros na página renderizada
    tot=ok=0
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        n=max(1,int(((x1-x0)**2+(y1-y0)**2)**0.5/step))
        for i in range(n):
            x=(x0+(x1-x0)*i/n)*ZOOM; y=(y0+(y1-y0)*i/n)*ZOOM; tot+=1
            dark=False
            for dx in (-2,-1,0,1,2):
                for dy in (-2,-1,0,1,2):
                    X,Y=int(x)+dx,int(y)+dy
                    if 0<=X<pix.width and 0<=Y<pix.height and max(pix.pixel(X,Y))<110: dark=True
            ok+=dark
    return ok/max(1,tot)
def clip_seg(a,b,r):  # Liang-Barsky
    x0,y0=a; dx,dy=b[0]-x0,b[1]-y0; t0,t1=0.0,1.0
    for p,q in ((-dx,x0-r[0]),(dx,r[2]-x0),(-dy,y0-r[1]),(dy,r[3]-y0)):
        if abs(p)<1e-12:
            if q<0: return None
        else:
            t=q/p
            if p<0: t0=max(t0,t)
            else: t1=min(t1,t)
    if t0>t1: return None
    return (x0+t0*dx,y0+t0*dy),(x0+t1*dx,y0+t1*dy)
def clip_poly(pts,r):
    runs=[]; cur=[]
    for a,b in zip(pts,pts[1:]):
        s=clip_seg(a,b,r)
        if s is None:
            if cur: runs.append(cur); cur=[]
            continue
        if cur and (abs(cur[-1][0]-s[0][0])>1e-6 or abs(cur[-1][1]-s[0][1])>1e-6): runs.append(cur); cur=[]
        if not cur: cur=[s[0]]
        cur.append(s[1])
    if cur: runs.append(cur)
    return [c for c in runs if len(c)>=2]
def scissors(p):  # seqno -> retângulo de recorte efetivo (coordenadas de exibição)
    M=p.rotation_matrix; st=[]; out={}
    for d in p.get_drawings(extended=True):
        if d['type']=='clip':
            r=d['scissor']*M; st=st[:d['level']]; st.append(r)
        elif d['type'] in ('s','f','fs'):
            act=st[:d['level']]
            if act:
                x0=max(r.x0 for r in act); y0=max(r.y0 for r in act); x1=min(r.x1 for r in act); y1=min(r.y1 for r in act)
                out[d['seqno']]=(x0,y0,x1,y1)
    return out
def clipped(pts,r): return clip_poly(pts,r) if r else [pts]
def span(c,k): v=[pt[k] for pt in c]; return max(v)-min(v)
def group(pieces,tol=0.5):
    n=len(pieces); par=list(range(n))
    def f(i):
        while par[i]!=i: par[i]=par[par[i]]; i=par[i]
        return i
    for i in range(n):
        for j in range(i+1,n):
            a,b=pieces[i],pieces[j]
            if min(pl_dist(x,y,b) for x,y in a)<tol or min(pl_dist(x,y,a) for x,y in b)<tol: par[f(i)]=f(j)
    g={}
    for i in range(n): g.setdefault(f(i),[]).append(pieces[i])
    return list(g.values())
def resample(ps,k):  # k=0: amostra por x (linhas de Hp); k=1: por y (curvas de peso)
    lo=min(pt[k] for c in ps for pt in c); hi=max(pt[k] for c in ps for pt in c)
    at=(lambda c,v:y_at_x(c,v)) if k==0 else (lambda c,v:x_at_y(c,v))
    out=[]; N=max(2,int((hi-lo)/0.5)+1)
    for i in range(N+1):
        v=lo+(hi-lo)*i/N; w=[at(c,v) for c in ps]; w=[u for u in w if u is not None]
        if w: out.append((v,sum(w)/len(w)) if k==0 else (sum(w)/len(w),v))
    return out
def extract(fig,n,rfm,cfg,gws,dbg=False):
    p=page(n); T,P=disp(p); M=p.rotation_matrix
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    # molduras: os dois retângulos de painel lado a lado com a mesma altura
    rr=[d['rect']*M for d in p.get_drawings()]
    cand=[r for r in rr if r.height>200 and r.width>150 and r.width<500]
    if fig in FR:  # molduras desenhadas como linhas (e, na 4-100, uma carta antiga escondida por baixo): moldura medida na grade visível
        a,b=FR[fig]; L=pymupdf.Rect(*a); R=pymupdf.Rect(*b)
    else: L,R=next((a,b) for a in sorted(cand,key=lambda r:r.x0) for b in cand if b.x0>a.x1 and abs(a.y0-b.y0)<1 and abs(a.y1-b.y1)<1)
    assert abs(L.y0-R.y0)<1 and abs(L.y1-R.y1)<1 and L.x1<R.x0,(fig,L,R)
    rL=(L.x0,L.y0,L.x1,L.y1); rR=(R.x0,R.y0,R.x1,R.y1)
    ws=sorted(set(q['w'] for q in P)); wc=max(w for w in ws if w<1.5 and sum(1 for q in P if q['w']==w and len(q['pts'])>=3)>=5)
    sc=scissors(p); pix=p.get_pixmap(matrix=pymupdf.Matrix(ZOOM,ZOOM),alpha=False)
    curv=[clipped(q['pts'],sc.get(q['seq'])) for q in P if q['w']>=wc-0.01 and q['w']<1.5 and not (q['dash'] and not q['dash'].startswith('[] '))]
    def pieces(r):
        out=[]
        for cs in curv:
          for c in cs:
            for run in clip_poly(c,r):
                if span(run,0)>3 and span(run,1)>3 and visible(pix,run)>0.9: out.append(run)
        return out
    pl=group(pieces(rL)); pr=group(pieces(rR))
    hp=[resample(g,0) for g in pl]; gw=[resample(g,1) for g in pr]
    if dbg: print(fig,'wc',wc,'L',[len(g) for g in pl],'R',[len(g) for g in pr])
    assert len(hp)==len(HP),(fig,'hp',len(hp))
    assert len(gw)==len(gws),(fig,'gw',len(gw))
    xm=(L.x0+L.x1)/2; hp.sort(key=lambda c:y_at_x(c,xm))
    # curvas de peso: ordena pelo x na altura mais baixa comum; confere com os rótulos
    yc=min(max(pt[1] for pt in c) for c in gw)-1
    gw.sort(key=lambda c:x_at_y(c,yc))
    labs=[(v,x,y) for v,x,y in nums if v in gws and rR[0]<x<rR[2] and rR[1]<y<rR[3]]
    near=lambda x,y:min(range(len(gw)),key=lambda i:pl_dist(x,y,gw[i]))
    idx={v:near(x,y) for v,x,y in labs}
    if dbg: print('  labels->curve',idx)
    assert all(idx[v]==gws.index(v) for v in idx) and len(idx)>=len(gws)-1,(fig,idx)
    # eixos (rótulos logo abaixo da moldura)
    bot=[(v,x,y) for v,x,y in nums if L.y1+2<y<L.y1+16]
    H,V=gridcoords_disp(p,100)
    if fig=='4-100':  # rótulos das duas camadas se misturam: calibra pela moldura (-40..50 °C; 0..600 m), conferido na imagem
        OAT=lin([(L.x0,-40),(L.x1,50),((L.x0+L.x1)/2,5)]); D=lin([(R.x0,0),(R.x1,600),((R.x0+R.x1)/2,300)])
    else:
        OAT=lin([(snap(x,V,2) or x,v) for v,x,y in bot if x<L.x1+3 and -40<=v<=50])
        D=lin([(snap(x,V,2) or x,v) for v,x,y in bot if x>R.x0-3 and 0<=v<=700])
    if dbg: print('  oat',OAT,'dist',D,'oat axis',round(OAT['a']*L.x0+OAT['b'],2),round(OAT['a']*L.x1+OAT['b'],2),'d@R.x0',round(D['a']*R.x0+D['b'],1))
    return dict(fig=fig,page=n,rfmPage=rfm,cfg=cfg,title='Offshore Helideck Balked Landing Distance',gwRange=[gws[0],gws[-1]],
        frameL=[round(v,2) for v in rL],frameR=[round(v,2) for v in rR],oatAx=OAT,dist=D,
        hp=[dict(v=v,pts=clean(c)) for v,c in zip(HP,hp)],gw=[dict(v=v,pts=clean(c)) for v,c in zip(gws,gw)])
if __name__=='__main__':
    out={}
    for c in CH:
        try: o=extract(*c,dbg=True); out[o['fig']]=o
        except AssertionError as e: print('FAIL',e)
    json.dump(out,open('obl.json','w'))
