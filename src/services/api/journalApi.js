// Couche d'abstraction pour les entrées de journal. Même principe que
// tradesApi.js : mock local ou vrai backend selon VITE_USE_MOCK_DATA.
import mockJournalEntries from '../mockData/journalEntries.json';
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

function mockDelay(data, ms = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredCloneSafe(data)), ms));
}

function structuredCloneSafe(data) {
  return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
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
    if (!response.ok) {
      throw new Error(json?.message || `Erreur API (${response.status}) sur ${path}`);
    }
    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

let inMemoryEntries = [...mockJournalEntries];

/** Récupère toutes les entrées de journal. */
export async function fetchJournalEntries() {
  if (USE_MOCK) return mockDelay(inMemoryEntries);
  return httpRequest('/journal-entries');
}

/** Récupère une entrée de journal par son identifiant. */
export async function fetchJournalEntryById(id) {
  if (USE_MOCK) {
    const entry = inMemoryEntries.find((e) => e.id === id);
    return mockDelay(entry || null);
  }
  return httpRequest(`/journal-entries/${id}`);
}

/** Crée une nouvelle entrée de journal. */
export async function createJournalEntry(entry) {
  if (USE_MOCK) {
    const newEntry = { ...entry, id: entry.id || `jrn-${Date.now()}` };
    inMemoryEntries = [newEntry, ...inMemoryEntries];
    return mockDelay(newEntry);
  }
  return httpRequest('/journal-entries', { method: 'POST', body: JSON.stringify(entry) });
}

/** Met à jour une entrée de journal existante. */
export async function updateJournalEntry(id, updates) {
  if (USE_MOCK) {
    inMemoryEntries = inMemoryEntries.map((e) => (e.id === id ? { ...e, ...updates } : e));
    const updated = inMemoryEntries.find((e) => e.id === id);
    return mockDelay(updated);
  }
  return httpRequest(`/journal-entries/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

/** Supprime une entrée de journal. */
export async function deleteJournalEntry(id) {
  if (USE_MOCK) {
    inMemoryEntries = inMemoryEntries.filter((e) => e.id !== id);
    return mockDelay({ success: true });
  }
  return httpRequest(`/journal-entries/${id}`, { method: 'DELETE' });
}