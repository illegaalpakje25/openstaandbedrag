const { randomUUID } = require('node:crypto');
const authorized = require('../lib/authorized');
const limits = new Map();
const maxBytes = 2 * 1024 * 1024;
const validPath = value => typeof value === 'string' && /^photos\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(value);
function parsePhoto(value) {
  if (typeof value !== 'string' || value.length > Math.ceil(maxBytes * 4 / 3) + 100) return null;
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return null;
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > maxBytes) return null;
  const type = match[1];
  const valid = type === 'jpeg' ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 : type === 'png' ? buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : buffer.subarray(0,4).toString() === 'RIFF' && buffer.subarray(8,12).toString() === 'WEBP';
  return valid ? { buffer, type, extension: type === 'jpeg' ? 'jpg' : type } : null;
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET','POST','DELETE'].includes(req.method)) { res.setHeader('Allow','GET, POST, DELETE'); return res.status(405).json({ error: 'Niet toegestaan.' }); }
  // Only the upload action is available to visitors. Reading and deleting require an admin session.
  if (req.method !== 'POST' && !authorized(req)) return res.status(401).json({ error: 'Log in om foto’s te bekijken.' });
  if (req.method !== 'GET' && req.headers.origin !== `https://${req.headers.host}`) return res.status(403).json({ error: 'Alleen uploads vanaf deze website zijn toegestaan.' });
  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Ongeldig uploadverzoek.' }); } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Ongeldig uploadverzoek.' });
  let photo;
  if (req.method === 'POST') {
    if (body.consent !== true) return res.status(400).json({ error: 'De bezoeker moet het opslaan van deze foto expliciet bevestigen.' });
    photo = parsePhoto(body.image);
    if (!photo) return res.status(400).json({ error: 'Stuur een geldige JPEG-, PNG- of WebP-foto van maximaal 2 MB als data-URL.' });
    const now = Date.now();
    for (const [ip, limit] of limits) if (limit.until < now) limits.delete(ip);
    const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0];
    const limit = limits.get(ip) || { count: 0, until: now + 600000 };
    if (limit.count >= 10) return res.status(429).json({ error: 'Uploadlimiet bereikt. Probeer over 10 minuten opnieuw.' });
    limit.count++; limits.set(ip, limit);
  }
  if (!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)) return res.status(503).json({ error: 'Foto-opslag is nog niet gekoppeld.' });
  try {
    const { put, get, list, del } = await import('@vercel/blob');
    if (req.method === 'POST') {
      const pathname = `photos/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${photo.extension}`;
      await put(pathname, photo.buffer, { access: 'private', addRandomSuffix: false, contentType: `image/${photo.type}` });
      return res.status(201).json({ ok: true, id: pathname, message: 'De foto is opgeslagen en kan door de beheerder worden bekeken.' });
    }
    if (req.method === 'DELETE') {
      if (!validPath(body.id)) return res.status(400).json({ error: 'Ongeldige foto.' });
      await del(body.id);
      return res.status(200).json({ ok: true });
    }
    if (req.query?.id) {
      if (!validPath(req.query.id)) return res.status(400).json({ error: 'Ongeldige foto.' });
      const result = await get(req.query.id, { access: 'private', useCache: false });
      if (!result) return res.status(404).json({ error: 'Foto niet gevonden.' });
      res.setHeader('Content-Type', result.blob.contentType);
      const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
      return res.status(200).send(buffer);
    }
    const cursor = typeof req.query?.cursor === 'string' ? req.query.cursor : undefined;
    const result = await list({ prefix: 'photos/', limit: 24, cursor });
    return res.status(200).json({ photos: result.blobs.filter(blob => validPath(blob.pathname)).map(blob => ({ id: blob.pathname, uploadedAt: blob.uploadedAt, size: blob.size, url: `/api/photos?id=${encodeURIComponent(blob.pathname)}` })), cursor: result.hasMore ? result.cursor : null });
  } catch { return res.status(503).json({ error: 'Foto-opslag tijdelijk niet bereikbaar. Probeer opnieuw.' }); }
};
