// Couche d'abstraction pour les trades. Toutes les fonctions sont async et
// retournent des Promises, que la source soit mockée ou un vrai backend HTTP.
// Cela permet de brancher une vraie API plus tard en changeant uniquement
// VITE_USE_MOCK_DATA=false, sans toucher aux composants qui consomment ce module.
import mockTrades from '../mockData/trades.json';
import { getToken, notifyUnauthorized, notifyPlanExpired } from '../../utils/authToken';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Petit délai uniquement pour éviter un rendu "zébré" si une vraie latence
// réseau existe plus tard ; en mode mock, on va le plus vite possible
// (0 ms) pour une interface fluide.
function mockDelay(data, ms = 0) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredCloneSafe(data)), ms));
}

function structuredCloneSafe(data) {
  return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
}

// Appelle le vrai backend Express. Ajoute automatiquement le jeton JWT
// (voir utils/authToken.js) et déballe le format de réponse standard du
// backend `{ success, data }` pour renvoyer directement `data` aux
// composants, exactement comme en mode mock.
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
    if (response.status === 403 && json?.code === 'PLAN_EXPIRED') {
      notifyPlanExpired();
    }
    if (!response.ok) {
      throw new Error(json?.message || `Erreur API (${response.status}) sur ${path}`);
    }
    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Stockage en mémoire utilisé uniquement en mode mock (simule une base de données locale).
let inMemoryTrades = [...mockTrades];

/** Récupère la liste complète des trades. */
export async function fetchTrades() {
  if (USE_MOCK) return mockDelay(inMemoryTrades);
  return httpRequest('/trades');
}

/** Récupère un trade par son identifiant. */
export async function fetchTradeById(id) {
  if (USE_MOCK) {
    const trade = inMemoryTrades.find((t) => t.id === id);
    return mockDelay(trade || null);
  }
  return httpRequest(`/trades/${id}`);
}

/** Crée un nouveau trade. */
export async function createTrade(trade) {
  if (USE_MOCK) {
    const newTrade = { ...trade, id: trade.id || `trd-${Date.now()}` };
    inMemoryTrades = [newTrade, ...inMemoryTrades];
    return mockDelay(newTrade);
  }
  return httpRequest('/trades', { method: 'POST', body: JSON.stringify(trade) });
}

/** Crée plusieurs trades en une fois (utilisé pour l'import CSV). */
export async function createTradesBulk(trades) {
  if (USE_MOCK) {
    inMemoryTrades = [...trades, ...inMemoryTrades];
    return mockDelay(trades);
  }
  return httpRequest('/trades/bulk', { method: 'POST', body: JSON.stringify({ trades }) });
}

/** Met à jour un trade existant. */
export async function updateTrade(id, updates) {
  if (USE_MOCK) {
    inMemoryTrades = inMemoryTrades.map((t) => (t.id === id ? { ...t, ...updates } : t));
    const updated = inMemoryTrades.find((t) => t.id === id);
    return mockDelay(updated);
  }
  return httpRequest(`/trades/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

/** Supprime un trade. */
export async function deleteTrade(id) {
  if (USE_MOCK) {
    inMemoryTrades = inMemoryTrades.filter((t) => t.id !== id);
    return mockDelay({ success: true });
  }
  return httpRequest(`/trades/${id}`, { method: 'DELETE' });
}