import sys,json; sys.path.insert(0,'.')
from lib import *
from PIL import Image
OUT=sys.argv[1] if len(sys.argv)>1 else '/home/claude/aw139/shortfield'
VAR=sys.argv[2] if len(sys.argv)>2 else 'SF_CHARTS'
FILES=sys.argv[3].split(',') if len(sys.argv)>3 else ['wat.json','rto.json','cto.json']
JS=sys.argv[4] if len(sys.argv)>4 else 'sf-data.js'
import os; os.makedirs(OUT+'/charts',exist_ok=True)
data={}
for f in FILES: data.update(json.load(open(f)))
Z=2.5
for fig,o in data.items():
    p=pymupdf.open(o.pop('srcPdf'))[0] if o.get('srcPdf') else page(o['page']); T,P=disp(p); W,H=p.rect.width,p.rect.height
    M=p.rotation_matrix; xs=[];ys=[]
    for d in p.get_drawings():
        r=d['rect']*M
        if r.y0>75 and r.y1<H-55 and r.width<W*0.95 and not (r.width<4 and r.height>150):
            xs+=[r.x0,r.x1]; ys+=[r.y0,r.y1]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            for sp in l['spans']:
                if not sp['text'].strip() or 'Printed' in sp['text'] or 'contractually' in sp['text']: continue
                r=pymupdf.Rect(sp['bbox'])*M
                if r.y0>75 and r.y1<H-40: xs+=[r.x0,r.x1]; ys+=[r.y0,r.y1]
    x0,x1,y0,y1=min(xs)-8,max(xs)+8,min(ys)-8,max(ys)+8
    x0=max(0,x0); x1=min(W,x1); y0=max(0,y0); y1=min(H,y1)
    clip=pymupdf.Rect(x0,y0,x1,y1)
    # clip in displayed coords -> pixmap of full page then crop
    pm=p.get_pixmap(matrix=pymupdf.Matrix(Z,Z))
    im=Image.frombytes('RGB',(pm.width,pm.height),pm.samples).crop((int(x0*Z),int(y0*Z),int(x1*Z),int(y1*Z)))
    fn=f'charts/{fig}.webp'; im.save(OUT+'/'+fn,'WEBP',quality=82,method=6)
    o['img']=dict(src=fn,box=[round(x0,2),round(y0,2),round(x1-x0,2),round(y1-y0,2)])
    for k in ('labelcheck','bad','gRight'): o.pop(k,None)
    for k in ('pa','w','hw','dist','corr','g','hl'):
        if o.get(k): o[k]={'a':o[k]['a'],'b':o[k]['b']}
    print(fig,o['img'],os.path.getsize(OUT+'/'+fn)//1024,'KB')
js='/* Dados digitalizados (vetoriais) das cartas do RFM AW139 Rev 30, Suplemento 12.\n   Coordenadas em pontos PDF do quadro exibido da pagina. Gerado automaticamente. */\nwindow.'+VAR+'='+json.dumps(data,separators=(',',':'))+';\n'
open(OUT+'/'+JS,'w').write(js); print(len(js)//1024,'KB data')
