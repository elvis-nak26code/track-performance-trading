// Sélecteur de trades liés à une entrée de journal (multi-sélection simple).
import PropTypes from 'prop-types';
import { formatDateShort } from '../../utils/dateHelpers';

export default function LinkedTradesSelector({ trades, selectedIds, onChange }) {
  const availableTrades = trades.filter((t) => !selectedIds.includes(t.id));
  const selectedTrades = selectedIds
    .map((id) => trades.find((t) => t.id === id))
    .filter(Boolean);

  function addTrade(id) {
    if (!id) return;
    onChange([...selectedIds, id]);
  }

  function removeTrade(id) {
    onChange(selectedIds.filter((tradeId) => tradeId !== id));
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2 block">
        Lier à un ou plusieurs trades (optionnel)
      </label>
      <select
        value=""
        onChange={(e) => addTrade(e.target.value)}
        className="w-full bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
      >
        <option value="">Ajouter un trade…</option>
        {availableTrades.map((t) => (
          <option key={t.id} value={t.id}>
            {formatDateShort(t.date)} · {t.symbol} · {t.direction === 'long' ? 'Long' : 'Short'} · {t.pnl >= 0 ? '+' : ''}
            {t.pnl.toFixed(2)} $
          </option>
        ))}
      </select>
      {selectedTrades.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {selectedTrades.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between text-xs font-mono bg-bg border border-card-border rounded-card px-3 py-1.5"
            >
              <span className="text-text-secondary">
                {formatDateShort(t.date)} · {t.symbol} · {t.direction === 'long' ? 'Long' : 'Short'} ·{' '}
                <span className={t.pnl >= 0 ? 'text-accent' : 'text-danger'}>
                  {t.pnl >= 0 ? '+' : ''}
                  {t.pnl.toFixed(2)} $
                </span>
              </span>
              <button type="button" onClick={() => removeTrade(t.id)} className="text-text-secondary hover:text-danger ml-2">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

LinkedTradesSelector.propTypes = {
  trades: PropTypes.array.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
