// Checklist pré-trade personnalisable, cochable avant de logger un trade.
// L'état est conservé en mémoire (React state) le temps de la session.
import { useState } from 'react';

const DEFAULT_ITEMS = [
  'Le contexte de marché correspond à mon plan de trading',
  "La zone d'entrée est claire, sans ambiguïté",
  'Le ratio risque/récompense est acceptable (minimum 1:2)',
  'Ma taille de position respecte mon risque maximum par trade',
  'Je ne suis pas en train de me refaire après une perte',
  'Je suis calme et concentré, pas sous le coup de l\'émotion',
];

export default function PreTradeChecklist() {
  const [items, setItems] = useState(DEFAULT_ITEMS.map((label, i) => ({ id: i, label, checked: false })));
  const [newItem, setNewItem] = useState('');

  function toggleItem(id) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }

  function addItem(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems((prev) => [...prev, { id: Date.now(), label: newItem.trim(), checked: false }]);
    setNewItem('');
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-secondary font-mono">
          {checkedCount}/{items.length} points validés
        </p>
        <button
          type="button"
          onClick={() => setItems((prev) => prev.map((i) => ({ ...i, checked: false })))}
          className="text-xs font-mono text-text-secondary hover:text-accent"
        >
          Réinitialiser
        </button>
      </div>
      <ul className="flex flex-col gap-2 mb-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="accent-accent w-4 h-4"
            />
            <span className={`text-sm flex-1 ${item.checked ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
              {item.label}
            </span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 text-xs"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={addItem} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Ajouter un point de contrôle…"
          className="flex-1 bg-bg border border-card-border rounded-card px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/60"
        />
        <button type="submit" className="text-sm font-mono text-accent hover:text-accent-soft px-2">
          Ajouter
        </button>
      </form>
    </div>
  );
}
