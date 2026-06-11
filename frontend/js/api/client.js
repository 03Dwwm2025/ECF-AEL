import { getToken, removeToken } from '../utils/auth.js';
import { navigate } from '../router.js';

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    removeToken();
    navigate('/login');
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // 401/404/409 → { message }  ·  400 (express-validator) → { erreurs: [{ msg }] }
    const msg = err.message || err.erreurs?.[0]?.msg || res.statusText || 'Erreur serveur';
    throw new Error(msg);
  }

  // Corps éventuellement vide (ex: 201/204 send() sans body) → null
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};
