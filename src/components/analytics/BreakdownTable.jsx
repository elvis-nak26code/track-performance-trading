// Tableau de répartition générique (par stratégie, par instrument, par direction).
import PropTypes from 'prop-types';

export default function BreakdownTable({ rows, keyLabel }) {
  const maxAbsPnl = Math.max(1, ...rows.map((r) => Math.abs(r.pnl)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-left text-text-secondary text-[11px] uppercase tracking-wide border-b border-card-border">
            <th className="py-2 pr-3 font-normal">{keyLabel}</th>
            <th className="py-2 pr-3 font-normal">Trades</th>
            <th className="py-2 pr-3 font-normal">Gains</th>
            <th className="py-2 pr-3 font-normal">Pertes</th>
            <th className="py-2 pr-3 font-normal">Win rate</th>
            <th className="py-2 pr-3 font-normal">R moyen</th>
            <th className="py-2 pr-3 font-normal">P&amp;L total</th>
            <th className="py-2 pr-3 font-normal">Répartition</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const widthPct = Math.min(100, (Math.abs(row.pnl) / maxAbsPnl) * 100);
            return (
              <tr key={row.key} className="border-b border-card-border/60 last:border-0">
                <td className="py-2 pr-3 text-text-primary">{row.key}</td>
                <td className="py-2 pr-3 text-text-secondary">{row.trades}</td>
                <td className="py-2 pr-3 text-accent">{row.wins}</td>
                <td className="py-2 pr-3 text-danger">{row.losses}</td>
                <td className="py-2 pr-3 text-text-secondary">{row.winRate.toFixed(1)}%</td>
                <td className={`py-2 pr-3 ${row.avgR >= 0 ? 'text-accent' : 'text-danger'}`}>
                  {row.avgR >= 0 ? '+' : ''}
                  {row.avgR.toFixed(2)}R
                </td>
                <td className={`py-2 pr-3 ${row.pnl >= 0 ? 'text-accent' : 'text-danger'}`}>
                  {row.pnl >= 0 ? '+' : ''}
                  {row.pnl.toFixed(2)} $
                </td>
                <td className="py-2 pr-3 w-40">
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.pnl >= 0 ? 'bg-accent' : 'bg-danger'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

BreakdownTable.propTypes = {
  rows: PropTypes.array.isRequired,
  keyLabel: PropTypes.string.isRequired,
};
