
const defaultHeader = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const apiGetRequest = async (apiUrl, header=defaultHeader) => {
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

export const apiPostRequest = async (apiUrl, params, header=defaultHeader) => {
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
