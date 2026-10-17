const TOKEN_KEY = 'cleantun_token';
const API_BASE = import.meta.env.VITE_API_URL || '';

export const assetUrl = (file) => (file ? `${API_BASE}/uploads/${file}` : null);

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {};
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
  return data;
}

export const api = {
  register: (fields) => request('/api/auth/register', { method: 'POST', body: fields, auth: false }),
  login: (fields) => request('/api/auth/login', { method: 'POST', body: fields, auth: false }),
  me: () => request('/api/auth/me'),
  reports: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return request(`/api/reports?${qs}`, { auth: false });
  },
  report: (id) => request(`/api/reports/${id}`, { auth: false }),
  createReport: (form) => request('/api/reports', { method: 'POST', form }),
  updateReport: (id, body) => request(`/api/reports/${id}`, { method: 'PATCH', body }),
  deleteReport: (id) => request(`/api/reports/${id}`, { method: 'DELETE' }),
  stats: () => request('/api/stats', { auth: false }),
  leaderboard: () => request('/api/leaderboard', { auth: false }),
  adminReports: () => request('/api/admin/reports'),
  adminUsers: () => request('/api/admin/users'),
};
