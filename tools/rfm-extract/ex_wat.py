import sys,json,re; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
def num(t):
    try: return float(t)
    except: return None
def lin(pairs):
    m,c,r=fit(pairs); return dict(a=m,b=c,resid=r,n=len(pairs))
def extract(n,fig,cfg):
    p=page(n); T,P=disp(p); H,V=gridcoords(p)  # page not rotated for WAT
    nums=[(num(t),x,y,t) for t,x,y in T if num(t) is not None]
    # PA labels: left column, the one with most entries x<130
    left=[(v,x,y) for v,x,y,t in nums if x<130]
    colx=sorted(set(round(x) for v,x,y in left))
    pa=[(snap(y,H,2) or y, v*1000) for v,x,y in left if y<cfg['hw_top'] and v==int(v) and 0<=v<=14]
    PA=lin(pa)
    hw=[(snap(y,H,2) or y, v) for v,x,y in left if y>cfg['hw_top']-6 and v in (0,10,20)]
    HW=lin(hw)
    if cfg.get('kg',True):
        kg=[(snap(x,V,2) or x, v*100) for v,x,y,t in nums if y>cfg['hw_top']+40 and 42<=v<=66]
        W=lin(kg)
    else:
        lb=[(snap(x,V,2) or x, v*100/2.20462262) for v,x,y,t in nums if y<cfg['top']+2 and 95<=v<=145]
        W=lin(lb)
    y0=(0-HW['b'])/HW['a']
    thick=[q for q in P if q['w']>=0.8 and q['c'] and max(q['c'])<0.1 and len(q['pts'])>=2]
    main=[q for q in thick if max(pt[1] for pt in q['pts'])<y0-0.5 and min(pt[1] for pt in q['pts'])>cfg['top']-2 and min(pt[0] for pt in q['pts'])>cfg['left']]
    guides=[q for q in thick if min(pt[1] for pt in q['pts'])>=y0-1.5]
    blue=[q for q in P if q['c'] and q['c'][2]>0.55 and q['c'][0]<0.3 and q['w']>=0.8]
    # OAT labels
    olabs=[(v,x,y) for v,x,y,t in nums if v in range(-40,51,10) and cfg['lab_x'][0]<x<cfg['lab_x'][1] and cfg['top']<y<y0]
    curves=join([q['pts'] for q in main])
    xmax=max(pt[0] for c in curves for pt in c)
    def yv(c):
        ys=[pt[1] for pt in c if abs(pt[0]-xmax)<0.3]
        return min(ys) if ys else 1e9
    curves.sort(key=yv)
    vals=list(range(-40,51,10))[:len(curves)]
    assert len(curves)==10,len(curves)
    labord=[v for v,x,y in sorted(olabs,key=lambda l:l[2])]
    oat=[dict(v=v,d=round(min(pl_dist(x,y,c) for c in curves),2)) for v,x,y in olabs]
    assert labord==sorted(labord),labord
    fam=[dict(v=v,pts=clean(c)) for v,c in zip(vals,curves)]
    bl=sorted(blue,key=lambda q:-len(q['pts']))
    maxoat=clean(bl[0]['pts']); hd=clean(bl[1]['pts']) if len(bl)>1 else None
    # guides values
    gl=join([q['pts'] for q in guides]); gl=[sorted(g,key=lambda pt:pt[1]) for g in gl]
    gl.sort(key=lambda g:x_at_y(g,g[0][1]+ (0 if True else 0)) )
    gv=[]
    for g in gl:
        if abs(g[0][1]-y0)<1.5:
            v=round((W['a']*g[0][0]+W['b'])/100)*100
        else: v=None
        gv.append(v)
    for i,v in enumerate(gv):
        if v is None: gv[i]=gv[i+1]-200
    G=[dict(v=v,pts=clean(g)) for v,g in zip(gv,gl)]
    return dict(fig=fig,page=n,rfmPage=cfg['rfm'],title=cfg['title'],pa=PA,w=W,hw=HW,y0kt=y0,
                oat=fam,maxOat=maxoat,hd=hd,guides=G,labelcheck=oat)
CFG={
 '4B-1':(953,dict(hw_top=425,top=172,left=100,lab_x=(285,330),rfm='S12-B19',title='Short Field Procedure Weight Limitations')),
 '4B-2':(954,dict(hw_top=412,top=144,left=60,lab_x=(250,280),rfm='S12-B20',title='Short Field Procedure Weight Limitations, EAPS OFF')),
 '4B-3':(955,dict(hw_top=413,top=145,left=60,lab_x=(280,320),rfm='S12-B21',title='Short Field Procedure Weight Limitations, EAPS ON')),
 '4B-3A':(956,dict(hw_top=415,top=150,left=60,lab_x=(250,275),kg=False,rfm='S12-B22',title='Short Field Procedure Weight Limitations, IBF Installed')),
}
if __name__=='__main__':
    out={}
    for f,(n,c) in CFG.items():
        r=extract(n,f,c); out[f]=r
        print(f,'PA',{k:round(v,4) for k,v in r['pa'].items()},'W',{k:round(v,4) for k,v in r['w'].items()},'HW',{k:round(v,4) for k,v in r['hw'].items()})
        print('  oat',[(o['v'],len(o['pts'])) for o in r['oat']],'labels',[(o['v'],o['d']) for o in r['labelcheck']])
        print('  guides',[g['v'] for g in r['guides']],'maxoat',len(r['maxOat']),'hd',r['hd'] and len(r['hd']))
    json.dump(out,open('wat.json','w'))
