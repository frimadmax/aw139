# Fig. 4A-13 (pág. 915): o PDF Rev 30 desenha por cima uma cópia da carta de 6000 kg (4A-12).
# A carta de 6400 kg (ICN ...12324, issue B) está por baixo; este script remove a cópia sobreposta.
import pymupdf,re
src=pymupdf.open('/mnt/project-files/AW 139 RFM REV 30.pdf')
d=pymupdf.open(); d.insert_pdf(src,from_page=914,to_page=914)
p=d[0]; x=p.get_contents()[0]; s=d.xref_stream(x).decode('latin1')
assert s[29687:29700].startswith('q\n158.7') and s[54295:54310].startswith('q\n158.7')
d.update_stream(x,(s[:29687]+s[54295:]).encode('latin1')); d.save('p915_6400.pdf')
