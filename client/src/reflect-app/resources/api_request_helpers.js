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

export function uploadFileProgress(apiUrl, data, object, component) {
  return new Promise((res, rej) => {
    const formData = new FormData();
    formData.append('data', data);
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      //console.log(xhr.response);
      delete object.uploading;
      delete object.progress;
      res(xhr.response);
    });
    xhr.addEventListener('error', (e) => {
      console.log("Error during xhr transfer...", xhr.response);
      rej(xhr.response);
    });
    xhr.upload.addEventListener('progress', (e) => {
    	const percent_complete = (e.loaded / e.total) * 100;
    	//console.log(percent_complete);
      object.uploading = true;
      object.progress = percent_complete;
      component.update();
    });
    xhr.responseType = 'json';
    xhr.open('post', apiUrl);
    xhr.setRequestHeader('Authorization', getAuthHeader()['Authorization']);
    xhr.send(formData);
  });
}

export async function* uploadFileGenerator(apiUrl, data) {
  const formData = new FormData();
  formData.append('data', data);
  const xhr = new XMLHttpRequest();

  let progress = 0.;
  let done = false;

  let res = () => {};
  let p = new Promise((r) => res = r);

  const update = () => {
    res();
    p = new Promise((r) => res = r);
  };

  xhr.upload.addEventListener('progress', (e) => {
    progress = (e.loaded / e.total) * 100;
    update();
    //console.log(percent_complete);
    //object.uploading = true;
    //object.progress = percent_complete;
    //component.update();
  });
  xhr.addEventListener('load', (e) => {
    //console.log(xhr.response);
    done = true;
    update();
    //res(xhr.response);
  });
  xhr.addEventListener('error', (e) => {
    console.log("Error during xhr transfer...", xhr.response);
    //rej(xhr.response);
  });
  while(!done) {
    await p;
    yield {
      progress: progress,
      done: done,
    }
  }
}
