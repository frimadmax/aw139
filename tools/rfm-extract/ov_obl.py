import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image,ImageDraw
D=json.load(open('obl.json')); Z=2
out=sys.argv[1]
for f in sys.argv[2].split(','):
    c=D[f]; p=page(c['page']); pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z)); im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); dr=ImageDraw.Draw(im)
    for o in c['hp']:
        dr.line([(x*Z,y*Z) for x,y in o['pts']],fill=(255,0,0),width=2); x,y=o['pts'][0]; dr.text((x*Z+3,y*Z-12),str(o['v']),fill=(255,0,0))
    for g in c['gw']:
        dr.line([(x*Z,y*Z) for x,y in g['pts']],fill=(0,170,0),width=2); x,y=max(g['pts'],key=lambda p:p[1]); dr.text((x*Z+3,y*Z+2),str(g['v']),fill=(0,140,0))
    for v in range(-40,51,10):
        x=(v-c['oatAx']['b'])/c['oatAx']['a']; dr.line([(x*Z,0),(x*Z,40)],fill=(0,0,255),width=1); dr.text((x*Z,42),str(v),fill=(0,0,255))
    for v in range(0,701,50):
        x=(v-c['dist']['b'])/c['dist']['a']; dr.line([(x*Z,pm.height-60),(x*Z,pm.height)],fill=(0,0,255),width=1); dr.text((x*Z,pm.height-75),str(v),fill=(0,0,255))
    for r in (c['frameL'],c['frameR']): dr.rectangle([r[0]*Z,r[1]*Z,r[2]*Z,r[3]*Z],outline=(255,0,255))
    im.save(f'{out}/ov_{f}.png')
