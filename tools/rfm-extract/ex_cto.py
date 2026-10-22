import sys,json,re; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
def extract():
    n=965; p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    thick=[q for q in P if q['w']>=0.9 and len(q['pts'])>=2]
    solid=[q for q in thick if not q['dash'] or q['dash'].startswith('[] ')]
    dashed=[q for q in thick if q not in solid]
    oat=[q['pts'] for q in solid if max(pt[0] for pt in q['pts'])<446.5 and min(pt[1] for pt in q['pts'])>230]
    oat=[sorted(c,key=lambda pt:-pt[0]) for c in oat]; oat.sort(key=lambda c:-c[0][1])
    assert len(oat)==10
    mo=[q['pts'] for q in dashed if max(pt[0] for pt in q['pts'])<446.5]; assert len(mo)==1
    mo=sorted(mo[0],key=lambda pt:-pt[0])
    gw=join([q['pts'] for q in solid if 446.5<min(pt[0] for pt in q['pts']) and max(pt[0] for pt in q['pts'])<653 and min(pt[1] for pt in q['pts'])>215])
    gw=[sorted(c,key=lambda pt:-pt[1]) for c in gw]; gw.sort(key=lambda c:x_at_y(c,330)); assert len(gw)==6,len(gw)
    ref=[q['pts'] for q in solid if min(pt[0] for pt in q['pts'])>653 and min(pt[1] for pt in q['pts'])>215]; assert len(ref)==1
    ref=sorted(ref[0],key=lambda pt:-pt[1])
    bot=[(v,x,y) for v,x,y in nums if y>450]
    PA=lin([(snap(x,V,2) or x,v*1000) for v,x,y in bot if x<440 and 0<=v<=14])
    D=lin([(snap(x,V,2) or x,v) for v,x,y in bot if 445<x<640 and 0<=v<=700])
    C=lin([(snap(x,V,2) or x,v) for v,x,y in bot if x>650 and -9<=v<=-2])
    return dict(fig='4B-7',page=n,rfmPage='S12-B29',title='Short Field Procedure CTO Distance OEI, Clean, EAPS ON/OFF',pa=PA,dist=D,corr=C,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(range(-40,51,10),oat)],maxOat=clean(mo),
        gw=[dict(v=v,pts=clean(c)) for v,c in zip(range(4400,6401,400),gw)],ref=clean(ref))
if __name__=='__main__':
    o=extract()
    for k in ('pa','dist','corr'): print(k,{a:round(b,4) for a,b in o[k].items()})
    print([(c['v'],c['pts'][0]) for c in o['oat']]); print([(c['v'],c['pts'][0],c['pts'][-1]) for c in o['gw']]); print(o['ref'])
    json.dump({'4B-7':o},open('cto.json','w'))
