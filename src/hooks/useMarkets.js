// Hook de chargement des données de référence des marchés (/marches), avec
// possibilité d'ajouter manuellement un nouvel actif au catalogue.
import { useEffect, useState, useCallback } from 'react';
import { fetchMarkets, createMarket } from '../services/api/marketsApi';

export function useMarkets() {
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

  return { markets, isLoading, error, reload: load, addMarket };
}
