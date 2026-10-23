# Power Assurance Check (NR 102%): Supl. 12 Fig. 4K-2 (S12-K7, sem IBF/EAPS), Fig. 4K-3 (S12-K9, EAPS ON),
# Supl. 86 Fig. 4-1A (S86-16A, IBF). Leitura: TQ (topo) -> desce até a linha de Hp -> direita até a OAT
# no painel ITT (sobe: ITT máxima) e no painel NG (sobe: NG máximo).
# mkclean() remove o exemplo tracejado vermelho do RFM (gera pwc_<pág>.pdf); a extração usa a página original.
import sys,json,re; sys.path.insert(0,'.')
from lib import *; from grid import *; from geo import *
from ex_wat import lin,num
CHARTS=[(1331,'NONE','4K-2','S12-K7','Power Assurance Check (NR 102%) — IBF/EAPS not installed',list(range(-1000,14001,1000)),list(range(-40,51,10))),
        (1333,'EAPS','4K-3','S12-K9','Power Assurance Check (NR 102%) — EAPS installed, EAPS ON',list(range(-1000,14001,1000)),list(range(-40,51,10))),
        (3133,'IBF','S86-4-1A','S86-16A','Power Assurance Chart IBF Installed (NR 102%)',list(range(-1000,10001,1000)),list(range(-50,51,10)))]
def mkclean(n):
    src=pymupdf.open('/mnt/project-files/AW 139 RFM REV 30.pdf')
    d=pymupdf.open(); d.insert_pdf(src,from_page=n-1,to_page=n-1)
    p=d[0]; x=p.get_contents()[0]; s=d.xref_stream(x).decode('latin1')
    s2,k=re.subn(r'q\n0\.921569 0\.172549 0\.176471 (?:RG|rg)\n.*?\nQ\n','',s,flags=re.S)
    if not k: return None
    d.update_stream(x,s2.encode('latin1')); fn=f'pwc_{n}.pdf'; d.save(fn); print(n,'exemplo removido:',k,'blocos'); return fn
def xsort(c,yb): return x_at_y(sorted(c,key=lambda p:p[1]),yb)
def extract(n,key,fig,rfm,title,pas,oats):
    p=page(n); T,P=disp(p); H,V=gridcoords_disp(p,100)
    cv=[q['pts'] for q in P if 0.9<=q['w']<1.0 and q['c'] and q['c'][2]>0.5 and len(q['pts'])>=2]
    nums=[(num(t),x,y) for t,x,y in T if num(t) is not None and 225<y<245]
    tqL=[(snap(x,V,3) or x,v) for v,x,y in nums if 89<v<106 and x<280]
    ittL=[(snap(x,V,3) or x,v) for v,x,y in nums if v>=500 and x<560]
    ngL=[(snap(x,V,3) or x,v) for v,x,y in nums if x>540]
    TQ,ITT,NG=lin(tqL),lin(ittL),lin(ngL)
    xb1=max(x for x,v in tqL)+2; xb2=max(x for x,v in ittL)+25
    pa=[c for c in cv if max(pt[0] for pt in c)<xb1+3]
    it=[c for c in cv if min(pt[0] for pt in c)>xb1 and max(pt[0] for pt in c)<xb2]
    ng=[c for c in cv if min(pt[0] for pt in c)>xb2]
    assert len(pa)==len(pas) and len(it)==len(oats) and len(ng)==len(oats),(len(pa),len(it),len(ng))
    pa=[sorted(c) for c in pa]; pa.sort(key=lambda c:-c[0][1])            # de baixo (menor Hp) para cima
    yb=max(pt[1] for c in it for pt in c)-1
    it=[sorted(c,key=lambda p:-p[1]) for c in it]; it.sort(key=lambda c:xsort(c,yb))
    ng=[sorted(c,key=lambda p:-p[1]) for c in ng]; ng.sort(key=lambda c:xsort(c,yb))
    o=dict(fig=fig,page=n,rfmPage=rfm,title=title,tq=TQ,itt=ITT,ng=NG,
        hp=[dict(v=v,pts=clean(c)) for v,c in zip(pas,pa)],
        oatItt=[dict(v=v,pts=clean(c)) for v,c in zip(oats,it)],
        oatNg=[dict(v=v,pts=clean(c)) for v,c in zip(oats,ng)])
    ys=[pt[1] for c in cv for pt in c]; xs=[pt[0] for c in cv for pt in c]
    o['crop']=[min(xs)-14,min(ys)-30,max(xs)+12,max(ys)+44]   # painéis + títulos dos eixos + legenda da figura
    f=mkclean(n)
    if f: o['srcPdf']=f
    return key,o
if __name__=='__main__':
    out={}
    for a in CHARTS:
        k,o=extract(*a); out[k]=o
        print(k,o['fig'],{q:{kk:round(vv,4) for kk,vv in o[q].items()} for q in ('tq','itt','ng')})
    json.dump(out,open('pwc.json','w'))
