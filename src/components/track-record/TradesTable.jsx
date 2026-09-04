// Tableau complet des trades pour /track-record, avec tri par colonne.
import { useState } from 'react';
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

export default function TradesTable({ trades, onEdit, onDelete }) {
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

  const sorted = [...trades].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (a[sortKey] < b[sortKey]) return -1 * dir;
    if (a[sortKey] > b[sortKey]) return 1 * dir;
    return 0;
  });

  if (!trades.length) {
    return <p className="text-text-secondary text-sm py-6 text-center">Aucun trade ne correspond aux filtres actuels.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono min-w-[900px]">
        <thead>
          <tr className="text-left text-text-secondary text-[11px] uppercase tracking-wide border-b border-white/30 border-card-border/40">
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
            <tr key={t.id} className="border-b border-white/20 border-card-border/30 last:border-0 hover:bg-white/[0.02]">
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
                <button type="button" onClick={() => onEdit(t)} className="text-text-secondary hover:text-accent mr-3">
                  Modifier
                </button>
                <button type="button" onClick={() => onDelete(t.id)} className="text-text-secondary hover:text-danger">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

TradesTable.propTypes = {
  trades: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
