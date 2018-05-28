// const fs = require('fs');
// const path = require('path');
// const config = require('../config');

module.exports = function(req, res) {
  // const filepath = path.resolve(config.file_dir, req.body.filename);
  // const limit = req.body.limit || 1;
  // const expire = req.body.expire || 3600;

  res.json({
    code: 0,
    message: '',
    data: {}
  });
};
