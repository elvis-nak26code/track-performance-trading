// Hook d'accès au SettingsContext (facteur R, risque par défaut).
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings doit être utilisé à l'intérieur d'un <SettingsProvider>.");
  }
  return context;
}
