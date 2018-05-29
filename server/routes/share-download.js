const crypto = require('crypto');
const storage = require('../storage');
const config = require('../config');
const mozlog = require('../log');

const log = mozlog('send.shareDl');

module.exports = async function(req, res) {
  const { fileId } = req.params;
  const { hasPasswd, ttl, dLimit, passwd } = await storage.get(fileId);

  if (hasPasswd && passwd !== req.params.passwd) {
    return res.json({
      msg: 'password wrong'
    });
  }

  if (ttl <= 0) {
    return res.json({
      msg: 'expired'
    });
  }
  if (dLimit <= 0) {
    return res.json({
      msg: 'expired'
    });
  }

  /**
   * metadata should be like {
   *    fileName: 'a.txt',
   *    dLimit: 5,
   *    hasPasswd: false,
   *    passwd: 111
   *    ttl: 111111,
   * }
   */

  res.writeHead(200, {
    'Content-Disposition': 'attachment',
    'Content-Type': 'application/octet-stream',
    'Content-Length': contentLength
  });

  const file_stream = storage.get(id);

  file_stream.on('end', async () => {
    if (dlimit === 0) {
      await storage.del(id);
    }
  });

  file_stream.pipe(res);
};
