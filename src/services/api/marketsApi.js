// Couche d'accès au catalogue des marchés (/marches) : le catalogue de
// référence (partagé) et les marchés personnalisés du compte connecté (privés).
// Tout vient de l'API ; aucune liste n'est embarquée dans l'application.
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

async function httpRequest(path, options = {}) {
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

/** Récupère le catalogue de référence + les marchés personnalisés du compte. */
export async function fetchMarkets() {
  return httpRequest('/markets');
}

/** Ajoute un marché/instrument personnalisé (visible uniquement par ce compte). */
export async function createMarket(market) {
  return httpRequest('/markets', { method: 'POST', body: JSON.stringify(market) });
}

/** Supprime un marché/instrument. */
export async function deleteMarket(market) {
  return httpRequest(`/markets/${market.id}`, { method: 'DELETE' });
}
