class Metadata {
  constructor(obj) {
    this.dl = +obj.dl || 0;
    this.dlimit = +obj.dlimit || 1;
    this.pwd = obj.pwd;
    this.filename = obj.filename;
    this.type = obj.type;
  }
}

module.exports = Metadata;
