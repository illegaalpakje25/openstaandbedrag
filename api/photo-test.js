const authorized = require('../lib/authorized');
const savePhoto = require('./photos');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!authorized(req)) return res.status(401).json({ error: 'Log in als beheerder om de cameratest te gebruiken.' });
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Niet toegestaan.' }); }
  return savePhoto(req, res);
};
