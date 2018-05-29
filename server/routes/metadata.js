const storage = require('../storage');

module.exports = async function(req, res) {
  const id = req.params.id;
  try {
    const metadata = await storage.metadata(id);
    const size = await storage.length(metadata);
    const ttl = await storage.ttl(id);
    res.send({
      finalDownload: metadata.dl + 1 === metadata.dlimit,
      size,
      ttl,
      name: metadata.filename,
      type: metadata.type
    });
  } catch (e) {
    res.sendStatus(404);
  }
};
