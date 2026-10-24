import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image,ImageDraw
D=json.load(open('cl_ldg.json')); Z=2
out=sys.argv[1]
for f in sys.argv[2].split(','):
    c=D[f]; p=page(c['page']); pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z)); im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); dr=ImageDraw.Draw(im)
    for o in c['oat']:
        dr.line([(x*Z,y*Z) for x,y in o['pts']],fill=(255,0,0),width=2); x,y=o['pts'][0]; dr.text((x*Z+3,y*Z-12),str(o['v']),fill=(255,0,0))
    for g in c['gw']:
        dr.line([(x*Z,y*Z) for x,y in g['pts']],fill=(0,170,0),width=2); x,y=min(g['pts'],key=lambda p:p[1]); dr.text((x*Z+3,y*Z+2),str(g['v']),fill=(0,140,0))
    if c['maxOat']: dr.line([(x*Z,y*Z) for x,y in c['maxOat']],fill=(255,0,255),width=3)
    for v in range(-1000,15001,1000):
        x=(v-c['pa']['b'])/c['pa']['a']; dr.line([(x*Z,0),(x*Z,40)],fill=(0,0,255),width=1); dr.text((x*Z,42),str(v//1000),fill=(0,0,255))
    for v in range(0,601,50):
        x=(v-c['dist']['b'])/c['dist']['a']; dr.line([(x*Z,pm.height-60),(x*Z,pm.height)],fill=(0,0,255),width=1); dr.text((x*Z,pm.height-75),str(v),fill=(0,0,255))
    im.save(f'{out}/ov_{f.replace("/","_")}.png')
