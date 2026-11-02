const crypto = require('node:crypto');
const attempts = new Map();
function equal(a, b) { const hash = value => crypto.createHash('sha256').update(value).digest(); return crypto.timingSafeEqual(hash(a), hash(b)); }
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET || password;
  if (!password) return res.status(503).json({ error: 'De beheerlogin is nog niet ingesteld. Stel ADMIN_PASSWORD in Vercel in.' });
  const sign = value => crypto.createHmac('sha256', secret).update(value).digest('base64url');
  const cookie = (value, age) => res.setHeader('Set-Cookie', `portal_session=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`);
  if (req.method === 'POST') {
    const origin = req.headers.origin;
    if (!origin || origin !== `https://${req.headers.host}`) return res.status(403).json({ error: 'Ongeldig verzoek.' });
    const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
    if (body.action === 'logout') { cookie('', 0); return res.status(200).json({ ok: true }); }
    const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0];
    const now = Date.now();
    for (const [key, item] of attempts) if (item.until < now) attempts.delete(key);
    const limit = attempts.get(ip) || { count: 0, until: now + 900000 };
    if (limit.count >= 5) return res.status(429).json({ error: 'Te veel pogingen. Probeer het over 15 minuten opnieuw.' });
    if (typeof body.username !== 'string' || typeof body.password !== 'string' || body.password.length > 1024 || !equal(body.username, 'admin1') || !equal(body.password, password)) {
      limit.count++; attempts.set(ip, limit);
      return res.status(401).json({ error: 'Gebruikersnaam of wachtwoord is onjuist.' });
    }
    attempts.delete(ip);
    const payload = Buffer.from(JSON.stringify({ user: 'admin1', expires: now + 3600000 })).toString('base64url');
    cookie(`${payload}.${sign(payload)}`, 3600);
    return res.status(200).json({ ok: true });
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Niet toegestaan.' }); }
  const token = String(req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('portal_session='))?.slice(15) || '';
  const [payload, signature] = token.split('.');
  try {
    if (!payload || !signature || !equal(signature, sign(payload))) throw new Error();
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (session.user !== 'admin1' || session.expires <= Date.now()) throw new Error();
  } catch { return res.status(401).json({ error: 'Log in om verder te gaan.' }); }
  return res.status(200).json({ username: 'admin1', amount: '€ 1.543,34', invoice: 'FAC-2026-001', status: 'Openstaand', description: 'Dienstverlening' });
};
