// Définition des forfaits de la plateforme. Toutes les fonctionnalités sont
// incluses dans chaque forfait — seule la durée/le prix changent.
// Taux de conversion FCFA (XOF) indicatif, à titre d'ordre de grandeur
// (le franc CFA d'Afrique de l'Ouest fluctue avec l'euro/le dollar) :
// on utilise un taux approximatif arrondi pour l'affichage.
export const USD_TO_XOF_RATE = 600; // taux indicatif, à ajuster selon le taux réel

export function usdToXof(usd) {
  return Math.round(usd * USD_TO_XOF_RATE);
}

export function formatXof(usd) {
  return `≈ ${usdToXof(usd).toLocaleString('fr-FR')} FCFA`;
}

const MONTHLY_PRICE_USD = 5;
const ANNUAL_PRICE_USD = 50;
const ANNUAL_EQUIVALENT_IF_MONTHLY = MONTHLY_PRICE_USD * 12; // 60 $
const ANNUAL_DISCOUNT_PERCENT = Math.round(
  ((ANNUAL_EQUIVALENT_IF_MONTHLY - ANNUAL_PRICE_USD) / ANNUAL_EQUIVALENT_IF_MONTHLY) * 100
);

export const PLANS = [
  {
    id: 'essai',
    label: "Essai gratuit",
    priceUsd: 0,
    durationDays: 7,
    period: '7 jours',
    tagline: 'Pour découvrir la plateforme sans engagement.',
    highlight: false,
  },
  {
    id: 'mensuel',
    label: 'Mensuel',
    priceUsd: MONTHLY_PRICE_USD,
    durationDays: 30,
    period: 'mois',
    tagline: 'Facturation mensuelle, résiliable à tout moment.',
    highlight: true,
  },
  {
    id: 'annuel',
    label: 'Annuel',
    priceUsd: ANNUAL_PRICE_USD,
    durationDays: 365,
    period: 'an',
    tagline: `Économisez ${ANNUAL_DISCOUNT_PERCENT}% par rapport au tarif mensuel.`,
    highlight: false,
    discountPercent: ANNUAL_DISCOUNT_PERCENT,
  },
];

// Accès à vie : jamais vendu, uniquement accordé via le code promo
// PROMO_CODE_LIFETIME (voir backend API/src/constants/plans.js).
export const LIFETIME_PLAN = {
  id: 'lifetime',
  label: 'Accès à vie',
  priceUsd: 0,
  durationDays: Infinity,
  period: 'à vie',
  tagline: 'Accès illimité à la plateforme, offert.',
  highlight: false,
};

export function getPlan(planId) {
  return PLANS.find((p) => p.id === planId) || (planId === LIFETIME_PLAN.id ? LIFETIME_PLAN : PLANS[0]);
}

/**
 * Calcule le nombre de jours restants sur le forfait courant.
 * Formule : durée du forfait (jours) - jours écoulés depuis son démarrage.
 * @param {string} planId
 * @param {string} planStartedAt date ISO (yyyy-MM-dd ou date complète retournée par le backend)
 * @returns {number} jours restants (0 minimum)
 */
export function computeDaysRemaining(planId, planStartedAt) {
  const plan = getPlan(planId);
  // Accès à vie : il ne reste jamais 0 jour.
  if (plan.durationDays === Infinity) return Infinity;
  if (!planStartedAt) return plan.durationDays;
  // Le backend renvoie une date ISO complète (avec "T"), le mode mock une
  // date simple yyyy-MM-dd : on gère les deux formats.
  const date = planStartedAt.includes('T') ? new Date(planStartedAt) : new Date(`${planStartedAt}T00:00:00`);
  if (Number.isNaN(date.getTime())) return plan.durationDays;
  const elapsedMs = Date.now() - date.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, plan.durationDays - elapsedDays);
}

/**
 * Un forfait est considéré expiré dès qu'il ne reste plus aucun jour.
 * C'est cette fonction (cohérente avec le backend, plan.middleware.js) qui
 * pilote le verrouillage des statistiques et des nouvelles entrées.
 */
export function isPlanExpired(planId, planStartedAt) {
  const plan = getPlan(planId);
  if (plan.durationDays === Infinity) return false;
  return computeDaysRemaining(planId, planStartedAt) === 0;
}
