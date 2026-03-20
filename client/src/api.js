const API = '/api';

function getToken() {
  return localStorage.getItem('ds_token');
}

export function setAuth(token, user) {
  localStorage.setItem('ds_token', token);
  localStorage.setItem('ds_user', JSON.stringify(user));
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('ds_user')); } catch { return null; }
}

export function logout() {
  localStorage.removeItem('ds_token');
  localStorage.removeItem('ds_user');
  window.location.href = '/login';
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
