# Desenha a extração do Power Check sobre a página (conferência visual).
import sys,json; sys.path.insert(0,'.')
from lib import *; from PIL import Image,ImageDraw
D=json.load(open('pwc.json')); Z=2
for k,o in D.items():
    p=pymupdf.open(o['srcPdf'])[0] if o.get('srcPdf') else page(o['page'])
    pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z)); im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples); dr=ImageDraw.Draw(im)
    for fam,col in (('hp','red'),('oatItt','green'),('oatNg','magenta')):
        for c in o[fam]:
            pts=[(x*Z,y*Z) for x,y in c['pts']]; dr.line(pts,fill=col,width=2)
            x,y=pts[-1] if fam=='hp' else pts[0]; dr.text((x+3,y-14),str(c['v']),fill=col)
    im.save(sys.argv[1]+f'/ov_{k}.png')
