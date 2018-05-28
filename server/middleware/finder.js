const fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = function(req, res, next) {
  const filename = req.body.filename;
  if (filename) {
    const filepath = path.resolve(config.file_dir, filename);
    if (fs.existsSync(filepath)) {
      next();
    } else {
      res.json({
        code: 404,
        message: `file ${filename} not found`
      });
    }
  } else {
    res.sendStatus(400);
  }
};
