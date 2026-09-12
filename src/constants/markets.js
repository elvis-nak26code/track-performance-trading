// Catégories d'actifs et tags de classification comportementale utilisés
// dans la page de référence des marchés (/marches).
export const MARKET_CATEGORIES = [
  { value: 'indice', label: 'Indices' },
  { value: 'action', label: 'Actions' },
  { value: 'forex', label: 'Forex' },
  { value: 'matiere-premiere', label: 'Matières premières' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'synthetique', label: 'Indices synthétiques' },
];

export const MARKET_TAGS = [
  {
    value: 'risk-on',
    label: 'Risk-on',
    color: 'text-accent border-accent/20 bg-accent/10',
    description: "Performe bien quand l'appétit pour le risque est élevé sur les marchés.",
  },
  {
    value: 'risk-off',
    label: 'Risk-off',
    color: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
    description: "Recherché comme valeur refuge en période d'incertitude ou de stress.",
  },
  {
    value: 'actif-saisonnier',
    label: 'Actif saisonnier',
    color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
    description: 'Présente des schémas de comportement récurrents liés au calendrier.',
  },
  {
    value: 'sensible-evenements',
    label: 'Sensible aux événements',
    color: 'text-danger border-danger/20 bg-danger/10',
    description: 'Réagit fortement aux publications macro, résultats ou actualités.',
  },
];

export function getMarketTagMeta(value) {
  return MARKET_TAGS.find((t) => t.value === value) || MARKET_TAGS[0];
}

export function getMarketCategoryLabel(value) {
  const found = MARKET_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}
