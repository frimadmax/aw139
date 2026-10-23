import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image, ImageDraw
Z=2
data={}
for f in (sys.argv[1].split(',') if len(sys.argv)>1 else ['wat.json','rto.json','cto.json']): data.update(json.load(open(f)))
for fig,o in data.items():
    p=page(o['page']); pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z))
    im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); d=ImageDraw.Draw(im)
    def line(pts,col,w=2):
        d.line([(x*Z,y*Z) for x,y in pts],fill=col,width=w)
    cols={'oat':(255,0,0),'gw':(255,0,255),'tdp':(255,120,0),'guides':(200,0,200)}
    for fam,col in cols.items():
        for c in o.get(fam,[]):
            line(c['pts'],col); x,y=c['pts'][-1]; d.text((x*Z+3,y*Z-6),str(c['v']),fill=col)
    line(o['maxOat'],(0,160,255),3)
    if o.get('hd'): line(o['hd'],(0,200,0),3)
    if o.get('ref'): line(o['ref'],(0,200,0),3)
    im.save(f'ov_{fig}.png')
print('ok')
