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

export function getPlan(planId) {
  return PLANS.find((p) => p.id === planId) || PLANS[0];
}

/**
 * Calcule le nombre de jours restants sur le forfait courant.
 * Formule : durée du forfait (jours) - jours écoulés depuis son démarrage.
 * @param {string} planId
 * @param {string} planStartedAt date ISO (yyyy-MM-dd)
 * @returns {number} jours restants (0 minimum)
 */
export function computeDaysRemaining(planId, planStartedAt) {
  const plan = getPlan(planId);
  const started = new Date(`${planStartedAt}T00:00:00`);
  const now = new Date();
  const elapsedMs = now.getTime() - started.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, plan.durationDays - elapsedDays);
}
