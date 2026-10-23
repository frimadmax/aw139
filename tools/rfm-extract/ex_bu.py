import sys,json; sys.path.insert(0,'.')
from ex_wat import extract as wext
from auto import auto_cfg
import ex_cto
def run(spec,outfile):
    out={}
    for fig,(n,rfm,title,kg) in spec.items():
        c=auto_cfg(n); c.update(rfm=rfm,title=title)
        if not kg: c['kg']=False
        r=wext(n,fig,c); out[fig]=r
        print(fig,'PAres',round(r['pa']['resid'],2),'Wres',round(r['w']['resid'],2),'guides',[g['v'] for g in r['guides']],'hd',bool(r['hd']))
    json.dump(out,open(outfile,'w'))
    return out
if __name__=='__main__':
    if sys.argv[1]=='sf':
        o=run({'4B-1':(953,'S12-B19','x',True),'4B-2':(954,'S12-B20','x',True),'4B-3':(955,'S12-B21','x',True),'4B-3A':(956,'S12-B22','x',False)},'chk_sf.json')
        ref=json.load(open('wat.json'))
        for f in o: print(f, o[f]['oat']==ref[f]['oat'], o[f]['guides']==ref[f]['guides'], o[f]['maxOat']==ref[f]['maxOat'])
    else:
        run({'4C-3':(993,'S12-C25','Heliport Back Up Procedure Weight Limitations',True),
             '4C-4':(994,'S12-C26','Heliport Back Up Procedure Weight Limitations, EAPS OFF',True),
             '4C-5':(995,'S12-C27','Heliport Back Up Procedure Weight Limitations, EAPS ON',True),
             '4C-5A':(996,'S12-C28','Heliport Back Up Procedure Weight Limitations, IBF Installed',False)},'bu_wat.json')
