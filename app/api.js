import { arrayToB64, b64ToArray } from './utils';

function post(obj) {
  return {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(obj)
  };
}

function parseNonce(header) {
  header = header || '';
  return header.split(' ')[1];
}

async function fetchWithAuth(url, params) {
  const result = {};
  params = params || {};
  const response = await fetch(url, params);
  result.response = response;
  result.ok = response.ok;
  result.shouldRetry = response.status === 401;
  return result;
}

async function fetchWithAuthAndRetry(url, params) {
  const result = await fetchWithAuth(url, params);
  if (result.shouldRetry) {
    return fetchWithAuth(url, params);
  }
  return result;
}

export async function del(id, owner_token) {
  const response = await fetch(`/api/delete/${id}`, post({ owner_token }));
  return response.ok;
}

export async function setParams(id, owner_token, params) {
  const response = await fetch(
    `/api/params/${id}`,
    post({
      owner_token,
      dlimit: params.dlimit
    })
  );
  return response.ok;
}

export async function fileInfo(id, owner_token) {
  const response = await fetch(`/api/info/${id}`, post({ owner_token }));
  if (response.ok) {
    const obj = await response.json();
    return obj;
  }
  throw new Error(response.status);
}

export async function metadata(id) {
  const result = await fetchWithAuthAndRetry(`/api/metadata/${id}`, {
    method: 'GET'
  });
  if (result.ok) {
    const data = await result.response.json();
    return data;
  }
  throw new Error(result.response.status);
}

export async function setPassword(id, owner_token, keychain) {
  const auth = await keychain.authKeyB64();
  const response = await fetch(
    `/api/password/${id}`,
    post({ owner_token, auth })
  );
  return response.ok;
}

export function uploadFile(
  encrypted,
  metadata,
  verifierB64,
  keychain,
  onprogress
) {
  const xhr = new XMLHttpRequest();
  const upload = {
    cancel: function() {
      xhr.abort();
    },
    result: new Promise(function(resolve, reject) {
      xhr.addEventListener('loadend', function() {
        const authHeader = xhr.getResponseHeader('WWW-Authenticate');
        if (authHeader) {
          keychain.nonce = parseNonce(authHeader);
        }
        if (xhr.status === 200) {
          const responseObj = JSON.parse(xhr.responseText);
          return resolve({
            url: responseObj.url,
            id: responseObj.id,
            ownerToken: responseObj.owner
          });
        }
        reject(new Error(xhr.status));
      });
    })
  };
  const dataView = new DataView(encrypted);
  const blob = new Blob([dataView], { type: 'application/octet-stream' });
  const fd = new FormData();
  fd.append('data', blob);
  xhr.upload.addEventListener('progress', function(event) {
    if (event.lengthComputable) {
      onprogress([event.loaded, event.total]);
    }
  });
  xhr.open('post', '/api/upload', true);
  xhr.setRequestHeader('X-File-Metadata', arrayToB64(new Uint8Array(metadata)));
  xhr.setRequestHeader('Authorization', `send-v1 ${verifierB64}`);
  xhr.send(fd);
  return upload;
}

function download(id, onprogress, canceller) {
  const xhr = new XMLHttpRequest();
  canceller.oncancel = function() {
    xhr.abort();
  };
  return new Promise(async function(resolve, reject) {
    xhr.addEventListener('loadend', function() {
      canceller.oncancel = function() {};
      if (xhr.status !== 200) {
        return reject(new Error(xhr.status));
      }

      const blob = new Blob([xhr.response]);
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(blob);
      fileReader.onload = function() {
        resolve(this.result);
      };
    });
    xhr.addEventListener('progress', function(event) {
      if (event.lengthComputable && event.target.status === 200) {
        onprogress([event.loaded, event.total]);
      }
    });
    xhr.open('get', `/api/download/${id}`);
    // xhr.setRequestHeader('Authorization', auth);
    xhr.responseType = 'blob';
    xhr.send();
  });
}

async function tryDownload(id, onprogress, canceller, tries = 1) {
  try {
    const result = await download(id, onprogress, canceller);
    return result;
  } catch (e) {
    if (e.message === '401' && --tries > 0) {
      return tryDownload(id, onprogress, canceller, tries);
    }
    throw e;
  }
}

export function downloadFile(id, onprogress) {
  const canceller = {
    oncancel: function() {} // download() sets this
  };
  function cancel() {
    canceller.oncancel();
  }
  return {
    cancel,
    result: tryDownload(id, onprogress, canceller, 2)
  };
}
