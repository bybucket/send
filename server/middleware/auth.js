const crypto = require('crypto');
const storage = require('../storage');

module.exports = async function(req, res, next) {
  const id = req.params.id;
  const metadata = await storage.metadata(id);

  req.authorized = true;
  if (id && metadata) {
    if (metadata.pwd && req.header('Authorization')) {
      const pwd = req.header('Authorization');
      if (metadata.pwd !== pwd) {
        req.authorized = false;
      }
    }
  }
  if (req.authorized) {
    next();
  } else {
    res.sendStatus(401);
  }
};
