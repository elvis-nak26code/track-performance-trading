// Utilitaire partagé d'accès à la session stockée en localStorage.
// La session a la forme { user, token } (token = JWT renvoyé par l'API), afin
// que tous les fichiers services/api/*.js puissent lire le token de la même
// façon, sans dépendre du contexte React (ces fichiers sont de simples
// fonctions, pas des composants).
const STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'journal_trading_token';

export function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function getToken() {
  return getStoredSession()?.token || null;
}

// Prévient le reste de l'application (AuthContext) qu'il faut déconnecter
// l'utilisateur — utilisé quand le backend renvoie 401 (jeton expiré/invalide)
// pendant qu'une requête est en cours ailleurs dans l'app.
export function notifyUnauthorized() {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
}
