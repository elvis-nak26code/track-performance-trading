// Formulaire d'ajout/édition manuelle d'un trade (modal simple, pas de
// librairie tierce).
// Un panneau de conformité compare la saisie à la stratégie active
// (direction, instruments, R minimum) afin de "respecter son plan".
import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import Button from '../common/Button';
import InputSymbol from '../track-record/InputSymbol'
import { useStrategy } from '../../hooks/useStrategy';

const EMPTY_TRADE = {
  date: new Date().toISOString().slice(0, 10),
  symbol: 'NQ1!',
  strategies: [],
  direction: 'long',
  quantity: 1,
  r: '',
  pnl: '',
};

export default function TradeForm({ initialTrade, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialTrade || EMPTY_TRADE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeStrategy } = useStrategy();

  useEffect(() => {
    setForm(initialTrade || EMPTY_TRADE);
  }, [initialTrade]);

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  // ---- Conformité à la stratégie active --------------------------------

  const conformance = useMemo(() => {
    if (!activeStrategy) return null;
    const cfg = activeStrategy.config || {};
    const issues = [];
    const validated = [];

    const dirs = cfg.directions || [];
    if (dirs.length > 0) {
      const okDir = dirs.includes(form.direction);
      (okDir ? validated : issues).push(
        okDir
          ? `Direction ${form.direction === 'long' ? 'Long' : 'Short'} autorisée`
          : `Direction ${form.direction === 'long' ? 'Long' : 'Short'} NON autorisée par « ${activeStrategy.name} »`
      );
    }

    const symbols = cfg.symbols || [];
    if (symbols.length > 0) {
      const current = String(form.symbol || '').toUpperCase();
      const okSym = current.length > 0 && symbols.some((s) => String(s).toUpperCase() === current);
      (okSym ? validated : issues).push(
        okSym ? `Instrument ${current} dans le plan` : `Instrument ${current || '?'} absent du plan de la stratégie`
      );
    }

    const minRR = Number(cfg.minRR);
    if (minRR > 0 && form.r !== '' && form.r !== null && form.r !== undefined) {
      const rValue = Number(form.r);
      const okRR = rValue >= minRR;
      (okRR ? validated : issues).push(
        okRR ? `R (${rValue}) ≥ minimum exigé (${minRR})` : `R (${rValue}) inférieur au minimum de ${minRR}`
      );
    }

    return { issues, validated, name: activeStrategy.name };
  }, [activeStrategy, form.direction, form.symbol, form.r]);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
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

      {conformance && (
        <div className="col-span-2 flex flex-col gap-1.5 mt-1 rounded-card border border-card-border bg-bg/60 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-text-secondary">
            {conformance.issues.length > 0 ? (
              <ShieldAlert size={14} className="text-amber-500" />
            ) : (
              <ShieldCheck size={14} className="text-accent" />
            )}
            Conformité · {conformance.issues.length > 0 ? 'réserves' : 'plan respecté'} — {conformance.name}
          </p>
          <ul className="flex flex-col gap-1">
            {conformance.validated.map((text) => (
              <li key={text} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <ShieldCheck size={13} className="text-accent shrink-0" />
                {text}
              </li>
            ))}
            {conformance.issues.map((text) => (
              <li key={text} className="flex items-center gap-1.5 text-xs text-amber-500">
                <Shield size={13} className="shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}
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
