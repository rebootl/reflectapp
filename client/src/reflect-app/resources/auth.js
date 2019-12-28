import { api_req_post } from './api_request_helpers.js'
import { api, login_url } from './api-service.js';

export function loggedIn() {
  if (localStorage.getItem('access_token')) {
    return true;
  }
  return false;
}

export function getUsername() {
  return localStorage.getItem('username');
}

export function getAuthHeader() {
  if (loggedIn()) {
    return {
      'Authorization':  'Bearer ' + localStorage.getItem('access_token')
    }
  } else {
    return {}
  }
}

export async function login(username, pw) {
  const login_resp = await api_req_post(login_url, {
    username: username,
    password: pw
  });
  // check login login_resp
  if (!login_resp) {
    console.log("Login unsuccessful :(");
    return false;
  } else {
    console.log("Login successful!");
    // store JWT
    localStorage.setItem('access_token', login_resp.token);
    localStorage.setItem('username', username);
    await api.setParams({'Authorization':  'Bearer ' + login_resp.token});
    await api.reset();
    return true;
  }
}

export async function logout() {
  localStorage.removeItem('username');
  localStorage.removeItem('access_token');
  await api.setParams({});
  await api.reset();
}

export function get_auth_header() {
  if (loggedIn()) {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization':  'Bearer ' + localStorage.getItem('access_token')
    }
  } else {
    return {}
  }
}
