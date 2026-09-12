// Contexte d'authentification.
//
// Deux modes, contrôlés par VITE_USE_MOCK_DATA (comme le reste de l'app) :
//
// - MODE MOCK (VITE_USE_MOCK_DATA=true, par défaut) : les comptes
//   email/mot de passe sont simulés en localStorage. Pratique pour la démo
//   sans backend, mais ce n'est PAS une vraie base de données sécurisée.
//
// - MODE BACKEND RÉEL (VITE_USE_MOCK_DATA=false) : toutes les actions
//   (inscription, connexion, connexion Google, changement de forfait)
//   appellent l'API Express via services/api/authApi.js. Le token JWT
//   renvoyé par le backend est stocké avec l'utilisateur et automatiquement
//   attaché à chaque requête suivante par tradesApi.js / journalApi.js /
//   marketsApi.js (voir utils/authToken.js).
//
// Dans les deux cas, la session persistée en localStorage a la MÊME forme
// { user, token }, ce qui permet à tout le reste de l'app de fonctionner de
// façon identique quel que soit le mode.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { apiRegister, apiLogin, apiGoogleLogin, apiChoosePlan } from '../services/api/authApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'journal_trading_token';
const USERS_STORAGE_KEY = `${STORAGE_KEY}_users`; // mode mock uniquement

export const AuthContext = createContext(null);

function readMockUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeMockUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Hash très simple, utilisé UNIQUEMENT en mode mock pour une démo locale
// sans backend. Le vrai backend, lui, utilise bcrypt côté serveur.
function simpleHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { user, token }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    localStorage.removeItem(STORAGE_KEY);
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

  // Re-synchronise la session React quand le stockage local est modifié
  // par un autre module (ex: code promo appliqué en mode mock via
  // updateStoredSession).
  useEffect(() => {
    const handler = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (stored) setSession(stored);
      } catch {
        // session invalide, on l'ignore
      }
    };
    window.addEventListener('auth:session-updated', handler);
    return () => window.removeEventListener('auth:session-updated', handler);
  }, []);

  function persistSession(nextSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function simulateDelay(ms = 400) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const login = useCallback(async (email, password) => {
    setError(null);
    if (USE_MOCK) {
      await simulateDelay();
      const users = readMockUsers();
      const found = users.find((u) => u.email === email);
      if (!found || found.passwordHash !== simpleHash(password)) {
        const message = 'E-mail ou mot de passe incorrect.';
        setError(message);
        throw new Error(message);
      }
      persistSession({
        token: null,
        user: {
          email: found.email,
          name: found.name,
          provider: 'email',
          plan: found.plan || 'essai',
          planStartedAt: found.planStartedAt || new Date().toISOString().slice(0, 10),
        },
      });
      return;
    }

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
    if (USE_MOCK) {
      await simulateDelay();
      const users = readMockUsers();
      if (users.some((u) => u.email === email)) {
        const message = 'Un compte existe déjà avec cet e-mail.';
        setError(message);
        throw new Error(message);
      }
      const planStartedAt = new Date().toISOString().slice(0, 10);
      const newUser = { name, email, passwordHash: simpleHash(password), plan: 'essai', planStartedAt };
      writeMockUsers([...users, newUser]);
      persistSession({
        token: null,
        user: { email, name, provider: 'email', plan: 'essai', planStartedAt },
      });
      return;
    }

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
    if (USE_MOCK) {
      // En mode mock, pas de backend pour vérifier le jeton : on se contente
      // de décoder les infos publiques du jeton Google (nom, e-mail, photo).
      const decoded = jwtDecode(credential);
      persistSession({
        token: null,
        user: {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          provider: 'google',
          plan: 'essai',
          planStartedAt: new Date().toISOString().slice(0, 10),
        },
      });
      return;
    }

    try {
      // En mode réel, le backend vérifie la signature ET l'audience du jeton
      // auprès de Google avant de créer/retrouver le compte (voir
      // utils/googleAuth.js côté backend).
      const { user, token } = await apiGoogleLogin(credential);
      persistSession({ user, token });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Change le forfait courant (choisi depuis /tarifs). En mode réel, appelle
  // le backend (mock pour l'instant côté serveur aussi, en attendant Genius
  // Pay — voir subscription.controller.js) puis met à jour la session avec
  // l'utilisateur renvoyé.
  const updatePlan = useCallback(async (planId) => {
    if (USE_MOCK) {
      const planStartedAt = new Date().toISOString().slice(0, 10);
      setSession((prev) => {
        if (!prev) return prev;
        const updatedUser = { ...prev.user, plan: planId, planStartedAt };
        const updated = { ...prev, user: updatedUser };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (prev.user.provider === 'email') {
          const users = readMockUsers();
          writeMockUsers(
            users.map((u) => (u.email === prev.user.email ? { ...u, plan: planId, planStartedAt } : u))
          );
        }
        return updated;
      });
      return;
    }

    const updatedUser = await apiChoosePlan(planId);
    setSession((prev) => {
      const updated = { ...prev, user: updatedUser };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Re-charge les infos utilisateur depuis le backend (apiFetchMe). Utilisé
  // après un paiement Genius Pay (webhook) pour refléter immédiatement le
  // forfait activé côté serveur, sans obliger l'utilisateur à se reconnecter.
  const refreshUser = useCallback(async () => {
    if (USE_MOCK) return;
    try {
      const user = await apiFetchMe();
      setSession((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      // 401 → notifyUnauthorized gère la déconnexion ; les autres erreurs
      // réseau doivent juste être silencieuses (on garde la session locale).
      if (err.name !== 'AbortError') {
        setError(err.message || 'Impossible de rafraîchir le profil.');
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isLoading,
      error,
      login,
      register,
      loginWithGoogleCredential,
      logout,
      updatePlan,
      refreshUser,
    }),
    [session, isLoading, error, login, register, loginWithGoogleCredential, logout, updatePlan, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};