const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');
const config = require('../config');
const storage = require('../storage');

module.exports = function(req, res) {
  const filename = req.body.filename;
  const dlimit = req.body.limit || 1;
  const pwd = req.body.pwd || '';
  const ttl = req.body.ttl;

  const filepath = path.resolve(config.file_dir, filename);
  const type = mime.lookup(filepath);

  const metadata = { filename, dlimit, pwd, type };

  const newId = crypto.randomBytes(5).toString('hex');

  // save metadata
  storage.set(newId, metadata, ttl);

  const url = `${req.protocol}://${req.get('host')}/download/${newId}/`;
  res.json({
    code: 0,
    message: '',
    data: { url }
  });
};
