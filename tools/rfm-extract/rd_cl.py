import json,sys
D=json.load(open('cl_ldg.json'))
def yat(pts,x):
    for (x1,y1),(x2,y2) in zip(pts,pts[1:]):
        if x1!=x2 and min(x1,x2)-.05<=x<=max(x1,x2)+.05: return y1+(x-x1)/(x2-x1)*(y2-y1)
def xat(pts,y):
    for (x1,y1),(x2,y2) in zip(pts,pts[1:]):
        if y1!=y2 and min(y1,y2)-.05<=y<=max(y1,y2)+.05: return x1+(y-y1)/(y2-y1)*(x2-x1)
def interp(l,v):
    l=sorted([e for e in l if e[1] is not None]);
    if not l or v<l[0][0]-1e-9 or v>l[-1][0]+1e-9: return None
    for (a,pa),(b,pb) in zip(l,l[1:]):
        if v<=b+1e-9: return pa+(v-a)/(b-a)*(pb-pa) if b!=a else pa
    return l[0][1]
def read(fig,gw,pa,oat):
    c=D[fig.replace('/','_')]; x=(pa-c['pa']['b'])/c['pa']['a']
    Y=interp([(o['v'],yat(sorted(o['pts']),x)) for o in c['oat']],oat)
    if Y is None: return None
    X=interp([(g['v'],xat(sorted(g['pts'],key=lambda p:p[1]),Y)) for g in c['gw']],gw)
    if X is None: return None
    return c['dist']['a']*X+c['dist']['b']
if __name__=='__main__':
    print('4J-2/1 ex 400:',read('4J-2/1',6000,6000,12)); print('4J-2/2 ex 35:',read('4J-2/2',6000,6000,12))
    for f in D: print(f,[ (w,p,t,None if read(f,w,p,t) is None else round(read(f,w,p,t))) for w in {'4J':(4400,6400)}.get(f[:2],(D[f]['gw'][0]['v'],D[f]['gw'][-1]['v'])) for p,t in ((0,15),(0,40),(4000,20),(8000,0))])
