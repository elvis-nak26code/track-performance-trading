// Hook d'accès au JournalContext. Centralise la vérification que le hook est
// bien utilisé à l'intérieur d'un <JournalProvider>.
import { useContext } from 'react';
import { JournalContext } from '../context/JournalContext';

export function useJournalEntries() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournalEntries doit être utilisé à l\'intérieur d\'un <JournalProvider>.');
  }
  return context;
}
