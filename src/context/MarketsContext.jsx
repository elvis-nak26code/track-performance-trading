// Contexte de données Marchés : UNE seule instance chargée une fois (contrairement
// à l'ancien hook par-composant), partagée entre le tableau de bord, la page
// Marchés et l'éditeur de journal. Évite de relire le localStorage + de refondre
// le catalogue à chaque montage d'un composant.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchMarkets, createMarket, deleteMarket } from '../services/api/marketsApi';

const MarketsContext = createContext(null);

export function MarketsProvider({ children }) {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMarkets();
      setMarkets(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des marchés.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addMarket = useCallback(async (market) => {
    const created = await createMarket(market);
    setMarkets((prev) => [...prev, created]);
    return created;
  }, []);

  const removeMarket = useCallback(async (market) => {
    await deleteMarket(market);
    setMarkets((prev) => prev.filter((m) => m.symbol !== market.symbol));
  }, []);

  const value = useMemo(
    () => ({ markets, isLoading, error, reload: load, addMarket, removeMarket }),
    [markets, isLoading, error, load, addMarket, removeMarket]
  );

  return <MarketsContext.Provider value={value}>{children}</MarketsContext.Provider>;
}

MarketsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useMarkets() {
  const ctx = useContext(MarketsContext);
  if (!ctx) throw new Error('useMarkets() doit être utilisé à l\'intérieur de <MarketsProvider>.');
  return ctx;
}