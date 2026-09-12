// Couche d'abstraction pour l'abonnement (statut + paiement).
// - Mode mock (VITE_USE_MOCK_DATA !== 'false') : le statut est calculé depuis
//   la session locale et le checkout payant répond PAYMENT_NOT_CONFIGURED
//   (identique au backend sans clés Genius Pay), pour pouvoir tester toute la
//   mécanique de verrouillage sans backend.
// - Mode réel : appelle /subscriptions/me et /subscriptions/checkout.
import { getStoredSession, getToken, updateStoredSession, notifyUnauthorized, notifyPlanExpired } from '../../utils/authToken';
import { computeDaysRemaining } from '../../constants/plans';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

async function httpRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
      ...options,
    });

    const json = await response.json().catch(() => null);

    if (response.status === 401) {
      notifyUnauthorized();
    }
    if (response.status === 403 && json?.code === 'PLAN_EXPIRED') {
      notifyPlanExpired();
    }
    if (!response.ok) {
      const error = new Error(json?.message || `Erreur API (${response.status}) sur ${path}`);
      if (json?.code) error.code = json.code;
      throw error;
    }
    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Statut courant de l'abonnement : { plan, planStartedAt, daysRemaining, isExpired }.
export function getSubscriptionStatus() {
  if (USE_MOCK) {
    const session = getStoredSession();
    const plan = session?.user?.plan || 'essai';
    const planStartedAt = session?.user?.planStartedAt || new Date().toISOString().slice(0, 10);
    const daysRemaining = computeDaysRemaining(plan, planStartedAt);
    return Promise.resolve({
      plan,
      planStartedAt,
      daysRemaining,
      isExpired: daysRemaining === 0,
      isLifetime: plan === 'lifetime',
    });
  }
  return httpRequest('/subscriptions/me');
}

// Initie le paiement d'un forfait : { mode, plan, payUrl } en cas de succès.
// Rejette avec code PAYMENT_NOT_CONFIGURED quand Genius Pay n'est pas branché.
export function createCheckout(planId) {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (planId === 'essai') {
          resolve({ mode: 'free', plan: 'essai', payUrl: null });
          return;
        }
        const error = new Error("Le paiement en ligne n'est pas encore disponible (mode démo). Renseignez les clés Genius Pay pour l'activer.");
        error.code = 'PAYMENT_NOT_CONFIGURED';
        reject(error);
      }, 400);
    });
  }
  return httpRequest('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ planId }) });
}

// Applique un code promo (1 mois gratuit ou accès à vie) sur le compte courant.
// Rejette avec code INVALID_PROMO_CODE ou PROMO_ALREADY_USED en cas d'échec.
export function redeemPromo(code) {
  if (USE_MOCK) {
    // En mode démo, reproduit la logique des deux codes par défaut du backend.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const session = getStoredSession();
        if (!session?.user) {
          reject(new Error('Non connecté.'));
          return;
        }
        const normalized = String(code || '').trim().toUpperCase();
        const used = (session.user.promoCodesRedeemed || []).map((r) => (typeof r === 'string' ? r.toUpperCase() : String(r.code || '').toUpperCase()));
        const today = new Date().toISOString().slice(0, 10);

        if (normalized === 'BTMOIS2026') {
          if (used.includes(normalized)) {
            const error = new Error('Vous avez déjà utilisé ce code promo.');
            error.code = 'PROMO_ALREADY_USED';
            reject(error);
            return;
          }
          session.user.plan = 'mensuel';
          session.user.planStartedAt = today;
          session.user.promoCodesRedeemed = [...(session.user.promoCodesRedeemed || []), { code: normalized }];
          updateStoredSession(session);
          resolve({ plan: 'mensuel', label: 'Mensuel', durationDays: 30, isLifetime: false });
          return;
        }

        if (normalized === 'BTLIFE2026') {
          if (used.includes(normalized)) {
            const error = new Error('Vous avez déjà utilisé ce code promo.');
            error.code = 'PROMO_ALREADY_USED';
            reject(error);
            return;
          }
          session.user.plan = 'lifetime';
          session.user.planStartedAt = today;
          session.user.promoCodesRedeemed = [...(session.user.promoCodesRedeemed || []), { code: normalized }];
          updateStoredSession(session);
          resolve({ plan: 'lifetime', label: 'Accès à vie', isLifetime: true });
          return;
        }

        const error = new Error("Ce code promo est invalide ou n'existe plus.");
        error.code = 'INVALID_PROMO_CODE';
        reject(error);
      }, 300);
    });
  }
  return httpRequest('/subscriptions/redeem', { method: 'POST', body: JSON.stringify({ code }) });
}