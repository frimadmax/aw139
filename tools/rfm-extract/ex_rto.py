import sys,json,re; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
def extract(n,fig,title,rfm):
    p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    thick=[q for q in P if q['w']>=0.9 and q['c'] and max(q['c'])<0.7 and len(q['pts'])>=2]
    solid=[q for q in thick if not q['dash'] or q['dash'].startswith('[] ')]
    dashed=[q for q in thick if q not in solid]
    # left panel = curves ending on a common right x and lying below y=300
    lowcurves=[q for q in solid if min(pt[1] for pt in q['pts'])>300]
    xs=[max(pt[0] for pt in q['pts']) for q in lowcurves]
    from collections import Counter
    divider=Counter(round(x,1) for x in xs).most_common(1)[0][0]
    oatc=[q['pts'] for q in lowcurves if max(pt[0] for pt in q['pts'])<=divider+0.5]
    cap=min(pt[1] for c in oatc for pt in c)
    gwc=[q['pts'] for q in lowcurves if min(pt[0] for pt in q['pts'])>divider+1]
    tdpc=[q['pts'] for q in solid if min(pt[0] for pt in q['pts'])>divider+1 and max(pt[1] for pt in q['pts'])<cap-5 and max(pt[0] for pt in q['pts'])-min(pt[0] for pt in q['pts'])>100]
    mo=[q['pts'] for q in dashed if min(pt[1] for pt in q['pts'])>cap and max(pt[0] for pt in q['pts'])<=divider+0.5]
    oatc=join(oatc); gwc=join(gwc); tdpc=join(tdpc); mo=join(mo)
    assert len(oatc)==10 and len(gwc)==6 and len(tdpc)==9 and len(mo)==1,(len(oatc),len(gwc),len(tdpc),len(mo))
    def capkey(c):
        xs=[pt[0] for pt in c if abs(pt[1]-cap)<0.3]
        return min(xs) if xs else 1e9
    oatc.sort(key=capkey)
    # if two have 1e9 (no cap), order by y at divider (lower y = colder)
    nc=[c for c in oatc if capkey(c)==1e9]
    if len(nc)>1:
        oatc=[c for c in oatc if capkey(c)<1e9]+sorted(nc,key=lambda c:y_at_x(c,divider-0.01) or 0)
    for c in oatc: c.sort(key=lambda pt:-pt[0])  # from low PA (right) to high PA (left)
    gwc=[sorted(c,key=lambda pt:-pt[1]) for c in gwc]; gwc.sort(key=lambda c:c[0][0])
    tdpc=[sorted(c,key=lambda pt:pt[0]) for c in tdpc]; tdpc.sort(key=lambda c:-c[0][1])
    mo=sorted(mo[0],key=lambda pt:-pt[0])
    pa=[(snap(x,V,2) or x, v*1000) for v,x,y in nums if y>480 and v==int(v) and 0<=v<=14 and x<divider]
    dist=[(snap(y,H,3.5) or y, v) for v,x,y in nums if 150<=v<=850 and v%100==50 and divider-60<x<divider+5 and y<cap]
    PA=lin(pa); D=lin(dist)
    # label check
    olabs=sorted([(v,x,y) for v,x,y in nums if v in range(-40,51,10) and cap<y<480 and x<divider],key=lambda l:l[1])
    return dict(fig=fig,page=n,rfmPage=rfm,title=title,divider=divider,cap=cap,pa=PA,dist=D,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(range(-40,51,10),oatc)],maxOat=clean(mo),
        gw=[dict(v=v,pts=clean(c)) for v,c in zip(range(4400,6401,400),gwc)],
        tdp=[dict(v=v,pts=clean(c)) for v,c in zip([35,50,100,150,200,250,300,350,400],tdpc)])
CFG={'4B-4':(957,'Short Field Procedure RTO Distance','S12-B23'),
     '4B-5':(959,'Short Field Procedure RTO Distance, EAPS OFF','S12-B25'),
     '4B-6':(961,'Short Field Procedure RTO, EAPS ON','S12-B27'),
     '4B-6A':(963,'Short Field Procedure RTO, IBF Installed','S12-B28A')}
if __name__=='__main__':
    out={}
    for f,(n,t,r) in CFG.items():
        o=extract(n,f,t,r); out[f]=o
        print(f,'div',o['divider'],'cap',o['cap'],'PA',{k:round(v,4) for k,v in o['pa'].items()},'D',{k:round(v,4) for k,v in o['dist'].items()})
        print('   oat first pts',[(c['v'],c['pts'][0],c['pts'][-1]) for c in o['oat']])
    json.dump(out,open('rto.json','w'))
