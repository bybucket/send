const crypto = require('crypto');
const storage = require('../storage');
const config = require('../config');
const mozlog = require('../log');

const log = mozlog('send.sharelink');

module.exports = function(req, res) {
  const newId = crypto.randomBytes(5).toString('hex');

  const metadata = req.body;

  /**
   * metadata should be like {
   *    fileName: 'a.txt',
   *    dLimit: 5,
   *    hasPasswd: false,
   *    passwd: 111
   *    ttl: 111111,
   * }
   */

  (async ({ filename }) => {
    await storage.set(newId, fileName, meta);
    const protocol = config.env === 'production' ? 'https' : req.protocol;
    const url = `${protocol}://${req.get('host')}/download/${newId}/`;
    res.json({
      url,
      id: newId
    });
  })(metadata);
};
