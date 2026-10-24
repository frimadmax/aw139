"""W.A.T. das cartas no estilo do Supl. 50 / Supl. 90 / Supl. 97 (Offshore, Clear Area, Confined, Enhanced).
Painel de cima: Hp (ft) x peso; linhas de OAT pretas; MAX OAT e Hd LIMIT azuis. Painel de baixo: vento de proa (guias).
Saída no mesmo formato de wat.json (lida por SFEngine.wat)."""
import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
def num(t):
    try: return float(t)
    except: return None
def lin(pairs):
    m,c,r=fit(pairs); return dict(a=m,b=c,resid=r,n=len(pairs))
def extract(n,fig,cfg):
    p=page(n); T,P=disp(p); H,V=gridcoords(p)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    km=cfg.get('kgMul',1000); pm=cfg.get('paMul',1000)
    from collections import Counter
    rows=Counter(round(y) for v,x,y in nums if 4000<=v*km<=7200 and y>380)
    kgy=cfg.get('kgy') or max(y for y,c in rows.items() if c>=3)
    xl=min(x for v,x,y in nums if abs(y-kgy)<4)  # 1º rótulo de peso
    left=sorted([(v,x,y) for v,x,y in nums if x<xl+2 and y<kgy-4],key=lambda l:l[2])
    hw=[]
    if cfg.get('hwPanel',True) and [l[0] for l in left[-3:]]==[0,10,20]: hw=left[-3:]; left=left[:-3]
    hw=[(snap(y,H,2) or y, v) for v,x,y in hw]
    cfg.setdefault('top',left[0][2]-6); cfg.setdefault('hw_top',hw[0][0] if hw else 1e9)
    pa=[(snap(y,H,2) or y, v*pm) for v,x,y in left if v==int(v)]
    PA=lin(pa)
    HW=lin(hw) if len(hw)>=2 else None
    kg=[(snap(x,V,2) or x, v*km) for v,x,y in nums if abs(y-kgy)<4 and 4000<=v*km<=7200]
    W=lin(kg)
    y0=(0-HW['b'])/HW['a'] if HW else max(pt[1] for q in P if q['c'] and max(q['c'])<0.25 and q['w']>=0.8 for pt in q['pts'] if pt[1]<kgy-4)+0.6
    blk=lambda q: q['c'] and max(q['c'])<0.25 and q['w']>=0.8
    thick=[q for q in P if blk(q) and len(q['pts'])>=2]
    xr=inv_w=(cfg.get('gwMax',6800)-W['b'])/W['a']
    def vertical(q): xs=[pt[0] for pt in q['pts']]; return max(xs)-min(xs)<0.3
    main=[q for q in thick if max(pt[1] for pt in q['pts'])<y0-0.5 and min(pt[1] for pt in q['pts'])>cfg['top']-2 and not vertical(q)]
    guides=[q for q in thick if min(pt[1] for pt in q['pts'])>=y0-1.5 and not vertical(q)]
    blue=[q for q in P if q['c'] and q['c'][2]>0.45 and q['c'][0]<0.35 and q['c'][1]<0.4 and q['w']>=0.8]
    curves=join([q['pts'] for q in main],tol=cfg.get('jtol',0.3))
    curves=[sorted(c,key=lambda pt:pt[1]) for c in curves if max(pt[1] for pt in c)-min(pt[1] for pt in c)>8]
    # ordena pelo x na altura de 0 ft (ou extrapolado): mais à direita = mais frio
    yref=inv(PA,cfg.get('refFt',1000))
    def key(c):
        x=x_at_y(c,yref)
        if x is None: x=c[0][0]+ (yref-c[0][1])*(c[-1][0]-c[0][0])/(c[-1][1]-c[0][1])
        return -x
    curves.sort(key=key)
    vals=cfg['oats']
    if vals is None:
        vals=sorted(set(v for v,x,y in nums if v==int(v) and -40<=v<=50 and x>xl+4 and cfg['top']-10<y<y0 and abs(y-kgy)>4))
        print('  labels',vals,len(curves))
    if cfg.get('bylabel'):
        # cada rótulo de OAT vai para a curva mais próxima (a ordem por posição falha quando as curvas dobram)
        labs=[(v,x,y) for v,x,y in nums if v in vals and x>xl+4 and cfg['top']-10<y<y0]
        pick={}
        for v,x,y in labs:
            d,i=min((pl_dist(x,y,c),i) for i,c in enumerate(curves))
            if v not in pick or d<pick[v][0]: pick[v]=(d,i)
        pick={v:di for v,di in pick.items() if di[0]<12}
        best={}
        for v,(d,i) in pick.items():
            if i not in best or d<best[i][0]: best[i]=(d,v)
        if len(best)<len(pick): print('  rótulos descartados (mesma curva):',sorted(set(pick)-set(v for d,v in best.values())))
        assert len(best)==len(curves),(fig,pick,len(curves))
        order=sorted(best.items(),key=lambda kv:kv[1][1])
        vals=[v for i,(d,v) in order]; curves=[curves[i] for i,(d,v) in order]
    assert len(curves)==len(vals),(fig,len(curves),[ (round(c[0][0]),round(c[0][1]),round(c[-1][0]),round(c[-1][1])) for c in curves])
    fam=[dict(v=v,pts=clean(c)) for v,c in zip(vals,curves)]
    vl=cfg.get('vline',-40)
    if vl not in vals and vl<min(vals) and (cfg.get('forceV') or vl!=-40 or any(t=='-40' for t,x,y in T)):
        # sem curva de -40 °C: o rótulo fica à direita da linha do peso máximo -> -40 °C lê o peso máximo
        ytop=min(pt[1] for c in curves for pt in c)
        fam.insert(0,dict(v=vl,pts=[[round(xr,3),round(ytop,3)],[round(xr,3),round(y0,3)]],synthetic=True))
        if vl>-40:  # "0 and below": vale também para as temperaturas mais frias
            fam.insert(0,dict(v=-40,pts=fam[0]['pts'],synthetic=True))
    bl=sorted(blue,key=lambda q:q['dash'] or '')
    for q in blue: q['n']=len(q['pts'])
    # MAX OAT: a azul que desce até a altitude mais baixa; Hd: a outra
    bl=sorted(blue,key=lambda q:-max(pt[1] for pt in q['pts']))
    # qual azul é qual: pelo texto mais próximo ("Hd LIMIT" ou "MAX OAT LIMIT"/"OAT LIMIT ISA+..")
    words=[(t,x,y) for t,x,y in T if 'Hd' in t or 'MAX' in t or 'ISA' in t or 'LIMIT' in t.upper()]
    def kind(q):
        dh=min([pl_dist(x,y,q['pts']) for t,x,y in words if 'hd' in t.lower()] or [1e9])
        dm=min([pl_dist(x,y,q['pts']) for t,x,y in words if 'MAX' in t or 'ISA' in t] or [1e9])
        return 'hd' if dh<12 and (dh<dm or dm>6) else 'max'
    maxoat=hd=None
    for q in bl:
        k=kind(q); pts=clean(sorted(q['pts'],key=lambda pt:pt[1]))
        if k=='hd' and hd is None: hd=pts
        elif k=='max' and maxoat is None: maxoat=pts
    G=[]
    if HW:
        gl=join([q['pts'] for q in guides]); gl=[sorted(g,key=lambda pt:pt[1]) for g in gl if max(pt[1] for pt in g)-min(pt[1] for pt in g)>5]
        gl.sort(key=lambda g:g[0][0])
        for g in gl:
            v=round((W['a']*g[0][0]+W['b'])/100)*100 if abs(g[0][1]-y0)<1.5 else None
            g=[list(pt) for pt in clean(g)]
            y20=(20-HW['b'])/HW['a']
            if abs(g[0][1]-y0)<1.5: g[0][1]=round(y0,3)      # encosta na linha de 0 kt
            if abs(g[-1][1]-y20)<1.5: g[-1][1]=round(y20,3)  # e na de 20 kt
            G.append(dict(v=v,pts=g))
    return dict(isaDev=cfg.get('isaDev',35),fig=fig,page=n,rfmPage=cfg['rfm'],title=cfg['title'],pa=PA,w=W,hw=HW,y0kt=y0,gwMax=cfg.get('gwMax',6800),
                oat=fam,maxOat=maxoat,hd=hd,guides=G)
def inv(c,v): return (v-c['b'])/c['a']
O10=[-40,-30,-20,-10,0,10,20,30,40,50]
T50='Weight Limitations for CAT A '
CFG={
 '4E-1':(1110,dict(oats=O10[1:],rfm='S12-E22',title='Offshore Helideck Procedure Weight Limitations')),
 '4-7':(2092,dict(oats=O10[1:],rfm='S50-30',title=T50+'Offshore Helideck Procedure')),
 '4-8':(2093,dict(oats=O10[1:],rfm='S50-31',title=T50+'Offshore Helideck Procedure, EAPS OFF')),
 '4-9':(2094,dict(oats=O10[1:],rfm='S50-32',title=T50+'Offshore Helideck Procedure, EAPS ON')),
 '4-1':(2086,dict(oats=[-20,-10,0,10,20,30,40,50],vline=-40,forceV=True,bylabel=True,gwMax=6800,refFt=5500,rfm='S50-24B',title=T50+'Clear Area and CAT B Procedures')),
 '4-2':(2087,dict(oats=None,vline=-40,forceV=True,bylabel=True,rfm='S50-25',title=T50+'Clear Area and CAT B Procedures, EAPS OFF')),
 '4-3':(2088,dict(oats=None,vline=-40,forceV=True,bylabel=True,rfm='S50-26',title=T50+'Clear Area and CAT B Procedure, EAPS ON')),
 '4-9A':(2095,dict(oats=None,bylabel=True,vline=-30,forceV=True,rfm='S50-32A',title=T50+'Clear Area and CAT B Procedure, IBF Installed')),
 'S90-4-5':(3310,dict(oats=None,bylabel=True,paMul=100,kgMul=100,gwMax=7000,isaDev=20,vline=0,forceV=True,rfm='S90-28',title=T50+'Clear Area Procedure')),
 'S90-4-6':(3311,dict(oats=None,bylabel=True,paMul=100,kgMul=100,gwMax=7000,isaDev=20,vline=0,forceV=True,rfm='S90-29',title=T50+'Clear Area Procedure, EAPS OFF')),
 'S90-4-7':(3312,dict(oats=None,bylabel=True,paMul=100,kgMul=100,gwMax=7000,isaDev=20,vline=0,forceV=True,rfm='S90-30',title=T50+'Clear Area Procedure, EAPS ON')),
 'S90-4-8':(3313,dict(oats=None,bylabel=True,paMul=100,kgMul=100,gwMax=7000,isaDev=20,vline=0,forceV=True,rfm='S90-31',title=T50+'Clear Area Procedure, IBF Installed')),
 '4-9C':(2097,dict(oats=O10[1:],rfm='S50-32C',title=T50+'Offshore Helideck Procedure, IBF Installed')),
}
if __name__=='__main__':
    sel=sys.argv[1].split(',') if len(sys.argv)>1 else list(CFG)
    out={}
    for f in sel:
        n,c=CFG[f]; r=extract(n,f,c); out[f]=r
        print(f,'PA',{k:round(v,4) for k,v in r['pa'].items()},'W',{k:round(v,4) for k,v in r['w'].items()},'HW',r['hw'] and {k:round(v,4) for k,v in r['hw'].items()})
        print('  oat',[(o['v'],len(o['pts']),[round(t) for t in o['pts'][0]],[round(t) for t in o['pts'][-1]]) for o in r['oat']])
        print('  guides',[(g['v'],len(g['pts'])) for g in r['guides']],'maxoat',r['maxOat'] and len(r['maxOat']),'hd',r['hd'] and len(r['hd']))
    json.dump(out,open(sys.argv[2] if len(sys.argv)>2 else 'ofw.json','w'))
