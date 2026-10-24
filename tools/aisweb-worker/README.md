# Intermediário do AISWEB (Cloudflare Worker)

O app não chama o AISWEB direto: a chave da API ficaria pública e o AISWEB não aceita chamadas de outro site.
Este Worker guarda a chave e repassa ROTAER, lista de cartas e PDFs só para o app.

## Instalar (uma vez)
1. Cloudflare → Workers & Pages → Create → Create Worker → nome `aeromax-aisweb` → Deploy.
2. Edit code → apague o exemplo → cole o conteúdo de `worker.js` → Deploy.
3. Settings → Variables and Secrets → Add:
   - `AISWEB_KEY` (tipo Secret) = apiKey recebida por e-mail
   - `AISWEB_PASS` (tipo Secret) = apiPass recebida por e-mail
4. Copie o endereço do Worker (ex.: `https://aeromax-aisweb.<sua-conta>.workers.dev`) e mande para o Claude.

## Testar
Abra `https://aeromax-aisweb.<sua-conta>.workers.dev/rotaer?icao=SBJR` no navegador: deve aparecer um XML do ROTAER.
