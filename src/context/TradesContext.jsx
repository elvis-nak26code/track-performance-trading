// Contexte React global pour l'état des trades (track record).
// Centralise le chargement, la création, la mise à jour et la suppression
// des trades afin que toutes les pages partagent la même source de vérité.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  fetchTrades,
  createTrade,
  createTradesBulk,
  updateTrade,
  deleteTrade,
} from '../services/api/tradesApi';

export const TradesContext = createContext(null);

export function TradesProvider({ children }) {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTrades();
      setTrades(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des trades.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const addTrade = useCallback(async (trade) => {
    const created = await createTrade(trade);
    setTrades((prev) => [created, ...prev]);
    return created;
  }, []);

  const addTradesBulk = useCallback(async (newTrades) => {
    const created = await createTradesBulk(newTrades);
    setTrades((prev) => [...created, ...prev]);
    return created;
  }, []);

  const editTrade = useCallback(async (id, updates) => {
    const updated = await updateTrade(id, updates);
    setTrades((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const removeTrade = useCallback(async (id) => {
    await deleteTrade(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ trades, isLoading, error, loadTrades, addTrade, addTradesBulk, editTrade, removeTrade }),
    [trades, isLoading, error, loadTrades, addTrade, addTradesBulk, editTrade, removeTrade]
  );

  return <TradesContext.Provider value={value}>{children}</TradesContext.Provider>;
}

TradesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
