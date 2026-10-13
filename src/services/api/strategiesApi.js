// Couche d'abstraction pour les stratégies de trading. Même contrat que les
// autres services : toutes les fonctions sont async, sources mockée (localStorage)
// ou vrai backend HTTP selon VITE_USE_MOCK_DATA.
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;
const MOCK_KEY = 'blacktrading_strategies_mock';

// Items par défaut de la checklist pré-trade (première stratégie créée).
const DEFAULT_CHECKLIST_ITEMS = [
  'Le contexte de marché correspond à mon plan de trading',
  "La zone d'entrée est claire, sans ambiguïté",
  'Le ratio risque/récompense est acceptable',
  'Ma taille de position respecte mon risque maximum par trade',
  'Je ne suis pas en train de me refaire après une perte',
  'Je suis calme et concentré, pas sous le coup de l\u2019émotion',
];

function clone(data) {
  return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
}

function mockDelay(data, ms = 0) {
  return new Promise((resolve) => setTimeout(() => resolve(clone(data)), ms));
}

function genId() {
  return `str-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readMock() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY)) || [];
  } catch {
    return [];
  }
}

function writeMock(items) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(items));
}

// Appelle le vrai backend Express (mêmes conventions que tradesApi/journalApi).
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

function normalize(data) {
  return {
    id: data.id || genId(),
    name: data.name || 'Stratégie sans nom',
    description: data.description || '',
    rules: data.rules || [],
    config: data.config || {},
    checklistItems: data.checklistItems || [],
    isActive: data.isActive === true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/** Récupère toutes les stratégies de l'utilisateur. */
export async function fetchStrategies() {
  if (USE_MOCK) {
    const items = readMock();
    items.sort((a, b) => Number(b.isActive) - Number(a.isActive) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return mockDelay(items);
  }
  return httpRequest('/strategies');
}

/** Récupère la stratégie active (ou null). */
export async function fetchActiveStrategy() {
  if (USE_MOCK) {
    const items = readMock();
    return mockDelay(items.find((s) => s.isActive) || null);
  }
  return httpRequest('/strategies/active');
}

/** Crée une nouvelle stratégie (activée automatiquement si c'est la première). */
export async function createStrategy(data) {
  if (USE_MOCK) {
    const items = readMock();
    const strategy = normalize({
      name: data.name,
      description: data.description,
      rules: data.rules || [],
      config: data.config || {},
      checklistItems: data.checklistItems || DEFAULT_CHECKLIST_ITEMS.map((label) => ({ id: `c-${Math.random().toString(36).slice(2, 9)}`, label, enabled: true })),
      isActive: items.length === 0,
    });
    writeMock([strategy, ...items]);
    return mockDelay(strategy);
  }
  return httpRequest('/strategies', { method: 'POST', body: JSON.stringify(data) });
}

/** Met à jour une stratégie (isActive est géré via activateStrategy). */
export async function updateStrategy(id, updates) {
  if (USE_MOCK) {
    const items = readMock();
    const index = items.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Stratégie introuvable.');
    const current = items[index];
    const next = { ...current, ...updates, isActive: current.isActive, updatedAt: new Date().toISOString() };
    items[index] = next;
    writeMock(items);
    return mockDelay(next);
  }
  return httpRequest(`/strategies/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

/** Active une stratégie : désactive les autres, en garde une seule. */
export async function activateStrategy(id) {
  if (USE_MOCK) {
    const items = readMock();
    const target = items.find((s) => s.id === id);
    if (!target) throw new Error('Stratégie introuvable.');
    const now = new Date().toISOString();
    const next = items.map((s) => ({ ...s, isActive: s.id === id, updatedAt: now }));
    writeMock(next);
    return mockDelay(next.find((s) => s.id === id));
  }
  return httpRequest(`/strategies/${id}/activate`, { method: 'PUT' });
}

/** Supprime une stratégie. */
export async function deleteStrategy(id) {
  if (USE_MOCK) {
    writeMock(readMock().filter((s) => s.id !== id));
    return mockDelay({ success: true });
  }
  return httpRequest(`/strategies/${id}`, { method: 'DELETE' });
}

export { DEFAULT_CHECKLIST_ITEMS };