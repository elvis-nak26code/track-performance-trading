// Couche d'accès à l'authentification et au profil (API Express : le cloud en
// version web, le serveur local en version desktop). Utilisée par
// AuthContext.jsx et SettingsContext.jsx.
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
      ...options,
    });

    const json = await response.json().catch(() => null);

    if (response.status === 401) {
      notifyUnauthorized();
    }
    if (!response.ok) {
      throw new Error(json?.message || `Erreur API (${response.status}) sur ${path}`);
    }

    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function apiRegister(name, email, password) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export function apiLogin(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function apiGoogleLogin(credential) {
  return request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) });
}

// Mot de passe oublié : demande un code de réinitialisation, envoyé par e-mail
// (data.code n'est renvoyé que par une API de développement sans SMTP).
export function apiForgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export function apiResetPassword(email, code, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, password }),
  });
}

export function apiFetchMe() {
  return request('/users/me');
}

export function apiUpdateSettings(settings) {
  return request('/users/me/settings', { method: 'PUT', body: JSON.stringify(settings) });
}
