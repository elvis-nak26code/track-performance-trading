// Hook d'accès au StrategyContext : liste des stratégies, stratégie active,
// CRUD et checklist pré-trade.
import { useContext } from 'react';
import { StrategyContext } from '../context/StrategyContext';

export function useStrategy() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategy doit être utilisé à l\u2019intérieur d\u2019un <StrategyProvider>.');
  }
  return context;
}