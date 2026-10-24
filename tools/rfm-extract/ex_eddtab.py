"""Tabelas de vento zero do Drop Down Enhanced (Supl. 97 Fig. 4-11 e 4-12, págs. 3591-3592): peso -> Hp -> OAT -> ft."""
import sys,json; sys.path.insert(0,'.')
from lib import *
out={}
for n in (3591,3592):
    T,P=disp(page(n))
    heads=sorted(y for t,x,y in T if t.startswith('Hp'))
    for kg,yk in [(int(t.split()[0]),y) for t,x,y in T if t.endswith('kg')]:
        yh=max(h for h in heads if h<yk)
        cols=[(int(t),x) for t,x,y in T if abs(y-yh)<2 and t.lstrip('-').isdigit()]
        xh=[x for t,x,y in T if t.startswith('Hp') and abs(y-yh)<2][0]
        rows=[(int(t),y) for t,x,y in T if t.lstrip('-').isdigit() and int(t) in (-1000,-500,0,500,1000) and abs(x-(xh+10))<12 and yh+5<y<yh+70]
        tab={}
        for h,yr in rows:
            cells=[]
            for t,x,y in T:
                if abs(y-yr)<2.5 and x>xh+20:
                    parts=t.split()
                    if len(parts)==2: cells+=[(int(parts[0]),x-11),(int(parts[1]),x+11)]  # duas células no mesmo texto
                    elif t.isdigit(): cells.append((int(t),x))
            r={}
            for v,x in cells:
                o=min(cols,key=lambda c:abs(c[1]-x))
                if abs(o[1]-x)<8: r[o[0]]=v
            tab[h]=r
        out[kg]=tab; print(kg,{h:len(r) for h,r in tab.items()})
json.dump(out,open('eddtab.json','w'))
