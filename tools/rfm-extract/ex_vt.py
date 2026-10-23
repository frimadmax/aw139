import sys,json; sys.path.insert(0,'.')
from ex_bu import run
import ex_cto
if __name__=='__main__':
    run({'4A-3':(902,'S12-A30','Ground and Elevated Heliport/Helideck Vertical Procedure Weight Limitations',True),
         '4A-4':(903,'S12-A31','Ground and Elevated Heliport/Helideck Vertical Procedure Weight Limitations, EAPS OFF',True),
         '4A-5':(904,'S12-A32','Ground and Elevated Heliport/Helideck Vertical Procedure Weight Limitations, EAPS ON',True),
         '4A-5A':(905,'S12-A32A','Ground and Elevated Heliport/Helideck Vertical Procedure Weight Limitations, IBF Installed',False)},'vt_wat.json')
    o=ex_cto.extract(907,'4A-6','S12-A33','Heliport CTO Distance OEI, Clean, EAPS ON/OFF')
    for k in ('pa','dist','corr'): print(k,{a:round(b,4) for a,b in o[k].items()})
    print([(c['v'],c['pts'][0]) for c in o['oat']]); print([(c['v'],c['pts'][0],c['pts'][-1]) for c in o['gw']]); print(o['ref'])
    json.dump({o['fig']:o},open('vt_cto.json','w'))
