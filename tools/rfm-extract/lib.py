import pymupdf, re
DOC=pymupdf.open('/mnt/project-files/AW 139 RFM REV 30.pdf')
def page(n): return DOC[n-1]
def texts(p):
    out=[]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            for s in l['spans']:
                t=s['text'].strip()
                if t:
                    x0,y0,x1,y1=s['bbox']; out.append((t,(x0+x1)/2,(y0+y1)/2,s['bbox']))
    return out
def polylines(p):
    res=[]
    for i,d in enumerate(p.get_drawings()):
        segs=[]
        for it in d['items']:
            if it[0]=='l': segs.append((it[1],it[2]))
            elif it[0]=='c':
                p0,p1,p2,p3=it[1],it[2],it[3],it[4]; prev=p0
                for k in range(1,17):
                    t=k/16; u=1-t
                    q=pymupdf.Point(u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x, u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y)
                    segs.append((prev,q)); prev=q
        if not segs: continue
        pts=[(segs[0][0].x,segs[0][0].y)]
        for a,b in segs:
            if abs(a.x-pts[-1][0])>0.05 or abs(a.y-pts[-1][1])>0.05: pts.append((a.x,a.y))
            pts.append((b.x,b.y))
        # dedupe consecutive
        q=[pts[0]]
        for pt in pts[1:]:
            if abs(pt[0]-q[-1][0])>1e-3 or abs(pt[1]-q[-1][1])>1e-3: q.append(pt)
        res.append(dict(i=i,w=round(d.get('width') or 0,2),c=d.get('color'),dash=d.get('dashes'),pts=q))
    return res
def fit(pairs):
    # least squares linear coord->value
    n=len(pairs); sx=sum(a for a,b in pairs); sy=sum(b for a,b in pairs)
    sxx=sum(a*a for a,b in pairs); sxy=sum(a*b for a,b in pairs)
    m=(n*sxy-sx*sy)/(n*sxx-sx*sx); c=(sy-m*sx)/n
    resid=max(abs(m*a+c-b) for a,b in pairs)
    return m,c,resid

def disp(p):
    """texts and polylines in displayed (rotated) frame"""
    M=p.rotation_matrix
    def tf(x,y):
        q=pymupdf.Point(x,y)*M; return (q.x,q.y)
    T=[]
    for t,x,y,b in texts(p):
        T.append((t,)+tf(x,y))
    P=[]
    for q in polylines(p):
        q=dict(q); q['pts']=[tf(*pt) for pt in q['pts']]; P.append(q)
    return T,P
