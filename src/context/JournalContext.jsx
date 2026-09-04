// Contexte React global pour l'état des entrées de journal de trading.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../services/api/journalApi';

export const JournalContext = createContext(null);

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJournalEntries();
      setEntries(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du journal.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(async (entry) => {
    const created = await createJournalEntry(entry);
    setEntries((prev) => [created, ...prev]);
    return created;
  }, []);

  const editEntry = useCallback(async (id, updates) => {
    const updated = await updateJournalEntry(id, updates);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const removeEntry = useCallback(async (id) => {
    await deleteJournalEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({ entries, isLoading, error, loadEntries, addEntry, editEntry, removeEntry }),
    [entries, isLoading, error, loadEntries, addEntry, editEntry, removeEntry]
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

JournalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
