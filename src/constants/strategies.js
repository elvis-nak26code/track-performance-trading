// Liste des approches de trading disponibles dans l'application.
// IMPORTANT : ce ne sont PAS des stratégies exclusives l'une de l'autre.
// Un même trade peut combiner plusieurs approches à la fois (ex : analyse
// fondamentale pour le biais directionnel + price action pour le timing
// d'entrée). C'est pourquoi chaque trade stocke un TABLEAU `strategies`
// (et non une seule valeur `strategy`), et l'interface les affiche/filtre
// comme des tags cumulables plutôt que comme un choix unique.
//
// En plus de cette liste, l'utilisateur peut saisir librement le nom d'une
// autre approche qui n'y figure pas : elle est alors stockée telle quelle
// dans le tableau `strategies`, exactement comme les valeurs de cette liste.
export const STRATEGIES = [
  { value: 'price-action', label: 'Price Action' },
  { value: 'ict', label: 'ICT' },
  { value: 'smc', label: 'SMC' },
  { value: 'fondamentale', label: 'Fondamentale' },
  { value: 'supply-demand', label: 'Supply & Demand' },
];

// Retrouve le libellé français d'une approche à partir de sa clé.
// Pour une approche saisie librement (absente de la liste), renvoie le texte
// saisi tel quel, ce qui permet de l'afficher proprement dans les tableaux.
export function getStrategyLabel(value) {
  if (!value) return value;
  const found = STRATEGIES.find((s) => s.value === value);
  return found ? found.label : value;
}

// Normalise une saisie libre : si l'utilisateur tape (même approximativement)
// le nom d'une approche de la liste, on renvoie sa valeur "officielle" pour
// éviter les doublons. Sinon, on renvoie le texte tel quel (nettoyé).
// Retourne null si la saisie est vide.
export function normalizeStrategyInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const match = STRATEGIES.find((s) => s.label.toLowerCase() === lower);
  return match ? match.value : raw;
}

// Formate un tableau de clés d'approches en libellés lisibles, ex:
// ['fondamentale', 'price-action'] -> "Fondamentale + Price Action"
export function formatStrategies(values) {
  if (!values || values.length === 0) return 'Non renseignée';
  return values.map((v) => getStrategyLabel(v)).join(' + ');
}
