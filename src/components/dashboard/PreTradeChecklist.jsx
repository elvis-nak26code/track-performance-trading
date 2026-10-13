// Checklist pré-trade du tableau de bord : dérivée de la stratégie active
// (champ checklistItems). Les cases cochées sont persistées par jour en
// localStorage ; chaque point peut être activé/désactivé depuis la page
// Stratégies.
import { Link } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import { useStrategy } from '../../hooks/useStrategy';

export default function PreTradeChecklist() {
  const {
    activeStrategy,
    checklist,
    checkedItems,
    toggleChecklistItem,
    resetChecklist,
    isLoading,
  } = useStrategy();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-7 rounded-lg bg-bg/70 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!activeStrategy) {
    return (
      <div className="text-center py-6 flex flex-col items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <Crosshair size={18} />
        </span>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Aucune stratégie active. Définissez vos règles et votre checklist pré-trade pour passer
          vos trades en toute conformité.
        </p>
        <Link
          to="/strategies"
          className="text-sm font-mono text-accent hover:text-accent-soft"
        >
          Créer ma stratégie →
        </Link>
      </div>
    );
  }

  if (checklist.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-text-secondary">
          La stratégie « {activeStrategy.name} » n'a pas de point de contrôle actif.
        </p>
        <Link to="/strategies" className="text-sm font-mono text-accent hover:text-accent-soft inline-block mt-2">
          Personnaliser la checklist →
        </Link>
      </div>
    );
  }

  const checkedCount = checklist.filter((i) => checkedItems.has(i.id)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-secondary font-mono">
          {checkedCount}/{checklist.length} points validés
        </p>
        <button
          type="button"
          onClick={resetChecklist}
          className="text-xs font-mono text-text-secondary hover:text-accent"
        >
          Réinitialiser
        </button>
      </div>
      <ul className="flex flex-col gap-2 mb-3">
        {checklist.map((item) => {
          const checked = checkedItems.has(item.id);
          return (
            <li key={item.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleChecklistItem(item.id)}
                className="accent-accent w-4 h-4"
              />
              <span className={`text-sm flex-1 ${checked ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        to="/strategies"
        className="text-xs font-mono text-text-secondary hover:text-accent"
        title={`Stratégie active : ${activeStrategy.name}`}
      >
        Checklist de « {activeStrategy.name} » · modifier →
      </Link>
    </div>
  );
}