// Liste des humeurs disponibles pour taguer une entrée de journal de trading.
// "color" référence des classes Tailwind utilisées pour les badges d'humeur.
export const MOODS = [
  { value: 'calme', label: 'Calme', color: 'border-purple-400/20 text-purple-400 bg-purple-400/10' },
  { value: 'confiant', label: 'Confiant', color: 'border-green-400/20 text-green-400 bg-green-400/10' },
  { value: 'frustre', label: 'Frustré', color: 'border-danger/20 text-danger bg-danger/10' },
  { value: 'avide', label: 'Avide', color: 'border-yellow-400/20 text-yellow-400 bg-yellow-400/10' },
  { value: 'craintif', label: 'Craintif', color: 'border-blue-400/20 text-blue-400 bg-blue-400/10' },
  { value: 'tilte', label: 'Tilté', color: 'border-red-400/20 text-red-400 bg-red-400/10' },
];

export function getMoodMeta(value) {
  return MOODS.find((m) => m.value === value) || MOODS[0];
}
