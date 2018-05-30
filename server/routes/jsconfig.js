const config = require('../config');

/* eslint-disable no-useless-escape */
const jsconfig = `
var isIE = /trident\\\/7\.|msie/i.test(navigator.userAgent);
var isUnsupportedPage = /\\\/unsupported/.test(location.pathname);
if (isIE && !isUnsupportedPage) {
  window.location.replace('/unsupported/ie');
}
var MAXFILESIZE = ${config.max_file_size};
var EXPIRE_SECONDS = ${config.expire_seconds};
`;

module.exports = function(req, res) {
  res.set('Content-Type', 'application/javascript');
  res.send(jsconfig);
};
