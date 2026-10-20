// Couche d'accès aux entrées de journal : toutes les fonctions appellent l'API
// (cloud en version web, serveur local en version desktop). Aucune donnée n'est
// fabriquée côté navigateur.
import { getToken, notifyUnauthorized } from '../../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Nombre maximal de captures par entrée, aligné sur le backend
// (API/src/middlewares/upload.middleware.js) et le serveur local de bureau.
export const MAX_JOURNAL_SCREENSHOTS = 20;

async function httpRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  const token = getToken();

  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        },
        signal: controller.signal,
        ...options,
      });
    } catch {
      // Coupure réseau, serveur injoignable ou délai dépassé : message clair
      // (le formulaire d'entrée de journal l'affiche tel quel).
      throw new Error('Erreur réseau : connexion au serveur impossible.');
    }

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

/** Récupère toutes les entrées de journal. */
export async function fetchJournalEntries() {
  return httpRequest('/journal-entries');
}

/** Récupère une entrée de journal par son identifiant. */
export async function fetchJournalEntryById(id) {
  return httpRequest(`/journal-entries/${id}`);
}

function buildJournalFormData(entry) {
  const formData = new FormData();

  // Seuls les champs fournis sont envoyés : une mise à jour partielle ne doit
  // pas vider les champs qu'elle ne mentionne pas.
  if (entry.date !== undefined) formData.append('date', entry.date || '');
  if (entry.instrument !== undefined) formData.append('instrument', entry.instrument || '');
  if (entry.mood !== undefined) formData.append('mood', entry.mood || '');
  if (entry.text !== undefined) formData.append('text', entry.text || '');

  // Blocs ordonnés (texte / image). Les blocs image référencent l'id d'une
  // capture du tableau screenshots (envoyé en métadonnées ci-dessous). La
  // largeur choisie pour une image est conservée : sans elle, la taille
  // donnée à une capture était perdue à chaque enregistrement.
  if (entry.blocks !== undefined) {
    const blocks = (entry.blocks || []).map((b) => {
      if (b.type !== 'image') return { type: 'text', content: b.content || '' };
      const block = { type: 'image', screenshotId: b.screenshotId || '' };
      const width = Number(b.width);
      if (Number.isFinite(width) && width > 0) block.width = width;
      return block;
    });
    formData.append('blocks', JSON.stringify(blocks));
  }

  // Captures : si le client ne les mentionne pas, on n'envoie rien et le
  // serveur conserve celles qui existent déjà (au lieu de toutes les supprimer).
  if (entry.screenshots !== undefined) {
    const screenshots = entry.screenshots || [];

    /*
     * Métadonnées de toutes les captures.
     *
     * isNew permet au backend de distinguer :
     * - une ancienne image déjà enregistrée
     * - une nouvelle image sélectionnée par l'utilisateur
     */
    const screenshotMetadata = screenshots.map((screenshot) => ({
      id: screenshot.id,
      name: screenshot.name || '',
      caption: screenshot.caption || '',
      isNew: screenshot.file instanceof File,
    }));

    // On envoie uniquement les nouvelles images.
    screenshots.forEach((screenshot) => {
      if (screenshot.file instanceof File) {
        formData.append('screenshots', screenshot.file);
      }
    });

    formData.append('screenshotMetadata', JSON.stringify(screenshotMetadata));
  }

  if (entry.linkedTradeIds) {
    formData.append('linkedTradeIds', JSON.stringify(entry.linkedTradeIds));
  }

  return formData;
}

/** Crée une nouvelle entrée de journal. */
export async function createJournalEntry(entry) {
  return httpRequest('/journal-entries', {
    method: 'POST',
    body: buildJournalFormData(entry),
  });
}

/** Met à jour une entrée de journal existante. */
export async function updateJournalEntry(id, updates) {
  return httpRequest(`/journal-entries/${id}`, {
    method: 'PUT',
    body: buildJournalFormData(updates),
  });
}

/** Supprime une entrée de journal. */
export async function deleteJournalEntry(id) {
  return httpRequest(`/journal-entries/${id}`, { method: 'DELETE' });
}
