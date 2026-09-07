// Couche d'abstraction pour l'authentification contre le VRAI backend
// (Express). Utilisée par AuthContext.jsx uniquement quand
// VITE_USE_MOCK_DATA=false — en mode mock, AuthContext continue de gérer
// les comptes en localStorage comme avant, sans passer par ce fichier.
import { getToken } from '../../utils/authToken';

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

export function apiFetchMe() {
  return request('/users/me');
}

export function apiUpdateSettings(settings) {
  return request('/users/me/settings', { method: 'PUT', body: JSON.stringify(settings) });
}

export function apiChoosePlan(planId) {
  return request('/subscriptions/choose', { method: 'POST', body: JSON.stringify({ planId }) });
}