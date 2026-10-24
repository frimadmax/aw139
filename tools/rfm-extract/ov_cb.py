import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image,ImageDraw
D=json.load(open('cb.json')); Z=2
out=sys.argv[1]
for f in sys.argv[2].split(','):
    c=D[f]; p=page(c['page']); pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z)); im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); dr=ImageDraw.Draw(im)
    for o in c['oat']:
        dr.line([(x*Z,y*Z) for x,y in o['pts']],fill=(255,0,0),width=2); x,y=o['pts'][0]; dr.text((x*Z-28,y*Z-6),str(o['v']),fill=(255,0,0))
    if c['maxOat']: dr.line([(x*Z,y*Z) for x,y in c['maxOat']],fill=(255,0,255),width=3)
    for pn in c['panels']:
        for g in pn['gw']:
            dr.line([(x*Z,y*Z) for x,y in g['pts']],fill=(0,170,0),width=2); x,y=max(g['pts'],key=lambda p:p[1]) if pn['k']!='br' else max(g['pts'],key=lambda p:p[0]); dr.text((x*Z+2,y*Z-10 if pn['k']=='br' else y*Z+2),str(g['v']),fill=(0,120,0))
        a=pn['dist']
        for v in range(0,401,10):
            x=(v-a['b'])/a['a']
            if pn['box'][0]-1<=x<=pn['box'][2]+1: dr.line([(x*Z,pn['box'][3]*Z),(x*Z,pn['box'][3]*Z+(14 if v%50==0 else 6))],fill=(0,0,255),width=1)
    for v in range(-1000,14001,1000):
        x=(v-c['pa']['b'])/c['pa']['a']
        if c['left'][0]-1<=x<=c['left'][2]+1: dr.line([(x*Z,c['left'][3]*Z),(x*Z,c['left'][3]*Z+14)],fill=(0,0,255),width=2)
    im.save(f'{out}/ov_cb_{f}.png')
