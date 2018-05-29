const storage = require('../storage');
const mozlog = require('../log');
const log = mozlog('send.download');

module.exports = async function(req, res) {
  const id = req.params.id;
  const meta = await storage.metadata(id);
  try {
    const contentLength = await storage.length(meta);
    res.writeHead(200, {
      'Content-Disposition': 'attachment',
      'Content-Type': 'application/octet-stream',
      'Content-Length': contentLength
    });
    const file_stream = storage.get(meta);

    file_stream.on('end', async () => {
      const dl = meta.dl + 1;
      const dlimit = meta.dlimit;
      try {
        if (dl >= dlimit) {
          await storage.del(id);
        } else {
          await storage.setField(id, 'dl', dl);
        }
      } catch (e) {
        log.info('StorageError:', id);
      }
    });
    file_stream.pipe(res);
  } catch (e) {
    res.sendStatus(404);
  }
};
