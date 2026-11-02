const authenticate = require('../api/auth');
module.exports = function authorized(req) {
  let status = 0;
  authenticate({ ...req, method: 'GET' }, { setHeader() {}, status(code) { status = code; return this; }, json() {} });
  return status === 200;
};
