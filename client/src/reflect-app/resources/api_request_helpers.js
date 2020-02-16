import { getAuthHeader } from './auth.js';

const defaultHeader = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export async function apiGetRequest(apiUrl, header=defaultHeader) {
  const response = await fetch(apiUrl, {
    headers: header
  });
  if (!response.ok) {
    const e = new Error('HTTP error, status = ' + response.status);
    e.code = 'ESERVER';
    throw e;
  }
  const data = await response.json();
  if (!data.success) {
    const e = new Error(data.errorMessage);
    e.code = 'ERESPONSE';
    throw e;
  }
  return data;
}

export async function apiPostRequest(apiUrl, params, header=defaultHeader) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: header,
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const e = new Error('HTTP error, status = ' + response.status);
    e.code = 'ESERVER';
    throw e;
  }
  const data = await response.json();
  if (!data.success) {
    const e = new Error(data);
    console.log(data);
    e.code = 'ERESPONSE';
    throw e;
  }
  return data;
}

export async function uploadFile(apiUrl, data) {
  const formData = new FormData();
  formData.append('data', data);
  const options = {
    method: 'POST',
    body: formData,
    headers: getAuthHeader()
  };
  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    const e = new Error('HTTP error, status = ' + response.status);
    e.code = 'ESERVER';
    throw e;
  }
  const resultData = await response.json();
  if (!resultData.success) {
    const e = new Error(resultData);
    console.log(resultData);
    e.code = 'ERESPONSE';
    throw e;
  }
  return resultData;
}

export async function* uploadMultiFilesGenerator(apiUrl, files) {
  const formData = new FormData();
  for (const f of files) {
    formData.append('filedata', f);
  }
  const xhr = new XMLHttpRequest();
  let progress = 0.;
  let done = false;
  let result = {};
  let res = () => {};
  let p = new Promise((r) => res = r);
  const update = () => {
    res();
    p = new Promise((r) => res = r);
  };
  xhr.upload.addEventListener('progress', (e) => {
    progress = (e.loaded / e.total) * 100;
    //console.log(progress);
    update();
  });
  xhr.addEventListener('load', (e) => {
    console.log(xhr.response);
    result = xhr.response;
    done = true;
    update();
  });
  xhr.addEventListener('error', (e) => {
    const msg = "Error during xhr transfer...";
    console.log(msg, xhr.response);
    done = true;
    update();
  });
  xhr.addEventListener('abort', (e) => {
    const msg = "Upload aborted...";
    console.log(msg, xhr.response);
    done = true;
    update();
  });
  xhr.responseType = 'json';
  xhr.open('post', apiUrl);
  xhr.setRequestHeader('Authorization', getAuthHeader()['Authorization']);
  xhr.send(formData);
  while(!done) {
    await p;
    yield {
      progress: progress,
      result: result,
      request: xhr
    }
  }
}
