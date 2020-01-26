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

export async function uploadFile(apiUrl, data, filename) {
  const formData = new FormData();
  formData.append('data', data);
  formData.append('filename', filename);
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
