// Contexte React global pour les stratégies de trading : liste, stratégie
// active, CRUD et checklist pré-trade. La checklist cochée est dérivée de la
// stratégie active ; les dates cochées sont persistées en localStorage.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  fetchStrategies,
  fetchActiveStrategy,
  createStrategy,
  updateStrategy,
  activateStrategy,
  deleteStrategy,
} from '../services/api/strategiesApi';

export const StrategyContext = createContext(null);

function checklistStorageKey(strategyId) {
  return `blacktrading_checklist_checked_${strategyId}`;
}

export function StrategyProvider({ children }) {
  const [strategies, setStrategies] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Incrémenté à chaque coche/décochage : force la relecture de la checklist
  // persistée en localStorage (sinon l'état mémoïsé ne se rafraîchit jamais et
  // les cases restent visuellement figées).
  const [checklistVersion, setChecklistVersion] = useState(0);

  const loadStrategies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [all, active] = await Promise.all([fetchStrategies(), fetchActiveStrategy()]);
      setStrategies(all);
      setActiveStrategy(active);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des stratégies.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const addStrategy = useCallback(async (data) => {
    const created = await createStrategy(data);
    setStrategies((prev) => [created, ...prev]);
    if (created.isActive) setActiveStrategy(created);
    return created;
  }, []);

  const editStrategy = useCallback(async (id, updates) => {
    const updated = await updateStrategy(id, updates);
    setStrategies((prev) => prev.map((s) => (s.id === id ? updated : s)));
    if (activeStrategy?.id === id) setActiveStrategy(updated);
    return updated;
  }, [activeStrategy]);

  const activate = useCallback(async (id) => {
    const updated = await activateStrategy(id);
    setStrategies((prev) => prev.map((s) => (s.id === id ? updated : { ...s, isActive: false })));
    setActiveStrategy(updated);
    return updated;
  }, []);

  const removeStrategy = useCallback(async (id) => {
    await deleteStrategy(id);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    if (activeStrategy?.id === id) {
      setActiveStrategy(null);
      localStorage.removeItem(checklistStorageKey(id));
    }
  }, [activeStrategy]);

  // ---- Checklist pré-trade : items = checklistItems de la stratégie active,
  // état coché persisté par politique clé (date) pour la session courante. ----

  const checklistToday = new Date().toISOString().slice(0, 10);

  const checkedByDate = useMemo(() => {
    if (!activeStrategy) return {};
    try {
      return JSON.parse(localStorage.getItem(checklistStorageKey(activeStrategy.id))) || {};
    } catch {
      return {};
    }
    // checklistVersion relance la lecture après chaque coche/décochage.
  }, [activeStrategy, checklistVersion]);

  const checklist = useMemo(
    () => (activeStrategy?.checklistItems || []).filter((item) => item.enabled !== false),
    [activeStrategy]
  );

  const checkedItems = useMemo(() => {
    const saved = checkedByDate[checklistToday] || [];
    return new Set(saved);
  }, [checkedByDate, checklistToday]);

  const toggleChecklistItem = useCallback(
    (itemId) => {
      if (!activeStrategy) return;
      const nextSet = new Set(checkedItems);
      if (nextSet.has(itemId)) nextSet.delete(itemId);
      else nextSet.add(itemId);
      const stored = { ...checkedByDate, [checklistToday]: [...nextSet] };
      localStorage.setItem(checklistStorageKey(activeStrategy.id), JSON.stringify(stored));
      setChecklistVersion((v) => v + 1);
    },
    [activeStrategy, checkedItems, checkedByDate, checklistToday]
  );

  const resetChecklist = useCallback(() => {
    if (!activeStrategy) return;
    const stored = { ...checkedByDate, [checklistToday]: [] };
    localStorage.setItem(checklistStorageKey(activeStrategy.id), JSON.stringify(stored));
    setChecklistVersion((v) => v + 1);
  }, [activeStrategy, checkedByDate, checklistToday]);

  const value = useMemo(
    () => ({
      strategies,
      activeStrategy,
      isLoading,
      error,
      loadStrategies,
      addStrategy,
      editStrategy,
      activate,
      removeStrategy,
      checklist,
      checkedItems,
      toggleChecklistItem,
      resetChecklist,
    }),
    [
      strategies,
      activeStrategy,
      isLoading,
      error,
      loadStrategies,
      addStrategy,
      editStrategy,
      activate,
      removeStrategy,
      checklist,
      checkedItems,
      toggleChecklistItem,
      resetChecklist,
    ]
  );

  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>;
}

StrategyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};