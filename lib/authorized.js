const authenticate = require('../api/auth');
module.exports = function authorized(req) {
  let status = 0;
  authenticate({ method: 'GET', headers: req.headers || {} }, { setHeader() {}, status(code) { status = code; return this; }, json() {} });
  return status === 200;
};
