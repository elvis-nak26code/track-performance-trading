// Tableau complet des trades pour /track-record, avec tri par colonne.
// Sur mobile (< sm) chaque trade est affiché en carte empilée ; à partir de
// sm, le tableau classique avec tri.
import { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatStrategies } from '../../constants/strategies';
import Badge from '../common/Badge';

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'symbol', label: 'Symbole' },
  { key: 'direction', label: 'Sens' },
  { key: 'entryPrice', label: 'Entrée' },
  { key: 'exitPrice', label: 'Sortie' },
  { key: 'quantity', label: 'Qté' },
  { key: 'r', label: 'R' },
  { key: 'pnl', label: 'P&L' },
];

function TradeRowActions({ trade, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <button type="button" onClick={() => onEdit(trade)} className="text-text-secondary hover:text-accent">
        Modifier
      </button>
      <button type="button" onClick={() => onDelete(trade.id)} className="text-text-secondary hover:text-danger">
        Supprimer
      </button>
    </div>
  );
}

TradeRowActions.propTypes = {
  trade: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function TradesTable({ trades, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...trades].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1 * dir;
      if (a[sortKey] > b[sortKey]) return 1 * dir;
      return 0;
    });
  }, [trades, sortKey, sortDir]);

  if (!trades.length) {
    return <p className="text-text-secondary text-sm py-6 text-center">Aucun trade ne correspond aux filtres actuels.</p>;
  }

  return (
    <>
      {/* Vue mobile : cartes empilées */}
      <div className="flex flex-col gap-2 sm:hidden">
        {sorted.map((t) => {
          const up = t.pnl >= 0;
          return (
            <div key={t.id} className="border border-card-border rounded-card p-3 bg-bg/60">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-mono text-text-primary font-semibold">{t.symbol}</p>
                  <p className="text-[10px] text-text-secondary font-mono">{formatDateShort(t.date)} · Qté {t.quantity}</p>
                </div>
                <Badge tone={t.direction === 'long' ? 'positive' : 'negative'}>
                  {t.direction === 'long' ? 'Long' : 'Short'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div>
                  <p className="text-text-secondary/70">Entrée / Sortie</p>
                  <p className="text-text-primary">{t.entryPrice} → {t.exitPrice}</p>
                </div>
                <div>
                  <p className="text-text-secondary/70">R multiple</p>
                  <p className={t.r >= 0 ? 'text-accent' : 'text-danger'}>
                    {t.r >= 0 ? `+${t.r}` : t.r}R
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary/70">P&L</p>
                  <p className={up ? 'text-accent' : 'text-danger'}>
                    {up ? '+' : ''}{t.pnl.toFixed(2)} $
                  </p>
                </div>
              </div>
              {t.strategies?.length > 0 && (
                <p className="text-[10px] text-text-secondary font-mono mt-2 truncate">
                  {formatStrategies(t.strategies)}
                </p>
              )}
              <div className="flex items-center justify-end gap-4 mt-2 pt-2 border-t border-card-border/40 text-xs">
                <TradeRowActions trade={t} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Vue desktop : tableau classique */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm font-mono min-w-[900px]">
          <thead>
            <tr className="text-left text-text-secondary text-[11px] uppercase tracking-wide border-b border-card-border/40">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="py-2 pr-4 font-normal cursor-pointer select-none hover:text-text-primary whitespace-nowrap"
                >
                  {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th className="py-2 pr-4 font-normal whitespace-nowrap">Approche(s)</th>
              <th className="py-2 pr-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id} className="border-b border-card-border/30 last:border-0 hover:bg-white/[0.02]">
                <td className="py-2 pr-4 text-text-secondary whitespace-nowrap">{formatDateShort(t.date)}</td>
                <td className="py-2 pr-4 text-text-primary">{t.symbol}</td>
                <td className="py-2 pr-4">
                  <Badge tone={t.direction === 'long' ? 'positive' : 'negative'}>
                    {t.direction === 'long' ? 'Long' : 'Short'}
                  </Badge>
                </td>
                <td className="py-2 pr-4">{t.entryPrice}</td>
                <td className="py-2 pr-4">{t.exitPrice}</td>
                <td className="py-2 pr-4">{t.quantity}</td>
                <td className={`py-2 pr-4 ${t.r >= 0 ? 'text-accent' : 'text-danger'}`}>
                  {t.r >= 0 ? `+${t.r}` : t.r}R
                </td>
                <td className={`py-2 pr-4 ${t.pnl >= 0 ? 'text-accent' : 'text-danger'}`}>
                  {t.pnl >= 0 ? '+' : ''}
                  {t.pnl.toFixed(2)} $
                </td>
                <td className="py-2 pr-4 text-text-secondary text-xs whitespace-nowrap">
                  {formatStrategies(t.strategies)}
                </td>
                <td className="py-2 pr-4 text-right whitespace-nowrap">
                  <TradeRowActions trade={t} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

TradesTable.propTypes = {
  trades: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default memo(TradesTable);
