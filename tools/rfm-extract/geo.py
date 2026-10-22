import math
def seg_dist(px,py,a,b):
    ax,ay=a; bx,by=b; dx,dy=bx-ax,by-ay
    L=dx*dx+dy*dy
    t=0 if L==0 else max(0,min(1,((px-ax)*dx+(py-ay)*dy)/L))
    return math.hypot(ax+t*dx-px,ay+t*dy-py)
def pl_dist(x,y,pts): return min(seg_dist(x,y,pts[i],pts[i+1]) for i in range(len(pts)-1))
def x_at_y(pts,y):
    for i in range(len(pts)-1):
        (x1,y1),(x2,y2)=pts[i],pts[i+1]
        if min(y1,y2)-1e-6<=y<=max(y1,y2)+1e-6 and y1!=y2:
            return x1+(y-y1)/(y2-y1)*(x2-x1)
    return None
def y_at_x(pts,x):
    for i in range(len(pts)-1):
        (x1,y1),(x2,y2)=pts[i],pts[i+1]
        if min(x1,x2)-1e-6<=x<=max(x1,x2)+1e-6 and x1!=x2:
            return y1+(x-x1)/(x2-x1)*(y2-y1)
    return None
def join(polys,tol=0.3):
    """merge polylines whose ends touch"""
    polys=[list(p) for p in polys]; changed=True
    while changed:
        changed=False
        for i in range(len(polys)):
            for j in range(len(polys)):
                if i==j: continue
                a,b=polys[i],polys[j]
                if math.dist(a[-1],b[0])<tol:
                    polys[i]=a+b[1:]; del polys[j]; changed=True; break
            if changed: break
    return polys
def clean(pts):
    out=[pts[0]]
    for p in pts[1:]:
        if math.dist(p,out[-1])>0.05: out.append(p)
    return [(round(x,2),round(y,2)) for x,y in out]
def rdp(pts,eps=0.03):
    if len(pts)<3: return pts
    a,b=pts[0],pts[-1]; dmax=-1; k=0
    for i in range(1,len(pts)-1):
        d=seg_dist(pts[i][0],pts[i][1],a,b)
        if d>dmax: dmax=d; k=i
    if dmax>eps: return rdp(pts[:k+1],eps)[:-1]+rdp(pts[k:],eps)
    return [a,b]
_clean=clean
def clean(pts): return _clean(rdp(_clean(pts)))
