/* AeroMax 139 — intermediário do AISWEB (Cloudflare Worker).
 * Guarda a chave da API (segredos AISWEB_KEY e AISWEB_PASS, nunca no código) e libera o acesso só para o app.
 * Rotas:
 *   /rotaer?icao=SBJR   -> XML do ROTAER (area=rotaer)
 *   /cartas?icao=SBJR   -> XML da lista de cartas (area=cartas)
 *   /pdf?url=<link>     -> PDF de uma carta, só de endereços do aisweb.decea.mil.br
 */
const API = 'https://aisweb.decea.mil.br/api/';
const ALLOWED_ORIGINS = ['https://frimadmax.github.io', 'http://localhost:8766'];

function cors(req) {
  const o = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  };
}
const fail = (req, status, msg) => new Response(msg, { status, headers: { ...cors(req), 'Content-Type': 'text/plain; charset=utf-8' } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
    if (req.method !== 'GET') return fail(req, 405, 'Método não permitido');
    const origin = req.headers.get('Origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return fail(req, 403, 'Origem não permitida');
    const url = new URL(req.url);

    if (url.pathname === '/rotaer' || url.pathname === '/cartas') {
      const icao = (url.searchParams.get('icao') || '').toUpperCase();
      if (!/^[A-Z]{4}$/.test(icao)) return fail(req, 400, 'ICAO inválido');
      const q = new URLSearchParams({ apiKey: env.AISWEB_KEY, apiPass: env.AISWEB_PASS, area: url.pathname.slice(1), icaoCode: icao });
      if (url.pathname === '/cartas') q.set('tipo', 'ADC');
      const r = await fetch(`${API}?${q}`, { cf: { cacheTtl: 3600 } });
      return new Response(r.body, { status: r.status, headers: { ...cors(req), 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' } });
    }

    if (url.pathname === '/pdf') {
      let target;
      try { target = new URL(url.searchParams.get('url') || ''); } catch { return fail(req, 400, 'Link inválido'); }
      if (target.protocol !== 'https:' || target.hostname !== 'aisweb.decea.mil.br') return fail(req, 400, 'Só cartas do AISWEB');
      const r = await fetch(target.toString(), { cf: { cacheTtl: 86400 } });
      return new Response(r.body, { status: r.status, headers: { ...cors(req), 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' } });
    }

    return fail(req, 404, 'Rota não encontrada');
  },
};
