// Contexte d'abonnement : gère l'état du forfait courant (expiré / jours
// restants) et le modal d'invitation au paiement. Le composant <SubscriptionModal/>
// est rendu une seule fois au sommet de l'arbre (PlanProvider) et s'ouvre dès
// qu'une action de écriture est refusée (bouton dans l'UI) ou que le backend
// renvoie 403 + code PLAN_EXPIRED (via le custom event 'plan:expired').
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { computeDaysRemaining, isPlanExpired as localIsExpired, getPlan } from '../constants/plans';
import { getSubscriptionStatus } from '../services/api/subscriptionApi';
import SubscriptionModal from '../components/subscription/SubscriptionModal';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
// Rafraîchit le statut serveur régulièrement pour que le nombre de jours
// restants affiché reste exact sans recharger la page (le calcul local a déjà
// l'heure, mais le serveur reste la source de vérité en mode réel).
const REFRESH_INTERVAL_MS = 60_000;
const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const { user } = useAuth();
  // En mode backend réel, on récupère la vérité côté serveur (1 appel au montage).
  // En mode mock, on se base sur la session locale : les valeurs sont
  // suffisamment fiables pour la démo, et un refresh appelé après updatePlan
  // remonte toujours la dernière valeur locale.
  const [serverStatus, setServerStatus] = useState(null);

  const [modal, setModal] = useState({ open: false, action: '' });

  useEffect(() => {
    // À chaque changement de plan/date de début, on rebascule d'abord sur le
    // calcul local (zéro flicker) puis on rafraîchit depuis le serveur.
    setServerStatus(null);
    if (USE_MOCK || !user) return;
    let cancelled = false;

    const fetchStatus = () =>
      getSubscriptionStatus()
        .then((s) => { if (!cancelled) setServerStatus(s); })
        .catch(() => {});

    fetchStatus();
    const intervalId = setInterval(fetchStatus, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, user?.plan, user?.planStartedAt]);

  // Écoute le custom event dispatché par authToken.js quand le backend
  // renvoie un 403 PLAN_EXPIRED sur un appel d'écriture.
  useEffect(() => {
    const handler = () => setModal((prev) => ({ ...prev, open: true }));
    window.addEventListener('plan:expired', handler);
    return () => window.removeEventListener('plan:expired', handler);
  }, []);

  const planId = user?.plan || 'essai';
  const planStartedAt = user?.planStartedAt || new Date().toISOString().slice(0, 10);
  // Accès à vie : le serveur renvoie daysRemaining = null (affiché « ∞ »).
  const isLifetime = serverStatus ? serverStatus.isLifetime : planId === 'lifetime';
  const liveDaysRemaining = serverStatus ? serverStatus.daysRemaining : computeDaysRemaining(planId, planStartedAt);
  const daysRemaining = isLifetime ? null : liveDaysRemaining;
  const isExpired = isLifetime ? false : serverStatus ? serverStatus.isExpired : localIsExpired(planId, planStartedAt);
  const planLabel = getPlan(planId).label;

  /**
   * Appelé avant toute action d'écriture (nouveau trade, entrée journal…).
   * Renvoie `true` si l'action est autorisée, `false` si le forfait est expiré
   * (dans ce cas, le modal s'ouvre automatiquement).
   */
  const requirePlan = useCallback(
    (actionLabel) => {
      if (!isExpired) return true;
      setModal({ open: true, action: actionLabel || '' });
      return false;
    },
    [isExpired]
  );

  const closeModal = useCallback(() => setModal({ open: false, action: '' }), []);

  const value = useMemo(
    () => ({ isLifetime, isExpired, daysRemaining, planId, planLabel, requirePlan, closeModal }),
    [isLifetime, isExpired, daysRemaining, planId, planLabel, requirePlan, closeModal]
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <SubscriptionModal open={modal.open} action={modal.action} onClose={closeModal} />
    </PlanContext.Provider>
  );
}

PlanProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan() doit être utilisé à l\'intérieur de <PlanProvider>.');
  return ctx;
}