// Contexte de paramètres de calcul, centralisé pour que toute l'application
// utilise la MÊME définition du "R" (valeur en dollars d'un risque de 1R) et
// le même risque par défaut. Sans ce réglage central, le calculateur de
// risque et le suivi des trades (qui enregistre un multiple R par trade)
// pourraient utiliser des hypothèses différentes — ce contexte garantit la
// cohérence entre les deux.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'journal_trading_settings';

const DEFAULT_SETTINGS = {
  // Valeur en dollars d'un risque de 1R (ex: si vous risquez toujours 500 $
  // par trade, 1R = 500 $). Sert de référence dans le calculateur de risque
  // et pour convertir les statistiques exprimées en R en équivalent dollar.
  rValueDollars: 500,
  // Risque par défaut, en pourcentage du capital, proposé dans le calculateur.
  defaultRiskPercent: 1,
};

export const SettingsContext = createContext(null);

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored) return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    // paramètres invalides ou absents : on utilise les valeurs par défaut
  }
  return DEFAULT_SETTINGS;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage indisponible (mode privé, quota dépassé)
    }
  }, [settings]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
