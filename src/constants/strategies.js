// Liste des approches de trading disponibles dans l'application.
// IMPORTANT : ce ne sont PAS des stratégies exclusives l'une de l'autre.
// Un même trade peut combiner plusieurs approches à la fois (ex : analyse
// fondamentale pour le biais directionnel + price action pour le timing
// d'entrée). C'est pourquoi chaque trade stocke un TABLEAU `strategies`
// (et non une seule valeur `strategy`), et l'interface les affiche/filtre
// comme des tags cumulables plutôt que comme un choix unique.
export const STRATEGIES = [
  { value: 'fondamentale', label: 'Fondamentale' },
  { value: 'price-action', label: 'Price Action' },
];

// Utilitaire pour retrouver le libellé français d'une approche à partir de sa clé.
export function getStrategyLabel(value) {
  const found = STRATEGIES.find((s) => s.value === value);
  return found ? found.label : value;
}

// Formate un tableau de clés d'approches en libellés lisibles, ex:
// ['fondamentale', 'price-action'] -> "Fondamentale + Price Action"
export function formatStrategies(values) {
  if (!values || values.length === 0) return 'Non renseignée';
  return values.map((v) => getStrategyLabel(v)).join(' + ');
}
