# PATH 1 Gradient (Fig. 4A-8 a 4A-31): PA x OAT -> gradiente na linha de base -> guias de vento
import sys,json,re,statistics,functools; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
def num(t):
    try: return float(t)
    except: return None
def lin(pairs,tol=None):
    pairs=list(pairs)
    while True:
        m,c,r=fit(pairs)
        if tol is None or r<=tol or len(pairs)<=3: return dict(a=m,b=c,resid=r,n=len(pairs))
        pairs.remove(max(pairs,key=lambda q:abs(m*q[0]+c-q[1])))
def tokens(p,maxblock=None):
    out=[]
    for b in p.get_text('rawdict')['blocks']:
        if maxblock is not None and b['number']>maxblock: continue
        for l in b.get('lines',[]):
            for s in l['spans']:
                cur=[]
                for c in s['chars']+[None]:
                    if c is None or not re.match(r'[-0-9]',c['c']) or (cur and c['bbox'][0]-cur[-1]['bbox'][2]>1.2):
                        if cur:
                            t=''.join(k['c'] for k in cur); x0=cur[0]['bbox'][0]; x1=cur[-1]['bbox'][2]
                            y=(cur[0]['bbox'][1]+cur[0]['bbox'][3])/2
                            if num(t) is not None: out.append((num(t),(x0+x1)/2,y))
                        cur=[c] if c is not None and re.match(r'[-0-9]',c['c']) else []
                    else: cur.append(c)
    return out
def gridseq(p,seq):
    H=set(); V=set()
    for d in p.get_drawings():
        if seq and not seq[0]<=d['seqno']<=seq[1]: continue
        for it in d['items']:
            segs=[]
            if it[0]=='l': segs=[(it[1],it[2])]
            elif it[0]=='re':
                r=it[1]; segs=[(r.tl,r.tr),(r.bl,r.br),(r.tl,r.bl),(r.tr,r.br)]
            for a,b in segs:
                if abs(a.y-b.y)<0.01 and abs(a.x-b.x)>1.5: H.add(round(a.y,2))
                if abs(a.x-b.x)<0.01 and abs(a.y-b.y)>1.5: V.add(round(a.x,2))
    return sorted(H),sorted(V)
def extract(n,fig,rfm,title,gw,cfg,seq=None):
    p=page(n); P=[q for q in polylines(p) if seq is None or seq[0]<=q['seq']<=seq[1]]; H,V=gridseq(p,seq); T=tokens(p,49 if seq else None)
    solid=[q for q in P if q['c'] and max(q['c'])<0.3 and q['dash'] in (None,'[] 0') and 0.5<=q['w']<=0.8 and len(q['pts'])>=2 and abs(q['pts'][0][0]-q['pts'][-1][0])>0.5 and abs(q['pts'][0][1]-q['pts'][-1][1])>0.5]
    dashed=[q for q in P if q['c'] and max(q['c'])<0.3 and q['dash'] not in (None,'[] 0') and 0.5<=q['w']<=0.8]
    # linha de base = fim comum das curvas principais (maior y mais frequente)
    ends=statistics.mode(round(max(pt[1] for pt in q['pts']),1) for q in solid)
    upper=[q['pts'] for q in solid if max(pt[1] for pt in q['pts'])<ends+0.3]
    main=[dict(pts=c) for c in join(upper) if abs(max(pt[1] for pt in c)-ends)<0.3]
    guides=[q for q in solid if min(pt[1] for pt in q['pts'])>ends+0.5]
    y0g=statistics.mode(round(min(pt[1] for pt in q['pts']),1) for q in guides)
    guides=[q for q in guides if abs(min(pt[1] for pt in q['pts'])-y0g)<0.3]
    # coluna da esquerda: altitude e vento
    colx=statistics.median(x for v,x,y in T if v in (1,2,3,4,6,7,8,9) and y<ends)
    col=[(v,x,y) for v,x,y in T if abs(x-colx)<5]
    pa=[(snap(y,H,2.5) or y, v*1000) for v,x,y in col if y<ends+3 and -1<=v<=15]
    hw=[(snap(y,H,2.5) or y, v) for v,x,y in col if ends+3<y<ends+80 and v in (0,5,10,15,20)]
    PA=lin(pa,30); HW=lin(hw,0.05)
    yb=(20-HW['b'])/HW['a']
    g=[(snap(x,V,1.2) or x, v) for v,x,y in T if yb+2<y<yb+16 and 0<=v<=70 and v==int(v)]
    gMax=max(v for x,v in g)
    Gt=lin(g,0.5)
    # eixo do gradiente pela moldura do painel de vento (0 na borda esquerda, gMax na direita);
    # nas cartas do PATH 2 os rótulos estão deslocados ~1,3 pt em relação à moldura e às guias.
    fr=[it[1] for d in p.get_drawings() if seq is None or seq[0]<=d['seqno']<=seq[1] for it in d['items']
        if it[0]=='re' and 150<it[1].width<260 and (abs(it[1].y0-y0g)<0.6 or abs(it[1].y1-ends)<0.6)]
    if fr:
        G=lin([(fr[0].x0,0),(fr[0].x1,gMax),(fr[0].x0+1e-6,0)])
        G['tokShift']=round((Gt['b']-G['b'])/G['a'],2)
    else: G=Gt
    curves=[clean(q['pts']) for q in main]
    def cmp(a,b):
        lo=max(min(pt[1] for pt in a),min(pt[1] for pt in b)); hi=min(max(pt[1] for pt in a),max(pt[1] for pt in b))
        ys=[lo+(hi-lo)*k/20 for k in range(1,20)]
        d=[x_at_y(a,y)-x_at_y(b,y) for y in ys if x_at_y(a,y) is not None and x_at_y(b,y) is not None]
        s=sum(d); return -1 if s>0 else 1
    curves.sort(key=functools.cmp_to_key(cmp))   # da direita (mais frio) para a esquerda
    vals=list(range(-40,51,10))[:len(curves)]
    xl,xr=min(V),max(V)
    x70=(gMax-G['b'])/G['a']
    lab=[(v,x,y) for v,x,y in T if v in range(-40,51,10) and abs(x-colx)>12 and x<x70-3 and y<ends-2 and min(pt[1] for c in curves for pt in c)-6<y]
    chk=[];bad=[]
    byv={v:c for v,c in zip(vals,curves)}
    for v,x,y in lab:
        if v not in byv: bad.append((v,'sem curva')); continue
        a=x_at_y(byv[v],y); b=x_at_y(byv[v-10],y) if v-10 in byv else None
        ok=a is not None and x>a-1 and (b is None or x<b+1)
        chk.append((v,ok));
        if not ok: bad.append((v,round(x,1),a and round(a,1),b and round(b,1)))
    mo=sorted([q for q in dashed if max(pt[1] for pt in q['pts'])<ends+0.5 and len(q['pts'])>=2 and max(pt[1] for pt in q['pts'])-min(pt[1] for pt in q['pts'])>5],key=lambda q:-len(q['pts']))
    maxoat=clean(mo[0]['pts']) if mo else None
    mg=[q for q in dashed if min(pt[1] for pt in q['pts'])>ends-1 and abs(q['pts'][0][0]-q['pts'][-1][0])<0.2]
    ming=G['a']*mg[0]['pts'][0][0]+G['b'] if mg else None
    gl=[sorted(clean(q['pts']),key=lambda pt:pt[1]) for q in guides]; gl.sort(key=lambda g:g[0][0])
    Gd=[dict(v=round(G['a']*g_[0][0]+G['b'],2),pts=g_) for g_ in gl]
    return dict(fig=fig,page=n,rfmPage=rfm,title=title,gw=gw,cfg=cfg,pa=PA,g=G,hw=HW,yBase=ends,y0kt=y0g,
                oat=[dict(v=v,pts=c) for v,c in zip(vals,curves)],maxOat=maxoat,minGrad=ming,guides=Gd,labelcheck=chk,bad=bad,
                gMax=gMax)
if __name__=='__main__' and sys.argv[1:2]==['p2']:
    out={}
    cfgs=[('clean',''),('eapsOff',', EAPS OFF'),('eapsOn',', EAPS ON'),('ibf',', IBF Installed')]
    k=5
    for ci,(cfg,suf) in enumerate(cfgs):
        for wi,gw in enumerate(range(4400,6401,400)):
            fig=f'4K-{k}'; n=1336+ci*6+wi
            pg=DOC[n-1].get_text()
            assert f'Figure {fig} ' in pg, (fig,n)
            rfm=re.search(r'Page (S12-K\d+)',pg).group(1)
            o=extract(n,fig,rfm,f'PATH 2 Gradient, Gross Weight {gw} kg{suf}',gw,cfg); out[fig]=o
            print(fig,n,rfm,cfg,gw,'shift',o['g'].get('tokShift'),'PA',round(o['pa']['resid'],1),o['pa']['n'],'HW',round(o['hw']['resid'],3),o['hw']['n'],'G',round(o['g']['resid'],3),o['g']['n'],o['gMax'],
                  'curves',len(o['oat']),'guides',[g['v'] for g in o['guides']],'maxOat',bool(o['maxOat']),'minG',o['minGrad'] and round(o['minGrad'],2),'bad',o['bad'],'y',o['yBase'],o['y0kt'],round((0-o['hw']['b'])/o['hw']['a'],1))
            k+=1
    json.dump(out,open('k_p2.json','w'))
elif __name__=='__main__':
    out={}
    cfgs=[('clean',''),('eapsOff',', EAPS OFF'),('eapsOn',', EAPS ON'),('ibf',', IBF Installed')]
    k=8
    for ci,(cfg,suf) in enumerate(cfgs):
        for wi,gw in enumerate(range(4400,6401,400)):
            fig=f'4A-{k}'; n=910+ci*6+wi+(1 if cfg=='ibf' else 0)
            pg=pymupdf.open('/mnt/project-files/AW 139 RFM REV 30.pdf')[n-1].get_text()
            assert f'Figure {fig} ' in pg, (fig,n)
            rfm=re.search(r'Page (S12-A\d+)',pg).group(1)
            o=extract(n,fig,rfm,f'PATH 1 Gradient, Gross Weight {gw} kg{suf}',gw,cfg,(0,269) if n==915 else None); out[fig]=o
            print(fig,n,rfm,cfg,gw,'shift',o['g'].get('tokShift'),'PA',round(o['pa']['resid'],1),o['pa']['n'],'HW',round(o['hw']['resid'],3),o['hw']['n'],'G',round(o['g']['resid'],3),o['g']['n'],
                  'curves',[c['v'] for c in o['oat']][-1],len(o['oat']),'guides',[g['v'] for g in o['guides']][:3],len(o['guides']),'maxOat',bool(o['maxOat']),'minG',o['minGrad'] and round(o['minGrad'],2),'bad',o['bad'],'y',o['yBase'],o['y0kt'],round((0-o['hw']['b'])/o['hw']['a'],1))
            if n==915: o['srcPdf']='p915_6400.pdf'
            k+=1
    json.dump(out,open('vt_p1.json','w'))
