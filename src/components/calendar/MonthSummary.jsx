// Résumé du mois affiché au-dessus de la heatmap calendrier : P&L total,
// nombre de trades, nombre de jours gagnants.
import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import KpiCard from '../common/KpiCard';

function MonthSummary({ trades }) {
  const { totalPnl, greenDays } = useMemo(() => {
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const pnlByDay = new Map();
    trades.forEach((t) => {
      pnlByDay.set(t.date, (pnlByDay.get(t.date) || 0) + t.pnl);
    });
    const greenDays = Array.from(pnlByDay.values()).filter((v) => v >= 0).length;
    return { totalPnl, greenDays };
  }, [trades]);

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <KpiCard
        label="P&L du mois"
        value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} $`}
        tone={totalPnl >= 0 ? 'positive' : 'negative'}
      />
      <KpiCard label="Trades" value={trades.length} />
      <KpiCard label="Jours gagnants" value={greenDays} tone="positive" />
    </div>
  );
}

MonthSummary.propTypes = {
  trades: PropTypes.array.isRequired,
};

export default memo(MonthSummary);
