import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image, ImageDraw
Z=2.2; data=json.load(open(sys.argv[2] if len(sys.argv)>2 else 'vt_p1.json'))
cols=[(255,0,0),(255,128,0),(200,180,0),(0,170,0),(0,170,170),(0,0,255),(128,0,255),(255,0,255),(120,60,0),(90,90,90)]
for fig in sys.argv[1].split(','):
    o=data[fig]; p=page(o['page']); pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z))
    im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); d=ImageDraw.Draw(im)
    for i,c in enumerate(o['oat']):
        d.line([(x*Z,y*Z) for x,y in c['pts']],fill=cols[i],width=3); x,y=c['pts'][-1]; d.text((x*Z-10,y*Z-14),str(c['v']),fill=cols[i])
    if o['maxOat']: d.line([(x*Z,y*Z) for x,y in o['maxOat']],fill=(0,160,255),width=4)
    for g in o['guides']: d.line([(x*Z,y*Z) for x,y in g['pts']],fill=(255,0,200),width=2); d.text((g['pts'][-1][0]*Z,g['pts'][-1][1]*Z+2),str(g['v']),fill=(255,0,200))
    for v in (0,5,10,15,20):
        y=(v*1 - o['hw']['b'])/o['hw']['a']; d.line([(60*Z,y*Z),(80*Z,y*Z)],fill=(0,200,0),width=2)
    for v in range(-1,16):
        y=(v*1000-o['pa']['b'])/o['pa']['a']; d.line([(60*Z,y*Z),(75*Z,y*Z)],fill=(255,0,0),width=2)
    for v in range(0,int(o.get('gMax',70))+1,10):
        x=(v-o['g']['b'])/o['g']['a']; d.line([(x*Z,520*Z),(x*Z,530*Z)],fill=(255,0,0),width=2)
    im.crop((40*Z,150*Z,380*Z,540*Z)).save(f'ovp_{fig}.png')
