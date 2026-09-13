// Formulaire d'ajout/édition manuelle d'un trade (modal simple, pas de
// librairie tierce). Calcule le P&L automatiquement si laissé vide.
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { STRATEGIES, getStrategyLabel, normalizeStrategyInput } from '../../constants/strategies';
import Button from '../common/Button';
import InputSymbol from '../track-record/InputSymbol'

const EMPTY_TRADE = {
  date: new Date().toISOString().slice(0, 10),
  symbol: 'NQ1!',
  strategies: [],
  direction: 'long',
  entryPrice: '',
  exitPrice: '',
  quantity: 1,
  r: '',
  pnl: '',
};

export default function TradeForm({ initialTrade, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialTrade || EMPTY_TRADE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customStrategyInput, setCustomStrategyInput] = useState('');

  useEffect(() => {
    setForm(initialTrade || EMPTY_TRADE);
  }, [initialTrade]);

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function toggleStrategy(value) {
    setForm((prev) => {
      const current = prev.strategies || [];
      const next = current.includes(value)
        ? current.filter((s) => s !== value)
        : [...current, value];
      return { ...prev, strategies: next };
    });
  }

  // Ajoute une approche saisie librement (si elle ne correspond pas à une
  // approche connue, on la stocke telle quelle comme un simple tag).
  function addCustomStrategy() {
    const normalized = normalizeStrategyInput(customStrategyInput);
    if (!normalized) return;
    setForm((prev) => {
      const current = prev.strategies || [];
      if (current.includes(normalized)) return prev;
      return { ...prev, strategies: [...current, normalized] };
    });
    setCustomStrategyInput('');
  }

  function removeStrategy(value) {
    setForm((prev) => ({
      ...prev,
      strategies: (prev.strategies || []).filter((s) => s !== value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        entryPrice: Number(form.entryPrice),
        exitPrice: Number(form.exitPrice),
        quantity: Number(form.quantity),
        r: Number(form.r),
        pnl: Number(form.pnl),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-3 gap-y-3">
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Date
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => update({ date: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Sens
        <select
          value={form.direction}
          onChange={(e) => update({ direction: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        >
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary col-span-2">
        Symbole
        <InputSymbol form={form} update={update} />
      </label>

      <div className="flex flex-col gap-1 text-xs font-mono text-text-secondary col-span-2">
        Approche(s) utilisée(s)
        <div className="flex flex-nowrap sm:flex-wrap gap-2 mt-1 overflow-x-auto sm:overflow-visible pb-1">
          {STRATEGIES.map((s) => {
            const isSelected = (form.strategies || []).includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleStrategy(s.value)}
                className={`shrink-0 px-3 py-1.5 rounded-card text-xs border transition-colors ${
                  isSelected
                    ? 'bg-accent/10 border-accent/20 text-accent'
                    : 'border-card-border text-text-secondary hover:border-text-secondary'
                }`}
              >
                {isSelected ? '✓ ' : ''}
                {s.label}
              </button>
            );
          })}
        </div>

        {((form.strategies || []).filter(
          (s) => !STRATEGIES.some((known) => known.value === s)
        ).length > 0) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {(form.strategies || [])
              .filter((s) => !STRATEGIES.some((known) => known.value === s))
              .map((custom) => (
                <span
                  key={custom}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-card text-xs border border-accent/30 bg-accent/10 text-accent"
                >
                  {getStrategyLabel(custom)}
                  <button
                    type="button"
                    onClick={() => removeStrategy(custom)}
                    className="hover:text-white transition-colors"
                    aria-label={`Retirer ${custom}`}
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customStrategyInput}
            onChange={(e) => setCustomStrategyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomStrategy();
              }
            }}
            placeholder="Autre approche (ex : scalping)…"
            className="flex-1 min-w-0 bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-accent/60"
          />
          <button
            type="button"
            onClick={addCustomStrategy}
            className="shrink-0 px-3 py-2 rounded-card text-xs border border-card-border text-text-secondary hover:border-accent/60 hover:text-accent transition-colors whitespace-nowrap"
          >
            Ajouter
          </button>
        </div>
        <p className="hidden sm:block text-[10px] text-text-secondary/70 normal-case">
          Sélectionnez une ou plusieurs approches, ou saisissez le nom de votre
          stratégie si elle n&apos;apparaît pas dans la liste.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Prix d&apos;entrée
        <input
          type="number"
          step="any"
          required
          value={form.entryPrice}
          onChange={(e) => update({ entryPrice: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Prix de sortie
        <input
          type="number"
          step="any"
          required
          value={form.exitPrice}
          onChange={(e) => update({ exitPrice: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Quantité
        <input
          type="number"
          min="1"
          step="1"
          required
          value={form.quantity}
          onChange={(e) => update({ quantity: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        R (multiple de risque)
        <input
          type="number"
          step="any"
          required
          value={form.r}
          onChange={(e) => update({ r: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary col-span-2">
        P&amp;L ($)
        <input
          type="number"
          step="any"
          required
          value={form.pnl}
          onChange={(e) => update({ pnl: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full min-w-0"
        />
      </label>
      <div className="col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <span className="w-2 h-2 rounded-full bg-bg animate-pulse" />
              Enregistrement…
            </>
          ) : (
            'Enregistrer le trade'
          )}
        </Button>
      </div>
    </form>
  );
}

TradeForm.propTypes = {
  initialTrade: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
