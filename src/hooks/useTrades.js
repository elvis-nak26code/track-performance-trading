// Hook d'accès au TradesContext. Centralise la vérification que le hook est
// bien utilisé à l'intérieur d'un <TradesProvider>.
import { useContext } from 'react';
import { TradesContext } from '../context/TradesContext';

export function useTrades() {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error('useTrades doit être utilisé à l\'intérieur d\'un <TradesProvider>.');
  }
  return context;
}
