// Formulaire d'ajout manuel d'un marché/instrument au catalogue de
// référence (/marches).
import { useState } from 'react';
import PropTypes from 'prop-types';
import { MARKET_CATEGORIES, MARKET_TAGS } from '../../constants/markets';
import Button from '../common/Button';

const EMPTY_MARKET = {
  symbol: '',
  name: '',
  category: 'action',
  tags: [],
  description: '',
};

export default function AddMarketForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_MARKET);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function toggleTag(value) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(value) ? prev.tags.filter((t) => t !== value) : [...prev.tags, value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
          Symbole
          <input
            type="text"
            required
            value={form.symbol}
            onChange={(e) => update({ symbol: e.target.value.toUpperCase() })}
            placeholder="ex : GC1!, SPX500…"
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
          Catégorie
          <select
            value={form.category}
            onChange={(e) => update({ category: e.target.value })}
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
          >
            {MARKET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Nom complet
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="ex : Or (Gold)"
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans"
        />
      </label>

      <div>
        <p className="text-xs font-mono text-text-secondary mb-1">Comportement (un ou plusieurs)</p>
        <div className="flex flex-wrap gap-2">
          {MARKET_TAGS.map((t) => {
            const isSelected = form.tags.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTag(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
                  isSelected ? t.color : 'text-text-secondary border-card-border hover:border-text-secondary'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Description du comportement
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Comment réagit cet actif ? À quels événements est-il sensible ?"
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans leading-relaxed resize-y"
        />
      </label>

      <div className="flex justify-end gap-2 mt-1">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Ajout…' : "Ajouter l'actif"}
        </Button>
      </div>
    </form>
  );
}

AddMarketForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
