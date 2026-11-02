const authorized = require('../lib/authorized');
const pathname = 'portal/button-page.json';
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const publicRead = req.method === 'GET' && (req.query?.view === 'page' || req.query?.public === '1');
  if (!publicRead && !authorized(req)) return res.status(401).json({ error: 'Log opnieuw in om uploads te beheren.' });
  const configured = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (!configured) {
    if (publicRead) return res.status(req.query?.view === 'page' ? 404 : 200).json({ active: false });
    return res.status(req.method === 'GET' ? 200 : 503).json({ configured: false, active: false, error: 'Koppel een private Vercel Blob-store via Storage en voer een redeploy uit.' });
  }
  try {
    const { get, put } = await import('@vercel/blob');
    if (req.method === 'GET') {
      const result = await get(pathname, { access: 'private', useCache: false });
      const data = result ? await new Response(result.stream).json() : { active: false };
      if (req.query?.view === 'page') {
        if (!data.active) return res.status(404).send('Er is geen pagina ingesteld.');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        return res.status(200).send(data.html);
      }
      return res.status(200).json({ configured: true, active: !!data.active, filename: data.filename || '', updatedAt: data.updatedAt || null });
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Niet toegestaan.' }); }
    if (req.headers.origin !== `https://${req.headers.host}`) return res.status(403).json({ error: 'Ongeldig verzoek.' });
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Ongeldig bestand.' }); } }
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Ongeldig bestand.' });
    let data;
    if (body.action === 'reset') data = { active: false, updatedAt: new Date().toISOString() };
    else {
      if (typeof body.content !== 'string' || !body.content.trim() || Buffer.byteLength(body.content) > 512000) return res.status(400).json({ error: 'Voeg een bestand met inhoud toe van maximaal 500 KB.' });
      if (typeof body.filename !== 'string' || !/\.(html?|js)$/i.test(body.filename) || body.filename.length > 200) return res.status(400).json({ error: 'Gebruik een .html-, .htm- of .js-bestand. Python kan niet in de browser draaien.' });
      let html = body.content;
      if (/\.js$/i.test(body.filename)) {
        const encoded = Buffer.from(body.content).toString('base64');
        html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pagina</title></head><body><main id="app"></main><script src="data:text/javascript;base64,${encoded}"></script></body></html>`;
      }
      data = { active: true, filename: body.filename, html, updatedAt: new Date().toISOString() };
    }
    await put(pathname, JSON.stringify(data), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
    return res.status(200).json({ ok: true, active: data.active, filename: data.filename || '' });
  } catch {
    return res.status(503).json({ error: 'De uploadopslag is niet bereikbaar. Controleer of een private Blob-store gekoppeld is.' });
  }
};
