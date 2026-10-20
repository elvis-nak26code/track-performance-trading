// Contexte de paramètres de calcul, centralisé pour que toute l'application
// utilise la MÊME définition du "R" (valeur en dollars d'un risque de 1R) et
// le même risque par défaut. Sans ce réglage central, le calculateur de
// risque et le suivi des trades (qui enregistre un multiple R par trade)
// pourraient utiliser des hypothèses différentes — ce contexte garantit la
// cohérence entre les deux.
//
// Les préférences de calcul (1R, risque par défaut) appartiennent au COMPTE :
// elles sont enregistrées dans l'API (et donc synchronisées entre le web et le
// desktop) et rechargées à la connexion. Le zoom de l'interface, lui, est un
// réglage d'affichage propre à l'appareil.
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { apiFetchMe, apiUpdateSettings } from '../services/api/authApi';

const STORAGE_KEY = 'journal_trading_settings';
// Présent tant qu'une modification n'a pas pu être envoyée à l'API (hors ligne,
// serveur indisponible) : elle sera renvoyée au prochain lancement.
const PENDING_KEY = 'journal_trading_settings_pending';
const PUSH_DELAY_MS = 600;

const DEFAULT_SETTINGS = {
  // Valeur en dollars d'un risque de 1R (ex: si vous risquez toujours 500 $
  // par trade, 1R = 500 $). Sert de référence dans le calculateur de risque
  // et pour convertir les statistiques exprimées en R en équivalent dollar.
  rValueDollars: 500,
  // Risque par défaut, en pourcentage du capital, proposé dans le calculateur.
  defaultRiskPercent: 1,
  // Zoom de l'interface, en pourcentage (70–150). Appliqué à la racine du
  // document pour agrandir/réduire l'ensemble du logiciel selon l'écran.
  uiZoom: 100,
};

// Préférences stockées sur le compte (les autres restent locales à l'appareil).
const ACCOUNT_KEYS = ['rValueDollars', 'defaultRiskPercent'];

// Extrait les préférences de compte valides (nombres finis ≥ 0) d'un objet.
function pickAccountSettings(source) {
  const picked = {};
  if (!source) return picked;
  for (const key of ACCOUNT_KEYS) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const value = Number(raw);
    if (Number.isFinite(value) && value >= 0) picked[key] = value;
  }
  return picked;
}

function loadSettings(accountSettings) {
  const fromAccount = pickAccountSettings(accountSettings);
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored) return { ...DEFAULT_SETTINGS, ...fromAccount, ...stored };
  } catch {
    // paramètres invalides ou absents : on utilise les valeurs du compte
  }
  return { ...DEFAULT_SETTINGS, ...fromAccount };
}

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => loadSettings(user?.settings));
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  // Dernières valeurs de compte connues du serveur (évite les envois inutiles).
  const lastSynced = useRef(JSON.stringify(pickAccountSettings(settings)));
  const pushTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage indisponible (mode privé, quota dépassé)
    }
  }, [settings]);

  const pushToAccount = useCallback(async (values) => {
    try {
      await apiUpdateSettings(values);
      lastSynced.current = JSON.stringify(values);
      try {
        localStorage.removeItem(PENDING_KEY);
      } catch {
        // localStorage indisponible : on ignore
      }
    } catch {
      // Hors ligne ou refus : la modification reste « en attente » (PENDING_KEY)
      // et sera renvoyée au prochain lancement.
    }
  }, []);

  // Au lancement : renvoie une modification restée en attente, sinon récupère
  // les préférences enregistrées sur le compte (modifiées sur un autre appareil).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let pending = false;
      try {
        pending = localStorage.getItem(PENDING_KEY) === '1';
      } catch {
        // localStorage indisponible : on ignore
      }
      if (pending) {
        await pushToAccount(pickAccountSettings(settingsRef.current));
        return;
      }
      const before = JSON.stringify(pickAccountSettings(settingsRef.current));
      try {
        const me = await apiFetchMe();
        if (cancelled) return;
        const remote = pickAccountSettings(me?.settings);
        if (Object.keys(remote).length === 0) return;
        // L'utilisateur a modifié une valeur pendant la requête : on ne l'écrase pas.
        if (JSON.stringify(pickAccountSettings(settingsRef.current)) !== before) return;
        const merged = { ...pickAccountSettings(settingsRef.current), ...remote };
        lastSynced.current = JSON.stringify(merged);
        setSettings((prev) => ({ ...prev, ...merged }));
      } catch {
        // Serveur injoignable : on garde les valeurs locales.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pushToAccount]);

  // Envoi différé des préférences de compte modifiées.
  useEffect(() => {
    const values = pickAccountSettings(settings);
    if (JSON.stringify(values) === lastSynced.current) return undefined;
    try {
      localStorage.setItem(PENDING_KEY, '1');
    } catch {
      // localStorage indisponible : on ignore
    }
    pushTimer.current = setTimeout(() => pushToAccount(values), PUSH_DELAY_MS);
    return () => clearTimeout(pushTimer.current);
  }, [settings.rValueDollars, settings.defaultRiskPercent, pushToAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
