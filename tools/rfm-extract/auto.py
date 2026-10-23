import sys,statistics; sys.path.insert(0,'.')
from lib import *
from ex_wat import num
def auto_cfg(n):
    T=[(num(t),x,y) for t,x,y,_ in texts(page(n)) if num(t) is not None]
    lx=min(x for v,x,y in T if v==0)  # left column
    col=[(v,x,y) for v,x,y in T if abs(x-lx)<4]
    zeros=sorted(y for v,x,y in col if v==0)
    pa0,hw0=zeros[0],zeros[1]
    topv=max(v for v,x,y in col if y<pa0)
    top=[y for v,x,y in col if v==topv][0]
    ol=[x for v,x,y in T if v in (-40,-30,-20,-10,10,20,30,40) and abs(x-lx)>20 and top<y<pa0]
    mx=statistics.median(ol)
    return dict(hw_top=(pa0+hw0)/2,top=top-3,left=lx+5,lab_x=(mx-25,mx+25))
if __name__=='__main__':
    for n in (953,954,955,956,993,994,995,996): print(n,auto_cfg(n))
