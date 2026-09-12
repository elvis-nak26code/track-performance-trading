// Couche d'abstraction pour la référence des marchés (/marches). Même
// principe que tradesApi.js / journalApi.js : mock local ou vrai backend
// selon VITE_USE_MOCK_DATA, pour pouvoir brancher un vrai catalogue de
// marchés (avec données live) plus tard sans changer les composants.
//
// Les marchés ajoutés manuellement par l'utilisateur (mode mock) sont
// persistés en localStorage, en plus du catalogue de référence embarqué
// (markets.json), afin qu'ils survivent à un rechargement de la page.
import mockMarkets from '../mockData/markets.json';
import { getToken, notifyUnauthorized, notifyPlanExpired } from '../../utils/authToken';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;
const CUSTOM_MARKETS_STORAGE_KEY = 'journal_trading_custom_markets';
const DELETED_MARKETS_STORAGE_KEY = 'journal_trading_deleted_markets';

function mockDelay(data, ms = 0) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredCloneSafe(data)), ms));
}

function structuredCloneSafe(data) {
  return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
}

function readCustomMarkets() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_MARKETS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCustomMarkets(markets) {
  localStorage.setItem(CUSTOM_MARKETS_STORAGE_KEY, JSON.stringify(markets));
}

function readDeletedMarkets() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_MARKETS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeDeletedMarkets(symbols) {
  localStorage.setItem(DELETED_MARKETS_STORAGE_KEY, JSON.stringify(symbols));
}

// Catalogue fusionné (prédéfinis + ajouts manuels, moins les supprimés), mis
// en cache pour éviter de re-parser le localStorage à chaque lecture.
let cachedCatalog = null;

function buildCatalog() {
  const deleted = new Set(readDeletedMarkets());
  const prefabs = mockMarkets.filter((m) => !deleted.has(m.symbol));
  const customs = readCustomMarkets().filter((m) => !deleted.has(m.symbol));
  return [...prefabs, ...customs];
}

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

/** Récupère la liste complète des marchés/instruments de référence (catalogue + ajouts manuels), moins ceux supprimés. */
export async function fetchMarkets() {
  if (USE_MOCK) {
    // Catalogue fusionné mis en cache : relire le localStorage + refondre les
    // filtres à chaque appel serait inutile (la liste ne change que via
    // createMarket/deleteMarket, qui invalident le cache).
    if (cachedCatalog === null) cachedCatalog = buildCatalog();
    return mockDelay(cachedCatalog);
  }
  return httpRequest('/markets');
}

/** Ajoute un nouveau marché/instrument au catalogue (persisté en localStorage en mode mock). */
export async function createMarket(market) {
  if (USE_MOCK) {
    const customMarkets = readCustomMarkets();
    const newMarket = { ...market, isCustom: true };
    writeCustomMarkets([...customMarkets, newMarket]);
    cachedCatalog = null; // le catalogue fusionné change → invalidation
    return mockDelay(newMarket);
  }
  return httpRequest('/markets', { method: 'POST', body: JSON.stringify(market) });
}

/** Supprime un marché/instrument du catalogue (persisté en localStorage en mode mock). */
export async function deleteMarket(market) {
  if (USE_MOCK) {
    if (market.isCustom) {
      writeCustomMarkets(readCustomMarkets().filter((m) => m.symbol !== market.symbol));
    } else {
      const deleted = readDeletedMarkets();
      if (!deleted.includes(market.symbol)) {
        writeDeletedMarkets([...deleted, market.symbol]);
      }
    }
    cachedCatalog = null; // le catalogue fusionné change → invalidation
    return mockDelay({ success: true });
  }
  return httpRequest(`/markets/${market.id}`, { method: 'DELETE' });
}