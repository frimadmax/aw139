import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image, ImageDraw
Z=2; d=json.load(open(sys.argv[1])); out=sys.argv[2]
for fig,o in d.items():
    p=page(o['page']); pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z)); im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); dr=ImageDraw.Draw(im)
    L=lambda pts,col,w=2: dr.line([(x*Z,y*Z) for x,y in pts],fill=col,width=w)
    for c in o['oat']: L(c['pts'],(255,0,0)); x,y=c['pts'][0]; dr.text((x*Z-20,y*Z),str(c['v']),fill=(255,0,0))
    for c in o['gw']: L(c['pts'],(255,0,255)); x,y=c['pts'][-1]; dr.text((x*Z+3,y*Z),str(c['v']),fill=(255,0,255))
    if o['maxOat']: L(o['maxOat'],(0,170,0),3)
    L(o['ref'],(255,140,0),3)
    im.save(f'{out}/ovr_{fig}.png')
