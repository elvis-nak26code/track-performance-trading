// Contexte d'authentification. En l'absence de tout backend réel, les
// comptes email/mot de passe sont simulés en localStorage (ce n'est PAS une
// vraie base de données sécurisée — à remplacer par un backend
// d'authentification en production, cf. .env VITE_API_BASE_URL).
//
// La connexion Google, elle, utilise Google Identity Services via la
// librairie @react-oauth/google : c'est un VRAI flux OAuth2 côté client, qui
// fonctionne dès qu'un VITE_GOOGLE_CLIENT_ID valide est renseigné dans .env
// (voir .env.example pour la marche à suivre). Le jeton renvoyé par Google
// est décodé côté client pour récupérer nom/e-mail/photo ; aucune vérification
// serveur n'est faite ici (à ajouter côté backend pour une vraie mise en prod).
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';

const STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'journal_trading_token';
const USERS_STORAGE_KEY = `${STORAGE_KEY}_users`;

export const AuthContext = createContext(null);

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Hash très simple, suffisant pour une démo locale sans backend.
// NE PAS utiliser tel quel en production (utiliser bcrypt/argon2 côté serveur).
function simpleHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored) setUser(stored);
    } catch {
      // session invalide, on l'ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  function persistSession(sessionUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  // Simule un appel réseau pour une expérience de chargement réaliste,
  // même si les données restent locales tant que VITE_USE_MOCK_DATA=true.
  function simulateDelay(ms = 400) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const login = useCallback(async (email, password) => {
    setError(null);
    await simulateDelay();
    const users = readUsers();
    const found = users.find((u) => u.email === email);
    if (!found || found.passwordHash !== simpleHash(password)) {
      const message = 'E-mail ou mot de passe incorrect.';
      setError(message);
      throw new Error(message);
    }
    persistSession({
      email: found.email,
      name: found.name,
      provider: 'email',
      plan: found.plan || 'essai',
      planStartedAt: found.planStartedAt || new Date().toISOString().slice(0, 10),
    });
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    await simulateDelay();
    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      const message = 'Un compte existe déjà avec cet e-mail.';
      setError(message);
      throw new Error(message);
    }
    const planStartedAt = new Date().toISOString().slice(0, 10);
    const newUser = { name, email, passwordHash: simpleHash(password), plan: 'essai', planStartedAt };
    writeUsers([...users, newUser]);
    persistSession({ email, name, provider: 'email', plan: 'essai', planStartedAt });
  }, []);

  // Appelé avec le credential JWT renvoyé par Google Identity Services.
  const loginWithGoogleCredential = useCallback((credential) => {
    setError(null);
    const decoded = jwtDecode(credential);
    persistSession({
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      provider: 'google',
      plan: 'essai',
      planStartedAt: new Date().toISOString().slice(0, 10),
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  // Change le forfait courant (choisi depuis la page /tarifs) et redémarre
  // le compteur de jours restants à partir d'aujourd'hui. Met aussi à jour
  // la fiche utilisateur stockée (pour les comptes email) afin que le
  // forfait persiste après une déconnexion/reconnexion.
  const updatePlan = useCallback(
    (planId) => {
      const planStartedAt = new Date().toISOString().slice(0, 10);
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, plan: planId, planStartedAt };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (prev.provider === 'email') {
          const users = readUsers();
          writeUsers(
            users.map((u) => (u.email === prev.email ? { ...u, plan: planId, planStartedAt } : u))
          );
        }
        return updated;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ user, isLoading, error, login, register, loginWithGoogleCredential, logout, updatePlan }),
    [user, isLoading, error, login, register, loginWithGoogleCredential, logout, updatePlan]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
