"""Drop Down do Enhanced Offshore (Supl. 97 Fig. 4-10), carta de 3 painéis (página girada).
Esquerda: Hp (ft x 1000, eixo de baixo) -> linha de OAT (MAX OAT LIMIT tracejada).
Meio: vento de proa (kt, eixo de baixo); as curvas-guia levam a altura da borda esquerda até o vento.
Direita: curva de peso (6000 a 7000 kg) -> perda de altura (ft, eixo de baixo).
Conferida contra as tabelas de vento zero do próprio RFM (Fig. 4-11 e 4-12)."""
import sys,json; sys.path.insert(0,'.')
from lib import *; from geo import *
from ex_wat import num, lin
N,FIG,RFM='3589','S97-4-10','S97-35'
p=page(int(N)); T,P=disp(p)
nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
dv=sorted(set(q['pts'][0][0] for q in P if q['c'] and len(q['pts'])==2 and abs(q['pts'][0][0]-q['pts'][1][0])<0.1 and abs(q['pts'][0][1]-q['pts'][1][1])>50))
snapx=lambda x: (lambda g: g if abs(g-x)<4 else x)(min(dv,key=lambda g:abs(g-x)))
best=lambda g,m=1: min(lin([(x,v*m) for v,x in g]),lin([(snapx(x),v*m) for v,x in g]),key=lambda r:r['resid'])
bot=[(v,x) for v,x,y in nums if 495<y<505]
HW=best([(v,x) for v,x in bot if 320<x<560])
DD=best([(v,x) for v,x in bot if x>560])
blk=[q for q in P if q['c'] and max(q['c'])<0.25 and q['w']>=0.8]
solid=[q for q in blk if q['dash'].startswith('[] ')]
L=[sorted(q['pts']) for q in solid if max(pt[0] for pt in q['pts'])<302]
M=[sorted(q['pts']) for q in solid if 302<min(pt[0] for pt in q['pts']) and max(pt[0] for pt in q['pts'])<532]
R=[sorted(q['pts']) for q in solid if min(pt[0] for pt in q['pts'])>532]
mo=[sorted(q['pts']) for q in blk if q['dash'].startswith('[ 3')]
assert len(mo)==1
# frame: bordas dos painéis (verticais pretas grossas) e topo/fundo
xl,xr=min(pt[0] for c in L for pt in c),max(pt[0] for c in L for pt in c)
xm0=min(pt[0] for c in M for pt in c); xm1=max(pt[0] for c in M for pt in c)
xd0=min(pt[0] for c in R for pt in c); xd1=max(pt[0] for c in R for pt in c)
# Hp: os rótulos ficam ~3 pt à direita do traço; o painel vai de -1000 ft (borda esquerda) a +1000 ft (borda direita), grade de 100 ft
x0=min(dv,key=lambda g:abs(g-(xl+xr)/2))
PA=lin([(xl,-1000),(x0,0),(xr,1000)])
yTop=min(pt[1] for c in L+M+R for pt in c); yBot=max(pt[1] for c in M for pt in c)
# OAT: rótulo vai para a linha que passa mais perto
labs=[(v,x,y) for v,x,y in nums if 175<x<215 and 170<y<420 and v in range(-40,51,10)]
oat=[]
for v,x,y in labs:
    d,i=min((pl_dist(x,y,c),i) for i,c in enumerate(L)); oat.append((v,i,d))
assert len(set(i for v,i,d in oat))==len(L)==len(oat),oat
oat=[dict(v=v,pts=clean(L[i])) for v,i,d in sorted(oat)]
# peso: o rótulo fica logo acima da sua curva -> curva mais próxima abaixo do rótulo
glabs=[(v,x,y) for v,x,y in nums if 6000<=v<=7000 and x>540 and y<300]
gw=[]
for v,x,y in sorted(glabs):
    below=[(yy-y,i) for i,c in enumerate(R) for yy in [y_at_x(c,x)] if yy is not None and yy>y]
    d,i=min(below); gw.append(dict(v=v,pts=clean(R[i]))); assert d<9,(v,d)
assert len(set(json.dumps(g['pts']) for g in gw))==len(gw)
guides=sorted([clean(c) for c in M],key=lambda c:c[0][1])
out={FIG:dict(fig=FIG,page=int(N),rfmPage=RFM,title='Enhanced Offshore Helideck Procedure Drop Down Height BTS for CTO OEI',
    pa=PA,hw=HW,dd=DD,oat=oat,maxOat=clean(mo[0]),guides=guides,gw=gw,frame=dict(xl=xl,xr=xr,xm0=xm0,xm1=xm1,xd0=xd0,xd1=xd1,yTop=yTop,yBot=yBot))}
# tabelas de vento zero do RFM (Fig. 4-11 e 4-12, de ex_eddtab): peso -> Hp -> OAT -> ft; usadas quando a carta passa de 150 ft
out[FIG]['zeroWind']=json.load(open('eddtab.json'))
for k in ('pa','hw','dd'): print(k,{a:round(b,4) for a,b in out[FIG][k].items()})
print('oat',[o['v'] for o in oat],'gw',[g['v'] for g in gw],'guides',len(guides),'frame',{k:round(v,1) for k,v in out[FIG]['frame'].items()})
json.dump(out,open(sys.argv[1] if len(sys.argv)>1 else 'edd.json','w'))
