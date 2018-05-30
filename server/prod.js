const express = require('express');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const pages = require('./routes/pages');

const app = express();

routes(app);

app.use(
  express.static(path.resolve(__dirname, '../dist/'), {
    setHeaders: function(res) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.removeHeader('Pragma');
    }
  })
);

app.use(pages.notfound);

app.listen(config.listen_port, config.listen_address);
