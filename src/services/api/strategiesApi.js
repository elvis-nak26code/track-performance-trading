// Couche d'accès aux stratégies de trading : toutes les fonctions sont async et
// appellent l'API (cloud en version web, serveur local en version desktop).
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Items par défaut de la checklist pré-trade (première stratégie créée).
const DEFAULT_CHECKLIST_ITEMS = [
  'Le contexte de marché correspond à mon plan de trading',
  "La zone d'entrée est claire, sans ambiguïté",
  'Le ratio risque/récompense est acceptable',
  'Ma taille de position respecte mon risque maximum par trade',
  'Je ne suis pas en train de me refaire après une perte',
  'Je suis calme et concentré, pas sous le coup de l\u2019émotion',
];

// Appelle l'API (mêmes conventions que tradesApi/journalApi).
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

/** Récupère toutes les stratégies de l'utilisateur. */
export async function fetchStrategies() {
  return httpRequest('/strategies');
}

/** Récupère la stratégie active (ou null). */
export async function fetchActiveStrategy() {
  return httpRequest('/strategies/active');
}

/** Crée une nouvelle stratégie (activée automatiquement si c'est la première). */
export async function createStrategy(data) {
  return httpRequest('/strategies', { method: 'POST', body: JSON.stringify(data) });
}

/** Met à jour une stratégie (isActive est géré via activateStrategy). */
export async function updateStrategy(id, updates) {
  return httpRequest(`/strategies/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

/** Active une stratégie : désactive les autres, en garde une seule. */
export async function activateStrategy(id) {
  return httpRequest(`/strategies/${id}/activate`, { method: 'PUT' });
}

/** Supprime une stratégie. */
export async function deleteStrategy(id) {
  return httpRequest(`/strategies/${id}`, { method: 'DELETE' });
}

export { DEFAULT_CHECKLIST_ITEMS };