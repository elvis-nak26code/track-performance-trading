// Couche d'accès aux trades : toutes les fonctions sont async et appellent
// l'API (le cloud en version web, le serveur local en version desktop). Aucune
// donnée n'est fabriquée côté navigateur : tout vient de la base de données du
// compte connecté.
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Appelle l'API. Ajoute automatiquement le jeton JWT (voir utils/authToken.js)
// et déballe le format de réponse standard `{ success, data }` pour renvoyer
// directement `data` aux composants.
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

/** Récupère la liste complète des trades. */
export async function fetchTrades() {
  return httpRequest('/trades');
}

/** Récupère un trade par son identifiant. */
export async function fetchTradeById(id) {
  return httpRequest(`/trades/${id}`);
}

/** Crée un nouveau trade. */
export async function createTrade(trade) {
  return httpRequest('/trades', { method: 'POST', body: JSON.stringify(trade) });
}

/** Crée plusieurs trades en une fois (utilisé pour l'import CSV). */
export async function createTradesBulk(trades) {
  return httpRequest('/trades/bulk', { method: 'POST', body: JSON.stringify({ trades }) });
}

/** Met à jour un trade existant. */
export async function updateTrade(id, updates) {
  return httpRequest(`/trades/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

/** Supprime un trade. */
export async function deleteTrade(id) {
  return httpRequest(`/trades/${id}`, { method: 'DELETE' });
}
