# Fig. 4H-4 Confined Area Balked Landing Distance: como a carta de CTO, sem o painel de correção de vento.
import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
def extract(n=1247,fig='4H-4',rfm='S12-H27',title='Confined Area Balked Landing Distance, Clean, EAPS ON/OFF'):
    p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    thick=[q for q in P if q['w']>=0.9 and len(q['pts'])>=2]
    solid=[q for q in thick if not q['dash'] or q['dash'].startswith('[] ')]
    dashed=[q for q in thick if q not in solid]
    from collections import Counter
    big=[q for q in solid if max(pt[1] for pt in q['pts'])-min(pt[1] for pt in q['pts'])>4 and max(pt[0] for pt in q['pts'])-min(pt[0] for pt in q['pts'])>4]
    div=Counter(round(max(pt[0] for pt in q['pts']),1) for q in big).most_common(1)[0][0]
    oat=[q['pts'] for q in big if max(pt[0] for pt in q['pts'])<=div+0.5]
    oat=[sorted(c,key=lambda pt:-pt[0]) for c in oat]; oat.sort(key=lambda c:-c[0][1])
    assert len(oat)==10,len(oat)
    mo=[q['pts'] for q in dashed if max(pt[0] for pt in q['pts'])<=div+0.5 and max(pt[1] for pt in q['pts'])-min(pt[1] for pt in q['pts'])>20]; assert len(mo)==1,len(mo)
    mo=sorted(mo[0],key=lambda pt:-pt[0])
    gw=join([q['pts'] for q in big if div+1<min(pt[0] for pt in q['pts'])])
    gw=[sorted(c,key=lambda pt:-pt[1]) for c in gw]
    ymid=sorted(pt[1] for c in gw for pt in c)[len([1 for c in gw for pt in c])//2]
    gw.sort(key=lambda c:min(pt[0] for pt in c)); assert len(gw)==6,len(gw)
    ymaxc=max(pt[1] for q in big for pt in q['pts']); bot=[(v,x,y) for v,x,y in nums if ymaxc<y<ymaxc+20]
    PA=lin([(snap(x,V,2) or x,v*1000) for v,x,y in bot if x<div-3 and 0<=v<=14])
    D=lin([(snap(x,V,2) or x,v) for v,x,y in bot if x>div-3 and 0<=v<=700])
    return dict(fig=fig,page=n,rfmPage=rfm,title=title,pa=PA,dist=D,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(range(-40,51,10),oat)],maxOat=clean(mo),
        gw=[dict(v=v,pts=clean(c)) for v,c in zip(range(4400,6401,400),gw)],ref=None)
if __name__=='__main__':
    o=extract()
    for k in ('pa','dist'): print(k,{a:round(b,4) for a,b in o[k].items()})
    print([(c['v'],[round(v,1) for v in c['pts'][0]]) for c in o['oat']]); print([(c['v'],c['pts'][0],c['pts'][-1]) for c in o['gw']])
    json.dump({o['fig']:o},open('cl_bl.json','w'))
