// Tableau compact des 5 derniers trades, affiché sur le tableau de bord.
import PropTypes from 'prop-types';
import { formatDateShort } from '../../utils/dateHelpers';
import Badge from '../common/Badge';

export default function RecentTradesTable({ trades }) {
  if (!trades.length) {
    return <p className="text-text-secondary text-sm">Aucun trade enregistré pour le moment.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-left text-text-secondary text-[11px] uppercase tracking-wide border-b border-card-border/40">
            <th className="py-2 pr-3 font-normal">Date</th>
            <th className="py-2 pr-3 font-normal">Symbole</th>
            <th className="py-2 pr-3 font-normal">Sens</th>
            <th className="py-2 pr-3 font-normal">R</th>
            <th className="py-2 pr-3 font-normal text-right">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-b border-card-border/30 last:border-0">
              <td className="py-2 pr-3 text-text-secondary">{formatDateShort(t.date)}</td>
              <td className="py-2 pr-3 text-text-primary">{t.symbol}</td>
              <td className="py-2 pr-3">
                <Badge tone={t.direction === 'long' ? 'positive' : 'negative'}>
                  {t.direction === 'long' ? 'Long' : 'Short'}
                </Badge>
              </td>
              <td className={`py-2 pr-3 ${t.r >= 0 ? 'text-accent' : 'text-danger'}`}>
                {t.r >= 0 ? `+${t.r}` : t.r}R
              </td>
              <td className={`py-2 pr-3 text-right ${t.pnl >= 0 ? 'text-accent' : 'text-danger'}`}>
                {t.pnl >= 0 ? '+' : ''}
                {t.pnl.toFixed(2)} $
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

RecentTradesTable.propTypes = {
  trades: PropTypes.array.isRequired,
};
