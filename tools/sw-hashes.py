# Atualiza sw.js: hash de cada arquivo do PRECACHE (HASHES) e CACHE_NAME derivado deles.
# Rodar antes de cada commit que muda arquivos do site:  python3 tools/sw-hashes.py
# Na atualização, o service worker copia do cache anterior os arquivos com o mesmo hash
# e só baixa da internet o que mudou.
import re, hashlib, os, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fn = os.path.join(ROOT, 'sw.js'); s = open(fn).read()
urls = re.findall(r'"(\./[^"]*)"', s[s.index('const PRECACHE'):s.index('];', s.index('const PRECACHE'))])
hashes = {}; missing = []
for u in dict.fromkeys(urls):
    if u == './sw.js': continue   # o próprio sw.js muda a cada geração; é sempre baixado
    p = os.path.join(ROOT, u[2:]); p = os.path.join(p, 'index.html') if u.endswith('/') else p
    if not os.path.isfile(p): missing.append(u); continue
    hashes[u] = hashlib.md5(open(p, 'rb').read()).hexdigest()[:10]
if missing: sys.exit('Arquivos do PRECACHE que não existem: ' + ', '.join(missing))
block = 'const HASHES = ' + json.dumps(hashes, separators=(',', ':')) + ';'
if 'const HASHES = ' in s: s = re.sub(r'const HASHES = \{.*?\};', lambda m: block, s, count=1, flags=re.S)
else: s = s.replace('\n];\n', '\n];\n// Gerado por tools/sw-hashes.py.\n' + block + '\n', 1)
ver = hashlib.md5(json.dumps(hashes, sort_keys=True).encode()).hexdigest()[:10]
s = re.sub(r"const CACHE_NAME = '[^']*';", f"const CACHE_NAME = 'aw139-root-{ver}';", s, count=1)
open(fn, 'w').write(s); print('CACHE_NAME aw139-root-' + ver, len(hashes), 'arquivos')
