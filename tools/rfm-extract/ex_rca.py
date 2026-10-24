"""RTO e CTO do Clear Area (Supl. 50 Fig. 4-54 a 4-59 e 4-68A/B; Supl. 90 Fig. 4-92 a 4-99): carta de 3 painéis.
Esquerdo: Hp (eixo de baixo, ft) -> sobe até a linha de OAT (MAX OAT LIMIT tracejada) -> direita.
Centro: até a curva de peso -> desce até a distância (m). Direito: na mesma altura, a linha de referência dá a correção
de distância por kt de vento de proa (m), que se multiplica pelo vento."""
import sys,json; sys.path.insert(0,'.')
from lib import *; from geo import *
def num(t):
    try: return float(t)
    except: return None
def lin(pairs):
    m,c,r=fit(pairs); return dict(a=m,b=c,resid=r,n=len(pairs))
def groups(row):
    out=[[row[0]]]
    for v,x in row[1:]:
        g=out[-1]
        if len(g)==1: ok=v!=g[0][0]
        else:
            d=g[1][0]-g[0][0]; ok=(v-g[-1][0])*d>0
        if ok: g.append((v,x))
        else: out.append([(v,x)])
    return out
def extract(n,fig,cfg):
    p=page(n); T,P=disp(p)
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None]
    yb=cfg.get('yb') or max(y for v,x,y in nums if y<560 and sum(1 for w,xx,yy in nums if abs(yy-y)<2)>12)
    row=sorted([(v,x) for v,x,y in nums if abs(y-yb)<2],key=lambda t:t[1])
    G=[g for g in groups(row) if len(g)>=3]
    assert len(G)==3,(fig,G)
    gHp,gD,gC=G
    # escala de Hp pelo título do eixo de baixo: [ft x 1000] ou [ft x 100]
    hpt=[t for t,x,y in T if 'ft x 10' in t and 'Pressure' in t and y>yb]
    pm=cfg.get('paMul') or (100 if hpt and 'ft x 100]' in hpt[0] else 1000 if max(abs(w) for w,_ in gHp)<=30 else 1)
    # o centro do rótulo desloca com o sinal de menos: encaixa cada rótulo na linha de grade vertical mais próxima
    dv=sorted(set(q['pts'][0][0] for q in P if q['c'] and len(q['pts'])==2 and abs(q['pts'][0][0]-q['pts'][1][0])<0.1 and abs(q['pts'][0][1]-q['pts'][1][1])>50))
    snapx=lambda x: (lambda g: g if abs(g-x)<4 else x)(min(dv,key=lambda g:abs(g-x))) if dv else x
    PA=min(lin([(x,v*pm) for v,x in gHp]),lin([(snapx(x),v*pm) for v,x in gHp]),key=lambda r:r['resid'])
    dm=100 if max(v for v,_ in gD)<=30 else 1
    # rótulo encaixado na grade só quando isso melhora o ajuste
    best=lambda g,m=1: min(lin([(x,v*m) for v,x in g]),lin([(snapx(x),v*m) for v,x in g]),key=lambda r:r['resid'])
    DIST=best(gD,dm); CORR=best(gC)
    blue=lambda q: q['c'] and q['c'][2]>0.45 and q['c'][1]<0.45 and q['w']>=0.4
    grid=[q for q in P if q['c'] and q['c'][1]>0.5 and (q['c'][2]>0.7 or q['c'][0]<0.1) and len(q['pts'])==2]  # grade azul (Supl. 50/90) ou verde (Supl. 12)
    vx=sorted(set(round(q['pts'][0][0],1) for q in grid if abs(q['pts'][0][0]-q['pts'][1][0])<0.1))
    hy=[q['pts'][0][1] for q in grid if abs(q['pts'][0][1]-q['pts'][1][1])<0.1]
    hys=[q['pts'][1][1] for q in grid if abs(q['pts'][0][0]-q['pts'][1][0])<0.1]+[q['pts'][0][1] for q in grid if abs(q['pts'][0][0]-q['pts'][1][0])<0.1]
    yTop,yBot=min(hys),max(hys)
    xs1=gHp[-1][1]; xs2=gD[-1][1]
    # moldura de cada painel: as linhas de grade verticais entre os grupos de rótulos
    def span(a,b): v=[x for x in vx if a-3<=x<=b+3]; return min(v),max(v)
    L=span(gHp[0][1]-40,(gHp[-1][1]+gD[0][1])/2); C=span((gHp[-1][1]+gD[0][1])/2,(gD[-1][1]+gC[0][1])/2); R=span((gD[-1][1]+gC[0][1])/2,gC[-1][1]+40)
    lines=[q for q in P if blue(q) and len(q['pts'])>=2]
    def inside(q,a): xs=[pt[0] for pt in q['pts']]; return min(xs)>=a[0]-1 and max(xs)<=a[1]+1
    def solid(q): return not q['dash'] or q['dash'].startswith('[] ')
    # molduras: linhas verticais pretas da altura toda; os separadores são as que ficam entre os grupos de rótulos
    fr=sorted(set(round(q['pts'][0][0],1) for q in P if q['c'] and max(q['c'])<0.3 and len(q['pts'])==2 and abs(q['pts'][0][0]-q['pts'][1][0])<0.1 and abs(q['pts'][0][1]-q['pts'][1][1])>(yBot-yTop)*0.9))
    def near(x): return min(fr,key=lambda f:abs(f-x))
    s1=near((gHp[-1][1]+gD[0][1])/2); s2=near((gD[-1][1]+gC[0][1])/2)
    L=(near(gHp[0][1]),s1); C=(s1,s2); R=(s2,near(gC[-1][1]))
    lL=[q for q in lines if inside(q,(0,s1))]; lC=[q for q in lines if inside(q,(s1,s2))]; lR=[q for q in lines if inside(q,(s2,2000))]
    oatc=join([q['pts'] for q in lL if solid(q)],tol=0.4); mo=join([q['pts'] for q in lL if not solid(q)],tol=0.6)
    if not mo:  # Supl. 12: a MAX OAT LIMIT é tracejada em preto
        mo=join([q['pts'] for q in P if q['c'] and max(q['c'])<0.3 and not solid(q) and inside(q,(L[0],s1)) and min(pt[1] for pt in q['pts'])>yTop-1],tol=0.6)
    # curvas de peso: o piso vertical (distância mínima) é comum a várias curvas e as emendaria entre si.
    # Corta os trechos verticais, junta só as diagonais e depois devolve a cada curva o seu pé no piso.
    isv=lambda a_,b_: abs(a_[0]-b_[0])<0.05 and abs(a_[1]-b_[1])>0.3
    vl={}
    for q in lC:
        for a_,b_ in zip(q['pts'],q['pts'][1:]):
            if isv(a_,b_): vl[round(a_[0],1)]=vl.get(round(a_[0],1),0)+abs(a_[1]-b_[1])
    fx0=max(vl,key=vl.get) if vl and max(vl.values())>10 else None
    runs=[];vert=[]
    for q in lC:
        cur=[q['pts'][0]]
        for a_,b_ in zip(q['pts'],q['pts'][1:]):
            if fx0 is not None and isv(a_,b_) and abs(a_[0]-fx0)<0.3:
                vert.append((a_[0],min(a_[1],b_[1]),max(a_[1],b_[1])))
                if len(cur)>1: runs.append(cur)
                cur=[b_]
            else: cur.append(b_)
        if len(cur)>1: runs.append(cur)
    gwc=join(runs,tol=0.4); ref=join([q['pts'] for q in lR],tol=0.4)
    floor=None
    if vert:
        fx=max(vert,key=lambda v:v[2]-v[1])[0]; fb=max(v[2] for v in vert if abs(v[0]-fx)<0.3)
        floor=(fx,fb)
    big=lambda c: max(pt[0] for pt in c)-min(pt[0] for pt in c)+max(pt[1] for pt in c)-min(pt[1] for pt in c)>6
    oatc=[c for c in oatc if big(c)]; gwc=[c for c in gwc if big(c) and max(pt[0] for pt in c)-min(pt[0] for pt in c)>1]; ref=max(ref,key=len)
    if floor:
        for c in gwc:
            lo=max(c,key=lambda pt:pt[1])
            if abs(lo[0]-floor[0])<0.6 and floor[1]>lo[1]+0.3:
                if c[-1] is lo: c.append((floor[0],floor[1]))
                elif c[0] is lo: c.insert(0,(floor[0],floor[1]))
    def label(curves,vals,region):
        labs=[(v,x,y) for v,x,y in nums if v in vals and region[0]-2<x<region[1]+2 and yTop-2<y<yBot+2]
        best={}
        for v,x,y in labs:
            d,i=min((pl_dist(x,y,c),i) for i,c in enumerate(curves))
            if d<14 and (i not in best or d<best[i][0]): best[i]=(d,v)
        return best
    ob=label(oatc,set(range(-40,51,10)),L)
    gws=cfg.get('gws',[4400,4800,5200,5600,6000,6400,6600,6800,7000])
    gb=label(gwc,set(gws),C)
    # rótulos de peso escritos entre as curvas: se há tantos valores quanto curvas, vale a ordem da esquerda para a direita
    gv=sorted(set(v for v,x,y in nums if v in gws and C[0]-2<x<C[1]+2 and yTop-2<y<yBot+2))
    if len(gv)==len(gwc) and len(gwc)>1:
        yc0=max(min(pt[1] for pt in c) for c in gwc)+1
        order=sorted(range(len(gwc)),key=lambda i:x_at_y(sorted(gwc[i],key=lambda pt:pt[1]),yc0) or 0)
        gb={i:(0,v) for i,v in zip(order,gv)}
    # pedaços sem rótulo (ex.: o 50 °C curto do lado da MAX OAT) entram só se cfg mandar
    def fill(best,curves,full,key,what):
        # curvas sem rótulo: valor deduzido pela ordem (posição entre as rotuladas) e pelo buraco na sequência de valores
        if len(best)==len(curves): return best
        order=sorted(range(len(curves)),key=key)
        vals=[best[i][1] if i in best else None for i in order]
        known=[v for v in vals if v is not None]
        miss=[v for v in full if v not in known and min(known)-10000<v]
        for k,v in enumerate(vals):
            if v is not None: continue
            lo=next((vals[j] for j in range(k-1,-1,-1) if vals[j] is not None),None)
            hi=next((vals[j] for j in range(k+1,len(vals)) if vals[j] is not None),None)
            cand=[m for m in miss if (lo is None or m>lo) and (hi is None or m<hi)]
            assert len(cand)>=1,(fig,what,'sem valor para curva',k,lo,hi,miss)
            c=cand[-1] if hi is None else cand[0] if lo is None else cand[0]
            if lo is not None and hi is not None: assert len(cand)==1,(fig,what,'ambíguo',lo,hi,cand)
            best[order[k]]=(99,c); vals[k]=c; miss.remove(c)
            print('  ',fig,what,'curva sem rótulo ->',c)
        return best
    yat=lambda c,x: (lambda pts:pts[min(range(len(pts)),key=lambda i:abs(pts[i][0]-x))][1])(c)
    # OAT: mais quente = mais alto na página na borda esquerda (ou no ponto mais à esquerda em comum)
    xc=max(min(pt[0] for pt in c) for c in oatc)
    okey=lambda i:-y_at_x(sorted(oatc[i]),xc+0.5) if y_at_x(sorted(oatc[i]),xc+0.5) is not None else -yat(oatc[i],xc)
    # rótulos de OAT amontoados (ex.: 4F-9A): se há tantos valores quanto curvas, vale a ordem de baixo para cima
    ov=sorted(set(v for v,x,y in nums if v in set(range(-40,51,10)) and L[0]-2<x<L[1]+2 and yTop-2<y<yBot+2))
    if len(ov)==len(oatc) and len(oatc)>1:
        ob={i:(0,v) for i,v in zip(sorted(range(len(oatc)),key=okey),ov)}
    ob=fill(ob,oatc,list(range(-40,51,10)),okey,'oat')
    # peso: mais pesado = mais à direita numa altura comum
    yc=max(min(pt[1] for pt in c) for c in gwc)+1
    gb=fill(gb,gwc,cfg.get('gws',[4400,4800,5200,5600,6000,6400,6600,6800,7000]),lambda i:x_at_y(sorted(gwc[i],key=lambda pt:pt[1]),yc) or 0,'gw')
    assert len(ob)==len(oatc),(fig,'oat',len(ob),len(oatc),ob)
    assert len(gb)==len(gwc),(fig,'gw',len(gb),len(gwc),gb)
    def mono(c,k):
        # na ordem do traço, descarta pontos que voltam para trás (ex.: o pé da curva que sobe pelo piso e desce de novo)
        c=list(c) if c[0][k]<=c[-1][k] else list(c)[::-1]
        out=[];m=float('inf')
        for pt in reversed(c):
            if pt[k]<=m+0.05: out.append(pt); m=min(m,pt[k])
        return out[::-1]
    srt=lambda c,k: [list(map(lambda v:round(v,3),pt)) for pt in clean(sorted(mono(c,k),key=lambda pt:pt[k]))]
    oat=sorted([dict(v=v,pts=srt(oatc[i],0)) for i,(d,v) in ob.items()],key=lambda o:o['v'])
    gw=sorted([dict(v=v,pts=srt(gwc[i],1)) for i,(d,v) in gb.items()],key=lambda o:o['v'])
    maxoat=srt([pt for c in mo for pt in c],0) if mo else None
    return dict(fig=fig,page=n,rfmPage=cfg['rfm'],title=cfg['title'],kind=cfg['kind'],isaDev=cfg.get('isaDev',35),
                pa=PA,dist=DIST,corr=CORR,L=L,C=C,R=R,yTop=yTop,yBot=yBot,oat=oat,gw=gw,maxOat=maxoat,ref=srt(ref,1))
CFG={
 '4-54':(2169,dict(kind='rto',rfm='S50-85',title='Rejected Take Off Distance OEI Clear Area')),
 '4-55':(2171,dict(kind='cto',rfm='S50-87',title='Continued Take Off Distance OEI Clear Area Procedure')),
 '4-56':(2173,dict(kind='rto',rfm='S50-89',title='Rejected Take Off Distance OEI Clear Area, EAPS OFF')),
 '4-57':(2175,dict(kind='cto',rfm='S50-91',title='CTO Distance OEI Clear Area Procedure, EAPS OFF')),
 '4-58':(2177,dict(kind='rto',rfm='S50-93',title='Rejected Take Off Distance OEI Clear Area, EAPS ON')),
 '4-59':(2179,dict(kind='cto',rfm='S50-95',title='CTO Distance OEI Clear Area Procedure, EAPS ON')),
'4-68A':(2193,dict(kind='rto',rfm='S50-108A',title='Rejected Take Off Distance OEI Clear Area, IBF Installed')),
 '4-68B':(2195,dict(kind='cto',rfm='S50-108C',title='Continued Take Off Distance OEI Clear Area, IBF Installed')),
 'S90-4-92':(3405,dict(kind='rto',rfm='S90-123',title='Rejected Take Off Distance OEI Clear Area Procedure')),
 'S90-4-93':(3407,dict(kind='cto',rfm='S90-125',title='Continued Take Off Distance OEI Clear Area Procedure')),
 'S90-4-94':(3409,dict(kind='rto',rfm='S90-127',title='Rejected Take Off Distance OEI Clear Area Procedure, EAPS OFF')),
 'S90-4-95':(3411,dict(kind='cto',rfm='S90-129',title='CTO Distance OEI Clear Area Procedure, EAPS OFF')),
 'S90-4-96':(3413,dict(kind='rto',rfm='S90-131',title='Rejected Take Off Distance OEI Clear Area Procedure, EAPS ON')),
 'S90-4-97':(3415,dict(kind='cto',rfm='S90-133',title='CTO Distance OEI Clear Area Procedure, EAPS ON')),
 'S90-4-98':(3417,dict(kind='rto',rfm='S90-135',title='Rejected Take Off Distance OEI Clear Area Procedure, IBF Installed')),
 'S90-4-99':(3419,dict(kind='cto',rfm='S90-137',title='CTO Distance OEI Clear Area Procedure, IBF Installed')),
 '4F-4':(1147,dict(kind='rto',rfm='S12-F21',title='Clear Area Procedure RTO Distance')),
 '4F-5':(1149,dict(kind='rto',rfm='S12-F23',title='Clear Area Procedure RTO Distance, EAPS OFF')),
 '4F-6':(1151,dict(kind='rto',rfm='S12-F25',title='Clear Area Procedure RTO Distance, EAPS ON')),
 '4F-6A':(1153,dict(kind='rto',rfm='S12-F26A',title='Clear Area Procedure RTO Distance, IBF Installed')),
 '4F-7':(1155,dict(kind='cto',rfm='S12-F27',title='Clear Area Procedure CTO Distance OEI')),
 '4F-8':(1157,dict(kind='cto',rfm='S12-F29',title='Clear Area Procedure CTO Distance OEI, EAPS OFF')),
 '4F-9':(1159,dict(kind='cto',rfm='S12-F31',title='Clear Area Procedure CTO Distance OEI, EAPS ON')),
 '4F-9A':(1161,dict(kind='cto',rfm='S12-F32A',title='Clear Area Procedure CTO Distance OEI, IBF Installed')),
}
if __name__=='__main__':
    sel=sys.argv[1].split(',') if len(sys.argv)>1 else list(CFG)
    out={}
    for f in sel:
        n,c=CFG[f]; r=extract(n,f,c); out[f]=r
        print(f,'PA',{k:round(v,3) for k,v in r['pa'].items()},'D',{k:round(v,3) for k,v in r['dist'].items()},'C',{k:round(v,4) for k,v in r['corr'].items()})
        print('  oat',[(o['v'],len(o['pts'])) for o in r['oat']],'gw',[(o['v'],len(o['pts'])) for o in r['gw']],'maxoat',r['maxOat'] and len(r['maxOat']),'ref',len(r['ref']),'L',r['L'],'C',r['C'],'R',r['R'],r['yTop'],r['yBot'])
    json.dump(out,open(sys.argv[2] if len(sys.argv)>2 else 'rca.json','w'))
