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
    kgy=cfg.get('kgy') or max(y for y,c in rows.items() if c>=4)
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
    y0=(0-HW['b'])/HW['a'] if HW else max(y for y,v in pa)+0.5
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
    assert len(curves)==len(vals),(fig,len(curves),[ (round(c[0][0]),round(c[0][1]),round(c[-1][0]),round(c[-1][1])) for c in curves])
    fam=[dict(v=v,pts=clean(c)) for v,c in zip(vals,curves)]
    if -40 not in vals and any(t=='-40' for t,x,y in T):
        # sem curva de -40 °C: o rótulo fica à direita da linha do peso máximo -> -40 °C lê o peso máximo
        ytop=min(pt[1] for c in curves for pt in c)
        fam.insert(0,dict(v=-40,pts=[[round(xr,3),round(ytop,3)],[round(xr,3),round(y0,3)]],synthetic=True))
    bl=sorted(blue,key=lambda q:q['dash'] or '')
    for q in blue: q['n']=len(q['pts'])
    # MAX OAT: a azul que desce até a altitude mais baixa; Hd: a outra
    bl=sorted(blue,key=lambda q:-max(pt[1] for pt in q['pts']))
    maxoat=clean(sorted(bl[0]['pts'],key=lambda pt:pt[1])); hd=clean(sorted(bl[1]['pts'],key=lambda pt:pt[1])) if len(bl)>1 else None
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
    return dict(fig=fig,page=n,rfmPage=cfg['rfm'],title=cfg['title'],pa=PA,w=W,hw=HW,y0kt=y0,gwMax=cfg.get('gwMax',6800),
                oat=fam,maxOat=maxoat,hd=hd,guides=G)
def inv(c,v): return (v-c['b'])/c['a']
O10=[-40,-30,-20,-10,0,10,20,30,40,50]
T50='Weight Limitations for CAT A '
CFG={
 '4E-1':(1110,dict(oats=O10[1:],rfm='S12-E22',title='Offshore Helideck Procedure Weight Limitations')),
 '4-7':(2092,dict(oats=O10[1:],rfm='S50-30',title=T50+'Offshore Helideck Procedure')),
 '4-8':(2093,dict(oats=O10[1:],rfm='S50-31',title=T50+'Offshore Helideck Procedure, EAPS OFF')),
 '4-9':(2094,dict(oats=O10[1:],rfm='S50-32',title=T50+'Offshore Helideck Procedure, EAPS ON')),
 '4-9C':(2097,dict(oats=O10[1:],rfm='S50-32C',title=T50+'Offshore Helideck Procedure, IBF Installed')),
}
if __name__=='__main__':
    sel=sys.argv[1].split(',') if len(sys.argv)>1 else list(CFG)
    out={}
    for f in sel:
        n,c=CFG[f]; r=extract(n,f,c); out[f]=r
        print(f,'PA',{k:round(v,4) for k,v in r['pa'].items()},'W',{k:round(v,4) for k,v in r['w'].items()},'HW',r['hw'] and {k:round(v,4) for k,v in r['hw'].items()})
        print('  oat',[(o['v'],len(o['pts']),[round(t) for t in o['pts'][0]],[round(t) for t in o['pts'][-1]]) for o in r['oat']])
        print('  guides',[(g['v'],len(g['pts'])) for g in r['guides']],'maxoat',len(r['maxOat']),'hd',r['hd'] and len(r['hd']))
    json.dump(out,open(sys.argv[2] if len(sys.argv)>2 else 'ofw.json','w'))
