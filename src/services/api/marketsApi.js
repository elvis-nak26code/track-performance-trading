// Couche d'abstraction pour la référence des marchés (/marches). Même
// principe que tradesApi.js / journalApi.js : mock local ou vrai backend
// selon VITE_USE_MOCK_DATA, pour pouvoir brancher un vrai catalogue de
// marchés (avec données live) plus tard sans changer les composants.
//
// Les marchés ajoutés manuellement par l'utilisateur (mode mock) sont
// persistés en localStorage, en plus du catalogue de référence embarqué
// (markets.json), afin qu'ils survivent à un rechargement de la page.
import mockMarkets from '../mockData/markets.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;
const CUSTOM_MARKETS_STORAGE_KEY = 'journal_trading_custom_markets';

function mockDelay(data, ms = 200) {
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

async function httpRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    if (!response.ok) {
      throw new Error(`Erreur API (${response.status}) sur ${path}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Récupère la liste complète des marchés/instruments de référence (catalogue + ajouts manuels). */
export async function fetchMarkets() {
  if (USE_MOCK) return mockDelay([...mockMarkets, ...readCustomMarkets()]);
  return httpRequest('/markets');
}

/** Ajoute un nouveau marché/instrument au catalogue (persisté en localStorage en mode mock). */
export async function createMarket(market) {
  if (USE_MOCK) {
    const customMarkets = readCustomMarkets();
    const newMarket = { ...market, isCustom: true };
    writeCustomMarkets([...customMarkets, newMarket]);
    return mockDelay(newMarket);
  }
  return httpRequest('/markets', { method: 'POST', body: JSON.stringify(market) });
}
