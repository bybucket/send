const crypto = require('crypto');
const storage = require('../storage');
const config = require('../config');
const mozlog = require('../log');

const log = mozlog('send.upload');

module.exports = function(req, res) {
  const newId = crypto.randomBytes(5).toString('hex');

  const metadata = req.body;
  const auth = req.header('Authorization');

  if (!metadata || !auth) {
    return res.sendStatus(400);
  }

  /**
   * metadata should be like {
   *    filename: 'a.txt',
   *    lastModified: 151111111,
   *    size: 312
   * }
   */
  const owner = crypto.randomBytes(10).toString('hex');
  const meta = {
    owner,
    metadata,
    auth: auth.split(' ')[1],
    nonce: crypto.randomBytes(16).toString('base64')
  };

  (async ({ filename }) => {
    await storage.set(newId, filename, meta);
    const protocol = config.env === 'production' ? 'https' : req.protocol;
    const url = `${protocol}://${req.get('host')}/download/${newId}/`;
    res.set('WWW-Authenticate', `send-v1 ${meta.nonce}`);
    res.json({
      url,
      owner: meta.owner,
      id: newId
    });
  })(metadata);
};
