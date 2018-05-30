import Nanobus from 'nanobus';
import Keychain from './keychain';
import { bytes } from './utils';
import { metadata, downloadFile } from './api';

export default class FileReceiver extends Nanobus {
  constructor(fileInfo) {
    super('FileReceiver');
    this.fileInfo = fileInfo;
    this.reset();
  }

  get progressRatio() {
    return this.progress[0] / this.progress[1];
  }

  get progressIndefinite() {
    return this.state !== 'downloading';
  }

  get sizes() {
    return {
      partialSize: bytes(this.progress[0]),
      totalSize: bytes(this.progress[1])
    };
  }

  cancel() {
    if (this.downloadRequest) {
      this.downloadRequest.cancel();
    }
  }

  reset() {
    this.msg = 'fileSizeProgress';
    this.state = 'initialized';
    this.progress = [0, 1];
  }

  async getMetadata(password) {
    const meta = await metadata(this.fileInfo.id, password);
    this.fileInfo.name = meta.name;
    this.fileInfo.type = meta.type;
    this.fileInfo.size = meta.size;
    this.state = 'ready';
  }

  async download(noSave = false) {
    this.state = 'downloading';
    this.downloadRequest = await downloadFile(this.fileInfo.id, p => {
      this.progress = p;
      this.emit('progress');
    });
    try {
      const plaintext = await this.downloadRequest.result;
      if (!noSave) {
        await saveFile({
          plaintext,
          name: decodeURIComponent(this.fileInfo.name),
          type: this.fileInfo.type
        });
      }
      this.msg = 'downloadFinish';
      this.state = 'complete';
    } catch (e) {
      this.downloadRequest = null;
      throw e;
    }
  }
}

async function saveFile(file) {
  return new Promise(function(resolve, reject) {
    const dataView = new DataView(file.plaintext);
    const blob = new Blob([dataView], { type: file.type });

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, file.name);
      return resolve();
    } else if (/iPhone|fxios/i.test(navigator.userAgent)) {
      // This method is much slower but createObjectURL
      // is buggy on iOS
      const reader = new FileReader();
      reader.addEventListener('loadend', function() {
        if (reader.error) {
          return reject(reader.error);
        }
        if (reader.result) {
          const a = document.createElement('a');
          a.href = reader.result;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
        }
        resolve();
      });
      reader.readAsDataURL(blob);
    } else {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setTimeout(resolve, 100);
    }
  });
}
