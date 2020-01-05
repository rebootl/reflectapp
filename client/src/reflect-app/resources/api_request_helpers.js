import { api } from './api-service.js';

export async function getValidTags(activeTopics) {
  const subtagsSource = await api.getSource('entries');
  const res = await subtagsSource.query([
    {$unwind: "$topics"},
    {$project: {
      topic: "$topics",
      tags: "$tags",
      selected: {$in: [
        "$topics",
        activeTopics
      ]}}
    },
    {$match: {selected: true}},
    {$unwind: "$tags"},
    {$group: {_id: "$tags"}}
  ]);
  return res.map((t)=>t._id);
}

export const apiGetRequest = async (apiUrl, header) => {
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

// deprecated => remove
export const api_req_get = async (api_url, header) => {
  try {
    const response = await fetch(api_url, {
      headers: header
    });
    if (!response.ok) {
      throw new Error('HTTP error, status = ' + response.status);
    }
    const data = await response.json();
    return data;
  } catch(err) {
    console.log(err);
    return false;
  }
}

const default_header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const api_req_post = async (api_url, params, header=default_header) => {
  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error('HTTP error, status = ' + response.status);
    }
    //console.log(response)
    const data = await response.json();
    //console.log(data);
    return data;
  } catch(err) {
    console.log(err);
  }
}
