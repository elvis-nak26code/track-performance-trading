// Formulaire d'ajout/édition manuelle d'un trade (modal simple, pas de
// librairie tierce). Calcule le P&L automatiquement si laissé vide.
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { STRATEGIES } from '../../constants/strategies';
import Button from '../common/Button';
import Inputsymbol from '../track-record/inputdymbole'

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
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Date
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => update({ date: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
        />
      </label>
      {/* <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Symbole
        <input
          type="text"
          required
          value={form.symbol}
          onChange={(e) => update({ symbol: e.target.value })}
          placeholder="NQ1!, ES, MNQ…"
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
        />
      </label> */}
      <Inputsymbol form={form} update={update} />
      
      <div className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Approche(s) utilisée(s)
        <div className="flex flex-wrap gap-2 mt-1">
          {STRATEGIES.map((s) => {
            const isSelected = (form.strategies || []).includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleStrategy(s.value)}
                className={`px-3 py-1.5 rounded-card text-xs border transition-colors ${
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
        <p className="text-[10px] text-text-secondary/70 normal-case mt-1">
          Fondamentale et Price Action peuvent être combinées sur un même trade.
        </p>
      </div>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Direction
        <select
          value={form.direction}
          onChange={(e) => update({ direction: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
        >
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Prix d&apos;entrée
        <input
          type="number"
          step="any"
          required
          value={form.entryPrice}
          onChange={(e) => update({ entryPrice: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
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
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
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
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
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
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
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
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
        />
      </label>
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
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
