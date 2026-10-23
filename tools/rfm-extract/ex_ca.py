import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import num, lin
def extract_nohw(n,fig,rfm,title):
    p=page(n); T,P=disp(p); H,V=gridcoords(p)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    lx=min(x for v,x,y in nums if v==0)
    col=[(v,x,y) for v,x,y in nums if abs(x-lx)<4]
    pa0=[y for v,x,y in col if v==0][0]
    PA=lin([(snap(y,H,2) or y, v*1000) for v,x,y in col if v==int(v) and 0<=v<=14])
    from collections import Counter
    cand=[(v,x,y) for v,x,y in nums if y>pa0+10 and 42<=v<=66 and v%2==0]
    rowy=Counter(round(y) for v,x,y in cand).most_common(1)[0][0]
    W=lin([(snap(x,V,2) or x, v*100) for v,x,y in cand if abs(y-rowy)<2])
    top=min(y for v,x,y in col)
    thick=[q for q in P if q['w']>=0.8 and q['c'] and max(q['c'])<0.2 and len(q['pts'])>=2]
    solid=[q for q in thick if not q['dash'] or q['dash'].startswith('[] ')]
    curves=join([q['pts'] for q in solid if min(pt[1] for pt in q['pts'])>top-5])
    assert len(curves)==10,len(curves)
    xmax=max(pt[0] for c in curves for pt in c)
    def yv(c):
        ys=[pt[1] for pt in c if abs(pt[0]-xmax)<0.3]
        return min(ys) if ys else 1e9
    curves.sort(key=yv)
    olabs=sorted([(v,x,y) for v,x,y in nums if v in range(-40,51,10) and abs(x-lx)>20 and top<y<pa0+30],key=lambda l:l[2])
    labord=[v for v,x,y in olabs]
    blue=[q for q in P if q['c'] and q['c'][2]>0.55 and q['c'][0]<0.3 and q['w']>=0.8]
    bl=sorted(blue,key=lambda q:-len(q['pts']))
    # max OAT line: the one reaching the lowest point (y largest); Hd: the other
    bl=sorted(blue,key=lambda q:-max(pt[1] for pt in q['pts']))
    maxoat=clean(bl[0]['pts']); hd=clean(bl[1]['pts']) if len(bl)>1 else None
    y0=max(pt[1] for c in curves for pt in c)
    return dict(fig=fig,page=n,rfmPage=rfm,title=title,pa=PA,w=W,hw=None,y0kt=y0,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(range(-40,51,10),curves)],maxOat=maxoat,hd=hd,guides=[],labord=labord)
if __name__=='__main__':
    spec={'4D-4':(1046,'S12-D32','Confined Area Heliport Procedure Weight Limitations'),
          '4D-5':(1047,'S12-D33','Confined Area Heliport Procedure Weight Limitations, EAPS OFF'),
          '4D-6':(1048,'S12-D34','Confined Area Heliport Procedure Weight Limitations, EAPS ON'),
          '4D-6A':(1049,'S12-D34A','Confined Area Heliport Procedure Weight Limitations, IBF Installed')}
    out={}
    for f,(n,r,t) in spec.items():
        o=extract_nohw(n,f,r,t); print(f,{k:round(v,3) for k,v in o['pa'].items()},{k:round(v,3) for k,v in o['w'].items()},o['labord'],len(o['maxOat']),o['hd'] and len(o['hd']))
        o.pop('labord'); out[f]=o
    json.dump(out,open('ca_wat.json','w'))
