// Contexte d'authentification.
//
// Inscription, connexion (e-mail/mot de passe ou Google) et déconnexion passent
// par l'API Express (services/api/authApi.js) : le cloud en version web, le
// serveur local en version desktop. Le token JWT renvoyé est stocké avec
// l'utilisateur en localStorage et automatiquement attaché à chaque requête
// suivante par les fichiers services/api/*.js (voir utils/authToken.js).
//
// La session persistée a la forme { user, token }.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { apiRegister, apiLogin, apiGoogleLogin } from '../services/api/authApi';

const STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'journal_trading_token';

// Anciens comptes de démonstration (mode simulation supprimé) : purgés au
// démarrage pour ne laisser aucun mot de passe ni donnée fictive dans le navigateur.
const LEGACY_USERS_STORAGE_KEY = `${STORAGE_KEY}_users`;
const OBSOLETE_KEYS = [
  LEGACY_USERS_STORAGE_KEY,
  'blacktrading_strategies_mock',
  'journal_trading_custom_markets',
  'journal_trading_deleted_markets',
];

export const AuthContext = createContext(null);

// Clés de cache locales liées à UN compte (préférences, checklist). Purger ces
// clés au logout garantit qu'un nouveau compte ne "revit" pas les données du
// précédent. Le thème et l'état de la sidebar sont des préférences d'affichage
// machine, conservées par défaut pour ne pas déstabiliser l'utilisateur.
const ACCOUNT_CACHE_KEYS = [
  'journal_trading_settings',
  'journal_trading_settings_pending',
];

function clearAccountCaches() {
  const removals = [STORAGE_KEY, ...OBSOLETE_KEYS, ...ACCOUNT_CACHE_KEYS];
  for (const key of removals) {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage indisponible : on ignore
    }
  }
  // Checklist pré-trade : clé par stratégie, invariable quel que soit le compte.
  try {
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith('blacktrading_checklist_checked_')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage indisponible : on ignore
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { user, token }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      for (const key of OBSOLETE_KEYS) localStorage.removeItem(key);
    } catch {
      // localStorage indisponible : on ignore
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored) setSession(stored);
    } catch {
      // session invalide, on l'ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAccountCaches();
    setSession(null);
    // Après déconnexion, on revient toujours sur la page de connexion
    // (jamais sur la landing page).
    navigate('/connexion', { replace: true });
  }, [navigate]);

  // Déconnexion forcée si le backend renvoie 401 sur une requête (jeton
  // expiré/invalide) pendant que l'utilisateur navigue dans l'app.
  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  function persistSession(nextSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { user, token } = await apiLogin(email, password);
      persistSession({ user, token });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const { user, token } = await apiRegister(name, email, password);
      persistSession({ user, token });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Appelé avec le credential JWT renvoyé par Google Identity Services.
  const loginWithGoogleCredential = useCallback(async (credential) => {
    setError(null);
    try {
      // Le backend vérifie la signature, l'audience ET l'e-mail vérifié du jeton
      // auprès de Google avant de créer/retrouver le compte (voir
      // utils/googleAuth.js côté backend).
      const { user, token } = await apiGoogleLogin(credential);
      persistSession({ user, token });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isLoading,
      error,
      login,
      register,
      loginWithGoogleCredential,
      logout,
    }),
    [session, isLoading, error, login, register, loginWithGoogleCredential, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
