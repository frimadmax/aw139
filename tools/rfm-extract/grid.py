from lib import *
def gridcoords(p, region=None):
    H=set(); V=set()
    for d in p.get_drawings():
        for it in d['items']:
            segs=[]
            if it[0]=='l': segs=[(it[1],it[2])]
            elif it[0]=='re':
                r=it[1]; segs=[(r.tl,r.tr),(r.bl,r.br),(r.tl,r.bl),(r.tr,r.br)]
            for a,b in segs:
                if abs(a.y-b.y)<0.01 and abs(a.x-b.x)>1.5: H.add(round(a.y,2))
                if abs(a.x-b.x)<0.01 and abs(a.y-b.y)>1.5: V.add(round(a.x,2))
    return sorted(H),sorted(V)
def snap(v,arr,tol=3):
    best=min(arr,key=lambda a:abs(a-v)); return best if abs(best-v)<=tol else None
def gridcoords_disp(p,minlen=1.5):
    M=p.rotation_matrix
    H=set(); V=set()
    for d in p.get_drawings():
        for it in d['items']:
            segs=[]
            if it[0]=='l': segs=[(it[1],it[2])]
            elif it[0]=='re':
                r=it[1]; segs=[(r.tl,r.tr),(r.bl,r.br),(r.tl,r.bl),(r.tr,r.br)]
            for a,b in segs:
                a=a*M; b=b*M
                if abs(a.y-b.y)<0.01 and abs(a.x-b.x)>minlen: H.add(round(a.y,2))
                if abs(a.x-b.x)<0.01 and abs(a.y-b.y)>minlen: V.add(round(a.x,2))
    return sorted(H),sorted(V)
