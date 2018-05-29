class Metadata {
  constructor(obj) {
    this.dl = +obj.dl || 0;
    this.dlimit = +obj.dlimit || 1;
    this.pwd = String(obj.pwd) === 'true';
    this.filename = obj.filename;
    this.type = obj.type;
  }
}

module.exports = Metadata;
