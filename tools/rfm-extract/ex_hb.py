# Fig. 4G-2 Heliport Balked Landing Distance (Supl. 12 Parte G, p. S12-G23): Hp (embaixo) -> linha de OAT ->
# direita até a curva de referência -> desce até a distância (m). Vale para todos os pesos do W.A.T.
import sys,json; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
def extract(n=1211,fig='4G-2',rfm='S12-G23',title='Heliport Balked Landing Distance, Clean, EAPS ON/OFF'):
    p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    big=[q for q in P if q['w']>=0.9 and len(q['pts'])>=2 and max(pt[0] for pt in q['pts'])-min(pt[0] for pt in q['pts'])>4 and max(pt[1] for pt in q['pts'])-min(pt[1] for pt in q['pts'])>4]
    solid=[q for q in big if not q['dash'] or q['dash'].startswith('[] ')]
    div=max(max(pt[0] for pt in q['pts']) for q in solid if max(pt[0] for pt in q['pts'])<500)
    oat=[sorted(q['pts'],key=lambda pt:pt[0]) for q in solid if max(pt[0] for pt in q['pts'])<=div+0.5]
    oat.sort(key=lambda c:-y_at_x(c,425)); assert len(oat)==10,len(oat)
    oat=[sorted(c,key=lambda pt:-pt[0]) for c in oat]
    mo=[q['pts'] for q in big if q not in solid]; assert len(mo)==1; mo=sorted(mo[0],key=lambda pt:-pt[0])
    ref=[q['pts'] for q in solid if min(pt[0] for pt in q['pts'])>div+1]; assert len(ref)==1
    ref=sorted(ref[0],key=lambda pt:-pt[1])
    ybot=max(pt[1] for c in oat for pt in c)
    bot=[(v,x,y) for v,x,y in nums if ybot<y<ybot+20]
    PA=lin([(snap(x,V,2) or x,v*1000) for v,x,y in bot if x<div and 0<=v<=14])
    D=lin([(snap(x,V,2) or x,v) for v,x,y in bot if x>div and 0<=v<=500])
    return dict(fig=fig,page=n,rfmPage=rfm,title=title,pa=PA,dist=D,
        oat=[dict(v=v,pts=clean(c)) for v,c in zip(range(-40,51,10),oat)],maxOat=clean(mo),curve=clean(ref))
if __name__=='__main__':
    o=extract()
    for k in ('pa','dist'): print(k,{a:round(b,4) for a,b in o[k].items()})
    print([(c['v'],c['pts'][0],c['pts'][-1]) for c in o['oat']]); print(o['curve'][0],o['curve'][-1],len(o['curve']))
    json.dump({o['fig']:o},open('hb.json','w'))
